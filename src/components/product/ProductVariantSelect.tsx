"use client";

import * as React from "react";
import { Ruler, Minus, Plus } from "lucide-react";
import type { Product } from "@/types/product";
import { cn, formatINR } from "@/lib/utils";
import {
  Label,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/_shims";

const COLOR_MAP: Record<string, string> = {
  pink: "#F9C6D3",
  blue: "#B3D4F2",
  green: "#C9E0C8",
  red: "#E69894",
  beige: "#E8DFD2",
  maroon: "#8B2C3F",
  navy: "#2C3E66",
  gold: "#C7A96B",
  black: "#1F1F1F",
  white: "#FFFFFF",
  mustard: "#D2A73E",
  teal: "#6EA9A4",
};

const DEFAULT_COLOR = "#A8A8A8";

function getColorValue(colorName: string): string {
  const key = colorName.toLowerCase().replace(/[\s_-]/g, "");
  return COLOR_MAP[key] || DEFAULT_COLOR;
}

const SIZE_CHART_DATA = [
  { size: "XS", bust: "32\"", waist: "26\"", hip: "34\"" },
  { size: "S", bust: "34\"", waist: "28\"", hip: "36\"" },
  { size: "M", bust: "36\"", waist: "30\"", hip: "38\"" },
  { size: "L", bust: "38\"", waist: "32\"", hip: "40\"" },
  { size: "XL", bust: "40\"", waist: "34\"", hip: "42\"" },
];

interface ProductVariantSelectProps {
  product: Pick<Product, "colors" | "sizes" | "stock" | "name" | "price">;
  onVariantChange?: (variant: {
    color: string | null;
    size: string | null;
    quantity: number;
  }) => void;
}

export function ProductVariantSelect({
  product,
  onVariantChange,
}: ProductVariantSelectProps) {
  const [selectedColor, setSelectedColor] = React.useState<string | null>(
    product.colors[0] ?? null
  );
  const [selectedSize, setSelectedSize] = React.useState<string | null>(
    product.sizes[0] ?? null
  );
  const [quantity, setQuantity] = React.useState(1);

  React.useEffect(() => {
    onVariantChange?.({
      color: selectedColor,
      size: selectedSize,
      quantity,
    });
  }, [selectedColor, selectedSize, quantity, onVariantChange]);

  const maxQuantity = Math.max(1, product.stock);
  const actualStock = product.stock;

  const incrementQty = () =>
    setQuantity((q) => Math.min(q + 1, maxQuantity));
  const decrementQty = () => setQuantity((q) => Math.max(q - 1, 1));

  return (
    <div className="space-y-6">
      {product.colors.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-foreground">
              {selectedColor ? (
                <>Colour: <span className="font-semibold text-[hsl(var(--primary))]">{selectedColor}</span></>
              ) : (
                "Colour"
              )}
            </Label>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {product.colors.map((color) => {
              const isSelected = selectedColor === color;
              const bg = getColorValue(color);
              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  aria-label={`Select ${color}`}
                  title={color}
                  className={cn(
                    "w-9 h-9 rounded-full border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[hsl(var(--primary))]",
                    isSelected
                      ? "border-[hsl(var(--primary))] scale-110 shadow-md ring-2 ring-[hsl(var(--primary))]/30 ring-offset-2"
                      : "border-border hover:border-muted-foreground/50"
                  )}
                  style={{
                    backgroundColor: bg,
                    ...(bg === "#FFFFFF"
                      ? { borderColor: "hsl(var(--border))", boxShadow: "inset 0 0 0 1px hsl(var(--border))" }
                      : {}),
                  }}
                />
              );
            })}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium text-foreground">Size</Label>
          <Dialog>
            <DialogTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-[hsl(var(--primary))] transition-colors underline underline-offset-4"
              >
                <Ruler className="w-3.5 h-3.5" />
                Size Chart
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="font-display text-xl">Size Guide</DialogTitle>
                <DialogDescription>
                  All measurements are in inches. Refer to the guide below for your perfect fit.
                </DialogDescription>
              </DialogHeader>
              <div className="overflow-hidden rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Size</th>
                      <th className="px-4 py-2.5 text-center font-medium text-muted-foreground">Bust</th>
                      <th className="px-4 py-2.5 text-center font-medium text-muted-foreground">Waist</th>
                      <th className="px-4 py-2.5 text-center font-medium text-muted-foreground">Hip</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SIZE_CHART_DATA.map((row, i) => (
                      <tr
                        key={row.size}
                        className={cn(
                          "border-t border-border",
                          i % 2 === 1 && "bg-muted/20"
                        )}
                      >
                        <td className="px-4 py-2.5 font-semibold">{row.size}</td>
                        <td className="px-4 py-2.5 text-center text-muted-foreground">{row.bust}</td>
                        <td className="px-4 py-2.5 text-center text-muted-foreground">{row.waist}</td>
                        <td className="px-4 py-2.5 text-center text-muted-foreground">{row.hip}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-muted-foreground pt-1">
                For custom sizing, please WhatsApp us.
              </p>
            </DialogContent>
          </Dialog>
        </div>
        <div className="flex flex-wrap gap-2">
          {product.sizes.map((size) => {
            const isSelected = selectedSize === size;
            const isOutOfStock = actualStock === 0;
            return (
              <button
                key={size}
                type="button"
                onClick={() => !isOutOfStock && setSelectedSize(size)}
                disabled={isOutOfStock}
                className={cn(
                  "min-w-[3rem] px-4 h-10 rounded-lg border text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[hsl(var(--primary))]",
                  isOutOfStock
                    ? "opacity-60 cursor-not-allowed line-through bg-muted/30 border-border text-muted-foreground"
                    : isSelected
                    ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5 text-[hsl(var(--primary))] shadow-sm"
                    : "border-border bg-background hover:border-muted-foreground/40 text-foreground"
                )}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-medium text-foreground">Quantity</Label>
        <div className="flex items-center gap-0 w-fit border border-border rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={decrementQty}
            disabled={quantity <= 1}
            className="h-11 w-11 flex items-center justify-center text-muted-foreground hover:bg-muted/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Decrease quantity"
          >
            <Minus className="w-4 h-4" />
          </button>
          <input
            type="number"
            min={1}
            max={maxQuantity}
            value={quantity}
            onChange={(e) => {
              const val = Number(e.target.value);
              if (Number.isFinite(val)) {
                setQuantity(Math.min(Math.max(1, Math.round(val)), maxQuantity));
              }
            }}
            className="h-11 w-14 text-center text-sm font-medium border-x border-border bg-background focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <button
            type="button"
            onClick={incrementQty}
            disabled={quantity >= maxQuantity}
            className="h-11 w-11 flex items-center justify-center text-muted-foreground hover:bg-muted/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Increase quantity"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {actualStock > 0 ? (
          <span className="inline-flex items-center gap-1.5 text-sm">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-success font-medium">
              In stock{actualStock <= 10 ? ` (${actualStock} left)` : ""}
            </span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-sm">
            <span className="w-2 h-2 rounded-full bg-destructive" />
            <span className="text-destructive font-medium">Out of stock</span>
          </span>
        )}
      </div>

      <div className="pt-2 pb-1">
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-semibold text-foreground font-display">
            {formatINR(product.price * quantity)}
          </span>
          {quantity > 1 && (
            <span className="text-sm text-muted-foreground">
              ({formatINR(product.price)} each)
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
