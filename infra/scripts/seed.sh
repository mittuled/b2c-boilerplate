#!/usr/bin/env bash
set -euo pipefail

echo "=== Seeding database ==="
echo "Running SQL seed..."
supabase db reset

echo ""
echo "Creating auth test users..."
npx tsx infra/scripts/seed-auth-users.ts

echo ""
echo "=== Seed complete ==="
