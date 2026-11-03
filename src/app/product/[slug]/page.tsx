import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/services/productService";
import { ProductDetail } from "@/components/product/ProductDetail";
import { siteConfig } from "@/config/site";
export const dynamic = "force-dynamic";
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const {slug}=await params;const p=await getProductBySlug(slug);return p?{title:p.name,description:p.description,openGraph:{title:p.name,description:p.description,images:[p.images[0]]},alternates:{canonical:`/product/${p.slug}`}}:{title:"Product not found"};}
export default async function ProductPage({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const p=await getProductBySlug(slug);if(!p)notFound();const jsonLd={"@context":"https://schema.org","@type":"Product",name:p.name,image:p.images,description:p.description,sku:p.id,offers:{"@type":"Offer",priceCurrency:"INR",price:p.price.toString(),availability:p.stock>0?"https://schema.org/InStock":"https://schema.org/OutOfStock",url:`${siteConfig.url}/product/${p.slug}`},aggregateRating:{"@type":"AggregateRating",ratingValue:p.rating,reviewCount:p.reviewCount}};return <div className="container-editorial py-8 pb-28 md:py-12"><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonLd)}}/><ProductDetail product={p}/></div>;}
