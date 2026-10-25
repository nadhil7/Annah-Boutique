export const siteConfig = {
  url: "https://annahboutique.example.com",
  name: "Annah Boutique",
  description:
    "Premium Indian ethnic wear boutique offering handpicked sarees, kurtis, dresses, and festive collections. Crafted with love, designed for grace.",
  whatsappNumber: "918089632481",
  instagramUrl: "https://instagram.com/annahboutique",
  facebookUrl: "https://facebook.com/annahboutique",
  phone: "+91 80896 32481",
  email: "annahboutiquemail@gmail.com",
  address: "Thangal Nagar, Palluruthy, Kochi",
  currency: "INR",
  currencySymbol: "₹",
  logo: "/logo.svg",
  collections: [
    "new-arrivals",
    "bestsellers",
    "festive-edit",
    "party-wear-edit",
    "summer-edit",
  ] as const,
  categories: [
    "sarees",
    "kurtis",
    "dresses",
    "co-ord-sets",
    "tops",
    "bottom-wear",
    "party-wear",
    "festive-wear",
  ] as const,
  navLinks: [
    { href: "/", label: "Home" },
    { href: "/shop", label: "Shop" },
    { href: "/categories", label: "Categories" },
    { href: "/collections", label: "Collections" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ],
} as const;

export type SiteConfig = typeof siteConfig;
