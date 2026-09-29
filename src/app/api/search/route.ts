import { NextResponse } from "next/server";
import localRepo from "@/repositories/productRepository";
import type { ApiResponse, Product } from "@/types/product";
import { searchSuggestions } from "@/services/productService";
import type { SearchSuggestion } from "@/services/productService";

interface SearchResponse {
  items: Product[];
  suggestions: SearchSuggestion[];
}

export async function GET(
  request: Request
): Promise<NextResponse<ApiResponse<SearchResponse>>> {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") ?? "";
    const trimmed = q.trim();

    const items = trimmed ? await localRepo.searchProducts(trimmed) : [];
    const all = await localRepo.getProducts();
    const suggestions = searchSuggestions(all, trimmed);

    return NextResponse.json({
      success: true,
      data: {
        items,
        suggestions,
      },
    }, { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600" } });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Search failed";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
