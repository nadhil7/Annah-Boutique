"use client";

import * as React from "react";
import Image from "next/image";
import { Heart, Instagram } from "lucide-react";
import { cn } from "@/lib/utils";

interface InstagramFeedProps {
  items?: string[];
}

const DEFAULT_ITEMS = [
  "/instagram/insta-1.webp",
  "/instagram/insta-2.webp",
  "/instagram/insta-3.webp",
  "/instagram/insta-4.webp",
  "/instagram/insta-5.webp",
  "/instagram/insta-6.webp",
];

export function InstagramFeed({ items = DEFAULT_ITEMS }: InstagramFeedProps) {
  const displayItems = items.slice(0, 6);

  return (
    <section className="container-editorial mx-auto py-14 px-4 sm:px-6">
      <div className="w-full flex flex-col items-center text-center gap-3 mb-10">
        <Instagram className="w-7 h-7 text-[hsl(var(--primary))]" />
        <a
          href="https://instagram.com/annahboutique"
          target="_blank"
          rel="noopener noreferrer"
          className="group"
        >
          <h2 className="font-display font-medium tracking-tight text-heading-1 text-foreground group-hover:text-[hsl(var(--primary))] transition-colors">
            Follow @annahboutique
          </h2>
        </a>
        <p className="text-sm md:text-base text-muted-foreground max-w-xl mt-1 leading-relaxed">
          Tag us in your Annah Boutique moments — every month, we feature three of our favourite looks on the feed.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 md:gap-3">
        {displayItems.map((src, idx) => (
          <a
            key={idx}
            href="https://instagram.com/annahboutique"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Instagram post ${idx + 1}`}
            className="relative aspect-square overflow-hidden rounded-xl md:rounded-2xl group cursor-pointer shadow-card hover:shadow-premium transition-all duration-300"
          >
            <Image
              src={src}
              alt={`Instagram post ${idx + 1}`}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 16vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            />

            <div
              className={cn(
                "absolute inset-0 flex flex-col items-center justify-center gap-2",
                "bg-foreground/0 group-hover:bg-[#E1306C]/70 backdrop-blur-[2px]",
                "transition-all duration-300 ease-out"
              )}
            >
              <div
                className={cn(
                  "flex flex-col items-center gap-1.5",
                  "opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0",
                  "transition-all duration-300 ease-out"
                )}
              >
                <Heart className="w-6 h-6 md:w-7 md:h-7 text-white fill-white" />
                <span className="text-white text-xs md:text-sm font-semibold tracking-wide">
                  View on Instagram
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
