export interface HeroBanner {
  heading: string;
  description: string;
  ctaPrimary: {
    label: string;
    href: string;
  };
  ctaSecondary: {
    label: string;
    href: string;
  };
  desktopImage: string;
  mobileImage: string;
}

export interface PromoBanner {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  image: string;
  badge?: string;
}

export const heroBanner: HeroBanner = {
  heading: "New Season. New You.",
  description:
    "Discover our handpicked Festive Edit 2026 — timeless sarees, flowy Anarkalis, and statement co-ords crafted with love. Free shipping on all orders above ₹1,999.",
  ctaPrimary: {
    label: "Shop Collection",
    href: "/shop",
  },
  ctaSecondary: {
    label: "Explore New Arrivals",
    href: "/collection/new-arrivals",
  },
  desktopImage: "/banners/hero-editorial.svg",
  mobileImage: "/banners/hero-editorial.svg",
};

export const promoBanners: PromoBanner[] = [
  {
    id: "festive-flat",
    title: "Flat 40% OFF",
    subtitle: "On Festive Edit — limited time",
    href: "/collection/festive-edit",
    image: "/banners/festive-editorial.svg",
    badge: "HOT",
  },
  {
    id: "bestsellers-pick",
    title: "Bestseller Picks",
    subtitle: "Handpicked by our stylists",
    href: "/collection/bestsellers",
    image: "/banners/hero-editorial.svg",
    badge: "LOVED",
  },
  {
    id: "summer-breezy",
    title: "Summer Essentials",
    subtitle: "Cottons & pastels from ₹799",
    href: "/collection/summer-edit",
    image: "/banners/atelier-editorial.svg",
  },
];
