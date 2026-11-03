import { describe, expect, it } from "vitest";
import { orderCatalogImages, type CatalogImage } from "@/lib/catalogApi";

const image = (id: string, sortOrder: number, isPrimary: boolean): CatalogImage => ({ id, url: `https://example.test/${id}`, altText: "", sortOrder, isPrimary });

describe("orderCatalogImages", () => {
  it("keeps the primary image first without mutating the API array", () => {
    const input = [image("secondary", 0, false), image("primary", 3, true), image("other", 1, false)];
    expect(orderCatalogImages(input).map((item) => item.id)).toEqual(["primary", "secondary", "other"]);
    expect(input.map((item) => item.id)).toEqual(["secondary", "primary", "other"]);
  });
});
