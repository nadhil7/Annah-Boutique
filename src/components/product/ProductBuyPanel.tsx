"use client";

import { useCallback, useState } from "react";
import type { Product } from "@/types/product";
import { ProductVariantSelect } from "@/components/product/ProductVariantSelect";
import { PdpCtaBlock } from "@/components/product/PdpCtaBlock";
import { useCartStore } from "@/stores/cartStore";

type SelectedVariant = { color: string | null; size: string | null; quantity: number; price: number; available: boolean };

export function ProductBuyPanel({ product }: { product: Product }) {
  const [variant, setVariant] = useState<SelectedVariant>({ color: product.colors[0] ?? null, size: product.sizes[0] ?? null, quantity: 1, price: product.price, available: false });
  const add = useCartStore((state) => state.addItem);
  const addToCart = useCallback(() => {
    if (variant.color && variant.size && variant.available) add(product, variant.color, variant.size, variant.quantity);
  }, [add, product, variant]);
  return <><ProductVariantSelect product={product} onVariantChange={setVariant} /><PdpCtaBlock productId={product.id} productName={product.name} productSlug={product.slug} inStock={variant.available} onAddToCart={addToCart} onBuyNow={() => { addToCart(); window.location.assign("/checkout"); }} /></>;
}
