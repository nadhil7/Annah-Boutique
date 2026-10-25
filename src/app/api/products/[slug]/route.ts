import { NextResponse } from "next/server";
import type { ApiResponse, Product } from "@/types/product";
import { getProductBySlug } from "@/services/productService";

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> }
): Promise<NextResponse<ApiResponse<Product>>> {
  try {
    const { slug } = await context.params;
    const product = await getProductBySlug(slug);

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: product,
    }, { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to fetch product";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
