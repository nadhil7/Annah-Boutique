"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Collection, Product } from "@/types/product";
import { cn } from "@/lib/utils";
import { ProductCard } from "@/components/product/ProductCard";

interface FeaturedCollectionProps {
  collection: Collection;
  products: Product[];
}

export function FeaturedCollection({ collection, products }: FeaturedCollectionProps) {
  const displayProducts = products.length > 0 ? products.slice(0, 4) : [];
  const [a, b, c, d] = displayProducts;

  const fallbackCollection: Collection = collection.slug
    ? collection
    : {
        slug: "festive-edit",
        name: "Festive Edit",
        tagline: "Crafted for the celebrations",
        description:
          "Rich fabrics, luminous zari, and heirloom craftsmanship — our Festive Edit '26 is a love letter to timeless Indian elegance.",
        heroImage: "/collections/festive-edit-hero.webp",
      };

  return (
    <section className="container-editorial mx-auto py-14 px-4 sm:px-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <Link
          href={`/collection/${fallbackCollection.slug}`}
          className={cn(
            "lg:col-span-5 relative overflow-hidden rounded-2xl group cursor-pointer",
            "aspect-[9/16] md:aspect-[4/5] lg:aspect-auto lg:min-h-[640px]",
            "shadow-card hover:shadow-premium transition-shadow duration-500"
          )}
        >
          <Image
            src={fallbackCollection.heroImage}
            alt={fallbackCollection.name}
            fill
            sizes="(max-width: 1024px) 100vw, 42vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-foreground/85 via-foreground/30 to-foreground/5" />

          <div className="absolute bottom-0 left-0 w-full p-7 md:p-9 z-10">
            <p className="text-gold/95 text-xs md:text-sm uppercase tracking-[0.25em] font-semibold mb-3">
              {fallbackCollection.tagline}
            </p>
            <h3 className="font-display font-medium tracking-tight text-white text-display-2 leading-[1.1] mb-3">
              {fallbackCollection.name}
            </h3>
            <p className="text-white/85 text-sm md:text-base leading-relaxed mb-6 max-w-md">
              {fallbackCollection.description}
            </p>
            <span className="inline-flex items-center gap-2 px-6 py-3 rounded-full border-2 border-white/90 text-white font-semibold text-sm group-hover:bg-white group-hover:text-foreground transition-all duration-300">
              Explore Collection
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
        </Link>

        <div className="lg:col-span-7 grid grid-cols-2 gap-4 lg:gap-5">
          {[a, b, c, d].map(
            (p, idx) =>
              p && (
                <div key={p.id} className={cn(idx < 2 ? "mb-1" : "")}>
                  <ProductCard product={p} priority={idx < 2} />
                </div>
              )
          )}
          {displayProducts.length === 0 &&
            Array.from({ length: 4 }).map((_, i) => (
              <div
                key={`ph-${i}`}
                className="aspect-[3/4] rounded-2xl bg-secondary border border-border/60"
              />
            ))}
        </div>
      </div>
    </section>
  );
}
