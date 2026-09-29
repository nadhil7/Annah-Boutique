"use client";

import * as React from "react";
import type { Product } from "@/types/product";
import { SectionHeading } from "./SectionHeading";
import { ProductGrid } from "@/components/product/ProductGrid";

interface TrendingProductsProps {
  products: Product[];
}

export function TrendingProducts({ products }: TrendingProductsProps) {
  const displayProducts = products.length > 0 ? products.slice(0, 8) : [];

  return (
    <section className="container-editorial mx-auto py-14 px-4 sm:px-6">
      <SectionHeading
        eyebrow="Trending Now"
        heading="What Everyone's Loving"
        subheading="Our most-loved silhouettes this month — handpicked from thousands of five-star reviews."
        ctaLabel="See All Trending →"
        ctaHref="/shop?sort=popular"
        align="center"
      />
      <ProductGrid products={displayProducts} />
    </section>
  );
}
