import { cn } from "@/lib/utils";

interface ProductBadgesProps {
  isNew?: boolean;
  isTrending?: boolean;
  isBestseller?: boolean;
  discount?: number;
}

export function ProductBadges({
  isNew,
  isTrending,
  isBestseller,
  discount,
}: ProductBadgesProps) {
  const badges: { key: string; label: string; className: string }[] = [];

  if (isNew) {
    badges.push({
      key: "new",
      label: "NEW",
      className:
        "bg-gold text-white rounded-full uppercase tracking-[0.2em] text-[10px] px-2.5 py-0.5 font-semibold",
    });
  }

  if (typeof discount === "number" && discount >= 15) {
    badges.push({
      key: "sale",
      label: `-${discount}%`,
      className:
        "bg-[#8B2C3F] text-white rounded-full uppercase tracking-widest text-[10px] px-2.5 py-0.5 font-semibold",
    });
  }

  if (isBestseller) {
    badges.push({
      key: "bestseller",
      label: "BESTSELLER",
      className:
        "bg-[hsl(var(--primary))] text-white rounded-full uppercase tracking-widest text-[10px] px-2.5 py-0.5 font-semibold",
    });
  }

  if (isTrending) {
    badges.push({
      key: "trending",
      label: "TRENDING",
      className:
        "border border-gold text-gold bg-white/90 backdrop-blur rounded-full uppercase tracking-widest text-[10px] px-2.5 py-0.5 font-semibold",
    });
  }

  if (badges.length === 0) return null;

  const visibleBadges = badges.slice(0, 2);

  return (
    <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
      {visibleBadges.map((badge) => (
        <span key={badge.key} className={cn(badge.className, "shadow-sm")}>
          {badge.label}
        </span>
      ))}
    </div>
  );
}
