import type { Category } from "@/types/product";
import { productPhotosByCategory } from "@/data/productPhotos";

export const categories: Category[] = [
  {
    slug: "sarees",
    name: "Sarees",
    description:
      "Timeless sarees in silk, cotton, and chiffon — from Banarasi classics to contemporary drapes.",
    image: productPhotosByCategory.sarees[0],
  },
  {
    slug: "kurtis",
    name: "Kurtis",
    description:
      "Versatile kurtis for every occasion — casual daily wear, office formals, and festive prints.",
    image: productPhotosByCategory.kurtis[0],
  },
  {
    slug: "dresses",
    name: "Dresses",
    description:
      "Elegant dresses, Anarkali gowns, and maxi dresses for celebrations and cocktail evenings.",
    image: productPhotosByCategory.dresses[0],
  },
  {
    slug: "co-ord-sets",
    name: "Co-ord Sets",
    description:
      "Matching co-ord sets — crop tops with skirts, dhoti sets, and kurta-palazzo duos.",
    image: productPhotosByCategory["co-ord-sets"][0],
  },
  {
    slug: "tops",
    name: "Tops",
    description:
      "Trendy tops, blouses, and tunics that pair perfectly with jeans, palazzos, or sarees.",
    image: productPhotosByCategory.tops[0],
  },
  {
    slug: "bottom-wear",
    name: "Bottom Wear",
    description:
      "Palazzos, shararas, dhoti pants, and leggings to complete your ethnic look.",
    image: productPhotosByCategory["bottom-wear"][0],
  },
  {
    slug: "party-wear",
    name: "Party Wear",
    description:
      "Glitz-and-glamour party wear — sequin gowns, cocktail sarees, and statement ensembles.",
    image: productPhotosByCategory["party-wear"][0],
  },
  {
    slug: "festive-wear",
    name: "Festive Wear",
    description:
      "Celebration-ready festive wear — heavy embroidery, zardozi work, and bridal trousseau picks.",
    image: productPhotosByCategory["festive-wear"][0],
  },
];

export const categoriesMap: Record<string, Category> = Object.fromEntries(
  categories.map((c) => [c.slug, c])
);
