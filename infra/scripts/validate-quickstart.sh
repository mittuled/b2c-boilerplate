#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────
# validate-quickstart.sh
# Validates that all scenarios from specs/001-b2c-foundation/quickstart.md
# have corresponding implementations in the codebase.
#
# Usage: ./infra/scripts/validate-quickstart.sh
# ─────────────────────────────────────────────────────────────────────
set -euo pipefail

# Resolve repo root (script lives in infra/scripts/)
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$REPO_ROOT"

PASS=0
FAIL=0
SKIP=0

pass() {
  PASS=$((PASS + 1))
  echo "  PASS: $1"
}

fail() {
  FAIL=$((FAIL + 1))
  echo "  FAIL: $1"
}

skip() {
  SKIP=$((SKIP + 1))
  echo "  SKIP: $1"
}

echo "============================================"
echo "  Quickstart Validation"
echo "  Repo: ${REPO_ROOT}"
echo "============================================"
echo ""

# ── 1. Repository structure ──────────────────────────────────────────
echo "[1/8] Repository structure"

declare -a STRUCTURE_FILES=(
  "turbo.json"
  "pnpm-workspace.yaml"
  "package.json"
  "biome.json"
  "supabase/config.toml"
  ".env.example"
  "contracts/openapi.yaml"
  "contracts/generated/typescript/database.ts"
)

for f in "${STRUCTURE_FILES[@]}"; do
  if [ -f "$f" ]; then
    pass "$f exists"
  else
    fail "$f not found"
  fi
done
echo ""

# ── 2. Web app routes ───────────────────────────────────────────────
echo "[2/8] Web app routes"

declare -a WEB_ROUTES=(
  "apps/web/app/(public)/signup/page.tsx"
  "apps/web/app/(public)/login/page.tsx"
  "apps/web/app/(public)/verify-email/page.tsx"
  "apps/web/app/(public)/reset-password/page.tsx"
  "apps/web/app/(public)/mfa-challenge/page.tsx"
  "apps/web/app/(public)/auth/callback/route.ts"
  "apps/web/app/(public)/privacy/page.tsx"
  "apps/web/app/(public)/terms/page.tsx"
  "apps/web/app/(auth)/settings/profile/page.tsx"
  "apps/web/app/(auth)/settings/privacy/page.tsx"
  "apps/web/app/(auth)/settings/sessions/page.tsx"
  "apps/web/app/(auth)/settings/mfa/page.tsx"
  "apps/web/app/(auth)/settings/appearance/page.tsx"
  "apps/web/app/(auth)/dashboard/page.tsx"
  "apps/web/app/(auth)/forbidden/page.tsx"
)

for f in "${WEB_ROUTES[@]}"; do
  if [ -f "$f" ]; then
    pass "$f"
  else
    fail "$f not found"
  fi
done
echo ""

# ── 3. Edge Functions ────────────────────────────────────────────────
echo "[3/8] Edge Functions"

declare -a EDGE_FUNCTIONS=(
  "supabase/functions/validate-signup/index.ts"
  "supabase/functions/manage-sessions/index.ts"
  "supabase/functions/delete-account/index.ts"
  "supabase/functions/export-data/index.ts"
  "supabase/functions/health/index.ts"
  "supabase/functions/rate-limiter/index.ts"
)

for f in "${EDGE_FUNCTIONS[@]}"; do
  if [ -f "$f" ]; then
    pass "$f"
  else
    fail "$f not found"
  fi
done

# Verify shared logger exists
if [ -f "supabase/functions/_shared/logger.ts" ]; then
  pass "Shared logger module exists"
else
  fail "supabase/functions/_shared/logger.ts not found"
fi
echo ""

# ── 4. Database migrations ──────────────────────────────────────────
echo "[4/8] Database migrations"

MIGRATION_COUNT=$(find supabase/migrations -name '*.sql' -not -path '*/down/*' 2>/dev/null | wc -l | tr -d ' ')
if [ "$MIGRATION_COUNT" -ge 10 ]; then
  pass "Found ${MIGRATION_COUNT} migration files (expected >= 10)"
else
  fail "Found ${MIGRATION_COUNT} migration files (expected >= 10)"
fi

if [ -f "supabase/seed.sql" ]; then
  pass "seed.sql exists"
else
  fail "supabase/seed.sql not found"
fi
echo ""

# ── 5. Packages ─────────────────────────────────────────────────────
echo "[5/8] Shared packages"

declare -a PACKAGES=(
  "packages/api-client-ts/src/index.ts"
  "packages/api-client-ts/src/client.ts"
  "packages/api-client-ts/src/auth.ts"
  "packages/api-client-ts/src/sessions.ts"
  "packages/api-client-ts/src/profile.ts"
  "packages/api-client-ts/src/roles.ts"
  "packages/env-validation/src/index.ts"
  "packages/ui-web/src/i18n/messages.ts"
)

for f in "${PACKAGES[@]}"; do
  if [ -f "$f" ]; then
    pass "$f"
  else
    fail "$f not found"
  fi
done
echo ""

# ── 6. CI/CD workflows ──────────────────────────────────────────────
echo "[6/8] CI/CD workflows"

declare -a WORKFLOWS=(
  "infra/github/workflows/shared-validation.yml"
  "infra/github/workflows/web.yml"
  "infra/github/workflows/deploy.yml"
  "infra/github/workflows/observability-check.yml"
)

for f in "${WORKFLOWS[@]}"; do
  if [ -f "$f" ]; then
    pass "$f"
  else
    fail "$f not found"
  fi
done
echo ""

# ── 7. Developer tooling ────────────────────────────────────────────
echo "[7/8] Developer tooling"

declare -a TOOLS=(
  "infra/scripts/doctor.sh"
  "infra/scripts/seed.sh"
  "infra/scripts/rollback-migration.sh"
  "docs/architecture.md"
  "docs/a11y-baseline.md"
)

for f in "${TOOLS[@]}"; do
  if [ -f "$f" ]; then
    pass "$f"
  else
    fail "$f not found"
  fi
done
echo ""

# ── 8. Web app components ───────────────────────────────────────────
echo "[8/8] Key components"

declare -a COMPONENTS=(
  "apps/web/middleware.ts"
  "apps/web/app/layout.tsx"
  "apps/web/app/error.tsx"
  "apps/web/app/global-error.tsx"
  "apps/web/components/error-boundary.tsx"
  "apps/web/components/avatar-upload.tsx"
  "apps/web/components/cookie-consent.tsx"
  "apps/web/components/permission-guard.tsx"
  "apps/web/components/theme-selector.tsx"
)

for f in "${COMPONENTS[@]}"; do
  if [ -f "$f" ]; then
    pass "$f"
  else
    fail "$f not found"
  fi
done
echo ""

# ── Summary ──────────────────────────────────────────────────────────
TOTAL=$((PASS + FAIL + SKIP))
echo "============================================"
echo "  Results: ${PASS}/${TOTAL} passed, ${FAIL} failed, ${SKIP} skipped"
echo "============================================"

if [ $FAIL -gt 0 ]; then
  echo ""
  echo "Some quickstart validations failed. Review the FAIL items above."
  exit 1
fi

echo ""
echo "All quickstart validations passed."
exit 0
