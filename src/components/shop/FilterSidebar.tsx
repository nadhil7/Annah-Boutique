import { FilterContent } from "./FilterContent";

export function FilterSidebar() {
  return (
    <aside className="hidden lg:block sticky top-28 w-72 flex-shrink-0 pr-4 self-start">
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2">
          <h2 className="text-lg font-display font-semibold text-foreground">
            Filters
          </h2>
        </div>
        <div className="max-h-[calc(100vh-10rem)] overflow-y-auto pr-2 scrollbar-thin hide-scrollbar">
          <FilterContent />
        </div>
      </div>
    </aside>
  );
}
