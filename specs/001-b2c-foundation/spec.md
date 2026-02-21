# Feature Specification: B2C Boilerplate — Phase 1: Foundation

**Feature Branch**: `001-b2c-foundation`
**Created**: 2026-02-21
**Status**: Draft
**Input**: B2C_Boilerplate_Initial_Spec.md — Phase 1 requirements (AUTH, SESS, PROF, RBAC, API, DATA, CICD, THEME, DX, SEC)
**Phase Scope**: Foundation layer — the minimum viable infrastructure that all subsequent phases depend on

## Phasing Strategy

This spec is **Phase 1 of 4** derived from the master B2C Boilerplate Feature Spec. Each phase is a self-contained speckit feature with its own plan and tasks.

| Phase | Branch | Scope | Requirement IDs |
| ----- | ------ | ----- | --------------- |
| **1 — Foundation** | `001-b2c-foundation` | Auth, sessions, profile, RBAC, API, data layer, CI/CD, theming, DX, security | AUTH-01–06, AUTH-08–09, SESS-01–02, PROF-01, PROF-04, RBAC-01, RBAC-03, API-01–04, DATA-01, DATA-03–04, CICD-01–03, CICD-05, THEME-01–02, DX-01, DX-05, SEC-01–03, SEC-05 |
| 2 — Monetization & Engagement | `002-b2c-monetization` | Billing, notifications, email, feature flags, admin dashboard, SEO, support | BILL-01–04, BILL-07, NOTIF-01–02, NOTIF-04–06, FF-01, FF-04, ADMIN-01–05, SEO-01–05, PLAT-07 |
| 3 — Scale & Polish | `003-b2c-scale-polish` | i18n, a11y, offline, analytics, observability, platform delivery, RLS | I18N-01–04, A11Y-01–04, OFF-01–02, ANLY-01–02, OBS-01–04, PLAT-01–06, DATA-02, DATA-05, NOTIF-07, DX-02–03 |
| 4 — Advanced | `004-b2c-advanced` | Passkeys, A/B testing, CMS extras, trials, advanced offline, webhooks, white-labeling | AUTH-03–04, AUTH-07, RBAC-02, SESS-03, BILL-05–06, NOTIF-03, FF-02–03, CMS-04–05, OFF-03–04, API-05–06, SEC-04, THEME-03, I18N-05, A11Y-05, OBS-02, OBS-05, ANLY-03, DX-04, DX-06, CICD-04, PLAT-03, PLAT-05–06, SEO-03 |

## User Scenarios & Testing *(mandatory)*

### User Story 1 — End User Signs Up and Logs In (Priority: P1)

A new user downloads the app (or visits the website) and creates an account using their email address or a social provider (Google, Apple). They verify their email, set up their profile, and are authenticated into the app with a secure session. On subsequent visits, they log in with their credentials and are returned to a personalized experience.

**Why this priority**: Authentication is the entry point to every other feature. Nothing else works without it.

**Independent Test**: A user can sign up with email, receive a verification email, verify their account, log in, see their profile, and log out — delivering a complete identity flow.

**Acceptance Scenarios**:

1. **Given** a new visitor, **When** they submit a valid email and password that meets strength rules, **Then** an account is created and a verification email arrives within 60 seconds.
2. **Given** a new visitor, **When** they choose "Sign in with Google" or "Sign in with Apple", **Then** an account is auto-created and they are logged in immediately.
3. **Given** a registered user with a verified email, **When** they enter correct credentials, **Then** they receive a secure session token and see their personalized home screen.
4. **Given** a user who has forgotten their password, **When** they request a reset, **Then** they receive a reset email, and after setting a new password all previous sessions are invalidated.
5. **Given** a user attempting to register with a disposable email domain, **When** they submit the form, **Then** registration is rejected with a clear error message.
6. **Given** a bot submitting rapid signup requests, **When** risk score is elevated, **Then** a CAPTCHA challenge is presented before the request proceeds.

---

### User Story 2 — End User Manages Profile and Privacy (Priority: P1)

An authenticated user navigates to their profile settings where they can update their display name, avatar, bio, timezone, and preferred language. They can also manage their privacy and consent preferences (marketing opt-in/out, cookie preferences on web). All changes take effect immediately and sync across devices.

**Why this priority**: Profile and privacy management are core identity features required by GDPR and fundamental to user trust.

**Independent Test**: A logged-in user can edit all profile fields, upload an avatar, toggle marketing consent, and see changes reflected immediately across sessions.

**Acceptance Scenarios**:

1. **Given** a logged-in user, **When** they update their display name and bio, **Then** the changes are saved and visible on all devices.
2. **Given** a logged-in user, **When** they upload a JPEG or PNG avatar under 5 MB, **Then** the image is auto-cropped to square and stored in multiple sizes.
3. **Given** a logged-in user, **When** they attempt to change their email, **Then** a re-verification email is sent and the change only takes effect after verification.
4. **Given** a logged-in user on web, **When** they adjust cookie/tracking preferences, **Then** the change is logged with a timestamp for compliance audit.
5. **Given** a logged-in user, **When** they opt out of marketing communications, **Then** they stop receiving marketing emails while transactional emails continue.

---

### User Story 3 — Admin Assigns Roles and Permissions (Priority: P1)

An administrator logs into the system and assigns roles (Super Admin, Admin, Moderator, End User) to team members. Each role carries a defined set of permissions that control what actions can be performed and what UI elements are visible. Permissions are enforced at both the API and UI levels — a user who manually navigates to a restricted URL receives a clear access-denied message.

**Why this priority**: RBAC is foundational to the admin dashboard (Phase 2) and all multi-user features.

**Independent Test**: An admin can assign a role to a user, and that user's API access and visible UI elements change accordingly.

**Acceptance Scenarios**:

1. **Given** a Super Admin, **When** they assign the "Moderator" role to a user, **Then** the user can only access moderator-level API endpoints and UI elements.
2. **Given** a user with "End User" role, **When** they attempt to access an admin-only route via URL, **Then** they receive a 403 response with a user-friendly message.
3. **Given** a user with limited permissions, **When** they view the navigation, **Then** restricted menu items and buttons are hidden.

---

### User Story 4 — Developer Sets Up and Extends the Boilerplate (Priority: P1)

A developer clones the boilerplate repository and follows the quick-start guide to get a running application within 15 minutes. They use the scaffolding CLI to generate a new module (screen, component, API endpoint, or data model) and the generated code follows all project conventions automatically. The CI/CD pipeline validates their changes with automated tests, linting, and type checks before merge.

**Why this priority**: Developer experience determines adoption. A boilerplate that is hard to set up or extend will not be used.

**Independent Test**: A developer can clone, run the doctor command, start the app, generate a new module via CLI, make a change, and have CI validate it — all within 15 minutes.

**Acceptance Scenarios**:

1. **Given** a developer with the correct runtime installed, **When** they run the "doctor" CLI command, **Then** it validates runtime versions, required environment variables, and database connectivity.
2. **Given** a developer following the README, **When** they complete setup, **Then** they have a running application within 15 minutes.
3. **Given** a developer, **When** they run the scaffolding CLI to generate a new component, **Then** files are created following project naming conventions, and barrel exports are updated automatically.
4. **Given** a developer submitting a pull request, **When** CI runs, **Then** linting, type checking, unit tests (>= 80% coverage), and security linting all pass before merge is allowed.
5. **Given** a deployment, **When** the pipeline runs, **Then** it executes lint → test → build → deploy (staging) → smoke test → deploy (production), with database migrations included.

---

### User Story 5 — End User Experiences Consistent Theming (Priority: P2)

A user selects their preferred color scheme (light, dark, or system default) from app settings. The choice persists across sessions and syncs to all their devices. All screens, components, and media render correctly in both modes. The design token system ensures visual consistency across the entire application.

**Why this priority**: Theming is a user-facing quality-of-life feature, but not blocking for core functionality. It establishes the visual foundation other phases build on.

**Independent Test**: A user can toggle between light/dark mode and see all screens render correctly in both themes.

**Acceptance Scenarios**:

1. **Given** a user, **When** they select "Dark" theme, **Then** all screens switch to the dark color scheme immediately.
2. **Given** a user who selected "System default", **When** the OS switches from light to dark mode, **Then** the app follows automatically.
3. **Given** the design token system, **When** a token value is changed (e.g., primary color), **Then** the change propagates globally without code changes.
4. **Given** a user who set dark mode on their phone, **When** they log in on web, **Then** their dark mode preference is already applied.

---

### User Story 6 — End User Has a Secure Session Across Devices (Priority: P1)

A user logs in and receives a secure session. They can view all their active sessions (device, location, last active time) and revoke any session they don't recognize. The system uses short-lived access tokens with rotating refresh tokens. Tokens are stored using platform-appropriate secure storage.

**Why this priority**: Session management is a security-critical requirement tied directly to authentication.

**Independent Test**: A user can log in on multiple devices, view all sessions, revoke one, and confirm that device is immediately logged out.

**Acceptance Scenarios**:

1. **Given** a logged-in user, **When** they view their sessions, **Then** they see a list of all active sessions with device, location, and last active time.
2. **Given** a user with multiple sessions, **When** they revoke a specific session, **Then** that device is immediately logged out.
3. **Given** a refresh token, **When** it is used, **Then** the old token is invalidated and a new one is issued (rotation).
4. **Given** an admin, **When** they force-logout a user, **Then** all sessions for that user are terminated immediately.

---

### Edge Cases

- What happens when a user tries to register with an email that already exists? System returns a generic "check your email" response (no account enumeration).
- What happens when a verification link is clicked after it expires? User sees a clear expiry message with an option to resend.
- What happens when a social provider is down during OAuth login? User sees a friendly error with fallback to email/password login.
- What happens when an avatar upload exceeds 5 MB? Upload is rejected with a clear file-size error before consuming bandwidth.
- What happens when the password reset link is used twice? Second click shows an expiry/already-used message.
- What happens when a user's role is changed while they are logged in? Active session reflects new permissions on the next API call; UI refreshes on next navigation.
- What happens when environment variables are missing at build time? Build fails immediately with a clear error naming each missing variable.
- What happens when database migrations fail during deployment? Deployment rolls back to the previous version automatically.
- What happens when multiple users attempt to register with the same email simultaneously? Only one registration succeeds; the other receives a retry prompt.

## Requirements *(mandatory)*

### Functional Requirements

**Authentication & Registration**

- **FR-001** (AUTH-01): System MUST support email/password registration with email verification delivered within 60 seconds, configurable password strength rules, and modern password hashing. Unverified users MUST be completely blocked from accessing the application — they are redirected to a verification screen on every login attempt until their email is verified. Default password rules: minimum 8 characters, at least 1 uppercase letter, 1 lowercase letter, 1 digit, and 1 special character.
- **FR-002** (AUTH-02): System MUST support social OAuth login with at minimum Google and Apple, with auto-account creation and the ability to link/unlink providers from profile settings.
- **FR-003** (AUTH-05): System MUST support TOTP-based multi-factor authentication with recovery codes, with admin-enforceable MFA per role.
- **FR-004** (AUTH-06): System MUST provide a password reset flow via email with configurable TTL, session invalidation on password change, and email notification of the change.
- **FR-005** (AUTH-08): System MUST block registration from known disposable email domains using a config-driven, updatable list.
- **FR-006** (AUTH-09): System MUST protect signup, login, and password reset endpoints with configurable bot detection (CAPTCHA or invisible challenge) that only activates when risk is elevated.

**Session Management**

- **FR-007** (SESS-01): System MUST implement token-based sessions with short-lived access tokens (default: 15 minutes) and rotating long-lived refresh tokens (default: 7 days), stored in platform-appropriate secure storage.
- **FR-008** (SESS-02): System MUST allow users to view all active sessions (device, location, last active) and revoke any individual session. Admin MUST be able to force-logout all sessions for a user.

**User Profile & Privacy**

- **FR-009** (PROF-01): System MUST provide an editable user profile with fields: display name, avatar, email, phone, bio, timezone, and preferred language. Avatar uploads MUST support JPEG/PNG up to 5 MB with auto-crop and multi-size storage.
- **FR-010** (PROF-04): System MUST allow users to manage privacy and consent settings (marketing opt-in/out, cookie/tracking preferences on web) with timestamped audit logging of all consent changes.

**Role-Based Access Control**

- **FR-011** (RBAC-01): System MUST provide predefined roles (Super Admin, Admin, Moderator, End User) with configurable permission sets enforced at both API and UI levels.
- **FR-012** (RBAC-03): System MUST show/hide UI elements based on user permissions and return a 403 with user-friendly message when restricted routes are accessed directly.

**Backend API**

- **FR-013** (API-01): System MUST provide a versioned RESTful API (URL-prefixed, e.g. `/v1/`) following REST conventions. Custom endpoints (Edge Functions) MUST use a consistent response envelope (`{ data, meta, errors }`) with cursor-based pagination (`meta: { cursor, has_more, total_count }`). Direct PostgREST table endpoints use Supabase's native array format with range headers for pagination. Both formats are documented in the OpenAPI contract.
- **FR-014** (API-02): System MUST require valid access tokens on all non-public endpoints and enforce tiered rate limiting per user AND per IP, with standard rate-limit headers and configurable thresholds. Defaults: Auth endpoints 10 req/min, Write endpoints 60 req/min, Read endpoints 300 req/min per user.
- **FR-015** (API-03): System MUST validate all inputs server-side, return 422 with field-level errors for validation failures, and use a consistent error schema ({ code, message, field?, details? }). Production errors MUST NOT expose stack traces.
- **FR-016** (API-04): System MUST maintain an OpenAPI 3.1 specification as the single source of truth for the API contract, auto-generate typed clients from it for all target platforms, and serve an interactive documentation UI with request/response examples and auth requirements.

**Data Layer**

- **FR-017** (DATA-01): System MUST manage schema changes via versioned, sequential migration files with automatic execution during deployment, rollback support, and migration state tracking.
- **FR-018** (DATA-03): System MUST provide compile-time type-safe data access with database schema as the single source of truth. Raw SQL MUST be prohibited for standard CRUD operations.
- **FR-019** (DATA-04): System MUST include an idempotent seed script that populates realistic test data covering all roles and subscription states.

**CI/CD**

- **FR-020** (CICD-01): System MUST run automated unit tests (>= 80% coverage target), integration tests for critical paths, and end-to-end tests for key user flows on every pull request, blocking merge on failure.
- **FR-021** (CICD-02): System MUST enforce code style via linting, type checking, and security linting (secrets detection, dependency audit) as both pre-commit hooks and CI checks.
- **FR-022** (CICD-03): System MUST support a deployment pipeline (lint → test → build → deploy staging → smoke test → deploy production) with environment-specific config, rollback capability, and migration execution.
- **FR-023** (CICD-05): System MUST validate all environment variables at build time against a schema, failing the build with clear error messages for missing or malformed values. Public and secret variables MUST be explicitly categorized.

**Theming**

- **FR-024** (THEME-01): System MUST support light, dark, and system-default color schemes with user preference that persists across sessions and syncs across devices.
- **FR-025** (THEME-02): System MUST define all visual properties (colors, typography, spacing, radii) as semantic design tokens that resolve to platform-appropriate values and propagate globally when changed.

**Developer Experience**

- **FR-026** (DX-01): System MUST provide a scaffolding CLI that generates screens, components, API endpoints, and data models from customizable templates following project conventions.
- **FR-027** (DX-05): System MUST include a quick-start guide enabling a new developer to reach a running app within 15 minutes, an architecture overview, inline documentation on public interfaces, and a "doctor" CLI command for environment validation.

**Security**

- **FR-028** (SEC-01): System MUST encrypt all data in transit via TLS 1.2+, encrypt sensitive data at rest with AES-256 or equivalent, and manage encryption keys via a secrets manager.
- **FR-029** (SEC-02): System MUST protect against OWASP Top 10 vulnerabilities (SQL injection, XSS, CSRF, command injection), set security headers, and run dependency scanning in CI.
- **FR-030** (SEC-03): System MUST implement GDPR compliance baseline: cookie consent banner (web), right to access (data export in JSON format), right to erasure (account soft-deletion with PII scrubbing), accessible privacy policy and terms of service, and documented lawful basis for each data category. Data processing records are deferred to Phase 3.
- **FR-031** (SEC-05): System MUST ensure no secrets in source code or config files, inject secrets via environment or vault at runtime, and support key rotation with least-privilege service accounts.

### Key Entities

- **User**: Central identity entity — ID, email, phone, display name, avatar URL, bio, timezone, preferred language, role, account status (Unverified → Active → Suspended | Deactivated), MFA enabled flag, created/updated timestamps.
- **Session**: Active authentication session — ID, user ID, device info, IP address, location, last active timestamp, refresh token hash, created timestamp.
- **Role**: Named permission group — ID, name, description, set of permission strings.
- **Permission**: Atomic access control unit — string identifier (e.g., `users:read`, `content:publish`).
- **Design Token**: Semantic visual property — key, light-mode value, dark-mode value, category (color, typography, spacing, radius).
- **Migration**: Schema version record — version number, name, applied timestamp, checksum.
- **Audit Entry (Consent)**: Privacy consent log — user ID, consent type, value, timestamp.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A new developer can go from cloning the repository to a running application in 15 minutes or less following the quick-start guide.
- **SC-002**: Users can complete the full signup-to-logged-in flow (registration, email verification, first login) in under 2 minutes.
- **SC-003**: Automated test coverage on all Phase 1 modules is >= 80% from day one.
- **SC-004**: Zero OWASP Top 10 vulnerabilities detected in automated security scans.
- **SC-005**: All authentication endpoints resist brute-force attacks via two mechanisms: (1) per-account lockout — after 5 consecutive failed login attempts for the same email, CAPTCHA is required for subsequent attempts; (2) per-IP rate limiting — auth endpoints are limited to 10 req/min per IP (FR-014). These are complementary, not redundant.
- **SC-006**: Social login (Google, Apple) works seamlessly on all four target platforms with platform-appropriate flows.
- **SC-007**: Role-based access control prevents unauthorized access — 100% of restricted API endpoints return 403 for unpermitted roles.
- **SC-008**: Light/dark mode switch applies to all screens with zero visual regressions.
- **SC-009**: Password reset flow completes end-to-end (request → email → new password → session invalidation) in under 60 seconds.
- **SC-010**: CI pipeline (lint → test → build → deploy) completes in under 10 minutes for a standard pull request.
- **SC-011**: Deployment rollback restores the previous application version (Edge Functions + web app) within 5 minutes of triggering. Database migration rollback uses companion down-migration scripts executed manually with safety confirmation.
- **SC-012**: Developer satisfaction score for boilerplate DX is >= 4.0/5.0 in initial team surveys.

## Clarifications

### Session 2026-02-21

- Q: What should happen when a user registers but has not yet verified their email and attempts to log in? → A: Unverified users are completely blocked — forced to a verification screen on every login attempt until email is verified.
- Q: What are the default password strength rules that ship with the boilerplate? → A: Minimum 8 characters, at least 1 uppercase, 1 lowercase, 1 digit, 1 special character.
- Q: What are the default token lifetimes for access and refresh tokens? → A: Access token: 15 minutes, Refresh token: 7 days.
- Q: What are the default rate limiting thresholds per tier? → A: Auth: 10 req/min, Writes: 60 req/min, Reads: 300 req/min (per user).
- Q: What are the possible user account lifecycle states? → A: Four states: Unverified, Active, Suspended (admin-imposed), Deactivated (user-initiated).

### Assumptions

- Platform-specific secure storage APIs (Keychain, Keystore, DPAPI) are available on all target platforms.
- At least Google and Apple OAuth credentials are configured before testing social login flows.
- A transactional email provider is available for verification and password reset emails.
- A relational database supporting migrations and row-level operations is available in all environments.
- A secrets management solution (vault or environment injection) is configured for non-development environments.
- The spec remains technology-agnostic; success criteria are measured at the functional level, not the implementation level.
