export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  discount: number;
  category: string;
  collection: string;
  images: string[];
  colors: string[];
  sizes: string[];
  stock: number;
  rating: number;
  reviewCount: number;
  isNew: boolean;
  isFeatured: boolean;
  isTrending: boolean;
  isBestseller: boolean;
  tags: string[];
  createdAt: Date;
}

export interface Category {
  slug: string;
  name: string;
  description: string;
  image: string;
}

export interface Collection {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  heroImage: string;
}
