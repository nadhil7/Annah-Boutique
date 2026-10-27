import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { setTimeout as delay } from "node:timers/promises";

const rootDir = resolve(fileURLToPath(new URL("..", import.meta.url)));
const gatewayPort = process.env.PORT || "4001";
const children = new Map();
let stopping = false;
let stopPromise;

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
  const child = spawn("pnpm", ["--filter", packageName, "start"], {
    cwd: rootDir,
    env: childEnvironment(overrides),
    detached: true,
    stdio: "inherit",
  });

  const exited = new Promise((resolveExit) => {
    child.once("exit", (code, signal) => {
      resolveExit({ code, signal });
      if (!stopping) {
        const result = signal ? `signal ${signal}` : `exit code ${code}`;
        void stop(1, `${name} stopped unexpectedly (${result})`);
      }
    });
  });

  child.once("error", (error) => {
    if (!stopping) void stop(1, `${name} could not start: ${error.message}`);
  });

  const service = { name, child, exited };
  children.set(name, service);
  return service;
}

async function waitForHealth(service, url, timeoutMs = 30_000) {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    if (stopping) throw new Error(`${service.name} startup was interrupted`);

    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(2_000) });
      if (response.ok) return;
    } catch {
      // The service may still be starting or waiting for the database.
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
