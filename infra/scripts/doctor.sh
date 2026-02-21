#!/usr/bin/env bash
# =============================================================================
# B2C Boilerplate - Doctor CLI
# =============================================================================
# Checks that the local development environment is configured correctly.
# Exit code 0 = all critical checks pass, 1 = one or more failures.
# =============================================================================

set -euo pipefail

# ---------------------------------------------------------------------------
# Colour helpers (disabled when stdout is not a terminal)
# ---------------------------------------------------------------------------
if [ -t 1 ]; then
  GREEN='\033[0;32m'
  RED='\033[0;31m'
  YELLOW='\033[0;33m'
  BOLD='\033[1m'
  RESET='\033[0m'
else
  GREEN='' RED='' YELLOW='' BOLD='' RESET=''
fi

PASS="${GREEN}✓${RESET}"
FAIL="${RED}✗${RESET}"
WARN="${YELLOW}!${RESET}"

FAILURES=0
WARNINGS=0

pass()  { echo -e "  ${PASS} $1"; }
fail()  { echo -e "  ${FAIL} $1"; FAILURES=$((FAILURES + 1)); }
warn()  { echo -e "  ${WARN} $1"; WARNINGS=$((WARNINGS + 1)); }

echo ""
echo -e "${BOLD}B2C Boilerplate — Doctor${RESET}"
echo -e "${BOLD}========================${RESET}"
echo ""

# ---------------------------------------------------------------------------
# 1. Node.js >= 20
# ---------------------------------------------------------------------------
echo -e "${BOLD}Runtime${RESET}"

if command -v node &>/dev/null; then
  NODE_VERSION=$(node -v | sed 's/v//')
  NODE_MAJOR=$(echo "$NODE_VERSION" | cut -d. -f1)
  if [ "$NODE_MAJOR" -ge 20 ]; then
    pass "Node.js v${NODE_VERSION} (>= 20 required)"
  else
    fail "Node.js v${NODE_VERSION} found — version 20+ is required"
  fi
else
  fail "Node.js is not installed"
fi

# ---------------------------------------------------------------------------
# 2. pnpm installed
# ---------------------------------------------------------------------------
if command -v pnpm &>/dev/null; then
  PNPM_VERSION=$(pnpm --version)
  pass "pnpm v${PNPM_VERSION}"
else
  fail "pnpm is not installed — run: corepack enable && corepack prepare pnpm@latest --activate"
fi

# ---------------------------------------------------------------------------
# 3. Supabase CLI
# ---------------------------------------------------------------------------
echo ""
echo -e "${BOLD}Supabase${RESET}"

if command -v supabase &>/dev/null; then
  SUPA_VERSION=$(supabase --version 2>/dev/null | head -1)
  pass "Supabase CLI (${SUPA_VERSION})"
else
  fail "Supabase CLI is not installed — see https://supabase.com/docs/guides/cli"
fi

# ---------------------------------------------------------------------------
# 4. .env file
# ---------------------------------------------------------------------------
echo ""
echo -e "${BOLD}Environment${RESET}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/../.." && pwd)"

if [ -f "${ROOT_DIR}/.env.local" ]; then
  pass ".env.local exists"
elif [ -f "${ROOT_DIR}/.env" ]; then
  pass ".env exists"
else
  warn "No .env.local or .env file found — run: cp .env.example .env.local"
fi

# ---------------------------------------------------------------------------
# 5. Required env vars
# ---------------------------------------------------------------------------
# Source the env file if it exists so we can check values
ENV_FILE=""
if [ -f "${ROOT_DIR}/.env.local" ]; then
  ENV_FILE="${ROOT_DIR}/.env.local"
elif [ -f "${ROOT_DIR}/.env" ]; then
  ENV_FILE="${ROOT_DIR}/.env"
fi

REQUIRED_VARS=(
  "NEXT_PUBLIC_SUPABASE_URL"
  "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  "SUPABASE_SERVICE_ROLE_KEY"
)

if [ -n "$ENV_FILE" ]; then
  # shellcheck disable=SC1090
  set +e
  source "$ENV_FILE" 2>/dev/null
  set -e

  for var in "${REQUIRED_VARS[@]}"; do
    if [ -n "${!var:-}" ]; then
      pass "${var} is set"
    else
      fail "${var} is missing or empty in ${ENV_FILE##*/}"
    fi
  done
else
  for var in "${REQUIRED_VARS[@]}"; do
    warn "${var} — cannot check (no env file)"
  done
fi

# ---------------------------------------------------------------------------
# 6. Supabase running
# ---------------------------------------------------------------------------
echo ""
echo -e "${BOLD}Services${RESET}"

if command -v supabase &>/dev/null; then
  if supabase status &>/dev/null; then
    pass "Supabase local stack is running"
  else
    warn "Supabase local stack is not running — run: supabase start"
  fi
else
  warn "Supabase CLI not found — cannot check local stack"
fi

# ---------------------------------------------------------------------------
# Summary
# ---------------------------------------------------------------------------
echo ""
echo -e "${BOLD}Summary${RESET}"
if [ "$FAILURES" -gt 0 ]; then
  echo -e "  ${RED}${FAILURES} failure(s)${RESET}, ${YELLOW}${WARNINGS} warning(s)${RESET}"
  echo ""
  exit 1
elif [ "$WARNINGS" -gt 0 ]; then
  echo -e "  ${GREEN}All critical checks passed${RESET}, ${YELLOW}${WARNINGS} warning(s)${RESET}"
  echo ""
  exit 0
else
  echo -e "  ${GREEN}All checks passed — you're good to go!${RESET}"
  echo ""
  exit 0
fi
