"use client";

import * as React from "react";
import { Expand } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/_shims";

interface ProductGalleryProps {
  images: string[];
  name: string;
}

export function ProductGallery({ images, name }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [zoomStyle, setZoomStyle] = React.useState<React.CSSProperties>({});
  const [isZooming, setIsZooming] = React.useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { currentTarget, clientX, clientY } = e;
    const rect = currentTarget.getBoundingClientRect();
    const x = (clientX - rect.left) / rect.width;
    const y = (clientY - rect.top) / rect.height;
    setZoomStyle({
      "--tx": `${(x - 0.5) * 50}px`,
      "--ty": `${(y - 0.5) * 50}px`,
    } as React.CSSProperties);
  };

  const safeImages = images.length > 0 ? images : ["/placeholder-product.svg"];

  return (
    <>
      <div className="hidden lg:flex gap-4 w-full">
        <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin">
          {safeImages.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedIndex(idx)}
              className={cn(
                "relative w-20 aspect-[4/5] rounded-lg overflow-hidden border-2 transition-all flex-shrink-0",
                selectedIndex === idx
                  ? "border-[hsl(var(--primary))] ring-2 ring-[hsl(var(--primary))]/30"
                  : "border-border hover:border-muted-foreground/40"
              )}
              aria-label={`View image ${idx + 1}`}
            >
              <img
                src={img}
                alt={`${name} view ${idx + 1}`}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </button>
          ))}
        </div>

        <div className="flex-1 relative">
          <div
            className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-secondary cursor-zoom-in"
            onMouseEnter={() => setIsZooming(true)}
            onMouseLeave={() => setIsZooming(false)}
            onMouseMove={handleMouseMove}
          >
            <img
              src={safeImages[selectedIndex]}
              alt={`${name} main view`}
              className={cn(
                "absolute inset-0 h-full w-full object-cover transition-transform duration-200 ease-out",
                isZooming && "scale-150"
              )}
              style={isZooming ? {
                transformOrigin: "center center",
                translate: `var(--tx) var(--ty)`,
                ...zoomStyle,
              } : undefined}
            />

            <Dialog>
              <DialogTrigger asChild>
                <button
                  type="button"
                  aria-label="Expand image"
                  className="absolute top-4 right-4 z-10 rounded-full bg-white/90 backdrop-blur p-2.5 shadow-soft hover:bg-white transition-all hover:scale-105"
                >
                  <Expand className="w-5 h-5 text-foreground" />
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-6xl w-[95vw] p-0 overflow-hidden">
                <div className="relative aspect-square max-h-[85vh]">
                  <img
                    src={safeImages[selectedIndex]}
                    alt={name}
                    className="absolute inset-0 h-full w-full object-contain"
                  />
                </div>
                <div className="flex gap-2 p-3 overflow-x-auto">
                  {safeImages.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedIndex(idx)}
                      className={cn(
                        "relative w-16 aspect-square rounded-md overflow-hidden border-2 flex-shrink-0",
                        selectedIndex === idx
                          ? "border-[hsl(var(--primary))]"
                          : "border-border"
                      )}
                    >
                      <img
                        src={img}
                        alt={`${name} thumbnail ${idx + 1}`}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="lg:hidden w-full">
        <div className="overflow-x-auto snap snap-mandatory snap-x flex hide-scrollbar -mx-6 px-6">
          {safeImages.map((img, idx) => (
            <div
              key={idx}
              className="snap-start w-full flex-shrink-0 pr-3 first:pl-0 last:pr-0"
            >
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-secondary">
                <img
                  src={img}
                  alt={`${name} view ${idx + 1}`}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-1.5 mt-4">
          {safeImages.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedIndex(idx)}
              aria-label={`Go to image ${idx + 1}`}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                selectedIndex === idx
                  ? "w-6 bg-[hsl(var(--primary))]"
                  : "w-2 bg-border hover:bg-muted-foreground/40"
              )}
            />
          ))}
        </div>
      </div>
    </>
  );
}
