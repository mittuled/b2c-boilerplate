# Data Model: B2C Boilerplate — Phase 1: Foundation

**Branch**: `001-b2c-foundation` | **Date**: 2026-02-21

All tables live in the `public` schema unless noted. Supabase manages `auth.users` and `auth.sessions` in the `auth` schema. Phase 1 extends them with public-schema tables linked via `auth.uid()`.

## Entity Relationship Overview

```
auth.users (Supabase-managed)
    │
    ├──1:1── profiles
    │            │
    │            └──1:N── consent_entries
    │
    ├──1:1── user_roles ──M:1── role_definitions
    │                              │
    │                              └──M:N── role_permissions ──M:1── permissions
    │
    ├──1:N── auth.sessions (Supabase-managed, read via security definer)
    │
    └──1:N── mfa_recovery_codes

design_tokens (standalone, no user FK)
migrations (Supabase-managed via CLI, supabase_migrations schema)
```

## Tables

### profiles

Extends `auth.users` with application-specific profile data. One row per user.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | uuid | PK, FK → auth.users(id) ON DELETE CASCADE | Same as auth user ID |
| display_name | text | NOT NULL, max 100 chars | 🔒 PII |
| avatar_url | text | NULL | 🔒 PII — Supabase Storage path |
| bio | text | NULL, max 500 chars | 🔒 PII |
| phone | text | NULL, unique | 🔒 PII — E.164 format |
| timezone | text | NOT NULL, default 'UTC' | IANA timezone string |
| preferred_language | text | NOT NULL, default 'en' | ISO 639-1 code |
| account_status | text | NOT NULL, default 'unverified' | CHECK: unverified, active, suspended, deactivated |
| suspended_at | timestamptz | NULL | Set when admin suspends account |
| suspended_reason | text | NULL | Admin-provided reason |
| deactivated_at | timestamptz | NULL | Set when user deactivates |
| deleted_at | timestamptz | NULL | 🔒 Soft-delete timestamp; non-NULL = deleted |
| created_at | timestamptz | NOT NULL, default now() | |
| updated_at | timestamptz | NOT NULL, default now() | Auto-updated via trigger |

**Indexes**: `idx_profiles_account_status` on `account_status`, `idx_profiles_email` (via join to auth.users), `idx_profiles_not_deleted` partial index on `(id) WHERE deleted_at IS NULL`

**RLS Policies** (all policies filter `deleted_at IS NULL` per AC-5 soft-delete requirement):
- SELECT own: `auth.uid() = id AND deleted_at IS NULL`
- UPDATE own: `auth.uid() = id AND deleted_at IS NULL` (cannot update `account_status`, `suspended_*`, `deleted_at` fields)
- SELECT all: `authorize('users.read') AND deleted_at IS NULL` (admin/moderator)
- UPDATE all: `authorize('users.manage')` (admin — can set `deleted_at` for soft-delete)

**State Transitions**:
```
unverified ──(email verified)──→ active
active ──(admin suspends)──→ suspended
active ──(user deactivates)──→ deactivated
suspended ──(admin reinstates)──→ active
deactivated ──(user reactivates within grace period)──→ active
```

**Trigger**: `on_auth_user_created` — automatically creates a `profiles` row when a new `auth.users` row is inserted. Sets `account_status` to `unverified`.

**Trigger**: `on_email_verified` — updates `account_status` from `unverified` to `active` when `auth.users.email_confirmed_at` is set.

---

### role_definitions

Predefined role types with descriptions. Seeded, rarely modified.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | uuid | PK, default gen_random_uuid() | |
| name | text | NOT NULL, UNIQUE | super_admin, admin, moderator, end_user |
| description | text | NOT NULL | Human-readable description |
| hierarchy_level | int | NOT NULL, UNIQUE | Lower = more powerful. super_admin=0, admin=1, moderator=2, end_user=3 |
| created_at | timestamptz | NOT NULL, default now() | |

**RLS Policies**:
- SELECT: all authenticated users (roles are not secret)
- INSERT/UPDATE/DELETE: `authorize('roles.manage')` (super_admin only)

---

### permissions

Atomic permission definitions. Seeded, extended as modules are added.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | uuid | PK, default gen_random_uuid() | |
| key | text | NOT NULL, UNIQUE | Format: `resource.action` (e.g., `users.read`, `content.publish`) |
| description | text | NOT NULL | |
| module | text | NOT NULL | Which module owns this permission (auth, profile, rbac, etc.) |
| created_at | timestamptz | NOT NULL, default now() | |

**Phase 1 seed permissions**:
- `users.read`, `users.manage`, `users.delete`
- `roles.read`, `roles.manage`
- `sessions.read`, `sessions.manage`
- `profiles.read`, `profiles.manage`
- `settings.read`, `settings.manage`

---

### role_permissions

Join table mapping roles to their permission sets.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| role_id | uuid | FK → role_definitions(id) ON DELETE CASCADE | |
| permission_id | uuid | FK → permissions(id) ON DELETE CASCADE | |
| created_at | timestamptz | NOT NULL, default now() | |

**Constraints**: UNIQUE(role_id, permission_id)

**RLS Policies**:
- SELECT: all authenticated users
- INSERT/UPDATE/DELETE: `authorize('roles.manage')`

---

### user_roles

Maps each user to exactly one role.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | uuid | PK, default gen_random_uuid() | |
| user_id | uuid | FK → auth.users(id) ON DELETE CASCADE, UNIQUE | One role per user |
| role_id | uuid | FK → role_definitions(id) ON DELETE RESTRICT | Cannot delete role with assigned users |
| assigned_by | uuid | FK → auth.users(id) NULL | Who assigned this role |
| assigned_at | timestamptz | NOT NULL, default now() | |
| deleted_at | timestamptz | NULL | Soft-delete timestamp per AC-5 |

**Indexes**: `idx_user_roles_user_id` on `user_id`, `idx_user_roles_not_deleted` partial index on `(user_id) WHERE deleted_at IS NULL`

**RLS Policies** (all policies filter `deleted_at IS NULL`):
- SELECT own: `auth.uid() = user_id AND deleted_at IS NULL`
- SELECT all: `authorize('users.read') AND deleted_at IS NULL`
- INSERT/UPDATE/DELETE: `authorize('roles.manage')`

**Trigger**: `on_user_created_assign_default_role` — assigns `end_user` role on profile creation.

**Custom Access Token Hook**: `custom_access_token_hook(event jsonb)` — injects `user_role` (role name) and `user_permissions` (array of permission keys) into JWT claims.

---

### consent_entries

Audit log for all privacy and consent changes (GDPR compliance).

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | uuid | PK, default gen_random_uuid() | |
| user_id | uuid | FK → auth.users(id) ON DELETE CASCADE | |
| consent_type | text | NOT NULL | marketing_email, marketing_push, cookie_analytics, cookie_advertising |
| value | boolean | NOT NULL | true = opted in, false = opted out |
| ip_address | inet | NULL | 🔒 PII — Captured at time of change |
| user_agent | text | NULL | 🔒 PII — Captured at time of change |
| created_at | timestamptz | NOT NULL, default now() | Immutable — each change is a new row |

**Indexes**: `idx_consent_user_type` on `(user_id, consent_type, created_at DESC)`

**RLS Policies**:
- SELECT own: `auth.uid() = user_id`
- INSERT own: `auth.uid() = user_id`
- No UPDATE or DELETE (append-only audit log)
- SELECT all: `authorize('users.read')` (for compliance reporting)

**Design note**: This is an append-only log. The current consent state is the most recent entry per `(user_id, consent_type)`. A view `current_consents` provides the latest state.

---

### mfa_recovery_codes

Stores hashed recovery codes for MFA. Generated during MFA enrollment.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | uuid | PK, default gen_random_uuid() | |
| user_id | uuid | FK → auth.users(id) ON DELETE CASCADE | |
| code_hash | text | NOT NULL | bcrypt hash of the recovery code |
| used_at | timestamptz | NULL | Set when code is consumed |
| created_at | timestamptz | NOT NULL, default now() | |

**Constraints**: 10 codes generated per enrollment. Old codes are deleted on re-enrollment.

**RLS Policies**:
- No direct SELECT (codes are only validated via a `security definer` function)
- INSERT: via `security definer` function during MFA enrollment
- UPDATE (mark used): via `security definer` function during recovery

---

### design_tokens

Stores the semantic design token definitions. Seeded from Style Dictionary output. Used by admin to customize theming (Phase 2+), but established in Phase 1.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | uuid | PK, default gen_random_uuid() | |
| key | text | NOT NULL, UNIQUE | Dot-notation path: `color.primary`, `text.body.size` |
| category | text | NOT NULL | CHECK: color, typography, spacing, radius, shadow |
| light_value | text | NOT NULL | CSS-compatible value for light mode |
| dark_value | text | NOT NULL | CSS-compatible value for dark mode |
| description | text | NULL | Human-readable token purpose |
| created_at | timestamptz | NOT NULL, default now() | |
| updated_at | timestamptz | NOT NULL, default now() | |

**RLS Policies**:
- SELECT: all authenticated users (tokens are public configuration)
- INSERT/UPDATE/DELETE: `authorize('settings.manage')`

**Note**: In Phase 1, tokens are primarily managed via the file-based Style Dictionary pipeline and seeded into this table. The table enables runtime theming and admin customization in later phases.

---

## Views

### v_current_consents

Materialized view of the latest consent state per user per type.

```sql
CREATE VIEW v_current_consents AS
SELECT DISTINCT ON (user_id, consent_type)
  user_id,
  consent_type,
  value,
  created_at AS changed_at
FROM consent_entries
ORDER BY user_id, consent_type, created_at DESC;
```

### v_user_with_role

Convenience view joining profiles with role info.

```sql
CREATE VIEW v_user_with_role AS
SELECT
  p.*,
  rd.name AS role_name,
  rd.hierarchy_level
FROM profiles p
JOIN user_roles ur ON ur.user_id = p.id AND ur.deleted_at IS NULL
JOIN role_definitions rd ON rd.id = ur.role_id
WHERE p.deleted_at IS NULL;
```

---

## Database Functions

### authorize(requested_permission text) → boolean

Security definer function used in RLS policies. Checks JWT claims for the requested permission.

### get_my_sessions() → TABLE

Security definer function querying `auth.sessions` for the current user. Returns session ID, created_at, updated_at, user_agent, IP.

### custom_access_token_hook(event jsonb) → jsonb

Auth Hook that injects `user_role` and `user_permissions` into JWT claims on token mint/refresh.

### validate_recovery_code(code text) → boolean

Security definer function that hashes the provided code and checks it against `mfa_recovery_codes`. Marks the matching code as used if found.

---

## Seed Data

The seed script (`supabase/seed.sql`) populates:

1. **Role definitions**: super_admin (level 0), admin (level 1), moderator (level 2), end_user (level 3)
2. **Permissions**: All Phase 1 permission keys
3. **Role-permission mappings**: super_admin gets all permissions; admin gets all except `roles.manage`; moderator gets `users.read`, `profiles.read`, `sessions.read`; end_user gets no admin permissions
4. **Test users** (via Supabase auth admin API in seed script):
   - `superadmin@test.com` (super_admin, verified, MFA enabled)
   - `admin@test.com` (admin, verified)
   - `moderator@test.com` (moderator, verified)
   - `user@test.com` (end_user, verified, active)
   - `unverified@test.com` (end_user, unverified)
   - `suspended@test.com` (end_user, suspended)
   - `deactivated@test.com` (end_user, deactivated)
5. **Design tokens**: Full set of semantic tokens (colors, typography, spacing, radii) for light and dark modes
6. **Consent entries**: Sample consent records for test users

---

## PII Field Registry

Per Constitution Article VI, all PII fields are registered here for GDPR data-export and data-deletion flows.

| Table/Source | Field | Export? | Action on Delete | Notes |
|--------------|-------|---------|------------------|-------|
| profiles | display_name | Yes | Set to 'Deleted User' | |
| profiles | avatar_url | Yes | Delete storage object + set NULL | |
| profiles | bio | Yes | Set to NULL | |
| profiles | phone | Yes | Set to NULL | |
| auth.users | email | Yes | Anonymize to `deleted_{id}@removed.local` | Managed by Supabase Auth |
| consent_entries | ip_address | Yes | Retain for legal obligation (6 years) | GDPR Art. 17(3)(b) |
| consent_entries | user_agent | Yes | Retain for legal obligation (6 years) | GDPR Art. 17(3)(b) |
| auth.sessions | ip | No | Sessions revoked on delete | Supabase-managed |
| auth.sessions | user_agent | No | Sessions revoked on delete | Supabase-managed |
