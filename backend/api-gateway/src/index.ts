import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { createProxyMiddleware, fixRequestBody } from "http-proxy-middleware";
import { randomUUID } from "node:crypto";

const app = express();
app.set("trust proxy", 1);

const origins = (process.env.CORS_ORIGINS || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const authServiceUrl = (process.env.AUTH_SERVICE_URL || "http://localhost:4002").replace(/\/$/, "");
const catalogServiceUrl = (process.env.CATALOG_SERVICE_URL || "http://localhost:4003").replace(/\/$/, "");

app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || origins.includes(origin)) callback(null, true);
    else callback(new Error("Origin not allowed"));
  },
  credentials: true,
}));
app.use((req, res, next) => {
  res.setHeader("x-request-id", req.header("x-request-id") || randomUUID());
  next();
});
app.use(express.json({ limit: "128kb" }));

async function dependencyIsHealthy(url: string) {
  try {
    const response = await fetch(`${url}/health`, { signal: AbortSignal.timeout(2_000) });
    return response.ok;
  } catch {
    return false;
  }
}

async function healthz(_req: express.Request, res: express.Response) {
  const [auth, catalog] = await Promise.all([
    dependencyIsHealthy(authServiceUrl),
    dependencyIsHealthy(catalogServiceUrl),
  ]);

  if (!auth || !catalog) {
    return res.status(503).json({
      status: "unavailable",
      service: "api-gateway",
      dependencies: { auth, catalog },
    });
  }

  return res.json({
    status: "ok",
    service: "api-gateway",
    dependencies: { auth: true, catalog: true },
  });
}

app.get("/healthz", healthz);
app.get("/health", healthz);
app.use("/api/v1", rateLimit({ windowMs: 60_000, limit: 120, standardHeaders: true, legacyHeaders: false }));

const auth = createProxyMiddleware({
  on: { proxyReq: fixRequestBody },
  target: authServiceUrl,
  changeOrigin: true,
  pathRewrite: (path) => `/auth${path}`,
  proxyTimeout: 10_000,
});
const adminCatalog = createProxyMiddleware({
  on: { proxyReq: fixRequestBody },
  target: catalogServiceUrl,
  changeOrigin: true,
  pathRewrite: (path) => `/admin${path}`,
  proxyTimeout: 15_000,
});
const catalog = createProxyMiddleware({
  on: { proxyReq: fixRequestBody },
  target: catalogServiceUrl,
  changeOrigin: true,
  proxyTimeout: 15_000,
});

app.use("/api/v1/auth/login", rateLimit({ windowMs: 15 * 60_000, limit: 10, standardHeaders: true, legacyHeaders: false }));
app.use("/api/v1/auth/password", rateLimit({ windowMs: 15 * 60_000, limit: 10, standardHeaders: true, legacyHeaders: false }));
app.use("/api/v1/auth/request-otp", rateLimit({ windowMs: 15 * 60_000, limit: 5, standardHeaders: true, legacyHeaders: false }));
app.use("/api/v1/auth/verify-otp", rateLimit({ windowMs: 15 * 60_000, limit: 10, standardHeaders: true, legacyHeaders: false }));
app.use("/api/v1/auth", auth);
app.use("/api/v1/admin", adminCatalog);
app.use("/api/v1", catalog);
app.use((_req, res) => res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Route not found" } }));
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  void err;
  void _next;
  res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Request could not be processed" } });
});

const server = app.listen(Number(process.env.PORT || 4001), process.env.HOST || "0.0.0.0");
process.on("SIGTERM", () => server.close());
process.on("SIGINT", () => server.close());
