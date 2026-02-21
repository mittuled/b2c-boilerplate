# Constitution Compliance Checklist: B2C Boilerplate — Phase 1: Foundation

**Purpose**: Validate that the spec and plan artifacts align with all 10 constitutional principles and 6 architectural constraints before implementation begins.
**Created**: 2026-02-21
**Feature**: [spec.md](../spec.md) | [plan.md](../plan.md) | [constitution.md](../../.specify/memory/constitution.md)

## Article I — Spec-Driven Implementation

- [ ] CHK001 - Do all 31 functional requirements trace to a numbered requirement ID from the master spec (AUTH-*, SESS-*, etc.)? [Traceability, Spec §FR-001–FR-031]
- [ ] CHK002 - Does the plan's project structure include only directories/modules that trace to spec requirements — are there any unauthorized scope additions? [Completeness, plan.md §Project Structure]
- [ ] CHK003 - Are the Supabase Edge Functions (validate-signup, manage-sessions, rate-limiter) each traceable to specific FRs? [Traceability, plan.md]
- [ ] CHK004 - Does the data model contain only entities required by spec requirements — are `design_tokens` table requirements documented in the spec or only implied? [Consistency, data-model.md vs Spec §FR-024/FR-025]

## Article II — Library-First Architecture

- [ ] CHK005 - Are iOS SPM packages (AuthKit, NetworkKit, DesignKit, SessionKit, ProfileKit) each a standalone library with its own tests and zero app-level dependencies? [Completeness, plan.md §Project Structure]
- [ ] CHK006 - Are Android Gradle modules (core/auth, core/network, core/design, core/session, core/profile) each independently testable? [Completeness, plan.md]
- [ ] CHK007 - Are Windows .NET class libraries (AuthLib, NetworkLib, DesignLib, ProfileLib) structured as separate projects with independent test assemblies? [Completeness, plan.md]
- [ ] CHK008 - Are web packages (api-client-ts, env-validation, ui-web) each publishable as standalone npm packages? [Completeness, plan.md]
- [ ] CHK009 - Is the app shell described as "thin orchestration" — does the plan define what belongs in the shell vs. libraries? [Clarity, plan.md]
- [ ] CHK010 - Are cross-module dependencies documented — do any library packages depend on other library packages, and if so, is the dependency graph acyclic? [Consistency, plan.md vs AC-6]

## Article III — Platform Parity with Explicit Divergence

- [ ] CHK011 - Are all platform divergences explicitly documented in the spec (auth storage, push delivery, billing, offline, deep linking, updates, biometric, architecture)? [Completeness, Spec §Phasing Strategy table]
- [ ] CHK012 - Does the OpenAPI contract serve all platforms equally — are there platform-specific endpoints that should be documented? [Consistency, contracts/openapi.yaml]
- [ ] CHK013 - Are generated API client contracts available for all four languages (TypeScript, Swift, Kotlin, C#)? [Completeness, plan.md §contracts/]
- [ ] CHK014 - Are design tokens generated for all four platforms (CSS, Swift, Kotlin, C#)? [Completeness, plan.md §tokens/]
- [ ] CHK015 - Is the Supabase client SDK availability documented for all platforms (JS for web, Swift SDK, Kotlin SDK, C# SDK)? [Gap, plan.md]

## Article IV — Test-First Imperative

- [ ] CHK016 - Are test tools specified for all platforms (Vitest, XCTest, JUnit, xUnit, pgTAP)? [Completeness, plan.md §Technical Context]
- [ ] CHK017 - Is the 80% coverage target enforceable per-platform in CI, or only as a global average? [Clarity, Spec §FR-020 vs plan.md]
- [ ] CHK018 - Are RLS policy tests specified — does the plan include pgTAP tests for every RLS policy in the data model? [Coverage, plan.md vs data-model.md]
- [ ] CHK019 - Is the "tests fail first (Red phase)" requirement practically achievable when using Supabase's auto-generated API? Tests against PostgREST may pass immediately. [Ambiguity, Constitution Art. IV vs plan.md]
- [ ] CHK020 - Are integration test environments specified — does each platform test against a real Supabase instance, and how is test data isolation handled? [Gap, plan.md]

## Article V — Accessibility and Internationalization

- [ ] CHK021 - Is the Phase 1 a11y scope explicitly defined — the plan defers full a11y to Phase 3, but does Phase 1 include any a11y requirements (contrast ratios in design tokens, semantic markup)? [Clarity, plan.md §Constitution Check]
- [ ] CHK022 - Are design tokens validated against WCAG 2.1 AA contrast ratios (4.5:1 for text, 3:1 for large text)? [Gap, Spec §FR-025 vs Constitution Art. V]
- [ ] CHK023 - Is the locale string externalization pattern defined for Phase 1, even if full i18n is Phase 3? [Gap, plan.md]
- [ ] CHK024 - Are form labels, error messages, and ARIA attributes mentioned in any Phase 1 UI requirements? [Gap, Spec §FR-009/FR-012]

## Article VI — Privacy by Default, Compliance by Design

- [ ] CHK025 - Are GDPR lawful basis annotations present for each data entity in the data model (profiles, consent_entries, user_roles, sessions)? [Gap, data-model.md vs Constitution Art. VI]
- [ ] CHK026 - Are PII fields annotated in the data model — which fields in `profiles` are PII and should be included in data export/deletion flows? [Gap, data-model.md]
- [ ] CHK027 - Is the data minimization principle applied — does the `profiles` table collect only necessary fields, or are any fields speculative? [Completeness, data-model.md]
- [ ] CHK028 - Is the consent logging mechanism sufficient for GDPR audit — does it capture IP, user agent, and timestamp as required by regulators? [Completeness, data-model.md §consent_entries]
- [ ] CHK029 - Is account deletion (right to erasure) specified in Phase 1? The master spec includes PROF-02 but Phase 1 does not list it. Is this an intentional deferral? [Gap, Spec vs master spec §PROF-02]
- [ ] CHK030 - Is data export (right to access / GDPR portability) specified in Phase 1? The master spec includes PROF-03 but Phase 1 does not list it. [Gap, Spec vs master spec §PROF-03]

## Article VII — Simplicity and Anti-Abstraction

- [ ] CHK031 - Is the Complexity Tracking table in the plan adequate — does it justify all deviations from the 3-project-per-module limit? [Completeness, plan.md §Complexity Tracking]
- [ ] CHK032 - Are the shared `contracts/` and `tokens/` packages justified as necessary rather than speculative? [Consistency, plan.md]
- [ ] CHK033 - Does the plan introduce any abstraction layers not required by the spec (e.g., custom API gateway, middleware framework, event bus)? [Consistency, plan.md §Project Structure]
- [ ] CHK034 - Are Edge Functions kept minimal — do `validate-signup`, `manage-sessions`, and `rate-limiter` each do one thing, or are they becoming micro-services? [Clarity, plan.md]
- [ ] CHK035 - Is the Plop.js scaffolding CLI justified by spec requirement FR-026, or is it over-engineering for Phase 1? [Consistency, plan.md vs Spec §FR-026]

## Article VIII — Observability from Day One

- [ ] CHK036 - Are structured logging requirements specified for Phase 1 Edge Functions (JSON format, correlation ID, log levels, PII redaction)? [Gap, Spec §FR-028/FR-029 vs plan.md]
- [ ] CHK037 - Is the health check endpoint (/functions/v1/health) specified with both shallow and deep modes in the OpenAPI contract? [Completeness, contracts/openapi.yaml]
- [ ] CHK038 - Is the plan's "PARTIAL" status for observability justified — are the deferred items (distributed tracing, synthetic monitoring) clearly Phase 3? [Clarity, plan.md §Constitution Check]

## Article IX — Developer Experience Is a Product Feature

- [ ] CHK039 - Does the quickstart.md achieve the 15-minute setup target — are all 8 steps realistically completable in 15 minutes including Docker image pulls? [Measurability, quickstart.md vs Spec §SC-001]
- [ ] CHK040 - Are test account passwords in quickstart.md compliant with the password strength rules (min 8 chars, 1 upper, 1 lower, 1 digit, 1 special)? [Consistency, quickstart.md vs Spec §FR-001]
- [ ] CHK041 - Is the architecture overview document referenced in quickstart.md actually planned as a deliverable? [Gap, quickstart.md vs Spec §FR-027]

## Article X — Priority-Driven Phasing

- [ ] CHK042 - Are all 31 Phase 1 FRs confirmed as P0 requirements from the master spec? [Traceability, Spec §Phasing Strategy vs master spec]
- [ ] CHK043 - Are any P1 or P2 requirements accidentally included in Phase 1? [Consistency, Spec]
- [ ] CHK044 - Are Phase 1 dependencies on Phase 2-4 explicitly documented — does Phase 1 establish interfaces that later phases consume? [Completeness, Spec §Phasing Strategy]

## Architectural Constraints (AC-1 through AC-6)

- [ ] CHK045 - AC-1: Is the admin panel structured as a separate Next.js app with its own build pipeline? [Completeness, plan.md §apps/admin]
- [ ] CHK046 - AC-2: Are desktop targets planned as native applications (Swift macOS, C# Windows) — not Electron/Tauri? [Consistency, plan.md §apps/desktop-*]
- [ ] CHK047 - AC-5: Are database migrations versioned and reversible? The research notes Supabase has no native rollback — is a workaround defined? [Conflict, plan.md vs research.md §1.5]
- [ ] CHK048 - AC-5: Is raw SQL prohibited in application code? Does the plan rely on PostgREST/Supabase client exclusively for CRUD? [Consistency, plan.md vs data-model.md]
- [ ] CHK049 - AC-6: Are cross-module dependencies flowing through the API layer — do any library packages directly import from other domain modules? [Gap, plan.md §Project Structure]

## Notes

- Items referencing "master spec" refer to `B2C_Boilerplate_Initial_Spec.md` at repo root.
- Constitution articles are referenced by Roman numeral (Art. I–X) and constraints by AC-1 through AC-6.
- The plan's Constitution Check table (plan.md) should be updated to reflect any items found here.
