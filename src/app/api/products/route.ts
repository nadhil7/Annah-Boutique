import { NextResponse } from "next/server";
import localRepo from "@/repositories/productRepository";
import type { ApiResponse, Product } from "@/types/product";
import { filterProducts } from "@/utils/sortFilter";

export async function GET(
  request: Request
): Promise<NextResponse<ApiResponse<Product[]>>> {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") ?? undefined;
    const collection = searchParams.get("collection") ?? undefined;

    const all = await localRepo.getProducts();
    const filtered = filterProducts(all, { category, collection });

    return NextResponse.json({
      success: true,
      data: filtered,
    }, { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to fetch products";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
