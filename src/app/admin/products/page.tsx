"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { ImagePlus, Pencil, Plus, Search, Trash2 } from "lucide-react";
import type { Category } from "@/types/product";
import type { AdminProduct, AdminVariant } from "@/lib/adminApi";
import { adminApi } from "@/lib/adminApi";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type FormVariant = Omit<AdminVariant, "sku" | "price"> & { price: number | "" };
const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL", "Free Size"];
const newVariant = (): FormVariant => ({ colour: "", size: "", price: "", availability: "AVAILABLE" });
const empty = { name: "", slug: "", description: "", categoryId: "", status: "ACTIVE" as "ACTIVE" | "INACTIVE", featured: false };

export default function AdminProductsPage() {
  const [items, setItems] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [form, setForm] = useState(empty);
  const [variants, setVariants] = useState<FormVariant[]>([newVariant()]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);

  useEffect(() => {
    if (!imageFile) { setImagePreviewUrl(null); return; }
    const url = URL.createObjectURL(imageFile);
    setImagePreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  const load = useCallback(() => {
    const params = new URLSearchParams({ ...(search ? { search } : {}), ...(status ? { status } : {}), limit: "100" });
    return adminApi.products(params.toString()).then((result) => setItems(result.items)).catch((err) => setError(err instanceof Error ? err.message : "Unable to load products"));
  }, [search, status]);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => { adminApi.categories("status=ACTIVE").then(setCategories).catch(() => setCategories([])); }, []);

  const reset = () => { setEditing(null); setForm(empty); setVariants([newVariant()]); setImageFile(null); setFormOpen(false); };
  const openNewProduct = () => { reset(); setFormOpen(true); };
  const startEdit = (item: AdminProduct) => { setEditing(item); setForm({ name: item.name, slug: item.slug, description: item.description, categoryId: item.categoryId || "", status: item.status, featured: item.featured }); setVariants(item.variants?.map((variant) => ({ colour: variant.colour, size: variant.size, price: Number(variant.price), availability: variant.availability })) || [newVariant()]); setImageFile(null); setFormOpen(true); };
  const setVariant = (index: number, key: keyof FormVariant, value: string | number) => setVariants((current) => current.map((variant, itemIndex) => itemIndex === index ? { ...variant, [key]: value } : variant));

  async function uploadImage(productId: string, file: File) {
    const fileName = file.name.replace(/[^A-Za-z0-9._-]/g, "-");
    const signed = await adminApi.signedUpload({ fileName, contentType: file.type, fileSize: file.size, entityType: "product", entityId: productId });
    if (!signed.uploadUrl || !signed.path) throw new Error("Storage did not return a valid upload target");
    const upload = await fetch(signed.uploadUrl, { method: "PUT", headers: { "Content-Type": file.type, "Cache-Control": "max-age=31536000", "x-upsert": "false" }, body: file });
    if (!upload.ok) {
      const responseText = await upload.text().catch(() => "");
      let message = "Image upload failed";
      try { const payload = JSON.parse(responseText) as { message?: string; error?: string }; message = payload.message || payload.error || message; } catch { /* Storage may return a non-JSON error body. */ }
      throw new Error(`${message} (${upload.status})`);
    }
    const completed = await adminApi.completeUpload({ entityType: "product", entityId: productId, path: signed.path, altText: form.name, sortOrder: 0, isPrimary: true });
    if (!completed.url) throw new Error("Storage completed without an image URL");
    return completed;
  }

  async function removeImage(imageId: string) {
    if (!editing || !window.confirm("Remove this product image?")) return;
    try { await adminApi.deleteMedia(imageId); setEditing({ ...editing, images: editing.images.filter((image) => image.id !== imageId) }); }
    catch (err) { setError(err instanceof Error ? err.message : "Unable to remove image"); }
  }

  async function moveImage(imageId: string, direction: -1 | 1) {
    if (!editing) return;
    const ordered = [...editing.images].sort((a, b) => a.sortOrder - b.sortOrder);
    const index = ordered.findIndex((image) => image.id === imageId); const nextIndex = index + direction;
    if (index < 0 || nextIndex < 0 || nextIndex >= ordered.length) return;
    const current = ordered[index]; const next = ordered[nextIndex];
    try {
      await Promise.all([adminApi.updateMedia(current.id, { sortOrder: next.sortOrder }), adminApi.updateMedia(next.id, { sortOrder: current.sortOrder })]);
      setEditing({ ...editing, images: ordered.map((image) => image.id === current.id ? { ...image, sortOrder: next.sortOrder } : image.id === next.id ? { ...image, sortOrder: current.sortOrder } : image) });
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to reorder images"); }
  }

  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      if (!form.categoryId) throw new Error("Select a category");
      if (variants.some((variant) => !variant.colour || !variant.size || typeof variant.price !== "number" || !Number.isFinite(variant.price) || variant.price < 0)) throw new Error("Complete every variant field");
      const saved = editing?.id ? await adminApi.updateProduct(editing.id, { ...form, variants }) : await adminApi.createProduct({ ...form, variants });
      const image = imageFile && saved.id ? await uploadImage(saved.id, imageFile) : null;
      const complete = image ? { ...saved, images: [image, ...(saved.images || [])] } : saved;
      setItems((current) => editing?.id ? current.map((item) => item.id === complete.id ? complete : item) : [complete, ...current]);
      reset();
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to save product"); }
    finally { setBusy(false); }
  }

  async function deactivate(item: AdminProduct) { if (!item.id || !window.confirm(`Deactivate ${item.name}? It will disappear from the storefront.`)) return; try { await adminApi.deleteProduct(item.id); setItems((current) => current.filter((candidate) => candidate.id !== item.id)); } catch (err) { setError(err instanceof Error ? err.message : "Unable to deactivate product"); } }

  return <>
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs uppercase tracking-[.24em] text-primary">Live catalog</p><h1 className="mt-2 font-display text-4xl">Products</h1></div><button onClick={openNewProduct} className="rounded-full bg-[#392a25] px-4 py-2 text-sm text-white"><Plus className="mr-1 inline" size={15} /> New product</button></div>
    {error && <p className="mt-6 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <div className="mt-8">
      <section className="min-w-0 rounded-2xl border border-border bg-white"><div className="flex flex-wrap gap-2 border-b border-border p-4"><div className="relative min-w-0 flex-1 basis-full sm:min-w-[180px] sm:basis-auto"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><input value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={(event) => event.key === "Enter" && void load()} placeholder="Search products" className="h-10 w-full rounded-lg border border-border pl-9 pr-3 text-sm" /></div><select value={status} onChange={(event) => setStatus(event.target.value)} className="h-10 min-w-0 flex-1 rounded-lg border border-border px-2 text-sm sm:flex-none"><option value="">All status</option><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></select><button onClick={() => void load()} className="flex-1 rounded-lg border border-border px-3 text-sm sm:flex-none">Search</button></div><div className="divide-y divide-border">{items.length ? items.map((item) => <div key={item.id} className="flex flex-wrap items-center gap-3 p-4"><div className="h-16 w-14 shrink-0 overflow-hidden rounded-lg bg-secondary">{item.images?.[0]?.url && <img src={item.images[0].url} alt="" className="h-full w-full object-cover" />}</div><div className="min-w-0 flex-1"><p className="truncate font-medium">{item.name}</p><p className="mt-1 text-xs text-muted-foreground">{item.categoryName || "No category"} · {item.status} · {item.variants?.length || 0} variants</p><p className="mt-1 text-xs text-primary">{item.variants?.length ? `₹${Math.min(...item.variants.map((variant) => Number(variant.price))).toLocaleString("en-IN")} starting price` : "No price"}</p></div><div className="flex gap-2"><button onClick={() => startEdit(item)} className="rounded-lg border border-border p-2" aria-label={`Edit ${item.name}`}><Pencil size={15} /></button><button onClick={() => void deactivate(item)} className="rounded-lg border border-border p-2 text-red-700" aria-label={`Deactivate ${item.name}`}><Trash2 size={15} /></button></div></div>) : <p className="p-10 text-center text-sm text-muted-foreground">No products found. Create the first database-backed product.</p>}</div></section>
      <Dialog open={formOpen} onOpenChange={setFormOpen}><DialogContent className="max-h-[calc(100dvh-2rem)] max-w-2xl overflow-y-auto p-4 sm:p-6"><DialogHeader><DialogTitle className="font-display text-2xl">{editing ? "Edit product" : "New product"}</DialogTitle></DialogHeader><form onSubmit={submit} className="space-y-4"><label className="grid gap-1 text-sm">Name<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="h-10 w-full min-w-0 rounded-lg border border-border px-3" /></label><div className="grid gap-3 sm:grid-cols-2"><label className="grid min-w-0 gap-1 text-sm">Slug<input value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} className="h-10 w-full min-w-0 rounded-lg border border-border px-3" /></label><label className="grid min-w-0 gap-1 text-sm">Category<SearchableSelect value={form.categoryId} onChange={(categoryId) => setForm({ ...form, categoryId })} options={categories.flatMap((category) => category.id ? [{ value: category.id, label: category.name, image: category.image || undefined }] : [])} placeholder="Select category" searchPlaceholder="Search categories" /></label></div><label className="grid gap-1 text-sm">Description<textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="min-h-24 w-full min-w-0 rounded-lg border border-border p-3" /></label><div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><label className="grid min-w-0 gap-1 text-sm">Status<select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as "ACTIVE" | "INACTIVE" })} className="h-10 w-full rounded-lg border border-border px-2"><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></select></label><label className="flex items-center gap-2 pb-2 text-sm sm:self-end"><input type="checkbox" checked={form.featured} onChange={(event) => setForm({ ...form, featured: event.target.checked })} /> Featured</label></div><div className="rounded-xl border border-border p-3"><div className="flex items-center justify-between gap-3"><h3 className="text-sm font-semibold">Variants</h3><button type="button" onClick={() => setVariants([...variants, newVariant()])} className="shrink-0 text-xs underline">Add variant</button></div><div className="mt-3 space-y-3">{variants.map((variant, index) => <div key={index} className="grid grid-cols-2 gap-2 rounded-lg bg-secondary/40 p-2 sm:grid-cols-4"><input required placeholder="Colour" value={variant.colour} onChange={(event) => setVariant(index, "colour", event.target.value)} className="h-9 w-full min-w-0 rounded border border-border px-2 text-xs" /><select required aria-label="Size" value={variant.size} onChange={(event) => setVariant(index, "size", event.target.value)} className="h-9 w-full min-w-0 rounded border border-border px-2 text-xs"><option value="">Select size</option>{SIZE_OPTIONS.map((size) => <option key={size} value={size}>{size}</option>)}</select><input required type="number" min="0" step="0.01" placeholder="Price (₹)" aria-label="Price" value={variant.price} onChange={(event) => setVariant(index, "price", event.target.value === "" ? "" : Number(event.target.value))} className="h-9 w-full min-w-0 rounded border border-border px-2 text-xs" /><select value={variant.availability} onChange={(event) => setVariant(index, "availability", event.target.value)} className="h-9 w-full min-w-0 rounded border border-border px-1 text-xs"><option value="AVAILABLE">Available</option><option value="UNAVAILABLE">Unavailable</option></select>{variants.length > 1 && <button type="button" onClick={() => setVariants(variants.filter((_, itemIndex) => itemIndex !== index))} className="col-span-2 text-left text-xs text-red-700 sm:col-span-4">Remove variant</button>}</div>)}</div></div><label className="flex flex-wrap items-center gap-2 rounded-lg border border-dashed border-border p-3 text-sm"><ImagePlus size={17} /><span className="min-w-0 flex-1">Add product image</span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setImageFile(event.target.files?.[0] || null)} className="w-full min-w-0 text-xs sm:w-auto sm:max-w-[180px]" /></label>{imagePreviewUrl && <div className="rounded-xl border border-border bg-secondary/30 p-3"><p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Selected image preview</p><div className="relative h-48 overflow-hidden rounded-lg bg-white"><img src={imagePreviewUrl} alt="Selected product preview" className="h-full w-full object-contain" /></div></div>}{editing?.images?.length ? <div className="space-y-2"><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Saved images</p>{[...editing.images].sort((a, b) => a.sortOrder - b.sortOrder).map((image, index) => <div key={image.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-border p-2"><img src={image.url} alt={image.altText} className="h-12 w-10 shrink-0 rounded object-cover" /><span className="min-w-0 flex-1 truncate text-xs">Image {index + 1}</span><button type="button" onClick={() => void moveImage(image.id, -1)} className="text-xs underline">Up</button><button type="button" onClick={() => void moveImage(image.id, 1)} className="text-xs underline">Down</button><button type="button" onClick={() => void removeImage(image.id)} className="text-xs text-red-700 underline">Remove</button></div>)}</div> : null}<button disabled={busy} className="w-full rounded-full bg-[#392a25] px-4 py-3 text-sm text-white disabled:opacity-50">{busy ? "Saving…" : editing ? "Save changes" : "Create product"}</button></form></DialogContent></Dialog>
    </div>
  </>;
}
