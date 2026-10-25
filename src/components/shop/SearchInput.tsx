"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Tag, Shirt } from "lucide-react";
import { cn } from "@/lib/utils";
import { searchSuggestions } from "@/services/productService";
import type { SearchSuggestion } from "@/services/productService";

export function SearchInput({ className }: { className?: string }) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [showDropdown, setShowDropdown] = React.useState(false);
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const [suggestions, setSuggestions] = React.useState<SearchSuggestion[]>([]);

  React.useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (!query.trim()) { setSuggestions([]); setShowDropdown(false); return; }
      searchSuggestions(query).then(setSuggestions).catch(() => setSuggestions([]));
      setShowDropdown(true);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setShowDropdown(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("relative w-full", className)}
    >
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground pointer-events-none" />
      <input
        ref={inputRef}
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => query.trim() && setShowDropdown(true)}
        onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
        placeholder="Search for sarees, kurtis, dresses..."
        className="w-full h-11 pl-11 pr-4 rounded-xl border border-border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]/30 focus:border-[hsl(var(--primary))]/40 transition-all"
      />

      {showDropdown && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-premium border border-border p-2 z-50 animate-fade-in">
          {suggestions.length > 0 ? (
            <ul className="py-1">
              {suggestions.map((s, i) => (
                <li key={`${s.type}-${i}`}>
                  <Link
                    href={s.href}
                    onClick={() => setShowDropdown(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 text-sm transition-colors"
                  >
                    {s.type === "category" ? (
                      <Tag className="w-4 h-4 text-gold flex-shrink-0" />
                    ) : (
                      <Shirt className="w-4 h-4 text-[hsl(var(--primary))] flex-shrink-0" />
                    )}
                    <div className="flex flex-col overflow-hidden">
                      <span className="font-medium truncate text-foreground">
                        {s.text}
                      </span>
                      <span className="text-xs text-muted-foreground capitalize">
                        {s.type}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-8 px-4 text-center text-sm text-muted-foreground">
              No results for &quot;{query}&quot;
            </div>
          )}
          <div className="mt-2 pt-2 border-t border-border">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm text-[hsl(var(--primary))] font-medium hover:bg-[hsl(var(--primary))]/5 transition-colors"
            >
              Search all results for &quot;{query}&quot;
              <Search className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
