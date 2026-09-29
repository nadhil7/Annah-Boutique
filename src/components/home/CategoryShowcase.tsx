"use client";

import Image from "next/image";
import Link from "next/link";
import type { Category } from "@/types/_shims";
import { siteConfig } from "@/config/_shims";
import { cn } from "@/lib/utils";

interface CategoryShowcaseProps {
  categories: Category[];
}

export function CategoryShowcase({ categories }: CategoryShowcaseProps) {
  const displayCategories = categories.length > 0 ? categories : [
    { slug: "kurtis", name: "Kurtis", description: "", image: "/categories/kurtis.webp" },
    { slug: "sarees", name: "Sarees", description: "", image: "/categories/sarees.webp" },
    { slug: "dresses", name: "Dresses", description: "", image: "/categories/dresses.webp" },
    { slug: "co-ord-sets", name: "Co-ord Sets", description: "", image: "/categories/coord-sets.webp" },
    { slug: "tops", name: "Tops", description: "", image: "/categories/tops.webp" },
    { slug: "bottom-wear", name: "Bottom Wear", description: "", image: "/categories/bottom-wear.webp" },
    { slug: "party-wear", name: "Party Wear", description: "", image: "/categories/party-wear.webp" },
    { slug: "festive-wear", name: "Festive Wear", description: "", image: "/categories/festive-wear.webp" },
  ].slice(0, 8);

  return (
    <section className="container-editorial mx-auto py-14 px-4 sm:px-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {displayCategories.map((cat, idx) => (
          <Link
            key={cat.slug}
            href={`/category/${cat.slug}`}
            className={cn(
              "relative aspect-[4/5] rounded-2xl overflow-hidden cursor-pointer group",
              "bg-secondary shadow-card hover:shadow-premium transition-all duration-500",
              idx === 0 && "sm:col-span-2 sm:aspect-[2/2.5]"
            )}
          >
            <Image
              src={cat.image || `/banners/category-${cat.slug}.webp`}
              alt={cat.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1200px) 25vw, 20vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-foreground/75 via-foreground/15 to-transparent" />

            <div className="absolute bottom-0 left-0 w-full p-5 z-10">
              <h3 className="text-white font-display font-medium tracking-tight text-heading-2 mb-0.5 drop-shadow-sm">
                {cat.name}
              </h3>
              <p className="text-white/85 text-xs md:text-sm font-medium opacity-90">
                Shop {siteConfig.name}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
