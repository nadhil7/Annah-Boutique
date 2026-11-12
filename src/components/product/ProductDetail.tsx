"use client";

import { useState } from "react";
import type { Product } from "@/types/product";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductBuyPanel } from "@/components/product/ProductBuyPanel";

export function ProductDetail({ product }: { product: Product }) {
  const [colour, setColour] = useState(product.colors[0] || null);
  const variantImages = colour ? product.variantImages?.[colour] || [] : [];
  const images = variantImages.length ? variantImages : product.images;

  return <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(0,1.08fr)_minmax(340px,.92fr)] lg:items-start lg:gap-16 xl:gap-20"><ProductGallery images={images} name={product.name} /><section className="rounded-2xl bg-background/70 lg:sticky lg:top-28 lg:self-start lg:p-2"><p className="text-xs font-medium uppercase tracking-[.22em] text-primary">{product.category.replaceAll("-", " ")}</p><h1 className="mt-3 font-display text-4xl leading-[.95] md:text-5xl xl:text-6xl">{product.name}</h1><p className="mt-4 text-sm">★ {product.rating.toFixed(1)} <span className="text-muted-foreground">({product.reviewCount} reviews)</span></p><div className="mt-6 flex items-baseline gap-3"><strong className="font-display text-3xl text-primary">₹{product.price.toLocaleString("en-IN")}</strong></div>{product.description && <p className="mt-6 max-w-xl leading-7 text-muted-foreground">{product.description}</p>}<div className="my-8 border-t border-border"/><ProductBuyPanel product={product} onColourChange={setColour} /></section></div>;
}
