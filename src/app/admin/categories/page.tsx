"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { ImagePlus, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import type { Category } from "@/types/product";
import { adminApi } from "@/lib/adminApi";
import { CatalogApiError } from "@/lib/catalogApi";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/components/ui/toaster";

const empty: { name: string; slug: string; description: string; image: string; status: "ACTIVE" | "INACTIVE"; sortOrder: number } = { name: "", slug: "", description: "", image: "", status: "ACTIVE", sortOrder: 0 };
const ACCEPTED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_IMAGE_SIZE = 8 * 1024 * 1024;
function messageOf(error: unknown, fallback: string) { return error instanceof Error && error.message ? error.message : fallback; }
function notifyError(title: string, error: unknown, fallback: string) { const description = messageOf(error, fallback); toast({ title, description, variant: "destructive" }); return description; }

export default function AdminCategoriesPage() {
  const [items, setItems] = useState<Category[]>([]); const [form, setForm] = useState(empty); const [editing, setEditing] = useState<Category | null>(null); const [originalImage, setOriginalImage] = useState(""); const [categoryFile, setCategoryFile] = useState<File | null>(null); const [previewUrl, setPreviewUrl] = useState<string | null>(null); const [search, setSearch] = useState(""); const [busy, setBusy] = useState(false); const [error, setError] = useState(""); const [formOpen, setFormOpen] = useState(false);
  const load = useCallback(() => { const params = new URLSearchParams({ status: "ACTIVE", ...(search ? { search } : {}) }); return adminApi.categories(params.toString()).then(setItems).catch((err) => setError(messageOf(err, "Unable to load categories"))); }, [search]);
  useEffect(() => { void load(); }, [load]);
  useEffect(() => { if (!categoryFile) { setPreviewUrl(null); return; } const url = URL.createObjectURL(categoryFile); setPreviewUrl(url); return () => URL.revokeObjectURL(url); }, [categoryFile]);

  const startEdit = (item: Category) => { setEditing(item); setOriginalImage(item.image || ""); setForm({ name: item.name, slug: item.slug, description: item.description, image: item.image, status: item.status || "ACTIVE", sortOrder: item.sortOrder || 0 }); setCategoryFile(null); setError(""); setFormOpen(true); };
  const reset = () => { setEditing(null); setOriginalImage(""); setForm(empty); setCategoryFile(null); setFormOpen(false); };
  const openNewCategory = () => { reset(); setFormOpen(true); };
  function chooseFile(file: File | undefined) { if (!file) return; if (!ACCEPTED_TYPES.has(file.type)) { notifyError("Unsupported image format", new Error("Use JPG, PNG, or WebP images."), "Use JPG, PNG, or WebP images."); return; } if (file.size > MAX_IMAGE_SIZE) { notifyError("Image file is too large", new Error("Images must be 8 MB or smaller."), "Images must be 8 MB or smaller."); return; } setCategoryFile(file); }

  async function uploadCategoryImage(categoryId: string, file: File) {
    const fileName = file.name.replace(/[^A-Za-z0-9._-]/g, "-");
    const signed = await adminApi.signedUpload({ fileName, contentType: file.type, fileSize: file.size, entityType: "category", entityId: categoryId });
    if (!signed.uploadUrl || !signed.path || !signed.token) throw new Error("Storage did not return a valid signed upload target");
    const upload = await fetch(signed.uploadUrl, { method: "POST", headers: { "Content-Type": file.type, "Cache-Control": "max-age=31536000", "x-upsert": "false" }, body: file });
    if (!upload.ok) { const detail = await upload.text().catch(() => ""); throw new Error(`Image upload failed${detail ? `: ${detail.slice(0, 180)}` : ""} (${upload.status})`); }
    const completed = await adminApi.completeUpload({ entityType: "category", entityId: categoryId, path: signed.path });
    if (!("category" in completed) || !completed.category) throw new Error("Category image update returned no category");
    return completed.category;
  }

  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const image = categoryFile ? undefined : (editing && form.image === originalImage ? undefined : form.image || null);
      const input = { ...form, image, sortOrder: Number(form.sortOrder) };
      const saved = editing?.id ? await adminApi.updateCategory(editing.id, input) : await adminApi.createCategory({ ...input, image: form.image || null });
      const finalCategory = categoryFile && saved.id ? await uploadCategoryImage(saved.id, categoryFile) : saved;
      setItems((current) => editing?.id ? current.map((item) => item.id === finalCategory.id ? finalCategory : item) : [finalCategory, ...current]);
      toast({ title: categoryFile ? "Category image updated successfully" : editing ? "Category updated successfully" : "Category created successfully", variant: "success" });
      reset();
    } catch (err) {
      setError(notifyError(categoryFile ? "Failed to update category image" : "Failed to save category", err, categoryFile ? "The category was not updated with this image." : "Unable to save category."));
    } finally { setBusy(false); }
  }
  async function deactivate(item: Category) {
    if (!item.id) return;
    try {
      await adminApi.deleteCategory(item.id);
      setItems((current) => current.filter((candidate) => candidate.id !== item.id));
      toast({ title: "Category deactivated", variant: "success" });
    } catch (err) {
      if (err instanceof CatalogApiError && err.code === "CATEGORY_HAS_PRODUCTS" && window.confirm(`${err.message}\n\nProducts will remain safely stored, but the category and its products will be hidden from storefront navigation. Continue?`)) {
        try {
          await adminApi.deleteCategory(item.id, true);
          setItems((current) => current.filter((candidate) => candidate.id !== item.id));
          toast({ title: "Category deactivated", variant: "success" });
          return;
        } catch (confirmError) { setError(notifyError("Failed to deactivate category", confirmError, "Unable to deactivate category.")); return; }
      }
      if (!(err instanceof CatalogApiError && err.code === "CATEGORY_HAS_PRODUCTS")) setError(notifyError("Failed to deactivate category", err, "Unable to deactivate category."));
    }
  }

  return <><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs uppercase tracking-[.24em] text-primary">Catalog setup</p><h1 className="mt-2 font-display text-4xl">Categories</h1></div><button onClick={openNewCategory} className="rounded-full bg-[#392a25] px-4 py-2 text-sm text-white"><Plus className="mr-1 inline" size={15} /> New category</button></div>{error && <p className="mt-6 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}<div className="mt-8 min-w-0"><section className="min-w-0 rounded-2xl border border-border bg-white"><div className="flex flex-wrap gap-2 border-b border-border p-4"><div className="relative min-w-0 flex-1 basis-full sm:basis-auto"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><input value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={(event) => event.key === "Enter" && void load()} placeholder="Search categories" className="h-10 w-full rounded-lg border border-border pl-9 pr-3 text-sm" /></div><button onClick={() => void load()} className="flex-1 rounded-lg border border-border px-3 text-sm sm:flex-none">Search</button></div><div className="divide-y divide-border">{items.length ? items.map((item) => <div key={item.id || item.slug} className="flex flex-wrap items-center gap-3 p-4"><div className="h-14 w-12 shrink-0 overflow-hidden rounded-lg bg-secondary">{item.image && <img src={item.image} alt="" className="h-full w-full object-cover" />}</div><div className="min-w-0 flex-1"><p className="font-medium">{item.name}</p><p className="mt-1 text-xs text-muted-foreground">/{item.slug} · {item.status}</p></div><div className="flex gap-2"><button onClick={() => startEdit(item)} className="rounded-lg border border-border p-2" aria-label={`Edit ${item.name}`}><Pencil size={15} /></button><button onClick={() => void deactivate(item)} className="rounded-lg border border-border p-2 text-red-700" aria-label={`Edit ${item.name}`}><Trash2 size={15} /></button></div></div>) : <p className="p-10 text-center text-sm text-muted-foreground">No categories found.</p>}</div></section></div><Dialog open={formOpen} onOpenChange={setFormOpen}><DialogContent className="max-h-[calc(100dvh-2rem)] max-w-lg overflow-y-auto p-4 sm:p-6"><DialogHeader><DialogTitle className="font-display text-2xl">{editing ? "Edit category" : "New category"}</DialogTitle></DialogHeader><form onSubmit={submit} className="space-y-4"><label className="grid gap-1 text-sm">Name<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="h-10 w-full min-w-0 rounded-lg border border-border px-3" /></label><label className="grid gap-1 text-sm">Slug<input value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} placeholder="generated-from-name" className="h-10 w-full min-w-0 rounded-lg border border-border px-3" /></label><label className="grid gap-1 text-sm">Description<textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="min-h-24 w-full min-w-0 rounded-lg border border-border p-3" /></label><label className="grid gap-1 text-sm">Image URL<input type="url" value={form.image} onChange={(event) => setForm({ ...form, image: event.target.value })} className="h-10 w-full min-w-0 rounded-lg border border-border px-3" /></label><div className="rounded-xl border border-dashed border-border p-3"><div className="flex items-center justify-between gap-2"><label className="flex cursor-pointer items-center gap-2 text-sm"><ImagePlus size={17} /><span>Upload replacement image</span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { chooseFile(event.target.files?.[0]); event.currentTarget.value = ""; }} className="sr-only" /></label>{categoryFile && <button type="button" onClick={() => setCategoryFile(null)} className="text-xs underline"><X size={14} className="mr-1 inline" />Clear</button>}</div>{(previewUrl || form.image) && <div className="mt-3 h-48 overflow-hidden rounded-lg bg-white"><img src={previewUrl || form.image} alt="Category preview" className="h-full w-full object-contain" /></div>}<p className="mt-2 text-xs text-muted-foreground">The previous image is kept until the replacement is uploaded and saved.</p></div><div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><label className="grid min-w-0 gap-1 text-sm">Status<select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as "ACTIVE" | "INACTIVE" })} className="h-10 w-full min-w-0 rounded-lg border border-border px-2"><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></select></label><label className="grid min-w-0 gap-1 text-sm">Sort order<input type="number" min="0" value={form.sortOrder} onChange={(event) => setForm({ ...form, sortOrder: Number(event.target.value) })} className="h-10 w-full min-w-0 rounded-lg border border-border px-3" /></label></div><button disabled={busy} className="w-full rounded-full bg-[#392a25] px-4 py-3 text-sm text-white disabled:opacity-50">{busy ? "Saving…" : editing ? "Save changes" : "Create category"}</button></form></DialogContent></Dialog></>;
}
