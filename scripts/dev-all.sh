#!/usr/bin/env bash
set -euo pipefail

if [[ ! -f .env ]]; then
  echo "Missing .env. Copy backend/.env.example to .env and fill it first."
  exit 1
fi

cleanup() {
  kill "$auth_pid" "$catalog_pid" "$gateway_pid" 2>/dev/null || true
  wait "$auth_pid" "$catalog_pid" "$gateway_pid" 2>/dev/null || true
}

trap cleanup EXIT INT TERM

(cd backend/auth-service && exec env PORT=4002 node --env-file=../../.env --import=tsx/esm src/index.ts) &
auth_pid=$!

(cd backend/catalog-service && exec env PORT=4003 node --env-file=../../.env --import=tsx/esm src/index.ts) &
catalog_pid=$!

(cd backend/api-gateway && exec env PORT=4001 node --env-file=../../.env --import=tsx/esm src/index.ts) &
gateway_pid=$!

pnpm dev
