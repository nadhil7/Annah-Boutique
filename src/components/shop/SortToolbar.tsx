"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/_shims";
import { FilterDrawer } from "./FilterDrawer";

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "popular", label: "Most Popular" },
  { value: "discount", label: "Biggest Discount" },
];

interface SortToolbarProps {
  currentPage?: number;
  pageSize?: number;
  totalProducts?: number;
}

export function SortToolbar({
  currentPage = 1,
  pageSize = 24,
  totalProducts = 0,
}: SortToolbarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const from = Math.min(totalProducts, (currentPage - 1) * pageSize + 1);
  const to = Math.min(totalProducts, currentPage * pageSize);

  const currentSort = searchParams.get("sort") || "featured";

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "featured") {
      params.delete("sort");
    } else {
      params.set("sort", value);
    }
    const query = params.toString();
    router.push(`/shop${query ? `?${query}` : ""}`);
  };

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3",
        "py-3 mb-6",
        "rounded-xl bg-muted/30 px-4",
        "border border-border/60"
      )}
    >
      <p className="text-sm text-muted-foreground flex-shrink-0">
        {totalProducts > 0 ? (
          <>
            Showing{" "}
            <span className="font-medium text-foreground">{from}</span>
            {"–"}
            <span className="font-medium text-foreground">{to}</span>{" "}
            of{" "}
            <span className="font-medium text-foreground">{totalProducts}</span>{" "}
            products
          </>
        ) : (
          "Sort and filter to find your perfect piece"
        )}
      </p>

      <div className="flex items-center gap-2">
        <FilterDrawer />

        <div className="hidden sm:flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
          <Select defaultValue={currentSort} onValueChange={handleSortChange}>
            <SelectTrigger className="h-10 w-[170px] rounded-full text-sm">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
