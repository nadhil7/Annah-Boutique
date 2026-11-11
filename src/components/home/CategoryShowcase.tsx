"use client";

import Image from "next/image";
import Link from "next/link";
import type { Category } from "@/types/_shims";
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
              unoptimized
              sizes="(max-width: 640px) 50vw, (max-width: 1200px) 25vw, 20vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            />

            <div className="p-4 md:p-5 bg-background">
              <h3 className="text-foreground font-display font-medium tracking-tight text-xl md:text-2xl">
                {cat.name}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Explore collection <span aria-hidden="true">→</span>
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
