"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/_shims";

interface PromoBannerProps {
  imageUrl: string;
  heading?: string;
  tagline?: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
  reverse?: boolean;
}

export function PromoBanner({
  imageUrl,
  heading = "Festive Edit '26",
  tagline = "Limited Edition · Up to 40% Off",
  description = "A curated capsule of occasion-wear designed for the season's grandest celebrations.",
  ctaLabel = "Shop the Edit",
  ctaHref = "/collection/festive-edit",
  reverse = false,
}: PromoBannerProps) {
  return (
    <section className="container-editorial mx-auto py-12 px-4 sm:px-6">
      <div
        className={cn(
          "w-full flex-col md:flex-row items-center rounded-3xl overflow-hidden",
          "bg-secondary/60 border border-border shadow-card",
          "p-8 md:p-10 lg:p-14 my-8 md:my-12 flex gap-8 md:gap-12"
        )}
      >
        <div
          className={cn(
            "relative aspect-[4/5] md:aspect-square lg:aspect-[5/4] w-full md:w-1/2 rounded-2xl overflow-hidden flex-shrink-0",
            reverse ? "md:order-2" : "md:order-1"
          )}
        >
          <Image
            src={imageUrl}
            alt={heading}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        </div>

        <div
          className={cn(
            "flex-1 flex flex-col items-start justify-center",
            reverse ? "md:order-1 md:pr-2" : "md:order-2 md:pl-2"
          )}
        >
          <p className="text-gold text-xs md:text-sm uppercase tracking-[0.25em] font-semibold mb-3">
            {tagline}
          </p>
          <h3 className="font-display font-medium tracking-tight text-display-2 text-foreground leading-[1.08] mb-4">
            {heading}
          </h3>
          <p className="text-muted-foreground text-base md:text-lg leading-relaxed mb-8 max-w-lg">
            {description}
          </p>
          <Link href={ctaHref}>
            <Button
              variant="gold"
              size="lg"
              className="rounded-full px-8 py-3.5 h-auto text-white font-semibold shadow-soft hover:shadow-premium hover:-translate-y-0.5 transition-all duration-300"
            >
              {ctaLabel}
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
