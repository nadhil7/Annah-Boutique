import type { Collection } from "@/types/product";

export const collections: Collection[] = [
  {
    slug: "new-arrivals",
    name: "New Arrivals",
    tagline: "Fresh off the loom",
    description:
      "The latest drops straight from our karigars. Limited editions you won't want to miss.",
    heroImage: "/public/banners/new-arrivals.webp",
  },
  {
    slug: "bestsellers",
    name: "Bestsellers",
    tagline: "Loved by everyone",
    description:
      "Our most-loved pieces, chosen by you. Five-star styles that sell out fast.",
    heroImage: "/public/banners/bestsellers.webp",
  },
  {
    slug: "festive-edit",
    name: "Festive Edit",
    tagline: "Celebrate in style",
    description:
      "Curated for Diwali, Durga Puja, and weddings. Rich fabrics, bold colours, timeless grace.",
    heroImage: "/public/banners/festive-edit.webp",
  },
  {
    slug: "party-wear-edit",
    name: "Party Wear Edit",
    tagline: "Turn heads every time",
    description:
      "Cocktail nights, receptions, and anniversary soirees — shimmer, shine, and stand out.",
    heroImage: "/public/banners/party-wear-edit.webp",
  },
  {
    slug: "summer-edit",
    name: "Summer Edit",
    tagline: "Breezy and beautiful",
    description:
      "Lightweight cottons, pastel hues, and breathable silhouettes perfect for sunny days.",
    heroImage: "/public/banners/summer-edit.webp",
  },
];

export const collectionsMap: Record<string, Collection> = Object.fromEntries(
  collections.map((c) => [c.slug, c])
);
