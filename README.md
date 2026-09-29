# Annah Boutique

Frontend only Next.js App Router storefront for a premium Indian fashion boutique. The catalog is local demo data; checkout, account and orders are mock experiences stored in the browser.

## Catalog architecture

```text
Server Components / UI
        ↓
ProductService
        ↓
ProductRepository interface
        ↓
LocalProductRepository → src/data/products.ts
```

The UI imports product types and calls `src/services/productService.ts`; it does not read the product array. Replace the repository implementation with an API repository when a backend is ready. The mock `/api/products` routes establish the response shape for that migration.

Product detail routes use `generateStaticParams()` and are prerendered at build time. Category and collection routes are statically generated too. Search and filtered shop URLs are server-rendered from the URL query, with no per-visitor product API fetch. Cart, wishlist, mock account and demo orders use guarded browser storage; no anonymous server session is created.

## Local development

```sh
pnpm install
pnpm dev
```

Checks: `pnpm run typecheck`, `pnpm test`, `pnpm run build`.

## High traffic deployment

The frontend code by itself does **not** establish a 200,000 concurrent visitor capacity. That target depends on deployment infrastructure and must be demonstrated with load tests. For a production launch:

- Put Next.js behind a CDN/edge platform and cache static HTML, route data and immutable assets there. Include query strings in the cache key for filtered shop and search URLs.
- Use a CDN or image service for responsive image variants. Keep the local optimized assets as build-time fallbacks.
- Configure enough edge/server capacity for cache misses and revalidation; keep catalog browsing stateless.
- Monitor cache hit rate, origin request rate, Core Web Vitals and error rates.
- Run realistic load tests against the deployed infrastructure before publishing a concurrency claim.

The current product and category art under `public/` is lightweight local SVG demo artwork. Replace it with licensed boutique photography before a commercial launch. Set the real public site URL and business contact details in `src/config/site.ts`; the `.example.com` metadata URL is a placeholder. Never add private keys or credentials to frontend configuration.

## Mock flow limits

No real payment provider, inventory service, authentication backend or order backend is connected. Checkout labels its order/payment actions as demo behavior. The mock account service keeps no password in browser storage, but this is not production authentication and should be replaced by a server-backed auth provider.
