#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

if [ ! -d node_modules ]; then
  echo "[setup] Installing npm dependencies..."
  npm install
fi

# ── API server (port 3002) ─────────────────────────────────────────────
echo "[api-server] Stopping any process on port 3002..."
lsof -ti:3002 | xargs kill -9 2>/dev/null || true
sleep 0.5

echo "[api-server] Starting api-server on http://localhost:3002"
node "$ROOT_DIR/api-server.mjs" &
API_PID=$!
trap "echo '[api-server] Stopping...'; kill $API_PID 2>/dev/null" EXIT

# Give the api-server a moment to bind
sleep 1
if lsof -ti:3002 &>/dev/null; then
  echo "[api-server] ✓ Running (PID $API_PID)"
else
  echo "[api-server] ✗ Failed to start — check api-server.mjs for errors"
fi

# ── Vite dev server (port 5173) ────────────────────────────────────────
echo "[vite] Starting dev server on http://localhost:5173"
npm run dev -- --host --port 5173
