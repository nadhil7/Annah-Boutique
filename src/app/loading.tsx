import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <section className="relative overflow-hidden">
        <div className="container-editorial py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-12 md:h-16 w-full rounded-lg" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-5 w-2/3" />
              <div className="flex gap-3 pt-2">
                <Skeleton className="h-11 w-36 rounded-full" />
                <Skeleton className="h-11 w-32 rounded-full" />
              </div>
            </div>
            <Skeleton className="aspect-[4/5] w-full rounded-2xl" />
          </div>
        </div>
      </section>

      <div className="container-editorial py-4">
        <div className="gold-underline" />
      </div>

      <section className="container-editorial py-10">
        <div className="flex flex-col items-center text-center mb-10 space-y-3">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-9 w-64 rounded" />
          <Skeleton className="h-4 w-96" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={`row1-${i}`} className="space-y-3">
              <Skeleton className="aspect-[3/4] w-full rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-4 w-12 line-through opacity-50" />
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="container-editorial py-4">
        <div className="gold-underline" />
      </div>

      <section className="container-editorial py-10">
        <div className="flex flex-col items-center text-center mb-10 space-y-3">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-9 w-72 rounded" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={`row2-${i}`} className="space-y-3">
              <Skeleton className="aspect-[3/4] w-full rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-4 w-12 line-through opacity-50" />
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="container-editorial py-4">
        <div className="gold-underline" />
      </div>

      <section className="container-editorial py-10">
        <div className="flex flex-col items-center text-center mb-10 space-y-3">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-9 w-80 rounded" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={`row3-${i}`} className="space-y-3">
              <Skeleton className="aspect-[3/4] w-full rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-4 w-12 line-through opacity-50" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
