#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="${ROOT_DIR}/react-guide"
INSTALL_ONLY=${1:-}

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is required (v18+). Install Node.js and re-run this script." >&2
  exit 1
fi

NODE_MAJOR="$(node -v | sed 's/^v//' | cut -d'.' -f1)"
if [ "${NODE_MAJOR}" -lt 18 ]; then
  echo "Node.js v18 or newer is required. Current: $(node -v)" >&2
  exit 1
fi

if [ ! -d "${APP_DIR}" ]; then
  echo "react-guide folder not found at ${APP_DIR}." >&2
  exit 1
fi

cd "${APP_DIR}"

if [ ! -d node_modules ]; then
  echo "Installing React guide dependencies..."
  npm install
else
  echo "Dependencies already installed; skipping npm install."
fi

echo "Setup complete."

if [ "${INSTALL_ONLY}" = "--install-only" ]; then
  echo "Install-only mode: skipping dev server start."
  exit 0
fi

echo "Starting Vite dev server on http://localhost:5173 ..."
npm run dev -- --host --port 5173
