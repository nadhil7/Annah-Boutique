"use client";

import * as React from "react";
import { Filter } from "lucide-react";
import {
  Button,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/_shims";
import { FilterContent } from "./FilterContent";

export function FilterDrawer() {
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="lg:hidden rounded-full gap-1.5 h-10">
          <Filter className="w-4 h-4" />
          Filters
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[92vh] rounded-t-2xl p-0 pt-5 flex flex-col">
        <div className="flex items-center justify-center mb-2">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>
        <SheetHeader className="px-5 pb-3 mb-2 border-b border-border">
          <SheetTitle className="text-xl font-display">Filters</SheetTitle>
          <SheetDescription>
            Refine your search with our curated filters
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-hidden px-5 pb-5">
          <FilterContent onClose={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
