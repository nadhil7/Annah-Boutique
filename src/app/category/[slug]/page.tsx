import { notFound } from "next/navigation";
import { categories, categoriesMap } from "@/data/categories";
import { queryProducts } from "@/services/productService";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ShopControls } from "@/components/shop/ShopControls";
export function generateStaticParams(){ return categories.map(({slug})=>({slug})); }
export default async function CategoryPage({params}:{params:Promise<{slug:string}>}) { const {slug}=await params; const category=categoriesMap[slug]; if(!category) notFound(); const result=await queryProducts({category:slug,limit:24}); return <div className="container-editorial py-12"><p className="text-xs uppercase tracking-[.2em] text-primary">Shop / Categories</p><h1 className="mt-3 font-display text-5xl">{category.name}</h1><p className="mt-3 max-w-2xl text-muted-foreground">{category.description}</p><ShopControls/><div className="mt-8"><ProductGrid products={result.items}/></div></div>; }
