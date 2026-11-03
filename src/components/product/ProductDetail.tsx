"use client";

import { useState } from "react";
import type { Product } from "@/types/product";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductBuyPanel } from "@/components/product/ProductBuyPanel";

export function ProductDetail({ product }: { product: Product }) {
  const [colour, setColour] = useState(product.colors[0] || null);
  const variantImages = colour ? product.variantImages?.[colour] || [] : [];
  const images = variantImages.length ? variantImages : product.images;
  return <div className="grid lg:grid-cols-2 gap-8 lg:gap-14"><ProductGallery images={images} name={product.name} /><div className="lg:sticky lg:top-28 lg:self-start py-2"><p className="text-xs uppercase tracking-[.2em] text-primary">{product.category.replaceAll("-", " ")}</p><h1 className="mt-3 font-display text-4xl md:text-5xl">{product.name}</h1><p className="mt-3 text-sm">★ {product.rating.toFixed(1)} <span className="text-muted-foreground">({product.reviewCount} reviews)</span></p><div className="mt-5 flex items-baseline gap-3"><strong className="text-2xl text-primary">₹{product.price.toLocaleString("en-IN")}</strong></div><p className="mt-6 leading-relaxed text-muted-foreground">{product.description}</p><div className="my-7 border-t border-border"/><ProductBuyPanel product={product} onColourChange={setColour} /></div></div>;
}
