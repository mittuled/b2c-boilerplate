#!/usr/bin/env bash
# generate-api-client.sh
# Generates TypeScript types from the OpenAPI spec using openapi-typescript.
#
# Usage:
#   bash infra/scripts/generate-api-client.sh
#
# Prerequisites:
#   pnpm add -D openapi-typescript   (workspace root or relevant package)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

OPENAPI_SPEC="$ROOT_DIR/contracts/openapi.yaml"
OUTPUT_DIR="$ROOT_DIR/contracts/generated/typescript"
OUTPUT_FILE="$OUTPUT_DIR/api-types.ts"

# ── Colours ──────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Colour

info()  { echo -e "${CYAN}[info]${NC}  $*"; }
ok()    { echo -e "${GREEN}[ok]${NC}    $*"; }
warn()  { echo -e "${YELLOW}[warn]${NC}  $*"; }
err()   { echo -e "${RED}[error]${NC} $*"; }

# ── Pre-flight checks ───────────────────────────────────────────────
if [ ! -f "$OPENAPI_SPEC" ]; then
  err "OpenAPI spec not found at $OPENAPI_SPEC"
  exit 1
fi

# Ensure the output directory exists
mkdir -p "$OUTPUT_DIR"

# Locate openapi-typescript binary
OPENAPI_TS=""
if command -v openapi-typescript &>/dev/null; then
  OPENAPI_TS="openapi-typescript"
elif [ -x "$ROOT_DIR/node_modules/.bin/openapi-typescript" ]; then
  OPENAPI_TS="$ROOT_DIR/node_modules/.bin/openapi-typescript"
else
  warn "openapi-typescript not found. Attempting install via pnpx..."
  OPENAPI_TS="pnpx openapi-typescript"
fi

# ── Generate ─────────────────────────────────────────────────────────
info "Generating TypeScript types from OpenAPI spec..."
info "  Input:  $OPENAPI_SPEC"
info "  Output: $OUTPUT_FILE"

$OPENAPI_TS "$OPENAPI_SPEC" -o "$OUTPUT_FILE"

ok "TypeScript API types generated at $OUTPUT_FILE"
