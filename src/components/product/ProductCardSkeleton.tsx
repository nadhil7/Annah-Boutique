import { Skeleton } from "@/components/ui/_shims";

export function ProductCardSkeleton() {
  return (
    <div className="w-full">
      <div className="relative overflow-hidden rounded-2xl bg-white shadow-card">
        <Skeleton className="aspect-[3/4] w-full rounded-2xl" />
        <div className="p-3 space-y-2">
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-4/5 rounded" />
          <div className="flex items-baseline gap-2 pt-1">
            <Skeleton className="h-5 w-20 rounded" />
            <Skeleton className="h-3 w-16 rounded" />
          </div>
          <div className="flex items-center gap-1 pt-1">
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-3 w-16 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
