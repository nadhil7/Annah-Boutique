import express from "express";
import cookieParser from "cookie-parser";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { pool, ApiError, fail, health, ok, requireAdmin, slugify } from "@annah/shared";

const app = express();
app.use(express.json({ limit: "128kb" }), cookieParser());
app.get("/health", health);

const supabase = createClient(
  process.env.SUPABASE_URL || "https://invalid.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || "invalid"
);
const bucket = process.env.SUPABASE_STORAGE_BUCKET || "annahboutique";
const slugSchema = z.string().trim().max(200).optional().or(z.literal(""));

const variantsSchema = z.array(z.object({
  id: z.string().uuid().optional(),
  sku: z.string().trim().max(80).optional(),
  colour: z.string().trim().min(1).max(60),
  size: z.string().trim().min(1).max(30),
  price: z.number().finite().nonnegative(),
  availability: z.enum(["AVAILABLE", "UNAVAILABLE"]),
})).min(1).max(100);

const productSchema = z.object({
  name: z.string().trim().min(1).max(180),
  slug: slugSchema,
  description: z.string().max(12000).default(""),
  categoryId: z.string().uuid(),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
  featured: z.boolean().default(false),
  seoTitle: z.string().max(200).optional(),
  seoDescription: z.string().max(320).optional(),
  variants: variantsSchema,
});
const productPatchSchema = productSchema.partial().extend({ variants: variantsSchema.optional() });
const categorySchema = z.object({
  name: z.string().trim().min(1).max(120),
  slug: z.string().trim().min(1).max(200).optional(),
  description: z.string().max(2000).default(""),
  image: z.string().url().nullable().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
  sortOrder: z.number().int().min(0).default(0),
});
const categoryPatchSchema = categorySchema.partial();

const productSelect = `
  SELECT p.id, p.name, p.slug, p.description, p.category_id AS "categoryId",
    c.name AS "categoryName", c.slug AS category, p.status, p.featured,
    p.created_at AS "createdAt", p.updated_at AS "updatedAt",
    COALESCE((SELECT json_agg(json_build_object(
      'id', v.id, 'sku', v.sku, 'colour', v.colour, 'size', v.size,
      'price', v.price, 'availability', v.availability
    ) ORDER BY v.colour, v.size) FROM product_variants v WHERE v.product_id=p.id), '[]') AS variants,
    COALESCE((SELECT json_agg(json_build_object(
      'id', i.id, 'url', i.public_url, 'altText', i.alt_text,
      'sortOrder', i.sort_order, 'isPrimary', i.is_primary
    ) ORDER BY i.sort_order, i.created_at) FROM product_images i WHERE i.product_id=p.id), '[]') AS images
  FROM products p
  LEFT JOIN categories c ON c.id=p.category_id
`;

function csv(value: unknown) {
  return String(value || "").split(",").map((item) => item.trim().toLowerCase()).filter(Boolean);
}

function numberQuery(value: unknown, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function publicProductFilters(query: Record<string, unknown>) {
  const values: unknown[] = [];
  const where = ["p.status='ACTIVE'", "(p.category_id IS NULL OR c.status='ACTIVE')"];
  const add = (sql: string, value: unknown) => {
    values.push(value);
    where.push(sql.replace("?", `$${values.length}`));
  };
  const categories = csv(query.category);
  if (categories.length) add("lower(c.slug)=ANY(?::text[])", categories);
  const colours = csv(query.colour);
  if (colours.length) add("EXISTS (SELECT 1 FROM product_variants fv WHERE fv.product_id=p.id AND lower(fv.colour)=ANY(?::text[]))", colours);
  const sizes = csv(query.size);
  if (sizes.length) add("EXISTS (SELECT 1 FROM product_variants fv WHERE fv.product_id=p.id AND lower(fv.size)=ANY(?::text[]))", sizes);
  if (query.search) {
    const search = `%${String(query.search).slice(0, 100)}%`;
    values.push(search);
    where.push(`(p.name ILIKE $${values.length} OR p.description ILIKE $${values.length})`);
  }
  if (query.minPrice !== undefined && query.minPrice !== "") add("EXISTS (SELECT 1 FROM product_variants fv WHERE fv.product_id=p.id AND fv.price>=?::numeric)", numberQuery(query.minPrice, 0));
  if (query.maxPrice !== undefined && query.maxPrice !== "") add("EXISTS (SELECT 1 FROM product_variants fv WHERE fv.product_id=p.id AND fv.price<=?::numeric)", numberQuery(query.maxPrice, Number.MAX_SAFE_INTEGER));
  if (query.availability === "AVAILABLE" || query.availability === "in-stock") where.push("EXISTS (SELECT 1 FROM product_variants fv WHERE fv.product_id=p.id AND fv.availability='AVAILABLE')");
  return { where: where.join(" AND "), values };
}

function sortExpression(sort: unknown) {
  switch (sort) {
    case "price_asc": return "(SELECT min(v.price) FROM product_variants v WHERE v.product_id=p.id) ASC NULLS LAST, p.id";
    case "price_desc": return "(SELECT min(v.price) FROM product_variants v WHERE v.product_id=p.id) DESC NULLS LAST, p.id";
    case "name_asc": return "lower(p.name) ASC, p.id";
    case "featured": return "p.featured DESC, p.created_at DESC, p.id";
    default: return "p.created_at DESC, p.id";
  }
}

app.get("/products", async (req, res, next) => {
  try {
    const page = Math.max(1, Math.floor(numberQuery(req.query.page, 1)));
    const limit = Math.min(60, Math.max(1, Math.floor(numberQuery(req.query.limit, 24))));
    const { where, values } = publicProductFilters(req.query as Record<string, unknown>);
    const count = await pool.query(`SELECT count(*)::int AS total FROM products p LEFT JOIN categories c ON c.id=p.category_id WHERE ${where}`, values);
    const rowsValues = [...values, limit, (page - 1) * limit];
    const rows = await pool.query(`${productSelect} WHERE ${where} ORDER BY ${sortExpression(req.query.sort)} LIMIT $${rowsValues.length - 1} OFFSET $${rowsValues.length}`, rowsValues);
    ok({ items: rows.rows, total: count.rows[0].total, page, limit }, res);
  } catch (error) { next(error); }
});

app.get("/products/:slug", async (req, res, next) => {
  try {
    const result = await pool.query(`${productSelect} WHERE p.slug=$1 AND p.status='ACTIVE' AND (p.category_id IS NULL OR c.status='ACTIVE')`, [req.params.slug]);
    if (!result.rowCount) throw new ApiError(404, "PRODUCT_NOT_FOUND", "Product not found");
    ok(result.rows[0], res);
  } catch (error) { next(error); }
});

app.get("/categories", async (_req, res, next) => {
  try {
    const result = await pool.query("SELECT id,name,slug,description,image,status,sort_order AS \"sortOrder\",created_at AS \"createdAt\",updated_at AS \"updatedAt\" FROM categories WHERE status='ACTIVE' ORDER BY sort_order,name");
    ok(result.rows, res);
  } catch (error) { next(error); }
});

app.get("/categories/:slug", async (req, res, next) => {
  try {
    const result = await pool.query("SELECT id,name,slug,description,image,status,sort_order AS \"sortOrder\" FROM categories WHERE slug=$1 AND status='ACTIVE'", [req.params.slug]);
    if (!result.rowCount) throw new ApiError(404, "CATEGORY_NOT_FOUND", "Category not found");
    ok(result.rows[0], res);
  } catch (error) { next(error); }
});

app.get("/filter-options", async (_req, res, next) => {
  try {
    const [sizes, colours, prices] = await Promise.all([
      pool.query("SELECT DISTINCT lower(v.size) AS value FROM product_variants v JOIN products p ON p.id=v.product_id LEFT JOIN categories c ON c.id=p.category_id WHERE p.status='ACTIVE' AND v.availability='AVAILABLE' AND (p.category_id IS NULL OR c.status='ACTIVE') ORDER BY value"),
      pool.query("SELECT DISTINCT lower(v.colour) AS value FROM product_variants v JOIN products p ON p.id=v.product_id LEFT JOIN categories c ON c.id=p.category_id WHERE p.status='ACTIVE' AND v.availability='AVAILABLE' AND (p.category_id IS NULL OR c.status='ACTIVE') ORDER BY value"),
      pool.query("SELECT COALESCE(min(v.price),0)::numeric AS \"priceMin\",COALESCE(max(v.price),0)::numeric AS \"priceMax\" FROM product_variants v JOIN products p ON p.id=v.product_id LEFT JOIN categories c ON c.id=p.category_id WHERE p.status='ACTIVE' AND v.availability='AVAILABLE' AND (p.category_id IS NULL OR c.status='ACTIVE')"),
    ]);
    ok({ sizes: sizes.rows.map((row) => row.value), colors: colours.rows.map((row) => row.value), priceMin: Number(prices.rows[0].priceMin), priceMax: Number(prices.rows[0].priceMax) }, res);
  } catch (error) { next(error); }
});

app.get("/settings", (_req, res) => ok({
  businessName: process.env.BUSINESS_NAME || "Annah Boutique",
  businessEmail: process.env.BUSINESS_EMAIL || "",
  businessPhone: process.env.BUSINESS_PHONE || "",
  businessAddress: process.env.BUSINESS_ADDRESS || "",
  whatsappNumber: process.env.WHATSAPP_NUMBER || "",
  instagramUrl: process.env.INSTAGRAM_URL || "",
  facebookUrl: process.env.FACEBOOK_URL || "",
}, res));

app.get("/admin/categories", requireAdmin, async (req, res, next) => {
  try {
    const values: unknown[] = [];
    const where: string[] = [];
    if (req.query.status === "ACTIVE" || req.query.status === "INACTIVE") { values.push(req.query.status); where.push(`status=$${values.length}`); }
    if (req.query.search) { values.push(`%${String(req.query.search).slice(0, 100)}%`); where.push(`(name ILIKE $${values.length} OR slug ILIKE $${values.length})`); }
    const limit = Math.min(200, Math.max(1, Math.floor(numberQuery(req.query.limit, 100))));
    values.push(limit);
    const result = await pool.query(`SELECT id,name,slug,description,image,status,sort_order AS \"sortOrder\",created_at AS \"createdAt\",updated_at AS \"updatedAt\" FROM categories ${where.length ? `WHERE ${where.join(" AND ")}` : ""} ORDER BY sort_order,name LIMIT $${values.length}`, values);
    ok(result.rows, res);
  } catch (error) { next(error); }
});

app.post("/admin/categories", requireAdmin, async (req, res, next) => {
  try {
    const input = categorySchema.parse(req.body);
    const result = await pool.query("INSERT INTO categories(name,slug,description,image,status,sort_order) VALUES($1,$2,$3,$4,$5,$6) RETURNING id,name,slug,description,image,status,sort_order AS \"sortOrder\",created_at AS \"createdAt\",updated_at AS \"updatedAt\"", [input.name, input.slug || slugify(input.name), input.description, input.image || null, input.status, input.sortOrder]);
    res.status(201); ok(result.rows[0], res);
  } catch (error) { next(error); }
});

app.patch("/admin/categories/:id", requireAdmin, async (req, res, next) => {
  try {
    const input = categoryPatchSchema.parse(req.body);
    const current = await pool.query("SELECT * FROM categories WHERE id=$1", [req.params.id]);
    if (!current.rowCount) throw new ApiError(404, "CATEGORY_NOT_FOUND", "Category not found");
    const nextName = input.name ?? current.rows[0].name;
    const result = await pool.query("UPDATE categories SET name=$2,slug=$3,description=$4,image=$5,status=$6,sort_order=$7,updated_at=now() WHERE id=$1 RETURNING id,name,slug,description,image,status,sort_order AS \"sortOrder\",created_at AS \"createdAt\",updated_at AS \"updatedAt\"", [req.params.id, nextName, input.slug || (input.name ? slugify(input.name) : current.rows[0].slug), input.description ?? current.rows[0].description, input.image === undefined ? current.rows[0].image : input.image, input.status ?? current.rows[0].status, input.sortOrder ?? current.rows[0].sort_order]);
    ok(result.rows[0], res);
  } catch (error) { next(error); }
});

app.delete("/admin/categories/:id", requireAdmin, async (req, res, next) => {
  try {
    const result = await pool.query("UPDATE categories SET status='INACTIVE',updated_at=now() WHERE id=$1 RETURNING id", [req.params.id]);
    if (!result.rowCount) throw new ApiError(404, "CATEGORY_NOT_FOUND", "Category not found");
    ok({ deactivated: true }, res);
  } catch (error) { next(error); }
});

app.get("/admin/products", requireAdmin, async (req, res, next) => {
  try {
    const page = Math.max(1, Math.floor(numberQuery(req.query.page, 1)));
    const limit = Math.min(100, Math.max(1, Math.floor(numberQuery(req.query.limit, 24))));
    const values: unknown[] = [];
    const where: string[] = [];
    if (req.query.status === "ACTIVE" || req.query.status === "INACTIVE") { values.push(req.query.status); where.push(`p.status=$${values.length}`); }
    if (req.query.category) { values.push(req.query.category); where.push(`c.id=$${values.length}`); }
    if (req.query.search) { values.push(`%${String(req.query.search).slice(0, 100)}%`); where.push(`(p.name ILIKE $${values.length} OR p.slug ILIKE $${values.length})`); }
    const clause = where.length ? `WHERE ${where.join(" AND ")}` : "";
    const count = await pool.query(`SELECT count(*)::int AS total FROM products p LEFT JOIN categories c ON c.id=p.category_id ${clause}`, values);
    const rowsValues = [...values, limit, (page - 1) * limit];
    const rows = await pool.query(`${productSelect} ${clause} ORDER BY p.updated_at DESC,p.id LIMIT $${rowsValues.length - 1} OFFSET $${rowsValues.length}`, rowsValues);
    ok({ items: rows.rows, total: count.rows[0].total, page, limit }, res);
  } catch (error) { next(error); }
});

app.get("/admin/products/:id", requireAdmin, async (req, res, next) => {
  try {
    const result = await pool.query(`${productSelect} WHERE p.id=$1`, [req.params.id]);
    if (!result.rowCount) throw new ApiError(404, "PRODUCT_NOT_FOUND", "Product not found");
    ok(result.rows[0], res);
  } catch (error) { next(error); }
});

async function assertCategory(categoryId: string) {
  const result = await pool.query("SELECT id FROM categories WHERE id=$1 AND status='ACTIVE'", [categoryId]);
  if (!result.rowCount) throw new ApiError(400, "INVALID_CATEGORY", "Select an active category");
}

type DbClient = { query: (sql: string, values?: unknown[]) => Promise<any> };
async function saveVariants(client: DbClient, productId: string, productSlug: string, variants: z.infer<typeof variantsSchema>, preserveExisting = false) {
  const existingSkus = new Map<string, string>();
  if (preserveExisting) {
    const existing = await client.query("SELECT colour,size,sku FROM product_variants WHERE product_id=$1", [productId]);
    for (const variant of existing.rows as Array<{ colour: string; size: string; sku: string }>) existingSkus.set(`${variant.colour.toLowerCase()}::${variant.size.toLowerCase()}`, variant.sku);
    await client.query("DELETE FROM product_variants WHERE product_id=$1", [productId]);
  }
  const values: unknown[] = [];
  const rows = variants.map((variant, index) => {
    const generatedSku = `${slugify(productSlug) || "product"}-${slugify(variant.colour) || "colour"}-${slugify(variant.size) || "size"}-${index + 1}-${randomUUID().slice(0, 8)}`;
    const preservedSku = existingSkus.get(`${variant.colour.toLowerCase()}::${variant.size.toLowerCase()}`);
    const row = [productId, variant.sku?.trim() || preservedSku || generatedSku, variant.colour, variant.size, variant.price, variant.availability];
    const offset = values.length;
    values.push(...row);
    return `($${offset + 1},$${offset + 2},$${offset + 3},$${offset + 4},$${offset + 5},$${offset + 6})`;
  });
  await client.query(`INSERT INTO product_variants(product_id,sku,colour,size,price,availability) VALUES ${rows.join(",")}`, values);
}

app.post("/admin/products", requireAdmin, async (req, res, next) => {
  const client = await pool.connect();
  try {
    const input = productSchema.parse(req.body);
    await assertCategory(input.categoryId);
    await client.query("BEGIN");
    const result = await client.query("INSERT INTO products(name,slug,description,category_id,status,featured,seo_title,seo_description) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id,name,slug,description,category_id AS \"categoryId\",status,featured,created_at AS \"createdAt\",updated_at AS \"updatedAt\"", [input.name, input.slug || slugify(input.name), input.description, input.categoryId, input.status, input.featured, input.seoTitle || null, input.seoDescription || null]);
    await saveVariants(client, result.rows[0].id, input.slug || slugify(input.name), input.variants);
    await client.query("COMMIT");
    const saved = await pool.query(`${productSelect} WHERE p.id=$1`, [result.rows[0].id]);
    res.status(201); ok(saved.rows[0], res);
  } catch (error) { await client.query("ROLLBACK"); next(error); } finally { client.release(); }
});

app.patch("/admin/products/:id", requireAdmin, async (req, res, next) => {
  const client = await pool.connect();
  try {
    const input = productPatchSchema.parse(req.body);
    const current = await client.query("SELECT * FROM products WHERE id=$1", [req.params.id]);
    if (!current.rowCount) throw new ApiError(404, "PRODUCT_NOT_FOUND", "Product not found");
    if (input.categoryId) await assertCategory(input.categoryId);
    await client.query("BEGIN");
    const row = current.rows[0];
    const nextSlug = input.slug || (input.name ? slugify(input.name) : row.slug);
    const result = await client.query("UPDATE products SET name=$2,slug=$3,description=$4,category_id=$5,status=$6,featured=$7,seo_title=$8,seo_description=$9,updated_at=now() WHERE id=$1 RETURNING id,name,slug,description,category_id AS \"categoryId\",status,featured,created_at AS \"createdAt\",updated_at AS \"updatedAt\"", [req.params.id, input.name ?? row.name, nextSlug, input.description ?? row.description, input.categoryId ?? row.category_id, input.status ?? row.status, input.featured ?? row.featured, input.seoTitle ?? row.seo_title, input.seoDescription ?? row.seo_description]);
    if (input.variants) await saveVariants(client, String(req.params.id), nextSlug, input.variants, true);
    await client.query("COMMIT");
    const saved = await pool.query(`${productSelect} WHERE p.id=$1`, [req.params.id]);
    ok(saved.rows[0], res);
  } catch (error) { await client.query("ROLLBACK"); next(error); } finally { client.release(); }
});

app.delete("/admin/products/:id", requireAdmin, async (req, res, next) => {
  try {
    const result = await pool.query("UPDATE products SET status='INACTIVE',updated_at=now() WHERE id=$1 RETURNING id", [req.params.id]);
    if (!result.rowCount) throw new ApiError(404, "PRODUCT_NOT_FOUND", "Product not found");
    ok({ deactivated: true }, res);
  } catch (error) { next(error); }
});

const mediaRequest = z.object({
  fileName: z.string().min(1).max(160).regex(/^[A-Za-z0-9._-]+$/),
  contentType: z.enum(["image/jpeg", "image/png", "image/webp"]),
  fileSize: z.number().int().positive().max(8 * 1024 * 1024),
  entityType: z.enum(["product", "category"]),
  entityId: z.string().uuid(),
});

app.post("/admin/media/signed-upload-url", requireAdmin, async (req, res, next) => {
  try {
    const input = mediaRequest.parse(req.body);
    const extension = input.fileName.toLowerCase().split(".").pop();
    const expected = input.contentType === "image/jpeg" ? "jpg" : input.contentType.split("/")[1];
    if (extension !== expected && !(expected === "jpg" && extension === "jpeg")) throw new ApiError(400, "INVALID_IMAGE", "Filename extension must match the image type");
    const table = input.entityType === "product" ? "products" : "categories";
    const exists = await pool.query(`SELECT id FROM ${table} WHERE id=$1`, [input.entityId]);
    if (!exists.rowCount) throw new ApiError(404, "ENTITY_NOT_FOUND", "Upload target not found");
    const folder = input.entityType === "category" ? "categories" : "products";
    const path = `${folder}/${input.entityId}/${randomUUID()}.${expected}`;
    const { data, error } = await supabase.storage.from(bucket).createSignedUploadUrl(path);
    if (error) throw new ApiError(502, "STORAGE_ERROR", "Unable to create upload URL");
    ok({ uploadUrl: data.signedUrl, token: data.token, path, expiresIn: 7200 }, res);
  } catch (error) { next(error); }
});

app.post("/admin/media/complete", requireAdmin, async (req, res, next) => {
  try {
    const input = z.object({ entityType: z.enum(["product", "category"]), entityId: z.string().uuid(), path: z.string().min(1), altText: z.string().max(300).default(""), sortOrder: z.number().int().default(0), isPrimary: z.boolean().default(false) }).parse(req.body);
    const folder = input.entityType === "category" ? "categories" : "products";
    if (!input.path.startsWith(`${folder}/${input.entityId}/`)) throw new ApiError(400, "INVALID_STORAGE_PATH", "Storage path does not match upload target");
    const files = await supabase.storage.from(bucket).list(`${folder}/${input.entityId}`, { search: input.path.split("/").pop() });
    if (!files.data?.some((file) => `${folder}/${input.entityId}/${file.name}` === input.path)) throw new ApiError(400, "UPLOAD_NOT_FOUND", "Uploaded object not found");
    const { data } = supabase.storage.from(bucket).getPublicUrl(input.path);
    if (input.entityType === "category") {
      await pool.query("UPDATE categories SET image=$2,updated_at=now() WHERE id=$1", [input.entityId, data.publicUrl]);
      ok({ path: input.path, publicUrl: data.publicUrl }, res);
    } else {
      const result = await pool.query("INSERT INTO product_images(product_id,storage_path,public_url,alt_text,sort_order,is_primary) VALUES($1,$2,$3,$4,$5,$6) RETURNING id,storage_path AS \"storagePath\",public_url AS url,alt_text AS \"altText\",sort_order AS \"sortOrder\",is_primary AS \"isPrimary\"", [input.entityId, input.path, data.publicUrl, input.altText, input.sortOrder, input.isPrimary]);
      ok(result.rows[0], res);
    }
  } catch (error) { next(error); }
});

app.patch("/admin/media/:id", requireAdmin, async (req, res, next) => {
  try {
    const input = z.object({ altText: z.string().max(300).optional(), sortOrder: z.number().int().optional(), isPrimary: z.boolean().optional() }).parse(req.body);
    const result = await pool.query("UPDATE product_images SET alt_text=COALESCE($2,alt_text),sort_order=COALESCE($3,sort_order),is_primary=COALESCE($4,is_primary),updated_at=now() WHERE id=$1 RETURNING id,public_url AS url,alt_text AS \"altText\",sort_order AS \"sortOrder\",is_primary AS \"isPrimary\"", [req.params.id, input.altText, input.sortOrder, input.isPrimary]);
    if (!result.rowCount) throw new ApiError(404, "IMAGE_NOT_FOUND", "Image not found");
    ok(result.rows[0], res);
  } catch (error) { next(error); }
});

app.delete("/admin/media/:id", requireAdmin, async (req, res, next) => {
  try {
    const result = await pool.query("DELETE FROM product_images WHERE id=$1 RETURNING storage_path", [req.params.id]);
    if (!result.rowCount) throw new ApiError(404, "IMAGE_NOT_FOUND", "Image not found");
    await supabase.storage.from(bucket).remove([result.rows[0].storage_path]);
    ok({ deleted: true }, res);
  } catch (error) { next(error); }
});

app.get("/admin/dashboard", requireAdmin, async (_req, res, next) => {
  try {
    const result = await pool.query(`SELECT
      (SELECT count(*)::int FROM products WHERE status='ACTIVE') AS "activeProducts",
      (SELECT count(*)::int FROM categories WHERE status='ACTIVE') AS "activeCategories",
      (SELECT count(*)::int FROM product_variants WHERE availability='AVAILABLE') AS "availableVariants",
      (SELECT count(*)::int FROM product_variants WHERE availability='UNAVAILABLE') AS "unavailableVariants",
      (SELECT count(*)::int FROM order_inquiries) AS "inquiries"`);
    ok(result.rows[0], res);
  } catch (error) { next(error); }
});

app.post("/order-inquiries", async (req, res, next) => {
  const client = await pool.connect();
  try {
    const input = z.object({ items: z.array(z.object({ productId: z.string().uuid(), variantId: z.string().uuid(), quantity: z.number().int().min(1).max(99) })).min(1).max(30), anonymousId: z.string().max(100).optional() }).parse(req.body);
    await client.query("BEGIN");
    let total = 0;
    const lines: Array<Record<string, string | number>> = [];
    for (const item of input.items) {
      const result = await client.query("SELECT p.id product_id,p.name,v.id variant_id,v.sku,v.colour,v.size,v.price FROM products p JOIN product_variants v ON v.product_id=p.id LEFT JOIN categories c ON c.id=p.category_id WHERE p.id=$1 AND v.id=$2 AND p.status='ACTIVE' AND (p.category_id IS NULL OR c.status='ACTIVE') AND v.availability='AVAILABLE' FOR SHARE OF v", [item.productId, item.variantId]);
      if (!result.rowCount) throw new ApiError(409, "VARIANT_UNAVAILABLE", "One or more selected variants are unavailable");
      const product = result.rows[0];
      const subtotal = Number(product.price) * item.quantity;
      total += subtotal;
      lines.push({ ...product, quantity: item.quantity, subtotal });
    }
    const reference = `AB-${Date.now().toString(36).toUpperCase()}-${randomUUID().slice(0, 4).toUpperCase()}`;
    const order = await client.query("INSERT INTO order_inquiries(reference_number,subtotal,total) VALUES($1,$2,$2) RETURNING id,reference_number,status,subtotal,total,created_at", [reference, total]);
    for (const product of lines) await client.query("INSERT INTO order_inquiry_items(order_inquiry_id,product_id,variant_id,product_name_snapshot,colour_snapshot,size_snapshot,sku_snapshot,unit_price_snapshot,quantity,subtotal) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)", [order.rows[0].id, product.product_id, product.variant_id, product.name, product.colour, product.size, product.sku, product.price, product.quantity, product.subtotal]);
    await client.query("INSERT INTO analytics_events(event_type,anonymous_id,metadata) VALUES('WHATSAPP_ORDER_INITIATED',$1,$2)", [input.anonymousId || null, { inquiryId: order.rows[0].id }]);
    await client.query("COMMIT");
    const message = ["Hello Annah Boutique,", "", "I would like to enquire about:", "", ...lines.flatMap((product, index) => [`${index + 1}. ${product.name}`, `   Colour: ${product.colour}`, `   Size: ${product.size}`, `   Quantity: ${product.quantity}`, `   Price: ₹${Number(product.price).toFixed(2)}`, ""]), `Total: ₹${total.toFixed(2)}`, "", "Please confirm availability and ordering details."].join("\n");
    const phone = (process.env.WHATSAPP_NUMBER || "").replace(/\D/g, "");
    ok({ inquiry: order.rows[0], message, whatsappUrl: phone ? `https://wa.me/${phone}?text=${encodeURIComponent(message)}` : null }, res);
  } catch (error) { await client.query("ROLLBACK"); next(error); } finally { client.release(); }
});

app.get("/admin/order-inquiries", requireAdmin, async (req, res, next) => {
  try {
    const page = Math.max(1, Math.floor(numberQuery(req.query.page, 1)));
    const limit = Math.min(100, Math.max(1, Math.floor(numberQuery(req.query.limit, 30))));
    const result = await pool.query("SELECT o.id,o.reference_number AS \"referenceNumber\",o.status,o.subtotal,o.total,o.created_at AS \"createdAt\",COALESCE(json_agg(json_build_object('productName',i.product_name_snapshot,'colour',i.colour_snapshot,'size',i.size_snapshot,'sku',i.sku_snapshot,'price',i.unit_price_snapshot,'quantity',i.quantity,'subtotal',i.subtotal)) FILTER (WHERE i.id IS NOT NULL),'[]') AS items FROM order_inquiries o LEFT JOIN order_inquiry_items i ON i.order_inquiry_id=o.id GROUP BY o.id ORDER BY o.created_at DESC LIMIT $1 OFFSET $2", [limit, (page - 1) * limit]);
    ok({ items: result.rows, page, limit }, res);
  } catch (error) { next(error); }
});

app.patch("/admin/order-inquiries/:id", requireAdmin, async (req, res, next) => {
  try {
    const { status } = z.object({ status: z.enum(["NEW", "CONTACTED", "CONFIRMED", "SOLD", "CANCELLED"]) }).parse(req.body);
    const result = await pool.query("UPDATE order_inquiries SET status=$2,updated_at=now() WHERE id=$1 RETURNING id,reference_number AS \"referenceNumber\",status,subtotal,total,created_at AS \"createdAt\"", [req.params.id, status]);
    if (!result.rowCount) throw new ApiError(404, "INQUIRY_NOT_FOUND", "Inquiry not found");
    ok(result.rows[0], res);
  } catch (error) { next(error); }
});

app.get("/admin/analytics/overview", requireAdmin, async (_req, res, next) => {
  try {
    const result = await pool.query("SELECT count(*) FILTER (WHERE event_type='PRODUCT_VIEW')::int AS \"productViews\",count(*) FILTER (WHERE event_type='ADD_TO_CART')::int AS \"addToCart\",(SELECT count(*)::int FROM order_inquiries) AS \"whatsappInquiries\",(SELECT count(*)::int FROM order_inquiries WHERE status='CONFIRMED') AS \"confirmedInquiries\",(SELECT count(*)::int FROM order_inquiries WHERE status='SOLD') AS \"soldInquiries\" FROM analytics_events");
    ok(result.rows[0], res);
  } catch (error) { next(error); }
});

app.get("/admin/analytics/products", requireAdmin, async (_req, res, next) => {
  try {
    const result = await pool.query("SELECT p.id,p.name,count(*) FILTER (WHERE e.event_type='PRODUCT_VIEW')::int AS views,count(*) FILTER (WHERE e.event_type='ADD_TO_CART')::int AS \"addToCart\",(SELECT count(*)::int FROM order_inquiry_items i WHERE i.product_id=p.id) AS requested,(SELECT COALESCE(sum(i.quantity),0)::int FROM order_inquiry_items i JOIN order_inquiries o ON o.id=i.order_inquiry_id WHERE i.product_id=p.id AND o.status='SOLD') AS sold FROM products p LEFT JOIN analytics_events e ON e.product_id=p.id GROUP BY p.id ORDER BY views DESC LIMIT 100");
    ok(result.rows, res);
  } catch (error) { next(error); }
});

const eventSchema = z.object({ eventType: z.enum(["PRODUCT_VIEW", "ADD_TO_CART", "REMOVE_FROM_CART", "WHATSAPP_ORDER_INITIATED", "SEARCH"]), productId: z.string().uuid().optional(), variantId: z.string().uuid().optional(), anonymousId: z.string().max(100).optional(), metadata: z.record(z.unknown()).default({}) });
app.post("/analytics/events", async (req, res, next) => { try { const input = eventSchema.parse(req.body); await pool.query("INSERT INTO analytics_events(event_type,product_id,variant_id,anonymous_id,metadata) VALUES($1,$2,$3,$4,$5)", [input.eventType, input.productId || null, input.variantId || null, input.anonymousId || null, input.metadata]); ok({ accepted: true }, res); } catch (error) { next(error); } });
app.post("/analytics/events/batch", async (req, res, next) => { const client = await pool.connect(); try { const inputs = z.array(eventSchema).min(1).max(100).parse(req.body.events); await client.query("BEGIN"); for (const input of inputs) await client.query("INSERT INTO analytics_events(event_type,product_id,variant_id,anonymous_id,metadata) VALUES($1,$2,$3,$4,$5)", [input.eventType, input.productId || null, input.variantId || null, input.anonymousId || null, input.metadata]); await client.query("COMMIT"); ok({ accepted: inputs.length }, res); } catch (error) { await client.query("ROLLBACK"); next(error); } finally { client.release(); } });

app.use(fail);
const server = app.listen(Number(process.env.PORT || 4003));
void pool.query("SELECT 1").catch(() => undefined);
process.on("SIGTERM", () => server.close(() => pool.end()));
