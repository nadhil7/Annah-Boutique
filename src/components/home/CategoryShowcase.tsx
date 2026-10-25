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
  const displayCategories = categories;

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
              src={cat.image || "/logo.svg"}
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
