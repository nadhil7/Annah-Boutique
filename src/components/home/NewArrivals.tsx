"use client";

import * as React from "react";
import type { Product } from "@/types/product";
import { SectionHeading } from "./SectionHeading";
import { ProductGrid } from "@/components/product/ProductGrid";

interface NewArrivalsProps {
  products: Product[];
}

export function NewArrivals({ products }: NewArrivalsProps) {
  const displayProducts = products.length > 0 ? products.slice(0, 8) : [];

  return (
    <section className="container-editorial mx-auto py-14 px-4 sm:px-6">
      <SectionHeading
        eyebrow="Fresh Drops"
        heading="New Arrivals"
        subheading="Just in from our artisans — handpicked silhouettes to elevate your wardrobe this season."
        ctaLabel="View All →"
        ctaHref="/collection/new-arrivals"
        align="left"
      />
      <ProductGrid products={displayProducts} />
    </section>
  );
}
