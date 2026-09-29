"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Filter, SlidersHorizontal } from "lucide-react";
import { categories } from "@/data/categories";
import { collections } from "@/data/collections";

export function ShopControls() {
  const params = useSearchParams(); const router = useRouter(); const path = usePathname(); const [open, setOpen] = useState(false);
  const update = (key: string, value: string) => { const next = new URLSearchParams(params.toString()); if (value) { next.set(key, value); } else { next.delete(key); } next.delete("page"); router.push(`${path}?${next.toString()}`, { scroll: false }); };
  return <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-y border-border py-4">
    <button onClick={()=>setOpen(!open)} className="inline-flex items-center gap-2 text-sm lg:hidden" aria-expanded={open}><Filter size={16}/> Filters</button>
    <div className={`${open ? "flex" : "hidden"} w-full flex-wrap gap-2 lg:flex lg:w-auto`}>
      <select aria-label="Category" value={params.get("category") ?? ""} onChange={e=>update("category",e.target.value)} className="rounded-full border border-border bg-transparent px-4 py-2 text-sm"><option value="">All categories</option>{categories.map(c=><option key={c.slug} value={c.slug}>{c.name}</option>)}</select>
      <select aria-label="Size" value={params.get("size") ?? ""} onChange={e=>update("size",e.target.value)} className="rounded-full border border-border bg-transparent px-4 py-2 text-sm"><option value="">All sizes</option>{["XS","S","M","L","XL","XXL","Free Size"].map(s=><option key={s}>{s}</option>)}</select>
      <select aria-label="Color" value={params.get("color") ?? ""} onChange={e=>update("color",e.target.value)} className="rounded-full border border-border bg-transparent px-4 py-2 text-sm"><option value="">All colours</option>{["beige","black","blue","gold","green","maroon","mustard","navy","pink","teal","white"].map(c=><option key={c} value={c}>{c}</option>)}</select>
      <select aria-label="Collection" value={params.get("collection") ?? ""} onChange={e=>update("collection",e.target.value)} className="rounded-full border border-border bg-transparent px-4 py-2 text-sm"><option value="">All edits</option>{collections.map(c=><option key={c.slug} value={c.slug}>{c.name}</option>)}</select>
      <select aria-label="Price range" value={params.get("price") ?? ""} onChange={e=>{const next=new URLSearchParams(params.toString());next.delete("minPrice");next.delete("maxPrice");next.delete("price");if(e.target.value==="under-2000"){next.set("maxPrice","1999");}if(e.target.value==="2000-5000"){next.set("minPrice","2000");next.set("maxPrice","5000");}if(e.target.value==="over-5000"){next.set("minPrice","5001");}next.delete("page");router.push(`${path}?${next.toString()}`,{scroll:false});}} className="rounded-full border border-border bg-transparent px-4 py-2 text-sm"><option value="">Any price</option><option value="under-2000">Under ₹2,000</option><option value="2000-5000">₹2,000–₹5,000</option><option value="over-5000">₹5,000+</option></select>
      <select aria-label="Availability" value={params.get("availability") ?? ""} onChange={e=>update("availability",e.target.value)} className="rounded-full border border-border bg-transparent px-4 py-2 text-sm"><option value="">Availability</option><option value="in-stock">In stock</option></select>
      <select aria-label="Discount" value={params.get("discount") ?? ""} onChange={e=>update("discount",e.target.value)} className="rounded-full border border-border bg-transparent px-4 py-2 text-sm"><option value="">Any discount</option><option value="20">20% or more</option><option value="30">30% or more</option></select>
    </div>
    <label className="ml-auto inline-flex items-center gap-2 text-sm"><SlidersHorizontal size={15}/><span className="sr-only">Sort products</span><select aria-label="Sort products" value={params.get("sort") ?? "featured"} onChange={e=>update("sort",e.target.value)} className="bg-transparent outline-none"><option value="featured">Featured</option><option value="newest">Newest</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option><option value="popular">Popular</option><option value="discount">Discount</option></select></label>
  </div>;
}
