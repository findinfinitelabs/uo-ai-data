#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

if [ ! -d node_modules ]; then
  echo "Installing dependencies..."
  npm install
fi

# Kill anything already on port 3002, then start the API bridge
lsof -ti:3002 | xargs kill -9 2>/dev/null || true
node "$ROOT_DIR/api-server.mjs" &
API_PID=$!
trap "kill $API_PID 2>/dev/null" EXIT

echo "Starting dev server at http://localhost:5173"
npm run dev -- --host --port 5173
