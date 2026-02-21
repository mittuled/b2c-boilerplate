# API Contracts Checklist: B2C Boilerplate — Phase 1: Foundation

**Purpose**: Validate that the OpenAPI contract is complete, consistent with the spec, and covers all functional requirements for all platforms.
**Created**: 2026-02-21
**Feature**: [spec.md](../spec.md) | [contracts/openapi.yaml](../contracts/openapi.yaml) | [data-model.md](../data-model.md)

## Requirement-to-Endpoint Traceability

- [ ] CHK001 - Does every functional requirement (FR-001 through FR-031) have at least one corresponding endpoint in the OpenAPI contract? [Traceability, Spec §FR-001–FR-031 vs contracts/openapi.yaml]
- [ ] CHK002 - Are FR-020 through FR-023 (CI/CD) and FR-026/FR-027 (DX) correctly excluded from the API contract as they are infrastructure requirements, not API endpoints? [Consistency]
- [ ] CHK003 - Are FR-024/FR-025 (Theming) represented — the contract has `/design_tokens` but is the theme preference persistence endpoint defined (user sets light/dark/system)? [Gap, Spec §FR-024 vs contracts/openapi.yaml]
- [ ] CHK004 - Is FR-028 (encryption) represented in the contract via TLS enforcement documentation (servers section)? [Completeness, contracts/openapi.yaml §servers]

## Response Envelope Consistency

- [ ] CHK005 - Is the response envelope ({ data, meta, errors }) consistently applied across ALL endpoints in the contract? [Consistency, Spec §FR-013]
- [ ] CHK006 - Does the Supabase PostgREST auto-generated API use the same envelope format, or does it return raw arrays? If different, is the adaptation strategy documented? [Conflict, Spec §FR-013 vs plan.md]
- [ ] CHK007 - Are Edge Function responses (manage-sessions, health) using the envelope format while PostgREST responses (profiles, roles, tokens) use array format? Is this inconsistency addressed? [Consistency, contracts/openapi.yaml]
- [ ] CHK008 - Is the cursor-based pagination specified in the `meta` object — cursor field name, has_more flag, total count? [Gap, Spec §FR-013 vs contracts/openapi.yaml]

## Error Schema Quality

- [ ] CHK009 - Does the error schema ({ code, message, field?, details? }) match across all error responses in the contract? [Consistency, Spec §FR-015 vs contracts/openapi.yaml §ApiError]
- [ ] CHK010 - Are error codes enumerated — is there a canonical list of error codes (VALIDATION_ERROR, UNAUTHORIZED, FORBIDDEN, RATE_LIMITED, etc.)? [Gap, contracts/openapi.yaml]
- [ ] CHK011 - Are field-level validation errors specified for each endpoint that accepts input (signup, profile update, consent update, role assignment)? [Coverage, Spec §FR-015]
- [ ] CHK012 - Is the "no stack traces in production" requirement verifiable from the contract — is there a production vs development error detail difference? [Clarity, Spec §FR-015]

## Authentication & Authorization in Contract

- [ ] CHK013 - Are all non-public endpoints marked with the correct security scheme (bearerAuth, apiKey, or both)? [Completeness, contracts/openapi.yaml]
- [ ] CHK014 - Are public endpoints (health, signup, login, password reset, OAuth authorize) explicitly marked with `security: []`? [Completeness, contracts/openapi.yaml]
- [ ] CHK015 - Are permission requirements documented per endpoint — which permission string is needed (e.g., `users.manage` for role assignment)? [Gap, contracts/openapi.yaml]
- [ ] CHK016 - Is the MFA flow (enroll → challenge → verify) fully documented with all three endpoints and their request/response schemas? [Completeness, contracts/openapi.yaml §Auth/MFA]

## Rate Limiting in Contract

- [ ] CHK017 - Are rate limit headers (X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, Retry-After) documented in all response schemas, not just the 429 response? [Gap, Spec §FR-014 vs contracts/openapi.yaml]
- [ ] CHK018 - Are the three rate limit tiers (auth: 10/min, writes: 60/min, reads: 300/min) documented per endpoint — which tier applies to each endpoint? [Clarity, contracts/openapi.yaml]
- [ ] CHK019 - Is per-IP rate limiting documented in addition to per-user? [Gap, Spec §FR-014 vs contracts/openapi.yaml]

## Data Model Alignment

- [ ] CHK020 - Do the Profile schema fields in the contract match the `profiles` table columns in the data model? [Consistency, contracts/openapi.yaml §Profile vs data-model.md]
- [ ] CHK021 - Does the ConsentEntry schema match the `consent_entries` table? [Consistency, contracts/openapi.yaml vs data-model.md]
- [ ] CHK022 - Does the Session schema include all fields from the `get_my_sessions()` function output? [Consistency, contracts/openapi.yaml §Session vs data-model.md]
- [ ] CHK023 - Does the RoleDefinition schema include the `hierarchy_level` field from the data model? [Consistency, contracts/openapi.yaml vs data-model.md]
- [ ] CHK024 - Are nullable fields consistently marked between the contract and data model (e.g., avatar_url, bio, phone)? [Consistency]

## Platform Compatibility

- [ ] CHK025 - Is the contract compatible with all four API client generators (openapi-typescript, swift-openapi-generator, openapi-generator kotlin, openapi-generator csharp)? [Completeness, plan.md §API Client Generation]
- [ ] CHK026 - Are file upload endpoints (avatar) documented with platform-appropriate content types and multipart handling? [Clarity, contracts/openapi.yaml §uploadAvatar]
- [ ] CHK027 - Are the Supabase-specific query parameters (select, eq, order) documented for PostgREST endpoints? [Gap, contracts/openapi.yaml]
- [ ] CHK028 - Is the OAuth redirect flow documented for each platform (web redirect URL, iOS universal link, Android app link, desktop custom URI)? [Gap, contracts/openapi.yaml §oauthAuthorize]

## Missing Endpoints

- [ ] CHK029 - Is the email verification confirmation endpoint specified (user clicks link, system marks email verified)? [Gap, contracts/openapi.yaml]
- [ ] CHK030 - Is the MFA recovery code validation endpoint specified? [Gap, contracts/openapi.yaml vs data-model.md §validate_recovery_code]
- [ ] CHK031 - Is the admin user management endpoint specified (list users, search, filter, suspend, force-reset)? [Gap, Spec §FR-011]
- [ ] CHK032 - Is the user's own theme preference update endpoint specified (set light/dark/system)? [Gap, Spec §FR-024]
- [ ] CHK033 - Is the admin force-logout endpoint specified (terminate all sessions for a specific user)? [Gap, Spec §FR-008]
- [ ] CHK034 - Are the RBAC permission listing endpoints specified (list all permissions, get permissions for current user)? [Gap, Spec §FR-012]

## Notes

- PostgREST auto-generates endpoints for all public tables, so many CRUD operations work without explicit contract definition. However, the contract should document the INTENDED API surface, not just what PostgREST exposes.
- Edge Function endpoints (manage-sessions, health, validate-signup, rate-limiter) are NOT auto-generated and must be explicitly documented.
- The contract serves as the source for code generation across 4 platforms — gaps here propagate to all clients.
