import { NextResponse } from "next/server";
import type { ApiResponse, Product } from "@/types/product";
import { queryProducts } from "@/services/productService";

export async function GET(
  request: Request
): Promise<NextResponse<ApiResponse<Product[]>>> {
  try {
    const { searchParams } = new URL(request.url);
    const result = await queryProducts({ category: searchParams.get("category") ?? undefined, q: searchParams.get("search") ?? undefined, page: Number(searchParams.get("page") || 1), limit: Number(searchParams.get("limit") || 24) });

    return NextResponse.json({
      success: true,
      data: result.items,
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
