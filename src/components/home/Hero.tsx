"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/_shims";

interface HeroProps {
  data: {
    heading: string;
    description: string;
    ctaPrimary: { href: string; label: string };
    ctaSecondary: { href: string; label: string };
    desktopImage: string;
    mobileImage: string;
  };
}

export function Hero({ data }: HeroProps) {
  return (
    <section className="w-full">
      <div
        className={cn(
          "relative overflow-hidden bg-cream-deep rounded-2xl",
          "h-[85vh] max-h-[820px] min-h-[520px]",
          "my-4 container-editorial mx-auto"
        )}
      >
        <div className="absolute inset-0">
          <Image
            src={data.desktopImage}
            alt=""
            fill
            sizes="100vw"
            className="object-cover hidden md:block"
            priority
          />
          <Image
            src={data.mobileImage}
            alt=""
            fill
            sizes="100vw"
            className="object-cover md:hidden"
            priority
          />
        </div>

        <div className="absolute inset-0 bg-hero-gradient" />

        <div className="relative z-10 h-full flex flex-col justify-center pl-6 md:pl-16 pr-6 max-w-2xl animate-fade-in">
          <p className="font-script text-gold text-2xl md:text-3xl mb-3 drop-shadow-sm">
            — Annah Boutique
          </p>

          <h1 className="font-display font-medium tracking-tight text-foreground mb-4 text-display-1 leading-[1.05]">
            {data.heading}
          </h1>

          <p className="text-base md:text-lg text-muted-foreground max-w-xl mb-8 leading-relaxed">
            {data.description}
          </p>

          <div className="flex flex-wrap gap-3 mb-6">
            <Link href={data.ctaPrimary.href}>
              <Button
                variant="gold"
                size="lg"
                className="rounded-full px-7 py-3.5 text-white font-semibold h-auto shadow-soft hover:shadow-premium hover:-translate-y-0.5 transition-all duration-300"
              >
                {data.ctaPrimary.label}
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
            <Link href={data.ctaSecondary.href}>
              <Button
                variant="gold-outline"
                size="lg"
                className="rounded-full px-7 py-3.5 font-semibold h-auto hover:-translate-y-0.5 transition-all duration-300"
              >
                {data.ctaSecondary.label}
              </Button>
            </Link>
          </div>

          <div className="w-2/5 max-w-[10rem]">
            <div className="h-[3px] w-full bg-gold-line rounded-full opacity-90" />
          </div>
        </div>
      </div>
    </section>
  );
}
