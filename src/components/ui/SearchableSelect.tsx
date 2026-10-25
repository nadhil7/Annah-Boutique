"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";

export type SearchableOption = { value: string; label: string };

type SearchableSelectProps = {
  value: string;
  options: SearchableOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
};

export function SearchableSelect({ value, options, onChange, placeholder = "Select an option", searchPlaceholder = "Search options" }: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const selected = options.find((option) => option.value === value);
  const filtered = useMemo(() => options.filter((option) => option.label.toLowerCase().includes(query.trim().toLowerCase())), [options, query]);

  useEffect(() => {
    const close = (event: MouseEvent) => { if (!containerRef.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  function choose(nextValue: string) {
    onChange(nextValue);
    setQuery("");
    setOpen(false);
  }

  return <div ref={containerRef} className="relative min-w-0">
    <button type="button" aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen((current) => !current)} className="flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-border bg-white px-3 text-left text-sm">
      <span className={selected ? "truncate" : "truncate text-muted-foreground"}>{selected?.label || placeholder}</span>
      <ChevronDown size={16} className={`shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
    </button>
    {open && <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-lg border border-border bg-white shadow-premium">
      <div className="border-b border-border p-2"><div className="relative"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder={searchPlaceholder} className="h-9 w-full rounded-md border border-border pl-9 pr-3 text-sm outline-none focus:border-primary" /></div></div>
      <div role="listbox" className="max-h-56 overflow-y-auto p-1">{filtered.length ? filtered.map((option) => <button type="button" role="option" aria-selected={option.value === value} key={option.value} onClick={() => choose(option.value)} className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm hover:bg-secondary"><span className="truncate">{option.label}</span>{option.value === value && <Check size={15} className="shrink-0 text-primary" />}</button>) : <p className="px-3 py-4 text-center text-sm text-muted-foreground">No matches found.</p>}</div>
    </div>}
  </div>;
}
