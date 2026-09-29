"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ProductQuery, SortKey } from "@/types/product";

type FilterKey = keyof ProductQuery;

const ARRAY_KEYS = new Set<FilterKey>(["sizes", "colors"]);
const NUMBER_KEYS = new Set<FilterKey>([
  "priceMin",
  "priceMax",
  "minDiscount",
  "page",
  "limit",
]);
const BOOLEAN_KEYS = new Set<FilterKey>(["inStockOnly"]);

function parseParams(raw: URLSearchParams): ProductQuery {
  const q: ProductQuery = {};

  for (const [key, value] of raw.entries()) {
    const k = key as FilterKey;
    if (ARRAY_KEYS.has(k)) {
      const arr = value.split(",").filter(Boolean);
      if (arr.length) (q as Record<FilterKey, unknown>)[k] = arr;
    } else if (NUMBER_KEYS.has(k)) {
      const num = Number(value);
      if (!Number.isNaN(num))
        (q as Record<FilterKey, unknown>)[k] = num;
    } else if (BOOLEAN_KEYS.has(k)) {
      (q as Record<FilterKey, unknown>)[k] = value === "true" || value === "1";
    } else {
      (q as Record<string, unknown>)[key] = value;
    }
  }
  return q;
}

export interface UseFiltersReturn {
  query: ProductQuery;
  setFilter: <K extends FilterKey>(key: K, value: ProductQuery[K]) => void;
  appendArray: (key: "sizes" | "colors", item: string) => void;
  removeArray: (key: "sizes" | "colors", item: string) => void;
  removeFilter: (key: FilterKey) => void;
  reset: () => void;
  toUrlParams: () => string;
  setSort: (sort: SortKey) => void;
  setPage: (page: number) => void;
}

export function useFilters(): UseFiltersReturn {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const query = useMemo<ProductQuery>(() => {
    const params = new URLSearchParams(searchParams.toString());
    return parseParams(params);
  }, [searchParams]);

  const buildParams = useCallback(
    (updater: (p: URLSearchParams) => void): string => {
      const params = new URLSearchParams(searchParams.toString());
      updater(params);
      return params.toString();
    },
    [searchParams]
  );

  const navigate = useCallback(
    (queryString: string) => {
      const target = queryString ? `${pathname}?${queryString}` : pathname;
      router.replace(target, { scroll: false });
    },
    [router, pathname]
  );

  const setFilter = useCallback(
    <K extends FilterKey>(key: K, value: ProductQuery[K]) => {
      const qs = buildParams((p) => {
        if (value === undefined || value === null || value === "") {
          p.delete(String(key));
          return;
        }
        if (ARRAY_KEYS.has(key)) {
          const arr = value as unknown as string[];
          if (arr.length) p.set(String(key), arr.join(","));
          else p.delete(String(key));
        } else if (BOOLEAN_KEYS.has(key)) {
          p.set(String(key), value ? "true" : "false");
        } else {
          p.set(String(key), String(value));
        }
        if (key !== "page") p.delete("page");
      });
      navigate(qs);
    },
    [buildParams, navigate]
  );

  const appendArray = useCallback(
    (key: "sizes" | "colors", item: string) => {
      const qs = buildParams((p) => {
        const current = (p.get(key) ?? "").split(",").filter(Boolean);
        if (!current.includes(item)) current.push(item);
        p.set(key, current.join(","));
        p.delete("page");
      });
      navigate(qs);
    },
    [buildParams, navigate]
  );

  const removeArray = useCallback(
    (key: "sizes" | "colors", item: string) => {
      const qs = buildParams((p) => {
        const current = (p.get(key) ?? "").split(",").filter(Boolean);
        const next = current.filter((it) => it !== item);
        if (next.length) p.set(key, next.join(","));
        else p.delete(key);
        p.delete("page");
      });
      navigate(qs);
    },
    [buildParams, navigate]
  );

  const removeFilter = useCallback(
    (key: FilterKey) => {
      const qs = buildParams((p) => {
        p.delete(String(key));
        if (key !== "page") p.delete("page");
      });
      navigate(qs);
    },
    [buildParams, navigate]
  );

  const reset = useCallback(() => {
    navigate("");
  }, [navigate]);

  const toUrlParams = useCallback(() => {
    return searchParams.toString();
  }, [searchParams]);

  const setSort = useCallback(
    (sort: SortKey) => {
      setFilter("sort", sort);
    },
    [setFilter]
  );

  const setPage = useCallback(
    (page: number) => {
      setFilter("page", page);
    },
    [setFilter]
  );

  return {
    query,
    setFilter,
    appendArray,
    removeArray,
    removeFilter,
    reset,
    toUrlParams,
    setSort,
    setPage,
  };
}
