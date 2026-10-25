# Annah Boutique

Next.js App Router storefront for a premium Indian fashion boutique backed by the Express catalog services in `backend/`. Customers browse anonymously and create WhatsApp order inquiries; only the seeded admin authenticates.

## Catalog architecture

```text
Server Components / UI → `src/services/productService.ts` → API gateway → Catalog service → PostgreSQL
```

All storefront products, variants, categories, search, filters, and prices come from the Catalog service. `src/lib/catalogApi.ts` is the shared frontend API client.

Product and category routes are dynamically rendered so admin changes are visible without stale build output. Cart and wishlist state remain anonymous browser state; order inquiries are validated and priced by the backend before opening WhatsApp.

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

## Backend development

Copy `backend/.env.example` to `.env`, fill the database, SMTP, JWT, and Supabase values, then run `pnpm db:migrate` and `pnpm db:seed` from the repository root. Run the gateway on `4001`, auth on `4002`, and catalog on `4003` in separate terminals. Start the frontend with `pnpm dev`; open `/admin/login` for the seeded admin OTP flow.
