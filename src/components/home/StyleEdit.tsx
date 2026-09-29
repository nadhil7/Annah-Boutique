"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const STYLE_CARDS = [
  {
    title: "Festive Glamour",
    subtitle: "Weddings & Pujas",
    quote: "For the moments that become heirlooms.",
    href: "/category/festive-wear",
    image: "/banners/lookbook-festive.webp",
    className: "lg:col-span-1 aspect-[3/5]",
  },
  {
    title: "Wedding Guest Edit",
    subtitle: "Occasionwear",
    quote: "Dress like the best-dressed guest.",
    href: "/category/party-wear",
    image: "/banners/lookbook-wedding.webp",
    className: "lg:col-span-2 aspect-[6/5]",
  },
  {
    title: "Effortless Office Wear",
    subtitle: "Everyday Chic",
    quote: "Power dressing, reimagined in soft silks.",
    href: "/category/kurtis",
    image: "/banners/lookbook-office.webp",
    className: "lg:col-span-1 aspect-[3/5]",
  },
];

export function StyleEdit() {
  return (
    <section className="container-editorial mx-auto py-14 px-4 sm:px-6">
      <div className="w-full flex flex-col items-center text-center gap-2 mb-10">
        <p className="text-xs md:text-sm uppercase tracking-[0.25em] text-gold font-semibold mb-1">
          Style Files
        </p>
        <h2 className="font-display font-medium tracking-tight text-heading-1 text-foreground">
          The Style Edit
        </h2>
        <p className="text-sm md:text-base text-muted-foreground max-w-2xl mt-2 leading-relaxed">
          Three mood boards, infinite ways to wear. Curated by our stylists for every occasion on your calendar.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-5 auto-rows-min">
        {STYLE_CARDS.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className={cn(
              "relative group cursor-pointer overflow-hidden rounded-2xl",
              "aspect-[5/6] lg:aspect-auto",
              card.className,
              "shadow-card hover:shadow-premium transition-shadow duration-500"
            )}
          >
            <Image
              src={card.image}
              alt={card.title}
              fill
              sizes="(max-width: 1024px) 100vw, 25vw"
              className="object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent" />

            <div className="absolute bottom-0 left-0 w-full p-6 md:p-8 z-10">
              <p className="text-gold text-[10px] md:text-xs uppercase tracking-[0.25em] font-semibold mb-2 drop-shadow-sm">
                {card.subtitle}
              </p>
              <h3 className="font-display font-medium tracking-tight text-white text-heading-2 md:text-heading-1 leading-[1.15] mb-2 drop-shadow-sm">
                {card.title}
              </h3>
              <p className="text-white/85 text-xs md:text-sm italic leading-relaxed mb-5 max-w-md opacity-95 drop-shadow-sm">
                &ldquo;{card.quote}&rdquo;
              </p>
              <span className="inline-flex items-center gap-1.5 text-white text-xs md:text-sm font-semibold border-b border-white/80 pb-0.5 group-hover:gap-2.5 transition-all duration-200">
                Explore Edit
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
