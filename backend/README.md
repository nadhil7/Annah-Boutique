# Annah Boutique backend

Three Railway deployables share one Neon PostgreSQL database: `api-gateway`, `auth-service`, and `catalog-service`. The gateway accepts browser traffic and proxies `/api/v1/auth/*` to Auth and all other versioned routes to Catalog. No customer accounts, payment endpoints, cart service, inventory quantity, or non-WhatsApp ordering channel are implemented.

## Run locally

Copy `backend/.env.example` to the root `.env` (never commit it), set the database, `JWT_SECRET`, `ADMIN_PASSWORD`, Supabase, and business values, then install the workspace with `pnpm install`. Apply schema using `pnpm db:migrate`, seed the admin with `pnpm db:seed`, and run each package in a separate terminal with `PORT=4002 pnpm --filter @annah/auth-service start`, `PORT=4003 pnpm --filter @annah/catalog-service start`, and `PORT=4001 pnpm --filter @annah/api-gateway start`. The active admin flow is email/password with `ADMIN_OTP_ENABLED=false`; OTP code and tables remain available for a future reviewed reactivation.

The initial seed creates the configured admin and never overwrites an existing password. If an existing OTP-only admin needs a deliberate password recovery, set `ADMIN_PASSWORD` and run `pnpm --filter @annah/auth-service admin:reset-password`; this revokes existing sessions. Passwords must be at least 12 characters and are stored as bcrypt hashes.

`pnpm db:seed` is idempotent and uses `ADMIN_EMAIL`, `ADMIN_NAME`, `ADMIN_PHONE`; authentication is email OTP, not a password. All service secrets stay server-side. Public product images belong in the public Supabase bucket named by `SUPABASE_STORAGE_BUCKET`. The browser uploads directly to the returned `uploadUrl` and sends the resulting `path` to the completion endpoint. `SUPABASE_SERVICE_ROLE_KEY` is never returned to the browser.

## Railway

Create exactly three services from this repository, using `backend/Dockerfile`. Set Docker build argument `SERVICE` to `api-gateway`, `auth-service`, or `catalog-service`. Set `PORT` per Railway; the gateway also needs internal `AUTH_SERVICE_URL` and `CATALOG_SERVICE_URL`. Configure the common Neon URL, JWT secret, and applicable SMTP/Supabase/business variables in Railway service variables. Set `CORS_ORIGINS` to the storefront origin(s). Run `pnpm db:migrate` and `pnpm db:seed` as release/pre-deploy commands for the catalog and auth services respectively. Each service exposes `/health`. Railway terminates TLS; the gateway trusts one proxy hop. Sessions are HttpOnly, SameSite=Lax cookies, Secure in production, and stored server-side. Configure `JWT_SECRET` with a high-entropy value.

## API conventions

Successful responses use `{ "success": true, "data": ... }`; failures use `{ "success": false, "error": { "code": "...", "message": "..." } }`. Validation uses Zod. Admin endpoints require the `annah_session` cookie. Pagination defaults to 24 and caps at 60 for catalog and 100 for inquiries. Amounts are INR decimal numbers and are always read from PostgreSQL for inquiry creation. Availability is a boolean-like enum, never quantity.

| Method and URL | Auth | Request / response |
|---|---|---|
| GET `/api/v1/products` | Public | Query `category`, `colour`, `size`, `minPrice`, `maxPrice`, `search`, `sort` (`price_asc`, `price_desc`, `newest`), `page`, `limit`. Returns `{items,total,page,limit}` with backend-priced variants and public image URLs. |
| GET `/api/v1/products/:slug` | Public | Returns one active product with variants and images. |
| GET `/api/v1/categories` | Public | Returns active categories ordered by `sortOrder`. |
| GET `/api/v1/categories/:slug` | Public | Returns one active category. |
| GET `/api/v1/settings` | Public | Returns configured business/contact/social links and WhatsApp number. |
| POST `/api/v1/auth/login` | Public, rate limited | `{email,password}`; sets the trusted HttpOnly session cookie. Invalid credentials are generic. |
| GET `/api/v1/auth/me` | Admin | Returns the database-backed admin profile. |
| POST `/api/v1/auth/password` | Admin, rate limited | `{currentPassword,newPassword,confirmPassword}`; changes the password and revokes/reissues the current session. |
| POST `/api/v1/auth/request-otp` | Disabled unless `ADMIN_OTP_ENABLED=true` | Legacy `{email}` OTP request. |
| POST `/api/v1/auth/verify-otp` | Disabled unless `ADMIN_OTP_ENABLED=true` | Legacy `{email,otp}` verification. |
| POST `/api/v1/auth/logout` | Session optional | Revokes current server session and clears cookie. |
| GET `/api/v1/auth/me` | Admin | Returns admin identity. |
| POST `/api/v1/admin/categories` | Admin | `{name,slug?,description?,image?,status?,sortOrder?}`. Creates a category. |
| PATCH `/api/v1/admin/categories/:id` | Admin | Partial category fields. |
| DELETE `/api/v1/admin/categories/:id` | Admin | Soft-deactivates category. |
| POST `/api/v1/admin/products` | Admin | Product fields plus `variants[]` containing `sku,colour,size,price,availability`. Creates product and variants transactionally. |
| PATCH `/api/v1/admin/products/:id` | Admin | Partial product fields; supplied `variants` replaces the variant set transactionally. |
| DELETE `/api/v1/admin/products/:id` | Admin | Soft-deactivates product. |
| POST `/api/v1/admin/media/signed-upload-url` | Admin | `{fileName,contentType,fileSize,entityType,entityId}`; JPEG/PNG/WebP up to 8 MiB. Returns Supabase `uploadUrl`, `token`, unique `path`, `expiresIn`. |
| POST `/api/v1/admin/media/complete` | Admin | `{entityType,entityId,path,altText?,sortOrder?,isPrimary?}`; validates ownership/object and stores public metadata. |
| PATCH `/api/v1/admin/media/:id` | Admin | `{altText?,sortOrder?,isPrimary?}` updates image text/order/primary selection. |
| DELETE `/api/v1/admin/media/:id` | Admin | Deletes image metadata and object from Storage. |
| POST `/api/v1/order-inquiries` | Public | `{items:[{productId,variantId,quantity}],anonymousId?}`; validates availability and obtains current variant prices, writes inquiry snapshots, returns `message` and encoded `whatsappUrl`. Returns 409 if any variant is unavailable. |
| GET `/api/v1/admin/order-inquiries` | Admin | Paginated inquiries with item snapshots. |
| PATCH `/api/v1/admin/order-inquiries/:id` | Admin | `{status:NEW\|CONTACTED\|CONFIRMED\|SOLD\|CANCELLED}`. |
| POST `/api/v1/analytics/events` | Public | One event with `eventType`, optional product/variant/anonymous ids and metadata. |
| POST `/api/v1/analytics/events/batch` | Public | `{events:[...]}` with up to 100 events. |
| GET `/api/v1/admin/analytics/overview` | Admin | View, add-to-cart, initiated inquiry, confirmed, and sold counts. |
| GET `/api/v1/admin/analytics/products` | Admin | Per-product views, cart adds, inquiry quantity, and quantity on SOLD inquiries. |

Validation failures return `VALIDATION_ERROR` with safe request-level messages; missing resources return 404, unavailable variants return 409, authentication failures 401, and cooldown returns 429. Error bodies never include SQL or stack traces.

## Database / quality

Schema is in `db/migrations/001_initial.sql`, using UUIDs, foreign keys, checks, inquiry snapshots, and query indexes. PostgreSQL is the only application database. Set up a public Supabase bucket with an 8 MiB maximum object size and allowed MIME types restricted to `image/jpeg`, `image/png`, and `image/webp`; the backend validates declared MIME type, size, and matching filename extension before signing. Allow browser uploads only through signed upload tokens. Expose only the gateway publicly; keep Auth and Catalog reachable through Railway private networking. Never set `SUPABASE_SERVICE_ROLE_KEY` in frontend variables.
