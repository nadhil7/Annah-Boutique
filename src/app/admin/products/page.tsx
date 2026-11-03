"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { ImagePlus, Pencil, Plus, Search, Star, Trash2, X } from "lucide-react";
import type { Category } from "@/types/product";
import type { AdminProduct, AdminVariant } from "@/lib/adminApi";
import { adminApi } from "@/lib/adminApi";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/components/ui/toaster";

type FormVariant = Omit<AdminVariant, "sku" | "price"> & { price: number | "" };
type PendingImage = { id: string; file: File; previewUrl: string };
const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL", "Free Size"];
const ACCEPTED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_IMAGE_SIZE = 8 * 1024 * 1024;
const newVariant = (): FormVariant => ({ colour: "", size: "", price: "", availability: "AVAILABLE" });
const empty = { name: "", slug: "", description: "", categoryId: "", status: "ACTIVE" as "ACTIVE" | "INACTIVE", featured: false };

function messageOf(error: unknown, fallback: string) { return error instanceof Error && error.message ? error.message : fallback; }
function notifyError(title: string, error: unknown, fallback: string) { const description = messageOf(error, fallback); toast({ title, description, variant: "destructive" }); return description; }

export default function AdminProductsPage() {
  const [items, setItems] = useState<AdminProduct[]>([]); const [categories, setCategories] = useState<Category[]>([]); const [editing, setEditing] = useState<AdminProduct | null>(null); const [form, setForm] = useState(empty); const [variants, setVariants] = useState<FormVariant[]>([newVariant()]); const [pendingImages, setPendingImages] = useState<PendingImage[]>([]); const [search, setSearch] = useState(""); const [status, setStatus] = useState(""); const [busy, setBusy] = useState(false); const [error, setError] = useState(""); const [formOpen, setFormOpen] = useState(false);

  const load = useCallback(() => { const params = new URLSearchParams({ ...(search ? { search } : {}), ...(status ? { status } : {}), limit: "100" }); return adminApi.products(params.toString()).then((result) => setItems(result.items)).catch((err) => setError(messageOf(err, "Unable to load products"))); }, [search, status]);
  useEffect(() => { void load(); }, [load]);
  useEffect(() => { adminApi.categories("status=ACTIVE").then(setCategories).catch(() => setCategories([])); }, []);

  const revokePending = (images: PendingImage[]) => images.forEach((image) => URL.revokeObjectURL(image.previewUrl));
  const clearPending = () => { revokePending(pendingImages); setPendingImages([]); };
  const reset = () => { clearPending(); setEditing(null); setForm(empty); setVariants([newVariant()]); setFormOpen(false); };
  const openNewProduct = () => { reset(); setFormOpen(true); };
  const startEdit = (item: AdminProduct) => { setEditing({ ...item, images: [...(item.images || [])].sort((a, b) => a.sortOrder - b.sortOrder) }); setForm({ name: item.name, slug: item.slug, description: item.description, categoryId: item.categoryId || "", status: item.status, featured: item.featured }); setVariants(item.variants?.map((variant) => ({ colour: variant.colour, size: variant.size, price: Number(variant.price), availability: variant.availability })) || [newVariant()]); clearPending(); setError(""); setFormOpen(true); };
  const setVariant = (index: number, key: keyof FormVariant, value: string | number) => setVariants((current) => current.map((variant, itemIndex) => itemIndex === index ? { ...variant, [key]: value } : variant));

  function addImages(fileList: FileList | null) {
    const valid: PendingImage[] = [];
    for (const file of Array.from(fileList || [])) {
      if (!ACCEPTED_TYPES.has(file.type)) { notifyError("Unsupported image format", new Error(`${file.name}: use JPG, PNG, or WebP`), "Use JPG, PNG, or WebP images."); continue; }
      if (file.size > MAX_IMAGE_SIZE) { notifyError("Image file is too large", new Error(`${file.name}: maximum size is 8 MB`), "Images must be 8 MB or smaller."); continue; }
      valid.push({ id: `${file.name}-${file.size}-${file.lastModified}-${crypto.randomUUID()}`, file, previewUrl: URL.createObjectURL(file) });
    }
    if (valid.length) setPendingImages((current) => [...current, ...valid]);
  }
  const removePending = (id: string) => setPendingImages((current) => { const removed = current.find((image) => image.id === id); if (removed) URL.revokeObjectURL(removed.previewUrl); return current.filter((image) => image.id !== id); });
  const movePending = (id: string, direction: -1 | 1) => setPendingImages((current) => { const index = current.findIndex((image) => image.id === id); const nextIndex = index + direction; if (index < 0 || nextIndex < 0 || nextIndex >= current.length) return current; const next = [...current]; [next[index], next[nextIndex]] = [next[nextIndex], next[index]]; return next; });

  async function uploadImage(productId: string, pending: PendingImage, sortOrder: number, isPrimary: boolean) {
    const fileName = pending.file.name.replace(/[^A-Za-z0-9._-]/g, "-");
    const signed = await adminApi.signedUpload({ fileName, contentType: pending.file.type, fileSize: pending.file.size, entityType: "product", entityId: productId });
    if (!signed.uploadUrl || !signed.path || !signed.token) throw new Error("Storage did not return a valid signed upload target");
    const upload = await fetch(signed.uploadUrl, { method: "POST", headers: { "Content-Type": pending.file.type, "Cache-Control": "max-age=31536000", "x-upsert": "false" }, body: pending.file });
    if (!upload.ok) { const responseText = await upload.text().catch(() => ""); let detail = "Image upload failed"; try { const payload = JSON.parse(responseText) as { message?: string; error?: string }; detail = payload.message || payload.error || detail; } catch { /* Supabase may return a non-JSON response. */ } throw new Error(`${detail} (${upload.status})`); }
    const completed = await adminApi.completeUpload({ entityType: "product", entityId: productId, path: signed.path, altText: form.name, sortOrder, isPrimary });
    if (!("url" in completed) || !completed.url) throw new Error("Storage completed without an image URL");
    return completed;
  }

  async function removeImage(imageId: string) { if (!editing || !window.confirm("Remove this product image?")) return; try { await adminApi.deleteMedia(imageId); setEditing((current) => current ? { ...current, images: current.images.filter((image) => image.id !== imageId) } : current); toast({ title: "Image removed successfully", variant: "success" }); } catch (err) { setError(notifyError("Failed to remove image", err, "Unable to remove image.")); } }
  async function moveImage(imageId: string, direction: -1 | 1) { if (!editing) return; const ordered = [...editing.images].sort((a, b) => a.sortOrder - b.sortOrder); const index = ordered.findIndex((image) => image.id === imageId); const nextIndex = index + direction; if (index < 0 || nextIndex < 0 || nextIndex >= ordered.length) return; const current = ordered[index]; const next = ordered[nextIndex]; try { await Promise.all([adminApi.updateMedia(current.id, { sortOrder: next.sortOrder }), adminApi.updateMedia(next.id, { sortOrder: current.sortOrder })]); setEditing({ ...editing, images: ordered.map((image) => image.id === current.id ? { ...image, sortOrder: next.sortOrder } : image.id === next.id ? { ...image, sortOrder: current.sortOrder } : image) }); } catch (err) { setError(notifyError("Failed to reorder images", err, "Unable to reorder images.")); } }
  async function makePrimary(imageId: string) { if (!editing) return; try { await adminApi.updateMedia(imageId, { isPrimary: true }); setEditing({ ...editing, images: editing.images.map((image) => ({ ...image, isPrimary: image.id === imageId })) }); toast({ title: "Primary image updated", variant: "success" }); } catch (err) { setError(notifyError("Failed to update primary image", err, "Unable to update primary image.")); } }

  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      if (!form.categoryId) throw new Error("Select a category");
      if (variants.some((variant) => !variant.colour || !variant.size || typeof variant.price !== "number" || !Number.isFinite(variant.price) || variant.price < 0)) throw new Error("Complete every variant field");
      const wasEditing = Boolean(editing?.id);
      const saved = editing?.id ? await adminApi.updateProduct(editing.id, { ...form, variants }) : await adminApi.createProduct({ ...form, variants });
      const existingCount = saved.images?.length || 0;
      const results: Array<PromiseSettledResult<Awaited<ReturnType<typeof uploadImage>>>> = [];
      let uploadedCount = 0;
      for (const image of pendingImages) {
        try {
          results.push({ status: "fulfilled", value: await uploadImage(saved.id, image, existingCount + uploadedCount, existingCount === 0 && uploadedCount === 0) });
          uploadedCount += 1;
        } catch (reason) {
          results.push({ status: "rejected", reason });
        }
      }
      const succeeded = results.filter((result): result is PromiseFulfilledResult<Awaited<ReturnType<typeof uploadImage>>> => result.status === "fulfilled");
      const failed = results.filter((result): result is PromiseRejectedResult => result.status === "rejected");
      const refreshed = await adminApi.product(saved.id);
      setItems((current) => wasEditing ? current.map((item) => item.id === refreshed.id ? refreshed : item) : [refreshed, ...current]);
      if (failed.length) {
        const failedImages = pendingImages.filter((_, index) => results[index].status === "rejected");
        const successfulImages = pendingImages.filter((_, index) => results[index].status === "fulfilled");
        revokePending(successfulImages); setPendingImages(failedImages); setEditing(refreshed);
        const detail = `${wasEditing ? "Product updated" : "Product created"}; ${succeeded.length} of ${pendingImages.length} images uploaded. ${failed.length} image upload${failed.length === 1 ? "" : "s"} failed: ${failed[0].reason instanceof Error ? failed[0].reason.message : "storage error"}`;
        setError(notifyError("Some images could not be uploaded", new Error(detail), detail)); return;
      }
      if (succeeded.length) toast({ title: "Images uploaded successfully", description: `${succeeded.length} image${succeeded.length === 1 ? "" : "s"} saved.`, variant: "success" });
      toast({ title: wasEditing ? "Product updated successfully" : "Product created successfully", variant: "success" }); reset();
    } catch (err) { setError(notifyError("Failed to save product", err, "Unable to save product.")); }
    finally { setBusy(false); }
  }
  async function deactivate(item: AdminProduct) { if (!item.id || !window.confirm(`Deactivate ${item.name}? It will disappear from the storefront.`)) return; try { await adminApi.deleteProduct(item.id); setItems((current) => current.filter((candidate) => candidate.id !== item.id)); toast({ title: "Product deactivated", variant: "success" }); } catch (err) { setError(notifyError("Failed to deactivate product", err, "Unable to deactivate product.")); } }

  const orderedExisting = [...(editing?.images || [])].sort((a, b) => a.sortOrder - b.sortOrder);
  return <>
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs uppercase tracking-[.24em] text-primary">Live catalog</p><h1 className="mt-2 font-display text-4xl">Products</h1></div><button onClick={openNewProduct} className="rounded-full bg-[#392a25] px-4 py-2 text-sm text-white"><Plus className="mr-1 inline" size={15} /> New product</button></div>{error && <p className="mt-6 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <div className="mt-8"><section className="min-w-0 rounded-2xl border border-border bg-white"><div className="flex flex-wrap gap-2 border-b border-border p-4"><div className="relative min-w-0 flex-1 basis-full sm:min-w-[180px] sm:basis-auto"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><input value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={(event) => event.key === "Enter" && void load()} placeholder="Search products" className="h-10 w-full rounded-lg border border-border pl-9 pr-3 text-sm" /></div><select value={status} onChange={(event) => setStatus(event.target.value)} className="h-10 min-w-0 flex-1 rounded-lg border border-border px-2 text-sm sm:flex-none"><option value="">All status</option><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></select><button onClick={() => void load()} className="flex-1 rounded-lg border border-border px-3 text-sm sm:flex-none">Search</button></div><div className="divide-y divide-border">{items.length ? items.map((item) => <div key={item.id} className="flex flex-wrap items-center gap-3 p-4"><div className="h-16 w-14 shrink-0 overflow-hidden rounded-lg bg-secondary">{item.images?.[0]?.url && <img src={item.images[0].url} alt="" className="h-full w-full object-cover" />}</div><div className="min-w-0 flex-1"><p className="truncate font-medium">{item.name}</p><p className="mt-1 text-xs text-muted-foreground">{item.categoryName || "No category"} · {item.status} · {item.images?.length || 0} images · {item.variants?.length || 0} variants</p><p className="mt-1 text-xs text-primary">{item.variants?.length ? `₹${Math.min(...item.variants.map((variant) => Number(variant.price))).toLocaleString("en-IN")} starting price` : "No price"}</p></div><div className="flex gap-2"><button onClick={() => startEdit(item)} className="rounded-lg border border-border p-2" aria-label={`Edit ${item.name}`}><Pencil size={15} /></button><button onClick={() => void deactivate(item)} className="rounded-lg border border-border p-2 text-red-700" aria-label={`Deactivate ${item.name}`}><Trash2 size={15} /></button></div></div>) : <p className="p-10 text-center text-sm text-muted-foreground">No products found. Create the first database-backed product.</p>}</div></section>
      <Dialog open={formOpen} onOpenChange={setFormOpen}><DialogContent className="max-h-[calc(100dvh-2rem)] max-w-3xl overflow-y-auto p-4 sm:p-6"><DialogHeader><DialogTitle className="font-display text-2xl">{editing ? "Edit product" : "New product"}</DialogTitle></DialogHeader><form onSubmit={submit} className="space-y-4"><label className="grid gap-1 text-sm">Name<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="h-10 w-full min-w-0 rounded-lg border border-border px-3" /></label><div className="grid gap-3 sm:grid-cols-2"><label className="grid min-w-0 gap-1 text-sm">Slug<input value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} className="h-10 w-full min-w-0 rounded-lg border border-border px-3" /></label><label className="grid min-w-0 gap-1 text-sm">Category<SearchableSelect value={form.categoryId} onChange={(categoryId) => setForm({ ...form, categoryId })} options={categories.flatMap((category) => category.id ? [{ value: category.id, label: category.name, image: category.image || undefined }] : [])} placeholder="Select category" searchPlaceholder="Search categories" /></label></div><label className="grid gap-1 text-sm">Description<textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="min-h-24 w-full min-w-0 rounded-lg border border-border p-3" /></label><div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><label className="grid min-w-0 gap-1 text-sm">Status<select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as "ACTIVE" | "INACTIVE" })} className="h-10 w-full rounded-lg border border-border px-2"><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></select></label><label className="flex items-center gap-2 pb-2 text-sm sm:self-end"><input type="checkbox" checked={form.featured} onChange={(event) => setForm({ ...form, featured: event.target.checked })} /> Featured</label></div><div className="rounded-xl border border-border p-3"><div className="flex items-center justify-between gap-3"><h3 className="text-sm font-semibold">Variants</h3><button type="button" onClick={() => setVariants([...variants, newVariant()])} className="shrink-0 text-xs underline">Add variant</button></div><div className="mt-3 space-y-3">{variants.map((variant, index) => <div key={index} className="grid grid-cols-2 gap-2 rounded-lg bg-secondary/40 p-2 sm:grid-cols-4"><input required placeholder="Colour" value={variant.colour} onChange={(event) => setVariant(index, "colour", event.target.value)} className="h-9 w-full min-w-0 rounded border border-border px-2 text-xs" /><select required aria-label="Size" value={variant.size} onChange={(event) => setVariant(index, "size", event.target.value)} className="h-9 w-full min-w-0 rounded border border-border px-2 text-xs"><option value="">Select size</option>{SIZE_OPTIONS.map((size) => <option key={size} value={size}>{size}</option>)}</select><input required type="number" min="0" step="0.01" placeholder="Price (₹)" aria-label="Price" value={variant.price} onChange={(event) => setVariant(index, "price", event.target.value === "" ? "" : Number(event.target.value))} className="h-9 w-full min-w-0 rounded border border-border px-2 text-xs" /><select value={variant.availability} onChange={(event) => setVariant(index, "availability", event.target.value as FormVariant["availability"])} className="h-9 w-full min-w-0 rounded border border-border px-1 text-xs"><option value="AVAILABLE">Available</option><option value="UNAVAILABLE">Unavailable</option></select>{variants.length > 1 && <button type="button" onClick={() => setVariants(variants.filter((_, itemIndex) => itemIndex !== index))} className="col-span-2 text-left text-xs text-red-700 sm:col-span-4">Remove variant</button>}</div>)}</div></div><div className="rounded-xl border border-dashed border-border p-3"><div className="flex flex-wrap items-center justify-between gap-2"><label className="flex cursor-pointer items-center gap-2 text-sm"><ImagePlus size={17} /><span>Add product images</span><input type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={(event) => { addImages(event.target.files); event.currentTarget.value = ""; }} className="sr-only" /></label><span className="text-xs text-muted-foreground">JPG, PNG, WebP · max 8 MB each</span></div>{pendingImages.length ? <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">{pendingImages.map((image, index) => <div key={image.id} className="relative rounded-lg border border-border bg-white p-2"><img src={image.previewUrl} alt={`Selected product image ${index + 1}`} className="h-32 w-full rounded object-contain" /><div className="mt-2 flex items-center justify-between gap-1 text-xs"><span className="truncate">New {index + 1}</span><button type="button" onClick={() => removePending(image.id)} aria-label={`Remove selected image ${index + 1}`}><X size={15} /></button></div><div className="mt-1 flex gap-2 text-xs"><button type="button" disabled={index === 0} onClick={() => movePending(image.id, -1)} className="underline disabled:opacity-40">Up</button><button type="button" disabled={index === pendingImages.length - 1} onClick={() => movePending(image.id, 1)} className="underline disabled:opacity-40">Down</button></div></div>)}</div> : <p className="mt-3 text-xs text-muted-foreground">Selected images will appear here before saving.</p>}</div>{orderedExisting.length ? <div className="space-y-2"><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Saved images</p>{orderedExisting.map((image, index) => <div key={image.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-border p-2"><img src={image.url} alt={image.altText || `${form.name} image ${index + 1}`} className="h-16 w-14 shrink-0 rounded object-cover" /><span className="min-w-0 flex-1 truncate text-xs">Image {index + 1}{image.isPrimary ? " · Primary" : ""}</span><button type="button" onClick={() => void makePrimary(image.id)} className="text-xs underline" disabled={image.isPrimary}><Star size={13} className="mr-1 inline" />Primary</button><button type="button" onClick={() => void moveImage(image.id, -1)} className="text-xs underline">Up</button><button type="button" onClick={() => void moveImage(image.id, 1)} className="text-xs underline">Down</button><button type="button" onClick={() => void removeImage(image.id)} className="text-xs text-red-700 underline">Remove</button></div>)}</div> : null}<button disabled={busy} className="w-full rounded-full bg-[#392a25] px-4 py-3 text-sm text-white disabled:opacity-50">{busy ? "Saving…" : editing ? "Save changes" : "Create product"}</button></form></DialogContent></Dialog>
    </div>
  </>;
}
