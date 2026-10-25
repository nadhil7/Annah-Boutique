import { notFound } from "next/navigation";
import { collectionsMap } from "@/data/collections";
import { queryProducts } from "@/services/productService";
import { ProductGrid } from "@/components/product/ProductGrid";
export const dynamic = "force-dynamic";
export default async function CollectionPage({params}:{params:Promise<{slug:string}>}) { const {slug}=await params; const collection=collectionsMap[slug]; if(!collection) notFound(); const result=await queryProducts({collection:slug,limit:24}); return <div className="container-editorial py-12"><p className="text-xs uppercase tracking-[.2em] text-primary">The Annah edits</p><p className="mt-5 font-script text-2xl text-primary">{collection.tagline}</p><h1 className="font-display text-5xl">{collection.name}</h1><p className="mt-3 max-w-2xl text-muted-foreground">{collection.description}</p><div className="mt-10"><ProductGrid products={result.items}/></div></div>; }
