# Architecture Overview — B2C Boilerplate

## Monorepo Structure

```
b2c-boilerplate/
├── apps/           # Application shells (thin orchestration)
│   ├── web/        # Next.js 15 consumer app
│   └── admin/      # Next.js 15 admin panel (separate deploy per AC-1)
├── packages/       # Shared libraries (Article II)
│   ├── api-client-ts/   # Typed Supabase client wrapper
│   ├── env-validation/  # Zod-based env var validation
│   └── ui-web/          # Shared React components + i18n
├── supabase/       # Backend (PostgreSQL + Auth + Edge Functions)
│   ├── migrations/ # Sequential SQL migrations
│   ├── functions/  # Edge Functions (Deno runtime)
│   ├── tests/      # pgTAP RLS/function tests
│   └── seed.sql    # Idempotent seed data
├── contracts/      # API contracts (OpenAPI 3.1 source of truth)
├── tokens/         # Design tokens (Style Dictionary v4)
├── infra/          # CI/CD and scripts
└── tools/          # Developer tooling (Plop.js generators)
```

## Data Flow

```
Client (Next.js / Mobile / Desktop)
  │
  ├── Direct DB access via PostgREST ← Supabase JS SDK
  │     └── RLS policies enforce authorization at row level
  │
  ├── Auth operations ← Supabase Auth
  │     └── Custom Access Token Hook injects role + permissions into JWT
  │
  └── Custom operations ← Edge Functions (Deno)
        ├── validate-signup (disposable email blocking)
        ├── manage-sessions (session listing/revocation)
        ├── rate-limiter (per-user rate limiting)
        ├── delete-account (GDPR right to erasure)
        ├── export-data (GDPR right to access)
        └── health (health check endpoint)
```

## Auth Flow

1. User signs up → Edge Function validates (password strength, disposable email) → Supabase Auth creates user
2. `on_auth_user_created` trigger → creates profile + assigns `end_user` role
3. Email verification link sent → user clicks → `on_email_verified` trigger → status = `active`
4. Login → Supabase Auth issues JWT → `custom_access_token_hook` injects `user_role` + `user_permissions`
5. Client receives JWT with role/permissions → used for UI rendering + API authorization

## RBAC Model

```
super_admin (level 0) → ALL permissions
admin (level 1)       → All except roles.manage
moderator (level 2)   → users.read, profiles.read, sessions.read
end_user (level 3)    → No admin permissions (RLS enforces own-data access)
```

Authorization checked at two layers:
- **Database**: RLS policies call `authorize('permission.key')` which reads JWT claims
- **UI**: `usePermissions()` hook + `<PermissionGuard>` component for conditional rendering

## Migration Rollback Strategy

### Approach: Forward-Fix Preferred, Down-Migration Available

**Forward-fix** (recommended for production):
- Create a new migration that reverses or modifies the problematic change
- Preserves migration history and audit trail
- Safer for production data

**Down-migration** (for development and staging):
- Companion scripts in `supabase/migrations/down/`
- Each up-migration has a corresponding down-migration
- Safety checks prevent accidental production execution

### Rollback Runbook

1. **Identify** the problematic migration version (e.g., `20260221000005`)
2. **Preview** the rollback: `bash infra/scripts/rollback-migration.sh --dry-run 20260221000005`
3. **Verify** the SQL is correct and safe
4. **Execute** (development only): `bash infra/scripts/rollback-migration.sh 20260221000005`
5. **Confirm** with interactive prompt
6. **Verify** database state after rollback

### Safety Guards

- Production environment check prevents accidental execution
- Interactive confirmation required before execution
- `--dry-run` mode shows SQL without executing
- All down-migrations use `IF EXISTS` to be idempotent

## Design Token Pipeline

```
tokens/src/ (W3C DTCG JSON)
  → Style Dictionary v4 build
    → tokens/generated/css/variables.css (:root)
    → tokens/generated/css/variables-dark.css ([data-theme="dark"])
    → (Phase 2+: Swift, Kotlin, C# outputs)
```

Contrast validation runs during build to ensure WCAG AA compliance.
