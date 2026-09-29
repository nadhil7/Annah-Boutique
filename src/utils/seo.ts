import type { Metadata } from "next";
import type { Product } from "@/types/product";
import type { SiteConfig } from "@/config/site";
import { truncateText } from "@/utils/format";

interface ProductJsonLd {
  "@context": "https://schema.org";
  "@type": "Product";
  name: string;
  description: string;
  image: string[];
  sku: string;
  brand: {
    "@type": "Brand";
    name: string;
  };
  offers: {
    "@type": "Offer";
    priceCurrency: string;
    price: number;
    availability: string;
    url?: string;
  };
  aggregateRating: {
    "@type": "AggregateRating";
    ratingValue: number;
    reviewCount: number;
  };
}

interface BreadcrumbJsonLd {
  "@context": "https://schema.org";
  "@type": "BreadcrumbList";
  itemListElement: Array<{
    "@type": "ListItem";
    position: number;
    name: string;
    item?: string;
  }>;
}

export function productJsonLd(
  product: Product,
  url: string,
  siteConfig: SiteConfig
): ProductJsonLd {
  const images = product.images.map(
    (img) => `${url.replace(/\/$/, "")}${img}`
  );
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: images,
    sku: product.id,
    brand: {
      "@type": "Brand",
      name: siteConfig.name,
    },
    offers: {
      "@type": "Offer",
      priceCurrency: siteConfig.currency,
      price: product.price,
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      url: `${url.replace(/\/$/, "")}/product/${product.slug}`,
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
    },
  };
}

export function breadcrumbJsonLd(
  items: Array<{ name: string; item?: string }>
): BreadcrumbJsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: it.name,
      item: it.item,
    })),
  };
}

export function buildProductMetadata(
  product: Product,
  url: string,
  siteConfig: SiteConfig
): Metadata {
  const title = `${product.name} | ${siteConfig.name}`;
  const description = truncateText(product.description, 160);
  const ogImage = product.images[0]
    ? `${url.replace(/\/$/, "")}${product.images[0]}`
    : undefined;

  return {
    title,
    description,
    alternates: {
      canonical: `/product/${product.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `/product/${product.slug}`,
      siteName: siteConfig.name,
      images: ogImage
        ? [
            {
              url: ogImage,
              width: 1200,
              height: 630,
              alt: product.name,
            },
          ]
        : undefined,
      type: "product" as "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export function buildPageMetadata(
  title: string,
  description: string,
  path: string,
  siteConfig: SiteConfig,
  image?: string
): Metadata {
  const fullTitle = `${title} | ${siteConfig.name}`;
  const ogImage = image ? `${siteConfig.logo ? "" : ""}${image}` : undefined;

  return {
    title: fullTitle,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title: fullTitle,
      description,
      url: path,
      siteName: siteConfig.name,
      images: ogImage
        ? [
            {
              url: ogImage,
              width: 1200,
              height: 630,
              alt: title,
            },
          ]
        : undefined,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}
