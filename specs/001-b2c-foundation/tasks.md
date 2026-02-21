# Tasks: B2C Boilerplate — Phase 1: Foundation

**Input**: Design documents from `/specs/001-b2c-foundation/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/openapi.yaml
**Tests**: Included per Constitution Article IV (Test-First Imperative) and FR-020 (>= 80% coverage)
**Organization**: Tasks grouped by user story. Each story is independently testable after foundational phase.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story (US1–US6)
- All file paths are relative to repository root

## Path Conventions

Per plan.md, this is a multi-platform monorepo. Phase 1 tasks focus on **web + backend (Supabase)** first. Mobile/desktop platform tasks are noted but grouped in a dedicated phase to avoid blocking the MVP.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize the monorepo structure, tooling, and Supabase project

- [x] T001 Initialize monorepo root: create `turbo.json`, `pnpm-workspace.yaml`, root `package.json` with pnpm workspaces
- [x] T002 Initialize Supabase project: run `supabase init`, configure `supabase/config.toml` with auth settings (15-min JWT expiry, refresh token rotation, email confirmation enabled)
- [x] T003 [P] Initialize Next.js 15 web app with App Router and TypeScript in `apps/web/`
- [x] T004 [P] Initialize Next.js 15 admin panel with App Router and TypeScript in `apps/admin/`
- [x] T005 [P] Create shared TypeScript API client package in `packages/api-client-ts/` with Supabase JS SDK dependency
- [x] T006 [P] Create environment validation package in `packages/env-validation/` with Zod schemas for dev/staging/prod
- [x] T007 Configure Biome for linting and formatting: create `biome.json` at repo root with shared rules
- [x] T008 Configure Husky pre-commit hooks in root: lint-staged running Biome on staged .ts/.tsx files
- [x] T009 Create `.env.example` with all Supabase variables (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY) and document public vs secret categorization
- [x] T010 [P] Create GitHub Actions shared validation workflow in `infra/github/workflows/shared-validation.yml` (lint, typecheck, security audit)
- [x] T011 [P] Create GitHub Actions web workflow in `infra/github/workflows/web.yml` (path-filtered, test, build)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Database schema, auth configuration, RLS, RBAC infrastructure, and design tokens. MUST complete before ANY user story.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

### Database Migrations

- [x] T012 Create migration `001_create_profiles` in `supabase/migrations/`: profiles table with all columns (id, display_name, avatar_url, bio, phone, timezone, preferred_language, account_status, suspended_at, suspended_reason, deactivated_at, deleted_at, created_at, updated_at) per data-model.md. Include partial index `idx_profiles_not_deleted` on `(id) WHERE deleted_at IS NULL`.
- [x] T013 Create migration `002_create_rbac_tables` in `supabase/migrations/`: role_definitions, permissions, role_permissions, user_roles (with deleted_at column and partial index) tables per data-model.md
- [x] T014 Create migration `003_create_consent_entries` in `supabase/migrations/`: consent_entries append-only audit table per data-model.md
- [x] T015 Create migration `004_create_mfa_recovery_codes` in `supabase/migrations/`: mfa_recovery_codes table per data-model.md
- [x] T016 Create migration `005_create_design_tokens` in `supabase/migrations/`: design_tokens table per data-model.md
- [x] T017 Create migration `006_create_views` in `supabase/migrations/`: v_current_consents and v_user_with_role views per data-model.md

### RLS Policies

- [x] T018 Create migration `007_rls_profiles` in `supabase/migrations/`: enable RLS on profiles, add policies (SELECT own WHERE deleted_at IS NULL, UPDATE own WHERE deleted_at IS NULL, SELECT all for users.read WHERE deleted_at IS NULL, UPDATE all for users.manage) per data-model.md. All policies MUST filter soft-deleted rows per AC-5.
- [x] T019 [P] Create migration `008_rls_rbac` in `supabase/migrations/`: enable RLS on role_definitions (SELECT all auth), permissions (SELECT all auth), role_permissions (SELECT all auth, CUD for roles.manage), user_roles (SELECT own WHERE deleted_at IS NULL, SELECT all for users.read WHERE deleted_at IS NULL, CUD for roles.manage)
- [x] T020 [P] Create migration `009_rls_consent` in `supabase/migrations/`: enable RLS on consent_entries (SELECT own, INSERT own, SELECT all for users.read, no UPDATE/DELETE)
- [x] T021 [P] Create migration `010_rls_mfa_recovery` in `supabase/migrations/`: enable RLS on mfa_recovery_codes (no direct access — security definer only)
- [x] T022 [P] Create migration `011_rls_design_tokens` in `supabase/migrations/`: enable RLS on design_tokens (SELECT all auth, CUD for settings.manage)

### Database Functions & Triggers

- [x] T023 Create migration `012_authorize_function` in `supabase/migrations/`: `authorize(requested_permission text)` security definer function that checks JWT claims per data-model.md
- [x] T024 Create migration `013_session_functions` in `supabase/migrations/`: `get_my_sessions()` security definer function querying auth.sessions for current user
- [x] T025 Create migration `014_recovery_code_function` in `supabase/migrations/`: `validate_recovery_code(code text)` security definer function
- [x] T026 Create migration `015_auth_triggers` in `supabase/migrations/`: `on_auth_user_created` trigger (creates profile row, assigns end_user role), `on_email_verified` trigger (updates account_status to active), `updated_at` auto-update trigger on profiles
- [x] T027 Create migration `016_access_token_hook` in `supabase/migrations/`: `custom_access_token_hook(event jsonb)` function that injects user_role and user_permissions into JWT claims. Register as Auth Hook in Supabase config.

### Seed Data

- [x] T028 Create `supabase/seed.sql`: idempotent seed script populating role_definitions (4 roles), permissions (Phase 1 set), role_permissions (mappings per data-model.md), design_tokens (semantic token set for light/dark), sample consent entries
- [x] T029 Create seed helper script `infra/scripts/seed-auth-users.ts`: Supabase Admin API script to create test users (superadmin@test.com, admin@test.com, moderator@test.com, user@test.com, unverified@test.com, suspended@test.com, deactivated@test.com) with password Test1234! and assign roles

### Type Generation & Client Setup

- [x] T030 Generate TypeScript types from local Supabase: run `supabase gen types typescript --local`, output to `contracts/generated/typescript/database.ts`
- [x] T031 Implement typed Supabase client in `packages/api-client-ts/src/client.ts`: createClient with Database type, auth helpers (signUp, signIn, signOut, resetPassword), server/client variants
- [x] T032 Implement environment validation in `packages/env-validation/src/index.ts`: Zod schemas for NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY (public), SUPABASE_SERVICE_ROLE_KEY (secret). Export validate() function that fails build with clear error messages per FR-023.

### Design Token Pipeline

- [x] T033 Create base design tokens in `tokens/src/base/colors.tokens.json` and `tokens/src/base/sizes.tokens.json` using W3C DTCG format (primitives: color palette, spacing scale, type scale, radii)
- [x] T034 Create semantic design tokens in `tokens/src/semantic/color.tokens.json`, `tokens/src/semantic/typography.tokens.json`, `tokens/src/semantic/spacing.tokens.json` with light/dark mode values via `$extensions.mode.dark`
- [x] T035 Configure Style Dictionary v4 in `tokens/config/web.config.js`: output CSS custom properties to `tokens/generated/css/` with `:root` and `[data-theme="dark"]` selectors
- [x] T036 Create `tokens/package.json` with build script that runs Style Dictionary, generates CSS output

### A11y & i18n Baseline (Constitution Art. V)

- [x] T115 [P] Create locale string externalization pattern in `packages/ui-web/src/i18n/messages.ts`: export all user-facing strings as a typed key-value map (English default), document pattern for adding locales in Phase 3
- [x] T116 [P] Add WCAG contrast validation to token pipeline in `tokens/config/web.config.js`: add Style Dictionary transform that validates all foreground/background token pairs meet 4.5:1 contrast ratio (AA), fail build on violation
- [x] T117 [P] Create a11y baseline guidelines in `docs/a11y-baseline.md`: document required ARIA attributes for form controls (labels, errors, descriptions), interactive elements (buttons, links, toggles), and navigation landmarks. All Phase 1 UI tasks MUST follow these patterns.
- [x] T118 Ensure all UI components created in US1-US5 use semantic HTML (`<main>`, `<nav>`, `<form>`, `<label>`) and include `aria-label`, `aria-describedby`, and `role` attributes where appropriate — add as acceptance criterion to each UI task

### Migration Rollback Scripts (Constitution AC-5)

- [x] T119 [P] Create down-migration scripts for migrations 001-006 in `supabase/migrations/down/`: one `.sql` file per up-migration reversing the schema change (DROP TABLE with CASCADE, safety check to prevent accidental production execution)
- [x] T120 [P] Create down-migration scripts for migrations 007-016 in `supabase/migrations/down/`: one `.sql` file per up-migration reversing RLS policies, functions, and triggers
- [x] T121 Create migration rollback runner script in `infra/scripts/rollback-migration.sh`: accepts migration version number, executes the corresponding down-migration via `psql`, updates migration tracking. Include safety prompts and `--dry-run` mode for production environments.
- [x] T122 Document rollback strategy in `docs/architecture.md`: explain forward-fix vs down-migration approach, when each is appropriate, include rollback runbook with step-by-step instructions

### pgTAP Test Setup

- [x] T037 Create pgTAP test file `supabase/tests/rls_profiles_test.sql`: test that end_user can SELECT own profile, cannot SELECT other profiles, cannot UPDATE account_status; admin can SELECT/UPDATE all profiles
- [x] T038 [P] Create pgTAP test file `supabase/tests/rls_rbac_test.sql`: test that end_user can SELECT roles/permissions, cannot INSERT/UPDATE/DELETE; super_admin can manage all
- [x] T039 [P] Create pgTAP test file `supabase/tests/rls_consent_test.sql`: test append-only behavior — user can INSERT and SELECT own, cannot UPDATE or DELETE
- [x] T040 [P] Create pgTAP test file `supabase/tests/authorize_function_test.sql`: test authorize() returns true for permitted role, false for unpermitted
- [x] T041 [P] Create pgTAP test file `supabase/tests/triggers_test.sql`: test on_auth_user_created creates profile + assigns end_user role, updated_at auto-updates

**Checkpoint**: Foundation ready — all tables (with soft-delete support), RLS policies (filtering deleted rows), functions, seeds, types, tokens, a11y baseline, and migration rollback scripts are in place. User story implementation can begin.

---

## Phase 3: User Story 1 — End User Signs Up and Logs In (Priority: P1) 🎯 MVP

**Goal**: A user can register with email/password or social OAuth, verify their email, and log into the application. Unverified users are blocked. Password strength enforced. Disposable emails rejected. Bot detection active.

**Independent Test**: A user can sign up with email, receive a verification email, verify, log in, and see a personalized screen. Social login creates an account automatically.

**Requirement Coverage**: FR-001, FR-002, FR-003, FR-004, FR-005, FR-006

### Tests for User Story 1

- [x] T042 [P] [US1] Create Vitest test file `apps/web/tests/unit/auth/signup.test.ts`: test signup form validation (password strength: min 8 chars, 1 upper, 1 lower, 1 digit, 1 special), email format validation, disposable email rejection message
- [x] T043 [P] [US1] Create Vitest test file `apps/web/tests/unit/auth/login.test.ts`: test login form submission, unverified account error display, MFA challenge flow
- [x] T044 [P] [US1] Create Vitest test file `apps/web/tests/unit/auth/password-reset.test.ts`: test password reset request form, new password form with strength validation
- [x] T045 [P] [US1] Create Playwright E2E test `apps/web/tests/e2e/auth-flow.spec.ts`: full signup → verify → login → see dashboard flow using Supabase local

### Implementation for User Story 1

- [x] T046 [US1] Create Supabase Edge Function `supabase/functions/validate-signup/index.ts`: validate password complexity (1 upper, 1 lower, 1 digit, 1 special — beyond Supabase default min length), check email against disposable domain list, return structured errors per FR-015 schema
- [x] T128 [US1] Add per-account login attempt tracking to `supabase/functions/validate-signup/index.ts` (or separate `supabase/functions/login-guard/index.ts`): track consecutive failed login attempts per email using Supabase table or Upstash Redis, require CAPTCHA after 5 consecutive failures (SC-005), reset counter on successful login. This is complementary to per-IP rate limiting (FR-014/T104).
- [x] T047 [US1] Create disposable email domain list in `supabase/functions/validate-signup/disposable-domains.json`: initial list of known disposable email providers (config-driven, updatable without code changes)
- [x] T048 [P] [US1] Create signup page in `apps/web/app/(public)/signup/page.tsx`: email/password form with client-side password strength indicator, CAPTCHA integration (Cloudflare Turnstile), social OAuth buttons (Google, Apple), calls validate-signup Edge Function then Supabase auth.signUp
- [x] T049 [P] [US1] Create login page in `apps/web/app/(public)/login/page.tsx`: email/password form with CAPTCHA, social OAuth buttons, "Forgot password?" link, error handling for unverified accounts (redirect to verification screen per clarification Q1)
- [x] T050 [P] [US1] Create email verification pending page in `apps/web/app/(public)/verify-email/page.tsx`: message explaining verification required, resend verification link button, countdown timer between resends
- [x] T051 [US1] Create auth callback handler in `apps/web/app/(public)/auth/callback/route.ts`: handle email verification link clicks, OAuth callback redirects, password reset token exchange
- [x] T052 [US1] Create password reset request page in `apps/web/app/(public)/reset-password/page.tsx`: email input form, generic success message (no account enumeration), CAPTCHA
- [x] T053 [US1] Create new password page in `apps/web/app/(public)/reset-password/update/page.tsx`: new password form with strength validation, calls auth.updateUser, redirects to login
- [x] T054 [US1] Create MFA setup page in `apps/web/app/(auth)/settings/mfa/page.tsx`: TOTP enrollment flow — QR code display, verification code input, recovery codes display (one-time view)
- [x] T055 [US1] Create MFA challenge page in `apps/web/app/(public)/mfa-challenge/page.tsx`: 6-digit TOTP code input, "Use recovery code" fallback link
- [x] T056 [US1] Create auth middleware in `apps/web/middleware.ts`: check session on (auth) routes, redirect unverified users to verify-email page, redirect unauthenticated users to login, pass through for (public) routes
- [x] T057 [US1] Create Supabase auth client helpers in `packages/api-client-ts/src/auth.ts`: typed wrappers for signUp (with captchaToken), signInWithPassword, signInWithOAuth (Google, Apple), signOut, resetPasswordForEmail, updateUser, mfa.enroll, mfa.challenge, mfa.verify
- [x] T058 [US1] Create auth context provider in `apps/web/lib/auth-provider.tsx`: React context wrapping Supabase onAuthStateChange, expose user/session/loading state, handle token refresh

**Checkpoint**: User Story 1 complete — signup, login, email verification, password reset, MFA, social OAuth, and bot protection are functional on web.

---

## Phase 4: User Story 6 — Secure Session Across Devices (Priority: P1)

**Goal**: A logged-in user can view all active sessions, see device/location info, and revoke any session. Admins can force-logout users. Tokens use 15-min access / 7-day refresh with rotation.

**Independent Test**: A user logs in on two browsers, views both sessions from either, revokes one, and confirms the other browser is immediately logged out.

**Requirement Coverage**: FR-007, FR-008

### Tests for User Story 6

- [x] T059 [P] [US6] Create Vitest test file `apps/web/tests/unit/sessions/session-list.test.ts`: test session list rendering (device, IP, last active, current session badge), revoke button behavior
- [x] T060 [P] [US6] Create Playwright E2E test `apps/web/tests/e2e/session-management.spec.ts`: login in two browser contexts, view sessions, revoke one, verify other context is logged out

### Implementation for User Story 6

- [x] T061 [US6] Create Supabase Edge Function `supabase/functions/manage-sessions/index.ts`: GET handler calls `get_my_sessions()` and enriches with `is_current` flag by comparing session IDs; DELETE handler revokes a specific session via Supabase Admin API (admin can revoke any user's session via authorize('sessions.manage'))
- [x] T062 [US6] Create session list page in `apps/web/app/(auth)/settings/sessions/page.tsx`: fetch sessions from manage-sessions Edge Function, display device info (parsed from user_agent), IP address, last active timestamp, "Current session" badge, revoke button per session, "Revoke all other sessions" button
- [x] T063 [US6] Create session service in `packages/api-client-ts/src/sessions.ts`: typed functions for listSessions(), revokeSession(sessionId), revokeAllOtherSessions()
- [x] T064 [US6] Add admin force-logout capability to `supabase/functions/manage-sessions/index.ts`: POST /manage-sessions/force-logout endpoint accepting user_id parameter, requires authorize('sessions.manage'), calls Supabase Admin API to terminate all sessions for target user

**Checkpoint**: User Story 6 complete — session viewing, individual revocation, and admin force-logout work independently.

---

## Phase 5: User Story 2 — Profile and Privacy Management (Priority: P1)

**Goal**: An authenticated user can edit their profile (display name, avatar, bio, timezone, language), manage privacy/consent settings, and see changes sync across devices.

**Independent Test**: A user edits all profile fields, uploads an avatar, toggles marketing consent, and sees changes reflected immediately.

**Requirement Coverage**: FR-009, FR-010

### Tests for User Story 2

- [x] T065 [P] [US2] Create Vitest test file `apps/web/tests/unit/profile/profile-form.test.ts`: test profile form validation (display name max 100, bio max 500, timezone selection, language selection), avatar upload preview
- [x] T066 [P] [US2] Create Vitest test file `apps/web/tests/unit/profile/consent-settings.test.ts`: test consent toggle rendering, consent history list
- [x] T067 [P] [US2] Create Playwright E2E test `apps/web/tests/e2e/profile-management.spec.ts`: edit profile fields, upload avatar, change consent, verify all changes persisted

### Implementation for User Story 2

- [x] T068 [P] [US2] Create Supabase Storage bucket configuration: create `avatars` bucket in `supabase/config.toml` with 5 MB file size limit, MIME type restriction (image/jpeg, image/png), RLS policy (users can upload/read their own folder `{user_id}/`)
- [x] T069 [P] [US2] Create profile page in `apps/web/app/(auth)/settings/profile/page.tsx`: edit form for display_name, bio, timezone (dropdown), preferred_language (dropdown), email (read-only with "Change email" flow triggering re-verification), phone display
- [x] T070 [US2] Create avatar upload component in `apps/web/components/avatar-upload.tsx`: drag-and-drop or file picker for JPEG/PNG, client-side preview, 5 MB limit validation, upload to Supabase Storage `avatars/{user_id}/avatar.{ext}`, update profile.avatar_url on success
- [x] T071 [US2] Create privacy settings page in `apps/web/app/(auth)/settings/privacy/page.tsx`: toggles for marketing_email, marketing_push, cookie_analytics, cookie_advertising; each toggle calls POST /consent_entries; consent history section showing timestamped changes from v_current_consents
- [x] T072 [US2] Create cookie consent banner component in `apps/web/components/cookie-consent.tsx`: GDPR-compliant banner for web — granular opt-in/opt-out for analytics and advertising cookies, "Accept all" / "Reject all" / "Customize" options, stores consent via consent_entries API, remembers choice via localStorage
- [x] T073 [US2] Create profile service in `packages/api-client-ts/src/profile.ts`: typed functions for getProfile(), updateProfile(data), uploadAvatar(file), getConsentHistory(), updateConsent(type, value)
- [x] T074 [US2] Create email change flow in `apps/web/app/(auth)/settings/profile/change-email/page.tsx`: new email input, calls Supabase auth.updateUser({ email }), shows "verification sent to new email" message

### GDPR Data Rights (FR-030, Constitution Art. VI)

- [x] T123 [US2] Create account deletion Edge Function in `supabase/functions/delete-account/index.ts`: soft-delete profile (set deleted_at, scrub PII fields per PII Registry in data-model.md), revoke all sessions via Admin API, return confirmation. Requires user to re-authenticate before deletion.
- [x] T124 [US2] Create account deletion confirmation page in `apps/web/app/(auth)/settings/delete-account/page.tsx`: warning message listing data to be deleted, password re-entry for confirmation, call delete-account Edge Function, redirect to goodbye page
- [x] T125 [US2] Create data export Edge Function in `supabase/functions/export-data/index.ts`: gather profile, consent_entries, user_roles for requesting user per PII Registry, return JSON bundle. Rate limit to 1 request per 24 hours.
- [x] T126 [US2] Add "Delete my account" and "Download my data" buttons to privacy settings page `apps/web/app/(auth)/settings/privacy/page.tsx`: "Delete" links to delete-account page, "Download" calls export-data Edge Function and downloads JSON file

**Checkpoint**: User Story 2 complete — profile editing, avatar upload, privacy consent, cookie banner, account deletion, and data export work independently.

---

## Phase 6: User Story 3 — Admin Assigns Roles and Permissions (Priority: P1)

**Goal**: An admin can assign roles (Super Admin, Admin, Moderator, End User) to users. Permissions are enforced at API (RLS) and UI (conditional rendering) levels. Restricted routes return 403.

**Independent Test**: An admin assigns "Moderator" to a user, and that user can only access moderator-level endpoints. Direct URL access to admin routes returns 403.

**Requirement Coverage**: FR-011, FR-012

### Tests for User Story 3

- [x] T075 [P] [US3] Create Vitest test file `apps/web/tests/unit/rbac/permission-guard.test.ts`: test PermissionGuard component shows/hides children based on user permissions, test usePermissions hook
- [x] T076 [P] [US3] Create Playwright E2E test `apps/web/tests/e2e/rbac-enforcement.spec.ts`: login as moderator, verify admin menu items hidden, navigate to admin URL directly, verify 403 page displayed

### Implementation for User Story 3

- [x] T077 [US3] Create permissions hook in `apps/web/lib/use-permissions.ts`: React hook that extracts user_role and user_permissions from Supabase session JWT claims, exposes hasPermission(key), hasRole(name), role, permissions
- [x] T078 [US3] Create PermissionGuard component in `apps/web/components/permission-guard.tsx`: wrapper component that renders children only if user has required permission(s), accepts `permission` or `role` prop
- [x] T079 [US3] Create 403 Forbidden page in `apps/web/app/(auth)/forbidden/page.tsx`: user-friendly access denied message with "Go back" and "Contact admin" options
- [x] T080 [US3] Update auth middleware in `apps/web/middleware.ts`: add route-level permission checks for admin routes — redirect to /forbidden if user lacks required permission
- [x] T081 [US3] Create admin user management page in `apps/admin/app/users/page.tsx`: list users with search/filter, display role badge, "Change role" dropdown calling PATCH /user_roles, bulk actions placeholder
- [x] T082 [US3] Create admin user detail page in `apps/admin/app/users/[id]/page.tsx`: profile info, current role, session list (via manage-sessions Edge Function), "Suspend" / "Force logout" / "Force password reset" actions
- [x] T083 [US3] Create role management service in `packages/api-client-ts/src/roles.ts`: typed functions for listRoles(), getUserRole(userId), assignRole(userId, roleId), listPermissions()
- [x] T084 [US3] Create navigation component in `apps/web/components/nav/sidebar.tsx`: navigation items filtered by PermissionGuard — admin items hidden for end users, moderator items visible for moderator+

**Checkpoint**: User Story 3 complete — role assignment, permission-guarded UI, 403 enforcement, and admin user management work independently.

---

## Phase 7: User Story 5 — Consistent Theming (Priority: P2)

**Goal**: A user selects light, dark, or system-default color scheme. Choice persists across sessions and syncs across devices. All screens render correctly in both modes. Design tokens propagate globally.

**Independent Test**: Toggle dark mode, verify all screens switch themes. Set "system default", change OS theme, verify app follows.

**Requirement Coverage**: FR-024, FR-025

### Tests for User Story 5

- [x] T085 [P] [US5] Create Vitest test file `apps/web/tests/unit/theme/theme-provider.test.ts`: test ThemeProvider applies correct class to document, test useTheme hook returns current theme and toggle function
- [x] T086 [P] [US5] Create Playwright E2E test `apps/web/tests/e2e/theming.spec.ts`: toggle light/dark/system, verify CSS variables change, verify preference persists across page reloads

### Implementation for User Story 5

- [x] T087 [US5] Create theme provider in `apps/web/lib/theme-provider.tsx`: React context that reads user preference (from profile.preferred_theme or localStorage fallback), applies `data-theme="light|dark"` attribute to `<html>`, listens to `prefers-color-scheme` media query for system mode
- [x] T088 [US5] Create theme settings component in `apps/web/components/theme-selector.tsx`: three-option selector (Light, Dark, System Default), updates localStorage and optionally syncs to user profile
- [x] T089 [US5] Integrate generated CSS tokens into web app: import `tokens/generated/css/variables.css` in `apps/web/app/layout.tsx`, ensure all Tailwind classes use CSS custom property values from tokens
- [x] T090 [US5] Create theme settings page section in `apps/web/app/(auth)/settings/appearance/page.tsx`: theme selector component, preview of current theme

**Checkpoint**: User Story 5 complete — light/dark/system theming with design tokens works independently.

---

## Phase 8: User Story 4 — Developer Sets Up and Extends (Priority: P1)

**Goal**: A developer clones the repo, runs the doctor command, reaches a running app in 15 minutes, generates new modules via scaffolding CLI, and has CI validate changes.

**Independent Test**: Clone, run doctor, start app, generate a component, make a change, CI passes — all within 15 minutes.

**Requirement Coverage**: FR-020, FR-021, FR-022, FR-023, FR-026, FR-027

### Tests for User Story 4

- [x] T091 [P] [US4] Create integration test `apps/web/tests/integration/env-validation.test.ts`: test that missing env vars produce clear error messages naming each missing variable, test public vs secret categorization
- [x] T092 [P] [US4] Create integration test `infra/scripts/tests/doctor.test.sh`: test doctor command output format (Pass/Warn/Fail per check), test exit code on missing prerequisite

### Implementation for User Story 4

- [x] T093 [US4] Create doctor CLI script in `infra/scripts/doctor.sh`: check Node.js >= 20, pnpm >= 9, Git >= 2, Docker running, Supabase CLI installed, local Supabase status, `.env.local` exists, all required env vars present. Output Pass/Warn/Fail per check with suggested fixes. Exit 1 on any Fail.
- [x] T094 [US4] Create Plop.js scaffolding configuration in `tools/plop/plopfile.js`: register generators for `component` (React component + test file), `screen` (Next.js page + layout), `api-endpoint` (Supabase Edge Function), `data-model` (migration file + type update)
- [x] T095 [P] [US4] Create Plop template for component in `tools/plop/templates/component/`: `{{pascalCase name}}.tsx` (React component with props interface), `{{pascalCase name}}.test.tsx` (Vitest test skeleton), auto-update barrel export in parent directory
- [x] T096 [P] [US4] Create Plop template for screen in `tools/plop/templates/screen/`: `page.tsx` (Next.js page component), `layout.tsx` (optional layout), `loading.tsx` (loading state)
- [x] T097 [P] [US4] Create Plop template for Edge Function in `tools/plop/templates/api-endpoint/`: `index.ts` (Deno.serve skeleton with Supabase client, request validation, error handling)
- [x] T098 [US4] Add `generate` script to root `package.json`: `"generate": "plop --plopfile tools/plop/plopfile.js"` with interactive prompts
- [x] T099 [US4] Create GitHub Actions CI pipeline for deployment in `infra/github/workflows/deploy.yml`: lint → test → build → deploy staging → smoke test → manual approval → deploy production. Include Supabase migration execution via `supabase db push`.
- [x] T100 [US4] Add Vitest coverage configuration to `apps/web/vitest.config.ts`: enable V8 coverage provider, set threshold to 80% for statements/branches/functions/lines, configure coverage reporter (text, lcov)
- [x] T101 [US4] Add `npm run doctor` script to root `package.json`, add `postinstall` hook to run doctor automatically after `pnpm install`
- [x] T102 [US4] Create architecture overview document in `docs/architecture.md`: monorepo structure, module boundaries, data flow (client → Supabase → PostgreSQL), auth flow diagram, RBAC model, design token pipeline

**Checkpoint**: User Story 4 complete — developer can clone, doctor, run, generate, and have CI validate. All DX tooling functional.

---

## Phase 9: API Documentation & Contract Alignment

**Purpose**: OpenAPI documentation and API contract consistency

- [x] T129 Create cursor-based pagination helper in `packages/api-client-ts/src/pagination.ts`: generic `PaginatedResponse<T>` type with `{ data: T[], meta: { cursor: string | null, has_more: boolean, total_count: number } }`, `fetchPaginated()` wrapper for Edge Function endpoints that accept `?cursor=&limit=` params. PostgREST endpoints use Supabase's native range headers instead.
- [x] T130 Update Edge Functions (`manage-sessions`, `export-data`) to accept `?cursor=&limit=` query params and return paginated envelope format per FR-013. Add `Envelope` and `PaginatedMeta` schemas to `contracts/openapi.yaml`.
- [x] T103 Create Edge Function `supabase/functions/health/index.ts`: shallow mode (return 200 with version), deep mode (check database connectivity, auth service, storage, realtime). Return HealthCheck schema per contracts/openapi.yaml
- [x] T104 Create Edge Function `supabase/functions/rate-limiter/index.ts`: middleware Edge Function using Upstash Redis for per-user rate limiting (auth: 10/min, writes: 60/min, reads: 300/min). Return standard rate limit headers (X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, Retry-After on 429).
- [x] T105 Update `contracts/openapi.yaml` to reflect final implemented endpoints: verify all Edge Function paths, PostgREST table endpoints, auth endpoints match actual implementation. Add missing endpoints identified in api-contracts checklist (email verification confirmation, MFA recovery validation, admin force-logout, theme preference)
- [x] T106 Generate TypeScript API client from finalized OpenAPI spec: run `npx openapi-typescript contracts/openapi.yaml -o contracts/generated/typescript/api.ts`
- [x] T107 Create `contracts/scripts/generate-all.sh`: shell script running all API client generators (TypeScript initially, Swift/Kotlin/C# stubs for future phases)
- [x] T131 Deploy interactive API docs UI: add Scalar or Swagger UI serving `contracts/openapi.yaml` — either as a static page at `apps/web/app/(public)/api-docs/page.tsx` or a standalone HTML file in `docs/api/`. Include request/response examples and auth requirements per FR-016.

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Improvements spanning multiple user stories, security hardening, documentation

- [x] T108 [P] Create security headers middleware in `apps/web/middleware.ts`: add Content-Security-Policy, X-Frame-Options (DENY), X-Content-Type-Options (nosniff), Referrer-Policy (strict-origin-when-cross-origin), Permissions-Policy headers per FR-029
- [x] T109 [P] Create privacy policy page in `apps/web/app/(public)/privacy/page.tsx` and terms of service page in `apps/web/app/(public)/terms/page.tsx`: static content pages accessible from all screens per FR-030
- [x] T110 [P] Add structured logging to all Edge Functions: JSON format with correlation ID (from request header or generated), log levels (INFO, WARN, ERROR), PII redaction (mask email, phone, IP in logs) per Constitution Art. VIII
- [x] T127 Add observability CI check to `infra/github/workflows/shared-validation.yml`: grep all Edge Function source files for structured log output (JSON format with level and correlationId fields), fail build if any function lacks structured logging per Constitution Art. VIII
- [x] T111 Add error boundary component in `apps/web/components/error-boundary.tsx`: catch rendering errors in (auth) route group, display user-friendly error page, log error details
- [x] T112 Run quickstart.md validation: follow all 8 steps from scratch, verify 15-minute target, document any deviations or missing steps
- [x] T113 Run all checklists in `specs/001-b2c-foundation/checklists/`: address CRITICAL and HIGH items from feature-completeness.md, constitution-compliance.md, security-privacy.md, api-contracts.md, developer-experience.md
- [x] T114 Final CI validation: run full `shared-validation.yml` and `web.yml` workflows, verify all tests pass, coverage >= 80%, no linting errors, no security audit findings

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup (Phase 1) completion — **BLOCKS all user stories**
- **US1 Sign Up/Login (Phase 3)**: Depends on Foundational — first MVP increment
- **US6 Sessions (Phase 4)**: Depends on Foundational + US1 (needs auth to test sessions)
- **US2 Profile/Privacy (Phase 5)**: Depends on Foundational — can run parallel with US1 if needed, but recommended after US1
- **US3 RBAC Admin (Phase 6)**: Depends on Foundational + US1 (needs auth) — can run parallel with US2
- **US5 Theming (Phase 7)**: Depends on Foundational (design tokens) — can run parallel with any P1 story
- **US4 Developer DX (Phase 8)**: Depends on Foundational — can start anytime after foundation, but best after US1-US3 exist for realistic scaffolding
- **API Docs (Phase 9)**: Depends on US1, US6 (all Edge Functions implemented)
- **Polish (Phase 10)**: Depends on all user stories being complete

### User Story Dependencies

```
Foundational ──┬──→ US1 (Auth) ──→ US6 (Sessions)
               │
               ├──→ US2 (Profile) ──────────────────→ Polish
               │
               ├──→ US3 (RBAC) ─────────────────────→ Polish
               │
               ├──→ US5 (Theming) ──────────────────→ Polish
               │
               └──→ US4 (DX) ──────────────────────→ Polish
```

### Within Each User Story

1. Tests MUST be written and FAIL before implementation (Article IV)
2. Edge Functions / backend before frontend pages
3. Services / hooks before UI components
4. Core flow before edge cases
5. Story complete before moving to next priority

### Parallel Opportunities

- **Phase 1**: T003, T004, T005, T006 can run in parallel (different directories)
- **Phase 1**: T010, T011 can run in parallel (different files)
- **Phase 2**: T018–T022 RLS migrations can run in parallel (different tables)
- **Phase 2**: T033–T036 token pipeline can run parallel with database work
- **Phase 2**: T037–T041 pgTAP tests can run in parallel
- **Phase 3+**: After foundational, US2/US3/US5/US4 can proceed in parallel with US1 (if staffed)
- **Within stories**: All [P] tasks within a story can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all tests for US1 together:
Task: "Create signup test in apps/web/tests/unit/auth/signup.test.ts"
Task: "Create login test in apps/web/tests/unit/auth/login.test.ts"
Task: "Create password-reset test in apps/web/tests/unit/auth/password-reset.test.ts"
Task: "Create E2E auth flow test in apps/web/tests/e2e/auth-flow.spec.ts"

# Then launch parallel implementation:
Task: "Create signup page in apps/web/app/(public)/signup/page.tsx"
Task: "Create login page in apps/web/app/(public)/login/page.tsx"
Task: "Create verify-email page in apps/web/app/(public)/verify-email/page.tsx"
Task: "Create reset-password page in apps/web/app/(public)/reset-password/page.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1 (Sign Up / Log In)
4. **STOP and VALIDATE**: Test auth flow end-to-end independently
5. Deploy to Supabase staging if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 (Auth) → Test → Deploy (MVP!)
3. Add US6 (Sessions) → Test → Deploy
4. Add US2 (Profile) → Test → Deploy
5. Add US3 (RBAC) → Test → Deploy
6. Add US5 (Theming) → Test → Deploy
7. Add US4 (DX) → Test → Deploy
8. Polish + API Docs → Final validation

### Parallel Team Strategy

With multiple developers after Foundational complete:
- Developer A: US1 → US6 (auth + sessions chain)
- Developer B: US2 + US3 (profile + RBAC)
- Developer C: US5 + US4 (theming + DX)

---

## Notes

- [P] tasks = different files, no shared state dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently testable after foundational phase
- Tests MUST fail before implementing (Article IV — Red → Green → Refactor)
- Commit after each task or logical group
- Mobile/desktop platform implementation follows the same structure but is deferred to a separate task generation pass once web MVP is validated
