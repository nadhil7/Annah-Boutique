"use client";
import { useCallback, useState } from "react";
import type { Product } from "@/types/product";
import { ProductVariantSelect } from "@/components/product/ProductVariantSelect";
import { PdpCtaBlock } from "@/components/product/PdpCtaBlock";
import { useCartStore } from "@/stores/cartStore";
export function ProductBuyPanel({product}:{product:Product}){const [variant,setVariant]=useState<{color:string|null;size:string|null;quantity:number}>({color:product.colors[0]??null,size:product.sizes[0]??null,quantity:1});const add=useCartStore(s=>s.addItem);const addToCart=useCallback(()=>{if(variant.color&&variant.size)add(product,variant.color,variant.size,variant.quantity);},[add,product,variant]);return <><ProductVariantSelect product={product} onVariantChange={setVariant}/><PdpCtaBlock productId={product.id} productName={product.name} productSlug={product.slug} inStock={product.stock>0} onAddToCart={addToCart} onBuyNow={()=>{addToCart();window.location.assign("/checkout");}}/></>;}
