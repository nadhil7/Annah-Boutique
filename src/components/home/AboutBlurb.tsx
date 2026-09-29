"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/_shims";

export function AboutBlurb() {
  return (
    <section className="container-editorial mx-auto py-16 px-4 sm:px-6">
      <div className="flex flex-col md:flex-row items-center gap-8 md:gap-14 lg:gap-20">
        <div className="relative aspect-[4/5] w-full md:w-1/2 rounded-2xl overflow-hidden shadow-premium flex-shrink-0">
          <Image
            src="/banners/about-brand.webp"
            alt="Annah Boutique — Crafted with Love in India"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            priority={false}
          />
          <div className="absolute top-5 left-5 rounded-full bg-white/90 backdrop-blur px-4 py-2 shadow-sm">
            <span className="font-script text-gold text-xl">Est. 2019</span>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-start">
          <p className="text-gold text-xs md:text-sm uppercase tracking-[0.25em] font-semibold mb-3">
            Our Story
          </p>
          <h2 className="font-display font-medium tracking-tight text-heading-1 text-foreground leading-[1.15] mb-5">
            Crafted with Love in India
          </h2>

          <div className="space-y-4 text-muted-foreground text-base md:text-lg leading-relaxed mb-8">
            <p>
              At Annah Boutique, every stitch tells a story. We work closely with
              artisan clusters across Rajasthan, Uttar Pradesh, and Gujarat to bring
              you silhouettes rooted in heritage, designed for the modern woman.
            </p>
            <p>
              From hand-block prints to resplendent zardozi, each piece is ethically
              made using breathable, natural fabrics — because luxury should never
              come at the cost of our planet or our people.
            </p>
            <p>
              We believe in <span className="text-foreground font-medium">timeless silhouettes</span>{" "}
              that outlive trends — the kind of pieces you&apos;ll reach for again and
              again, season after season.
            </p>
          </div>

          <Link href="/about">
            <Button
              variant="gold-outline"
              size="lg"
              className="rounded-full px-7 py-3 h-auto font-semibold hover:-translate-y-0.5 transition-all duration-300"
            >
              Our Story
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
