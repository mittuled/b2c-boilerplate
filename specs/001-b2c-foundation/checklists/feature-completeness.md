# Feature Completeness Checklist: B2C Boilerplate — Phase 1: Foundation

**Purpose**: Validate that all Phase 1 functional requirements are fully specified, unambiguous, and have measurable acceptance criteria before implementation begins.
**Created**: 2026-02-21
**Feature**: [spec.md](../spec.md) | [plan.md](../plan.md) | [data-model.md](../data-model.md)

## Requirement Completeness — Authentication (FR-001 through FR-006)

- [ ] CHK001 - Are password strength rules fully enumerable — is the special character set defined (which characters qualify)? [Clarity, Spec §FR-001]
- [ ] CHK002 - Is the email verification link TTL specified (expiry duration before the link becomes invalid)? [Gap, Spec §FR-001]
- [ ] CHK003 - Is the maximum number of verification email resends defined (rate limiting on resend requests)? [Gap, Spec §FR-001]
- [ ] CHK004 - Are the specific social OAuth scopes documented for Google and Apple (email, profile, etc.)? [Gap, Spec §FR-002]
- [ ] CHK005 - Is the account linking/unlinking behavior specified when the same email exists across providers (e.g., user signs up with email, then tries Google with same email)? [Edge Case, Spec §FR-002]
- [ ] CHK006 - Are recovery code count (10) and format (length, character set) specified in the spec, or only in the data model? [Consistency, Spec §FR-003 vs data-model.md]
- [ ] CHK007 - Is the MFA enrollment flow defined — specifically what happens if a user abandons enrollment midway? [Gap, Spec §FR-003]
- [ ] CHK008 - Is the password reset link TTL specified in the spec? The master spec says "default 1 hour" but Phase 1 spec says "configurable TTL" without a default. [Ambiguity, Spec §FR-004]
- [ ] CHK009 - Are the criteria for "elevated risk score" defined for CAPTCHA activation (number of failed attempts, velocity, IP reputation)? [Clarity, Spec §FR-006]
- [ ] CHK010 - Is the disposable email domain list update mechanism specified (how often, who maintains, admin UI vs config file)? [Gap, Spec §FR-005]

## Requirement Completeness — Session Management (FR-007, FR-008)

- [ ] CHK011 - Are session metadata fields fully enumerated — the spec says "device, location, last active" but the data model only stores user_agent and IP (no device name or geolocation)? [Conflict, Spec §FR-008 vs data-model.md]
- [ ] CHK012 - Is the refresh token reuse grace interval specified (the data model research mentions 10 seconds but the spec does not)? [Gap, Spec §FR-007]
- [ ] CHK013 - Is the maximum concurrent sessions per user defined (unlimited by default, but is this configurable by admin as the master spec states)? [Gap, Spec §FR-008]
- [ ] CHK014 - Is the behavior specified when a refresh token is used after expiry (7-day window) — silent re-auth prompt vs forced login? [Edge Case, Spec §FR-007]
- [ ] CHK015 - Does the spec define how "force-logout" propagates to native mobile apps that may not have an active connection? [Gap, Spec §FR-008]

## Requirement Completeness — Profile & Privacy (FR-009, FR-010)

- [ ] CHK016 - Are the avatar auto-crop dimensions and stored sizes specified (thumbnail, medium, large pixel values)? [Clarity, Spec §FR-009]
- [ ] CHK017 - Is the phone change OTP flow specified in Phase 1 or deferred? The master spec mentions OTP confirmation but Phase 1 spec does not include phone OTP (AUTH-04 is P1). [Ambiguity, Spec §FR-009]
- [ ] CHK018 - Are the consent types exhaustively enumerated? Spec mentions "marketing opt-in/out, cookie/tracking preferences" but data model lists four specific types. Are these aligned? [Consistency, Spec §FR-010 vs data-model.md]
- [ ] CHK019 - Is the consent audit log retention period defined (how long are consent_entries kept)? [Gap, Spec §FR-010]
- [ ] CHK020 - Are the requirements for email change re-verification specified — does the old email remain active during the verification window? [Edge Case, Spec §FR-009]

## Requirement Completeness — RBAC (FR-011, FR-012)

- [ ] CHK021 - Is the complete permission set for each predefined role documented in the spec, or only in the data model seed data? [Gap, Spec §FR-011 vs data-model.md]
- [ ] CHK022 - Is the delay between role change and permission enforcement specified (up to 15 min access token TTL)? Is this acceptable for security-sensitive role revocations? [Clarity, Spec §FR-011]
- [ ] CHK023 - Are the specific UI elements that should be shown/hidden per role listed, or is it left to implementation? [Clarity, Spec §FR-012]
- [ ] CHK024 - Is the first user bootstrapping flow defined — how does the initial Super Admin account get created? [Gap, Spec §FR-011]

## Requirement Completeness — API Layer (FR-013 through FR-016)

- [ ] CHK025 - Is the API versioning strategy specified — URL path prefix (/v1/) vs header? The spec says "URL path prefix or header" but the OpenAPI contract uses path prefix. Is this decision documented? [Ambiguity, Spec §FR-013 vs contracts/openapi.yaml]
- [ ] CHK026 - Are cursor-based pagination parameters specified (cursor field name, page size defaults, max page size)? [Gap, Spec §FR-013]
- [ ] CHK027 - Is the consistent response envelope ({ data, meta, errors }) documented for Supabase PostgREST responses, which use a different format (array responses, not envelope)? [Conflict, Spec §FR-013 vs plan.md]
- [ ] CHK028 - Are rate limit thresholds specified per-IP in addition to per-user? The clarification defines per-user rates but not per-IP rates. [Gap, Spec §FR-014]
- [ ] CHK029 - Is the OpenAPI auto-generation strategy aligned with Supabase PostgREST's auto-generated spec? Are Edge Function endpoints documented separately? [Consistency, Spec §FR-016 vs plan.md]
- [ ] CHK030 - Are the specific validation rules for each input field documented (email format, phone format, display name constraints)? [Clarity, Spec §FR-015]

## Requirement Completeness — Data Layer (FR-017 through FR-019)

- [ ] CHK031 - Is the migration rollback strategy specified given Supabase CLI does not support native down migrations? [Conflict, Spec §FR-017 vs research.md §8.2]
- [ ] CHK032 - Is "compile-time type-safe data access" achievable with Supabase's PostgREST client? Are there gaps where raw SQL is needed? [Consistency, Spec §FR-018 vs plan.md]
- [ ] CHK033 - Are seed data idempotency guarantees specified — what happens if seed runs against an already-seeded database? [Clarity, Spec §FR-019]
- [ ] CHK034 - Is the seed script's handling of auth.users documented — Supabase auth users cannot be seeded via SQL INSERT; they require the admin API? [Gap, data-model.md vs plan.md]

## Requirement Completeness — CI/CD (FR-020 through FR-023)

- [ ] CHK035 - Are integration test and E2E test scopes defined — which "critical paths" and "key user flows" specifically? [Clarity, Spec §FR-020]
- [ ] CHK036 - Is the pre-commit hook tool specified (Husky) in the spec or only in the plan? Should spec remain tool-agnostic? [Consistency, Spec §FR-021 vs plan.md]
- [ ] CHK037 - Is the rollback mechanism defined — "deploy previous version with one command" but is this automated or manual? What is the rollback trigger? [Clarity, Spec §FR-022]
- [ ] CHK038 - Are the environment variable schemas for dev/staging/prod differences documented? [Gap, Spec §FR-023]

## Requirement Completeness — Theming (FR-024, FR-025)

- [ ] CHK039 - Is the theme preference sync mechanism specified — via user profile field (preferred_language exists, but no preferred_theme)? [Gap, Spec §FR-024 vs data-model.md]
- [ ] CHK040 - Are the minimum required design token categories and token keys enumerated (how many colors, typography scales, spacing values)? [Gap, Spec §FR-025]
- [ ] CHK041 - Is the "system default" detection mechanism specified per platform (CSS prefers-color-scheme, UITraitCollection, Configuration.uiMode)? [Clarity, Spec §FR-024]

## Requirement Completeness — DX & Security (FR-026 through FR-031)

- [ ] CHK042 - Are the scaffolding CLI template types listed — the spec says "screens, components, API endpoints, and data models" but are platform-specific generators (iOS, Android) in scope for Phase 1? [Clarity, Spec §FR-026 vs plan.md]
- [ ] CHK043 - Is the "doctor" CLI command's specific checks enumerated in the spec or only in quickstart.md? [Consistency, Spec §FR-027 vs quickstart.md]
- [ ] CHK044 - Are GDPR data categories and their lawful basis documented for each entity in the data model? [Gap, Spec §FR-030 vs data-model.md]
- [ ] CHK045 - Is the secrets management approach specified — the plan says "Supabase handles secrets" but the spec requires a "secrets manager" and "vault". Are these reconciled? [Ambiguity, Spec §FR-031 vs plan.md]
- [ ] CHK046 - Are the specific OWASP Top 10 protections mapped to concrete requirements or left as a general directive? [Clarity, Spec §FR-029]

## Scenario Coverage

- [ ] CHK047 - Are requirements defined for the account recovery flow when a user loses both password AND MFA device AND recovery codes? [Edge Case, Gap]
- [ ] CHK048 - Are requirements specified for what happens when a suspended user's access token has not yet expired (15-min window)? [Edge Case, Gap]
- [ ] CHK049 - Are requirements defined for database migration failure during deployment — the spec says "rollback automatically" but Supabase has no native down migrations? [Exception Flow, Spec §Edge Cases vs research.md]
- [ ] CHK050 - Are requirements specified for handling Supabase service outages (Auth down, PostgREST down, Realtime down) — graceful degradation? [Gap, Exception Flow]
- [ ] CHK051 - Are requirements defined for the first-time setup flow (empty database, no admin user, no roles seeded)? [Gap, Recovery Flow]

## Notes

- Items marked with [Conflict] indicate misalignment between spec and plan artifacts that must be resolved before implementation.
- Items marked with [Gap] indicate missing requirements that should be added to the spec or documented as intentional deferral.
- Items marked with [Ambiguity] indicate vague language that needs quantification or clarification.
- Cross-references between spec.md, plan.md, data-model.md, research.md, and contracts/openapi.yaml are intentional per Q2 selection.
