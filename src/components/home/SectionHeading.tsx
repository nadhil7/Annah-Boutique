"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  heading: string;
  subheading?: string;
  align?: "left" | "center";
  ctaLabel?: string;
  ctaHref?: string;
  className?: string;
}

export function SectionHeading({
  eyebrow,
  heading,
  subheading,
  align = "left",
  ctaLabel,
  ctaHref,
  className,
}: SectionHeadingProps) {
  const alignmentClasses =
    align === "center"
      ? "text-center items-center"
      : "text-left items-start";

  return (
    <div className={cn("w-full flex flex-col gap-2 mb-8 md:mb-10", alignmentClasses, className)}>
      {align === "center" ? (
        <div className="w-full flex flex-col items-center">
          {eyebrow && (
            <p className="text-xs md:text-sm uppercase tracking-[0.25em] text-gold font-semibold mb-2">
              {eyebrow}
            </p>
          )}
          <div className="flex w-full items-center justify-between gap-6">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            <h2 className="min-w-0 px-3 text-center font-display font-medium tracking-tight text-heading-1 text-foreground">
              {heading}
            </h2>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          </div>
          {subheading && (
            <p className="text-sm md:text-base text-muted-foreground max-w-2xl mt-3 leading-relaxed">
              {subheading}
            </p>
          )}
          {ctaLabel && ctaHref && (
            <Link
              href={ctaHref}
              className="inline-flex items-center gap-1.5 mt-4 text-sm font-semibold text-[hsl(var(--primary))] hover:gap-2.5 transition-all duration-200 group"
            >
              {ctaLabel}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="flex items-end justify-between w-full gap-4">
            <div>
              {eyebrow && (
                <p className="text-xs md:text-sm uppercase tracking-[0.25em] text-gold font-semibold mb-2">
                  {eyebrow}
                </p>
              )}
              <h2 className="font-display font-medium tracking-tight text-heading-1 text-foreground">
                {heading}
              </h2>
            </div>
            {ctaLabel && ctaHref && (
              <Link
                href={ctaHref}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[hsl(var(--primary))] hover:gap-2.5 transition-all duration-200 group whitespace-nowrap"
              >
                {ctaLabel}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            )}
          </div>
          {subheading && (
            <p className="text-sm md:text-base text-muted-foreground max-w-2xl leading-relaxed mt-1">
              {subheading}
            </p>
          )}
        </>
      )}
    </div>
  );
}
