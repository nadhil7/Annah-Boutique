"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
  Checkbox,
  Label,
  RadioGroup,
  RadioGroupItem,
  Slider,
} from "@/components/ui/_shims";
import { siteConfig } from "@/config/_shims";
import { cn, formatINR } from "@/lib/utils";

const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "Free Size"];

const COLOR_MAP: Record<string, { name: string; value: string }> = {
  pink: { name: "Pink", value: "#F9C6D3" },
  blue: { name: "Blue", value: "#B3D4F2" },
  green: { name: "Green", value: "#C9E0C8" },
  red: { name: "Red", value: "#E69894" },
  beige: { name: "Beige", value: "#E8DFD2" },
  maroon: { name: "Maroon", value: "#8B2C3F" },
  navy: { name: "Navy", value: "#2C3E66" },
  gold: { name: "Gold", value: "#C7A96B" },
  black: { name: "Black", value: "#1F1F1F" },
  white: { name: "White", value: "#FFFFFF" },
  mustard: { name: "Mustard", value: "#D2A73E" },
  teal: { name: "Teal", value: "#6EA9A4" },
};

const AVAILABLE_COLORS = Object.entries(COLOR_MAP);

const DISCOUNT_PRESETS = [
  { value: "20", label: "20%+" },
  { value: "40", label: "40%+" },
  { value: "50", label: "50%+" },
  { value: "60", label: "60%+" },
];

export function FilterContent({ onClose }: { onClose?: () => void }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedCategories, setSelectedCategories] = React.useState<string[]>(
    searchParams.get("category")?.split(",").filter(Boolean) || []
  );
  const [selectedCollections, setSelectedCollections] = React.useState<string[]>(
    searchParams.get("collection")?.split(",").filter(Boolean) || []
  );
  const [priceRange, setPriceRange] = React.useState<[number, number]>(() => {
    const min = Number(searchParams.get("minPrice") || 0);
    const max = Number(searchParams.get("maxPrice") || 15000);
    return [min || 0, max || 15000];
  });
  const [selectedSizes, setSelectedSizes] = React.useState<string[]>(
    searchParams.get("size")?.split(",").filter(Boolean) || []
  );
  const [selectedColors, setSelectedColors] = React.useState<string[]>(
    searchParams.get("color")?.split(",").filter(Boolean) || []
  );
  const [inStockOnly, setInStockOnly] = React.useState(
    searchParams.get("inStock") === "true"
  );
  const [discountMin, setDiscountMin] = React.useState<string>(
    searchParams.get("discount") || ""
  );

  const toggleArrayItem = (
    arr: string[],
    setArr: React.Dispatch<React.SetStateAction<string[]>>,
    item: string
  ) => {
    setArr((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const hasActiveFilters =
    selectedCategories.length > 0 ||
    selectedCollections.length > 0 ||
    priceRange[0] > 0 ||
    priceRange[1] < 15000 ||
    selectedSizes.length > 0 ||
    selectedColors.length > 0 ||
    inStockOnly ||
    discountMin !== "";

  const handleApply = () => {
    const params = new URLSearchParams(searchParams.toString());

    const setParam = (key: string, value: string) => {
      if (value) params.set(key, value);
      else params.delete(key);
    };

    setParam("category", selectedCategories.join(","));
    setParam("collection", selectedCollections.join(","));
    setParam("minPrice", priceRange[0] > 0 ? String(priceRange[0]) : "");
    setParam("maxPrice", priceRange[1] < 15000 ? String(priceRange[1]) : "");
    setParam("size", selectedSizes.join(","));
    setParam("color", selectedColors.join(","));
    setParam("inStock", inStockOnly ? "true" : "");
    setParam("discount", discountMin);
    params.delete("page");

    const query = params.toString();
    router.push(`/shop${query ? `?${query}` : ""}`);
    onClose?.();
  };

  const handleReset = () => {
    setSelectedCategories([]);
    setSelectedCollections([]);
    setPriceRange([0, 15000]);
    setSelectedSizes([]);
    setSelectedColors([]);
    setInStockOnly(false);
    setDiscountMin("");
    router.push("/shop");
    onClose?.();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto pr-1 -mr-1 py-1">
        <Accordion type="single" collapsible defaultValue="category" className="w-full space-y-1">
          <AccordionItem value="category" className="border-none">
            <AccordionTrigger className="text-sm font-semibold py-3 hover:no-underline">
              Category
              {selectedCategories.length > 0 && (
                <span className="ml-2 text-xs bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] rounded-full px-2 py-0.5 font-medium">
                  {selectedCategories.length}
                </span>
              )}
            </AccordionTrigger>
            <AccordionContent className="space-y-2.5 pb-4">
              {siteConfig.categories.map((cat) => (
                <div key={cat.slug} className="flex items-center gap-3">
                  <Checkbox
                    id={`cat-${cat.slug}`}
                    checked={selectedCategories.includes(cat.slug)}
                    onCheckedChange={() =>
                      toggleArrayItem(selectedCategories, setSelectedCategories, cat.slug)
                    }
                  />
                  <Label
                    htmlFor={`cat-${cat.slug}`}
                    className="text-sm cursor-pointer select-none font-normal leading-tight pt-0.5"
                  >
                    {cat.name}
                  </Label>
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="collection" className="border-none">
            <AccordionTrigger className="text-sm font-semibold py-3 hover:no-underline">
              Collection
              {selectedCollections.length > 0 && (
                <span className="ml-2 text-xs bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] rounded-full px-2 py-0.5 font-medium">
                  {selectedCollections.length}
                </span>
              )}
            </AccordionTrigger>
            <AccordionContent className="space-y-2.5 pb-4">
              {siteConfig.collections.map((col) => (
                <div key={col.slug} className="flex items-center gap-3">
                  <Checkbox
                    id={`col-${col.slug}`}
                    checked={selectedCollections.includes(col.slug)}
                    onCheckedChange={() =>
                      toggleArrayItem(selectedCollections, setSelectedCollections, col.slug)
                    }
                  />
                  <Label
                    htmlFor={`col-${col.slug}`}
                    className="text-sm cursor-pointer select-none font-normal leading-tight pt-0.5"
                  >
                    {col.name}
                  </Label>
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="price" className="border-none">
            <AccordionTrigger className="text-sm font-semibold py-3 hover:no-underline">
              Price Range
              {(priceRange[0] > 0 || priceRange[1] < 15000) && (
                <span className="ml-2 text-xs bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] rounded-full px-2 py-0.5 font-medium">
                  {formatINR(priceRange[0])} – {formatINR(priceRange[1])}
                </span>
              )}
            </AccordionTrigger>
            <AccordionContent className="pb-4 space-y-4">
              <Slider
                value={priceRange as number[]}
                min={0}
                max={15000}
                step={100}
                onValueChange={(v) => setPriceRange([v[0], v[1] ?? v[0]])}
              />
              <div className="flex items-center justify-between gap-2 pt-1">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">
                    ₹
                  </span>
                  <input
                    type="number"
                    value={priceRange[0]}
                    onChange={(e) =>
                      setPriceRange((range) => [
                        Math.min(Number(e.target.value) || 0, range[1]),
                        range[1],
                      ])
                    }
                    className="w-full h-9 pl-6 pr-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]/30"
                  />
                </div>
                <span className="text-muted-foreground text-sm">—</span>
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">
                    ₹
                  </span>
                  <input
                    type="number"
                    value={priceRange[1]}
                    onChange={(e) =>
                      setPriceRange((range) => [
                        range[0],
                        Math.max(Number(e.target.value) || 0, range[0]),
                      ])
                    }
                    className="w-full h-9 pl-6 pr-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]/30"
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="size" className="border-none">
            <AccordionTrigger className="text-sm font-semibold py-3 hover:no-underline">
              Size
              {selectedSizes.length > 0 && (
                <span className="ml-2 text-xs bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] rounded-full px-2 py-0.5 font-medium">
                  {selectedSizes.length}
                </span>
              )}
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <div className="flex flex-wrap gap-2">
                {SIZES.map((size) => {
                  const isSelected = selectedSizes.includes(size);
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => toggleArrayItem(selectedSizes, setSelectedSizes, size)}
                      className={cn(
                        "min-w-[2.75rem] px-3 h-9 rounded-lg border text-xs font-medium transition-all",
                        isSelected
                          ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5 text-[hsl(var(--primary))]"
                          : "border-border bg-background hover:border-muted-foreground/40 text-foreground"
                      )}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="color" className="border-none">
            <AccordionTrigger className="text-sm font-semibold py-3 hover:no-underline">
              Colour
              {selectedColors.length > 0 && (
                <span className="ml-2 text-xs bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] rounded-full px-2 py-0.5 font-medium">
                  {selectedColors.length}
                </span>
              )}
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <div className="flex flex-wrap gap-2.5">
                {AVAILABLE_COLORS.map(([key, { name, value }]) => {
                  const isSelected = selectedColors.includes(key);
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggleArrayItem(selectedColors, setSelectedColors, key)}
                      aria-label={name}
                      title={name}
                      className={cn(
                        "w-8 h-8 rounded-full border-2 transition-all",
                        isSelected
                          ? "scale-110 shadow-md ring-2 ring-[hsl(var(--primary))]/30 ring-offset-2"
                          : "border-border hover:scale-105"
                      )}
                      style={{
                        backgroundColor: value,
                        borderColor: isSelected
                          ? "hsl(var(--primary))"
                          : value === "#FFFFFF"
                          ? "hsl(var(--border))"
                          : undefined,
                      }}
                    />
                  );
                })}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="availability" className="border-none">
            <AccordionTrigger className="text-sm font-semibold py-3 hover:no-underline">
              Availability
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="in-stock-only"
                  checked={inStockOnly}
                  onCheckedChange={() => setInStockOnly((v) => !v)}
                />
                <Label
                  htmlFor="in-stock-only"
                  className="text-sm cursor-pointer select-none font-normal leading-tight pt-0.5"
                >
                  In Stock Only
                </Label>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="discount" className="border-none">
            <AccordionTrigger className="text-sm font-semibold py-3 hover:no-underline">
              Discount
              {discountMin && (
                <span className="ml-2 text-xs bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] rounded-full px-2 py-0.5 font-medium">
                  {discountMin}%+
                </span>
              )}
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <RadioGroup value={discountMin} onValueChange={setDiscountMin} className="flex flex-wrap gap-2">
                {DISCOUNT_PRESETS.map((p) => {
                  const isSelected = discountMin === p.value;
                  return (
                    <Label
                      key={p.value}
                      className={cn(
                        "inline-flex items-center gap-2 px-3.5 h-9 rounded-lg border text-xs font-medium transition-all cursor-pointer",
                        isSelected
                          ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5 text-[hsl(var(--primary))]"
                          : "border-border bg-background hover:border-muted-foreground/40 text-foreground"
                      )}
                    >
                      <RadioGroupItem value={p.value} id={`discount-${p.value}`} className="w-3.5 h-3.5" />
                      {p.label}
                    </Label>
                  );
                })}
              </RadioGroup>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <div className="pt-4 mt-4 border-t border-border flex gap-2">
        <Button
          variant="outline"
          onClick={handleReset}
          disabled={!hasActiveFilters}
          className="flex-1 h-11 rounded-xl"
        >
          Reset
        </Button>
        <Button
          variant="gold"
          onClick={handleApply}
          className="flex-1 h-11 rounded-xl text-white font-semibold"
        >
          Apply Filters
        </Button>
      </div>
    </div>
  );
}
