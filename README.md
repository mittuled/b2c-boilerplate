# B2C SaaS Boilerplate

A production-ready, multi-platform B2C SaaS starter built with **Next.js 15**, **Supabase**, and **Turborepo**. Ships with authentication, RBAC, GDPR compliance, theming, and developer tooling out of the box.

## What's Included

| Category | Details |
|----------|---------|
| **Auth** | Email/password signup, OAuth (Google/Apple), email verification, password reset, MFA (TOTP), disposable email blocking |
| **Sessions** | Session listing, individual/bulk revocation, admin force-logout, cursor pagination |
| **Profiles** | Display name, avatar upload, bio, timezone, language preferences |
| **RBAC** | 4-tier role system (super_admin, admin, moderator, end_user), 11 permissions, JWT-embedded claims |
| **GDPR** | Cookie consent banner, data export (JSON), account deletion with PII scrubbing, consent audit trail |
| **Theming** | Light/dark/system modes, W3C DTCG design tokens, Style Dictionary v4 pipeline, CSS custom properties |
| **API** | 6 Edge Functions, OpenAPI 3.1 spec, interactive API docs, health check, rate limiting |
| **DX** | Doctor script, Plop.js code generators, Biome linting, Husky pre-commit hooks, CI/CD workflows |

## Tech Stack

- **Frontend**: Next.js 15 (App Router, React 19, TypeScript)
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions, Storage, Realtime)
- **Monorepo**: Turborepo + pnpm workspaces
- **Database**: PostgreSQL with Row-Level Security (RLS)
- **Edge Functions**: Deno runtime
- **Styling**: CSS custom properties from design tokens
- **Testing**: Vitest (unit), Playwright (E2E), pgTAP (database)
- **Linting**: Biome
- **CI/CD**: GitHub Actions (4 workflows)

## Project Structure

```
b2c-boilerplate/
├── apps/
│   ├── web/                 # Consumer-facing Next.js 15 app
│   └── admin/               # Admin panel (separate deploy)
├── packages/
│   ├── api-client-ts/       # Typed Supabase client with auth, session, profile, role helpers
│   ├── env-validation/      # Zod-based environment variable validation
│   └── ui-web/              # Shared React components + i18n messages
├── supabase/
│   ├── migrations/          # 16 sequential SQL migrations + down-migrations
│   ├── functions/           # 6 Edge Functions + shared utilities
│   ├── tests/               # pgTAP test suites (26 tests)
│   └── seed.sql             # Idempotent seed data (roles, permissions, tokens)
├── contracts/               # OpenAPI 3.1 spec + generated TypeScript types
├── tokens/                  # W3C DTCG design tokens (Style Dictionary v4)
├── infra/
│   ├── github/workflows/    # CI/CD: validation, web, deploy, observability
│   └── scripts/             # doctor, seed, rollback, generate, validate
├── tools/generators/        # Plop.js templates (component, page, Edge Function)
├── specs/                   # Feature specifications (4 phases planned)
└── docs/                    # Architecture, a11y baseline
```

## Prerequisites

- **Node.js** >= 20
- **pnpm** >= 9
- **Supabase CLI** ([install guide](https://supabase.com/docs/guides/cli/getting-started))
- **Docker** (for local Supabase)

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/mittuled/b2c-boilerplate.git
cd b2c-boilerplate
pnpm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

For local development the defaults work. For production, fill in your Supabase project URL and keys.

### 3. Start Supabase locally

```bash
supabase start
```

This starts PostgreSQL, Auth, Storage, Edge Functions, and the Studio dashboard. After startup, note the `anon key` and `API URL` printed to the console — update `.env.local` if they differ from defaults.

### 4. Apply migrations and seed data

```bash
pnpm db:reset        # Applies all 16 migrations + seed.sql
pnpm db:seed         # Also creates 7 test users via Admin API
```

### 5. Start development

```bash
pnpm dev             # Starts web app (port 3000) + admin (port 3001) concurrently
```

### 6. Verify setup

```bash
pnpm doctor          # Checks Node, pnpm, Supabase CLI, env vars, services
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start all apps in development mode |
| `pnpm build` | Build all apps and packages |
| `pnpm test` | Run unit tests (Vitest) |
| `pnpm test:e2e` | Run end-to-end tests (Playwright) |
| `pnpm lint` | Lint with Biome |
| `pnpm typecheck` | TypeScript type checking |
| `pnpm generate` | Scaffold new component, page, or Edge Function (Plop.js) |
| `pnpm doctor` | Verify development environment |
| `pnpm db:reset` | Reset database and apply all migrations |
| `pnpm db:seed` | Seed database with test data and users |
| `pnpm tokens:build` | Build design tokens to CSS variables |

## Test Users

After running `pnpm db:seed`, these accounts are available (password: `Test1234!`):

| Email | Role | Status |
|-------|------|--------|
| superadmin@test.com | super_admin | active |
| admin@test.com | admin | active |
| moderator@test.com | moderator | active |
| user@test.com | end_user | active |
| unverified@test.com | end_user | unverified |
| suspended@test.com | end_user | suspended |
| deactivated@test.com | end_user | deactivated |

## Auth Flow

1. User signs up → `validate-signup` Edge Function checks password strength + disposable email
2. Supabase Auth creates user → `on_auth_user_created` trigger creates profile + assigns `end_user` role
3. Verification email sent → user clicks link → `on_email_verified` trigger sets status to `active`
4. Login → Supabase Auth issues JWT → `custom_access_token_hook` injects `user_role` + `user_permissions`
5. Client receives JWT with embedded claims → used for both UI rendering and API authorization

## RBAC

Authorization is enforced at two layers:

**Database layer** — RLS policies call `authorize('permission.key')` which reads JWT claims:

```sql
-- Example: Only users with 'users.read' permission can see other profiles
create policy "admin_read_profiles" on profiles
  for select using (public.authorize('users.read'));
```

**UI layer** — React hook + guard component for conditional rendering:

```tsx
import { usePermissions } from '@/lib/use-permissions';
import { PermissionGuard } from '@/components/permission-guard';

// Hook
const { hasPermission, role } = usePermissions();
if (hasPermission('users.manage')) { /* ... */ }

// Component
<PermissionGuard permission="users.manage">
  <AdminPanel />
</PermissionGuard>
```

### Role Hierarchy

| Role | Level | Permissions |
|------|-------|-------------|
| super_admin | 0 | All 11 permissions |
| admin | 1 | All except `roles.manage` |
| moderator | 2 | `users.read`, `profiles.read`, `sessions.read` |
| end_user | 3 | None (RLS enforces own-data access) |

## Edge Functions

| Function | Auth | Description |
|----------|------|-------------|
| `validate-signup` | No | Email + password validation, disposable domain blocking |
| `manage-sessions` | Yes | List sessions (paginated), revoke session, admin force-logout |
| `delete-account` | Yes | GDPR right to erasure — soft-delete, PII scrub, avatar removal |
| `export-data` | Yes | GDPR right to access — profile, consent, role as JSON bundle |
| `health` | No | Shallow/deep health check (database + auth connectivity) |
| `rate-limiter` | Yes | Per-user/IP rate limiting with sliding window |

All Edge Functions use:
- **Envelope response format**: `{ data, errors, meta: { timestamp, correlationId } }`
- **Structured JSON logging** with PII redaction via shared `_shared/logger.ts`
- **Cursor pagination** via shared `_shared/pagination.ts`

## Database Migrations

16 sequential migrations in `supabase/migrations/`:

| # | Migration | Description |
|---|-----------|-------------|
| 001 | `create_profiles` | User profiles with PII markers, soft delete |
| 002 | `create_rbac_tables` | role_definitions, permissions, role_permissions, user_roles |
| 003 | `create_consent_entries` | Append-only GDPR consent audit trail |
| 004 | `create_mfa_recovery_codes` | Hashed recovery codes for TOTP MFA |
| 005 | `create_design_tokens` | Runtime theming token storage |
| 006 | `create_views` | v_current_consents, v_user_with_role |
| 007–011 | `rls_*` | Row-Level Security policies for all tables |
| 012 | `authorize_function` | JWT permission checking helper |
| 013 | `session_functions` | `get_my_sessions()` security definer |
| 014 | `recovery_code_function` | bcrypt-based recovery code validation |
| 015 | `auth_triggers` | Auto-create profile, email verification, updated_at |
| 016 | `access_token_hook` | Custom JWT claims injection (role + permissions) |

Each migration has a companion down-migration in `supabase/migrations/down/` for development rollback. See [docs/architecture.md](docs/architecture.md) for the rollback runbook.

## Design Tokens

Design tokens follow the [W3C Design Tokens Community Group](https://design-tokens.github.io/community-group/format/) format and are built with Style Dictionary v4.

```
tokens/src/base/          # Primitives (colors, sizes)
tokens/src/semantic/      # Semantic aliases with dark mode overrides
tokens/generated/css/     # Generated :root and [data-theme="dark"] variables
```

Build tokens:

```bash
pnpm tokens:build
```

The web app imports generated CSS variables and applies them via the `ThemeProvider` which supports light, dark, and system preference modes.

## Code Generation

Scaffold new code with Plop.js:

```bash
pnpm generate
```

Three generators are available:

- **component** — React component with TypeScript props, test file, optional `'use client'`
- **screen** — Next.js App Router page with metadata export
- **edge-function** — Deno Edge Function with CORS, auth, logging, envelope response

## CI/CD

Four GitHub Actions workflows in `infra/github/workflows/`:

| Workflow | Trigger | Jobs |
|----------|---------|------|
| `shared-validation.yml` | Push/PR | Lint, typecheck, security audit, workflow validation, Edge Function validation |
| `web.yml` | Push/PR (apps/web/**) | Unit tests with coverage, build, E2E tests |
| `deploy.yml` | Push to main | Deploy web, deploy admin, deploy Supabase (migrations + functions) |
| `observability-check.yml` | PR (supabase/functions/**) | Verify structured logging in all Edge Functions |

## Planned Phases

This boilerplate is Phase 1 of a 4-phase roadmap:

| Phase | Scope | Status |
|-------|-------|--------|
| **1 — Foundation** | Auth, RBAC, profiles, sessions, GDPR, theming, API, DX, CI/CD | Complete |
| 2 — Monetization | Billing (Stripe), notifications, email, feature flags, admin dashboard, SEO | Spec ready |
| 3 — Scale & Polish | i18n, a11y, offline support, analytics, observability, multi-platform delivery | Spec ready |
| 4 — Advanced | Passkeys, A/B testing, CMS, trials, webhooks, white-labeling | Spec ready |

Feature specs for all phases are in `specs/`.

## Documentation

- [Architecture Overview](docs/architecture.md) — Monorepo structure, data flow, auth flow, RBAC model, rollback strategy, token pipeline
- [Accessibility Baseline](docs/a11y-baseline.md) — Required ARIA patterns, semantic HTML, focus management, color contrast
- [OpenAPI Spec](contracts/openapi.yaml) — Full API documentation for all Edge Functions
- [Implementation Summary](specs/001-b2c-foundation/implementation-summary.md) — Detailed build log for Phase 1

## License

MIT
