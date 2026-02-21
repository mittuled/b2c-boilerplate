#!/usr/bin/env bash
set -euo pipefail

MIGRATION_DIR="supabase/migrations/down"

usage() {
  echo "Usage: $0 [--dry-run] <migration_version>"
  echo ""
  echo "Roll back a specific migration by running its down-migration script."
  echo ""
  echo "Options:"
  echo "  --dry-run    Print the SQL that would be executed without running it"
  echo ""
  echo "Example:"
  echo "  $0 20260221000001"
  echo "  $0 --dry-run 20260221000016"
  exit 1
}

DRY_RUN=false
VERSION=""

while [[ $# -gt 0 ]]; do
  case $1 in
    --dry-run) DRY_RUN=true; shift ;;
    --help|-h) usage ;;
    *) VERSION="$1"; shift ;;
  esac
done

if [[ -z "$VERSION" ]]; then
  usage
fi

# Find the down-migration file
DOWN_FILE=$(find "$MIGRATION_DIR" -name "${VERSION}_*" -type f 2>/dev/null | head -1)

if [[ -z "$DOWN_FILE" ]]; then
  echo "ERROR: No down-migration found for version $VERSION"
  echo "Available down-migrations:"
  ls "$MIGRATION_DIR"/*.sql 2>/dev/null | sed 's/.*\//  /'
  exit 1
fi

echo "=== Migration Rollback ==="
echo "Down-migration: $DOWN_FILE"
echo ""

if $DRY_RUN; then
  echo "[DRY RUN] Would execute:"
  echo "---"
  cat "$DOWN_FILE"
  echo "---"
  exit 0
fi

echo "⚠️  WARNING: This will modify the database schema."
read -p "Are you sure you want to proceed? (yes/no): " CONFIRM

if [[ "$CONFIRM" != "yes" ]]; then
  echo "Aborted."
  exit 1
fi

echo "Executing down-migration..."
supabase db execute --file "$DOWN_FILE"
echo "✓ Rollback complete for $VERSION"
