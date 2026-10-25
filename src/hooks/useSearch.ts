"use client";

import { useEffect, useState, useMemo } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { searchSuggestions } from "@/services/productService";
import type { SearchSuggestion } from "@/services/productService";

export interface UseSearchReturn {
  query: string;
  debouncedQuery: string;
  setQuery: (q: string) => void;
  suggestions: SearchSuggestion[];
  isLoading: boolean;
}

export function useSearch(initial: string = "", delay: number = 300): UseSearchReturn {
  const [query, setQuery] = useState(initial);
  const debounced = useDebounce(query, delay);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);

  useEffect(() => {
    const q = debounced.trim();
    if (!q) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    let cancelled = false;
    Promise.resolve()
      .then(() => searchSuggestions(q))
      .then((s) => {
        if (!cancelled) {
          setSuggestions(s);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSuggestions([]);
          setIsLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [debounced]);

  return useMemo(
    () => ({
      query,
      debouncedQuery: debounced,
      setQuery,
      suggestions,
      isLoading,
    }),
    [query, debounced, suggestions, isLoading]
  );
}
