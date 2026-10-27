import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { setTimeout as delay } from "node:timers/promises";

const rootDir = resolve(fileURLToPath(new URL("..", import.meta.url)));
const gatewayPort = process.env.PORT || "4001";
const children = new Map();
let stopping = false;
let stopPromise;

function envPresent(name) {
  return typeof process.env[name] === "string" && process.env[name].trim().length > 0;
}

function envStatus(name, validateUrl = false) {
  if (!envPresent(name)) return "missing";
  if (!validateUrl) return "set";
  try {
    new URL(process.env[name]);
    return "set(valid-url)";
  } catch {
    return "set(invalid-url)";
  }
}

function verifyEnvironment() {
  const supabaseKeyName = envPresent("SUPABASE_SERVICE_ROLE_KEY")
    ? "SUPABASE_SERVICE_ROLE_KEY"
    : envPresent("SUPABASE_SECRET_KEY")
      ? "SUPABASE_SECRET_KEY"
      : "SUPABASE_SERVICE_ROLE_KEY";
  const checks = {
    DATABASE_URL: envStatus("DATABASE_URL", true),
    JWT_SECRET: envStatus("JWT_SECRET"),
    SUPABASE_URL: envStatus("SUPABASE_URL", true),
    [supabaseKeyName]: envStatus(supabaseKeyName),
    CORS_ORIGINS: envStatus("CORS_ORIGINS"),
  };
  console.log(`[backend] environment check: ${Object.entries(checks).map(([name, status]) => `${name}=${status}`).join(" ")}`);

  const missing = Object.entries(checks)
    .filter(([, status]) => status === "missing" || status.endsWith("invalid-url)"))
    .map(([name]) => name);
  if (missing.length) throw new Error(`required environment configuration is missing or invalid: ${missing.join(", ")}`);
}

function childEnvironment(overrides) {
  return { ...process.env, ...overrides };
}

function stopProcess(child) {
  if (!child.pid || child.exitCode !== null) return;
  try {
    process.kill(-child.pid, "SIGTERM");
  } catch {
    child.kill("SIGTERM");
  }
}

function forceStopProcess(child) {
  if (!child.pid || child.exitCode !== null) return;
  try {
    process.kill(-child.pid, "SIGKILL");
  } catch {
    child.kill("SIGKILL");
  }
}

function startService(name, packageName, overrides) {
  console.log(`[backend] starting ${name} (${packageName})`);
  const child = spawn("pnpm", ["--filter", packageName, "start"], {
    cwd: rootDir,
    env: childEnvironment(overrides),
    detached: true,
    stdio: "inherit",
  });

  const exited = new Promise((resolveExit) => {
    child.once("exit", (code, signal) => {
      resolveExit({ code, signal });
      console.error(`[backend] ${name} exited: code=${code ?? "none"} signal=${signal ?? "none"}`);
      if (!stopping) {
        const result = signal ? `signal ${signal}` : `exit code ${code}`;
        void stop(1, `${name} stopped unexpectedly (${result})`);
      }
    });
  });

  child.once("error", (error) => {
    console.error(`[backend] ${name} process error: ${error.message}`);
    if (!stopping) void stop(1, `${name} could not start: ${error.message}`);
  });

  const service = { name, child, exited };
  children.set(name, service);
  return service;
}

async function waitForHealth(service, url, timeoutMs = 30_000) {
  const deadline = Date.now() + timeoutMs;
  let lastFailure;

  while (Date.now() < deadline) {
    if (stopping) throw new Error(`${service.name} startup was interrupted`);

    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(2_000) });
      if (response.ok) {
        console.log(`[backend] ${service.name} is healthy at ${url}`);
        return;
      }
      const body = (await response.text().catch(() => "")).slice(0, 240);
      const failure = `HTTP ${response.status}${body ? ` ${body}` : ""}`;
      if (failure !== lastFailure) {
        console.error(`[backend] ${service.name} health check at ${url}: ${failure}`);
        lastFailure = failure;
      }
    } catch (error) {
      const cause = error && typeof error === "object" && "cause" in error ? error.cause : undefined;
      const causeCode = cause && typeof cause === "object" && "code" in cause ? cause.code : undefined;
      const errorName = error instanceof Error ? error.name : "Error";
      const errorMessage = error instanceof Error ? error.message : String(error);
      const failure = errorName === "TimeoutError" || errorName === "AbortError"
        ? "request timeout"
        : `connection error${causeCode ? ` ${String(causeCode)}` : ""}: ${errorMessage}`;
      if (failure !== lastFailure) {
        console.error(`[backend] ${service.name} health check at ${url}: ${failure}`);
        lastFailure = failure;
      }
    }

    await delay(250);
  }

  throw new Error(`${service.name} did not become healthy at ${url}`);
}

async function stop(code, reason) {
  if (stopPromise) return stopPromise;

  stopping = true;
  if (reason) console.error(`[backend] ${reason}`);

  stopPromise = (async () => {
    const services = [...children.values()].reverse();
    services.forEach(({ child }) => stopProcess(child));

    await Promise.race([
      Promise.all(services.map(({ exited }) => exited)),
      delay(10_000),
    ]);

    services.forEach(({ child }) => forceStopProcess(child));
    process.exitCode = code;
  })();

  return stopPromise;
}

process.once("SIGTERM", () => void stop(0, "Received SIGTERM; stopping backend services"));
process.once("SIGINT", () => void stop(0, "Received SIGINT; stopping backend services"));

async function main() {
  verifyEnvironment();

  const auth = startService("auth-service", "@annah/auth-service", {
    HOST: "127.0.0.1",
    PORT: "4002",
    SERVICE_NAME: "auth-service",
  });
  const catalog = startService("catalog-service", "@annah/catalog-service", {
    HOST: "127.0.0.1",
    PORT: "4003",
    SERVICE_NAME: "catalog-service",
  });

  await Promise.all([
    waitForHealth(auth, "http://127.0.0.1:4002/health"),
    waitForHealth(catalog, "http://127.0.0.1:4003/health"),
  ]);

  const gateway = startService("api-gateway", "@annah/api-gateway", {
    HOST: "0.0.0.0",
    PORT: gatewayPort,
    SERVICE_NAME: "api-gateway",
    AUTH_SERVICE_URL: "http://127.0.0.1:4002",
    CATALOG_SERVICE_URL: "http://127.0.0.1:4003",
  });

  await waitForHealth(gateway, `http://127.0.0.1:${gatewayPort}/healthz`);
  console.log(`[backend] gateway is ready on port ${gatewayPort}`);
}

try {
  await main();
  await new Promise((resolveStop) => {
    const check = async () => {
      if (stopping) return resolveStop();
      await delay(250);
      void check();
    };
    void check();
  });
  await stopPromise;
} catch (error) {
  await stop(1, error instanceof Error ? error.message : String(error));
}
