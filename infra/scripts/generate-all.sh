#!/usr/bin/env bash
# generate-all.sh
# Master code-generation script. Runs all generators in the correct order.
#
# Usage:
#   bash infra/scripts/generate-all.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

# ── Colours ──────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Colour

divider() {
  echo ""
  echo -e "${BOLD}────────────────────────────────────────────────────────${NC}"
  echo ""
}

info()  { echo -e "${CYAN}[info]${NC}  $*"; }
ok()    { echo -e "${GREEN}[ok]${NC}    $*"; }
warn()  { echo -e "${YELLOW}[warn]${NC}  $*"; }
err()   { echo -e "${RED}[error]${NC} $*"; }

FAILED=0

# ── Step 1: Style Dictionary / Design Tokens ────────────────────────
divider
info "Step 1/3: Building design tokens (Style Dictionary)"

if pnpm --filter @b2c/tokens build 2>/dev/null; then
  ok "Design tokens built successfully."
else
  warn "Design tokens build skipped (package @b2c/tokens may not exist yet)."
fi

# ── Step 2: OpenAPI TypeScript Types ────────────────────────────────
divider
info "Step 2/3: Generating TypeScript types from OpenAPI spec"

if bash "$SCRIPT_DIR/generate-api-client.sh"; then
  ok "OpenAPI TypeScript types generated."
else
  err "OpenAPI type generation failed."
  FAILED=1
fi

# ── Step 3: Supabase Type Generation ───────────────────────────────
divider
info "Step 3/3: Supabase database types"

if command -v supabase &>/dev/null; then
  SUPABASE_DB_TYPES="$ROOT_DIR/contracts/generated/typescript/database.ts"
  info "Running: supabase gen types typescript --local > $SUPABASE_DB_TYPES"
  if supabase gen types typescript --local > "$SUPABASE_DB_TYPES" 2>/dev/null; then
    ok "Supabase database types generated."
  else
    warn "Supabase type generation failed (is the local instance running?)."
    warn "Run 'supabase start' first, then re-run this script."
  fi
else
  warn "Supabase CLI not found. Skipping database type generation."
  warn "Install it with: brew install supabase/tap/supabase"
  warn "Then run: supabase gen types typescript --local > contracts/generated/typescript/database.ts"
fi

# ── Summary ──────────────────────────────────────────────────────────
divider
if [ "$FAILED" -eq 0 ]; then
  ok "All code generation steps completed."
else
  err "Some steps failed. Review the output above."
  exit 1
fi
