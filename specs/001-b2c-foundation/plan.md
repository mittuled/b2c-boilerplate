# Implementation Plan: B2C Boilerplate — Phase 1: Foundation

**Branch**: `001-b2c-foundation` | **Date**: 2026-02-21 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-b2c-foundation/spec.md`

## Summary

Phase 1 establishes the foundational infrastructure for a multi-platform B2C SaaS boilerplate: authentication (email/password, social OAuth, MFA), session management with token rotation, user profile and privacy controls, RBAC with four predefined roles, a versioned RESTful API, a type-safe data layer with migrations, CI/CD pipelines for all platforms, light/dark theming via design tokens, and developer experience tooling (scaffolding CLI, doctor command, quick-start guide).

The backend uses **Supabase** (PostgreSQL + Auth + Edge Functions + Storage + Realtime). Clients are native per platform: **Next.js** (web), **Swift/SwiftUI** (iOS + macOS), **Kotlin/Jetpack Compose** (Android), **C#/.NET** (Windows). The monorepo uses **Turborepo** for JS orchestration and platform-native build systems for mobile/desktop. Shared artifacts (API contracts, design tokens, locale files) are generated from single sources and committed for DX.

## Technical Context

**Languages/Versions**:
- Backend: TypeScript (Deno runtime via Supabase Edge Functions) + SQL (PostgreSQL 15+)
- Web: TypeScript 5.x (Next.js 15+ App Router)
- iOS/macOS: Swift 6.x (SwiftUI, Xcode 16+)
- Android: Kotlin 2.x (Jetpack Compose, API 26+)
- Windows Desktop: C# 12 (.NET 8+, WinUI 3)

**Primary Dependencies**:
- Backend: Supabase (Auth, PostgREST, Edge Functions, Storage, Realtime), Zod (validation)
- Web: Next.js 15, React 19, Tailwind CSS v4, Supabase JS SDK
- iOS/macOS: Swift OpenAPI Generator, SwiftUI, Keychain Services
- Android: Ktor (HTTP), Jetpack Compose, EncryptedSharedPreferences
- Windows: System.Net.Http, Windows Credential Manager, WinUI 3
- Shared: Style Dictionary v4 (tokens), OpenAPI 3.1 (contracts)

**Storage**: PostgreSQL 15+ via Supabase (with RLS, migrations, type generation). Supabase Storage for file uploads (avatars).

**Testing**:
- Web: Vitest (unit) + Playwright (E2E)
- iOS/macOS: XCTest + ViewInspector
- Android: JUnit 5 + Espresso + Compose testing
- Windows: xUnit + WinAppDriver
- Database: pgTAP (RLS policy testing)
- Integration: Real Supabase instance (not mocked)

**Target Platforms**: iOS 17+, Android 8+ (API 26), Web (modern browsers), macOS 14+, Windows 10+

**Project Type**: Multi-platform (monorepo with per-platform apps + shared contracts/tokens)

**Performance Goals**: Auth endpoints respond < 500ms, real-time notifications delivered < 500ms, CI pipeline < 10 minutes, developer setup < 15 minutes

**Constraints**: Rate limiting (Auth: 10 req/min, Writes: 60 req/min, Reads: 300 req/min per user), access tokens expire in 15 minutes, refresh tokens in 7 days, avatar uploads max 5 MB

**Scale/Scope**: 10 modules, 31 functional requirements, 7 key entities, 4+ platform apps + admin panel, ~30 screens per platform

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Article | Gate | Status | Notes |
|---------|------|--------|-------|
| I. Spec-Driven | Every implementation traces to a numbered requirement | PASS | All 31 FRs map to AUTH-*, SESS-*, PROF-*, RBAC-*, API-*, DATA-*, CICD-*, THEME-*, DX-*, SEC-* |
| II. Library-First | Modules are standalone libraries before app integration | PASS | SPM packages (iOS/macOS), Gradle modules (Android), .NET class libraries (Windows), npm packages (web) |
| III. Platform Parity | All platforms are first-class; divergences documented | PASS | Platform capability matrix in spec (auth storage, push, billing, offline, deep linking) |
| IV. Test-First | Tests written before implementation; >= 80% coverage | PASS | Testing strategy defined per platform; pgTAP for RLS; coverage target enforced in CI |
| V. A11y & i18n | WCAG 2.1 AA, screen readers, RTL, locales | PASS (BASELINE) | Phase 1 establishes a11y/i18n baseline: semantic HTML, ARIA on forms, contrast-validated tokens, externalized strings. Full audit (RTL, screen-reader, complete locales) is Phase 3. |
| VI. Privacy by Default | GDPR baseline, consent, encryption, data minimization | PASS | FR-010 (consent), FR-028 (encryption), FR-030 (GDPR), FR-031 (secrets mgmt) |
| VII. Simplicity | <= 3 projects per module; no speculative abstractions | PASS | Each module: library + tests + one integration. Supabase reduces custom backend code. See Complexity Tracking for multi-app justification. |
| VIII. Observability | Structured logging, health checks, error tracking | PASS (BASELINE) | Phase 1 delivers baseline: structured JSON logging with correlation IDs in all Edge Functions, health endpoint (shallow + deep), error classification. Distributed tracing and synthetic monitoring are Phase 3. |
| IX. DX | Scaffolding CLI, doctor command, quick-start, docs | PASS | FR-026 (CLI), FR-027 (quick-start, doctor). Plop.js for code generation. |
| X. Priority-Driven | P0 items form critical path; P1/P2 do not delay | PASS | All Phase 1 FRs are P0. Phase 2-4 items are excluded from this plan. |

**Baseline items justification**: Article V (a11y/i18n) and Article VIII (observability) follow the constitution's phased maturity model. Phase 1 delivers the infrastructure baseline (semantic HTML, ARIA on forms, contrast-validated tokens, externalized strings, structured JSON logging, health endpoints). Phase 3 delivers full maturity (RTL, complete locales, distributed tracing, synthetic monitoring). This is consistent with Article X (priority-driven phasing).

## Project Structure

### Documentation (this feature)

```text
specs/001-b2c-foundation/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── openapi.yaml     # OpenAPI 3.1 specification
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
turbo.json                              # Turborepo pipeline config
package.json                            # Root workspace config (pnpm)
pnpm-workspace.yaml

supabase/
├── migrations/                         # Sequential SQL migration files
├── seed.sql                            # Idempotent seed data
├── config.toml                         # Supabase project config
└── functions/                          # Edge Functions
    ├── validate-signup/                # Disposable email blocking, custom validation
    ├── manage-sessions/                # Session listing, selective revocation
    ├── rate-limiter/                   # Custom rate limiting for data APIs
    ├── delete-account/                 # GDPR right to erasure (soft-delete + PII scrub)
    └── export-data/                    # GDPR right to access (JSON data export)

contracts/
├── openapi.yaml                        # Single source of truth for API
├── generated/
│   ├── typescript/                     # openapi-typescript output
│   ├── swift/                          # swift-openapi-generator output
│   ├── kotlin/                         # openapi-generator kotlin output
│   └── csharp/                         # openapi-generator csharp output
└── scripts/
    └── generate-all.sh                 # Runs all generators

tokens/
├── src/
│   ├── base/                           # Primitive tokens (colors, sizes)
│   ├── semantic/                       # Semantic tokens (color.primary, text.body)
│   └── component/                      # Component-level tokens
├── config/
│   ├── web.config.js                   # Style Dictionary → CSS variables
│   ├── ios.config.js                   # Style Dictionary → Swift enum
│   ├── android.config.js               # Style Dictionary → Kotlin object
│   └── windows.config.js              # Style Dictionary → C# static class
└── generated/
    ├── css/
    ├── swift/
    ├── kotlin/
    └── csharp/

packages/
├── api-client-ts/                      # TypeScript API client wrapper
├── env-validation/                     # Zod-based env var schema validation
├── ui-web/                             # Shared web components (React)
└── eslint-config/                      # Shared Biome/lint config

apps/
├── web/                                # Next.js 15 App Router — consumer app
│   ├── app/
│   │   ├── (public)/                   # SSR/SSG: landing, pricing
│   │   ├── (auth)/                     # SPA: dashboard, profile, settings
│   │   └── api/                        # API routes (if needed beyond Supabase)
│   ├── components/
│   ├── lib/
│   └── tests/
├── admin/                              # Next.js 15 — admin panel (separate deploy)
│   ├── app/
│   │   ├── dashboard/
│   │   ├── users/
│   │   └── settings/
│   └── tests/
├── ios/                                # Xcode project (Swift/SwiftUI)
│   ├── Packages/
│   │   ├── AuthKit/                    # Auth library (SPM)
│   │   ├── NetworkKit/                 # API client (wraps generated Swift)
│   │   ├── DesignKit/                  # Design tokens + shared components
│   │   ├── SessionKit/                 # Session management
│   │   └── ProfileKit/                 # User profile management
│   └── App/                            # Thin app shell
├── android/                            # Gradle project (Kotlin/Compose)
│   ├── core/
│   │   ├── auth/                       # Auth module
│   │   ├── network/                    # API client (wraps generated Kotlin)
│   │   ├── design/                     # Design tokens + shared composables
│   │   ├── session/                    # Session management
│   │   └── profile/                    # User profile management
│   └── app/                            # Thin app shell
├── desktop-macos/                      # Xcode project (Swift/SwiftUI)
│   ├── Packages/                       # Shares SPM packages with iOS where possible
│   └── App/
└── desktop-windows/                    # .NET solution (C#/WinUI 3)
    ├── src/
    │   ├── AuthLib/
    │   ├── NetworkLib/
    │   ├── DesignLib/
    │   └── ProfileLib/
    └── App/

infra/
├── github/
│   └── workflows/
│       ├── shared-validation.yml       # Contracts, tokens, lint, types — every PR
│       ├── web.yml                     # Web app CI (path-filtered)
│       ├── admin.yml                   # Admin panel CI (path-filtered)
│       ├── ios.yml                     # iOS CI (path-filtered)
│       ├── android.yml                 # Android CI (path-filtered)
│       ├── desktop-macos.yml           # macOS CI (path-filtered)
│       ├── desktop-windows.yml         # Windows CI (path-filtered)
│       ├── contracts.yml               # Regenerate clients on openapi.yaml change
│       └── tokens.yml                  # Regenerate tokens on source change
└── scripts/
    ├── doctor.sh                       # Environment validation CLI
    └── seed.sh                         # Database seeding wrapper

tools/
├── plop/                               # Code generator templates
│   ├── plopfile.js
│   └── templates/
│       ├── component/
│       ├── screen/
│       ├── api-endpoint/
│       └── data-model/
└── cli/                                # Developer CLI entry point
    └── index.ts

docs/
├── architecture.md                     # Architecture overview
├── adr/                                # Architecture Decision Records
└── onboarding/
    └── quickstart.md                   # Symlink to specs/001/quickstart.md
```

**Structure Decision**: Multi-platform monorepo with Turborepo orchestrating JavaScript packages/apps and platform-native build systems (Xcode, Gradle, MSBuild) for mobile/desktop. Shared artifacts (contracts, tokens, locale files) are generated from single sources and committed to the repo. The admin panel is a separate Next.js app per constitution AC-1.

**Implementation Phasing**: Phase 1 implementation focuses on **web + backend (Supabase) first** to establish the MVP. The full project structure above is the target architecture; mobile/desktop app directories (ios/, android/, desktop-macos/, desktop-windows/) are scaffolded but implementation is deferred to a follow-up task generation pass after the web MVP is validated. This avoids blocking the critical path on platform-specific toolchain setup.

## Complexity Tracking

> Justification for exceeding 3 projects per module

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| 6 app targets (web, admin, iOS, Android, macOS, Windows) | Constitution AC-1 mandates separate admin panel. Spec requires 4 consumer platforms (iOS, Android, Web, Desktop). Constitution AC-2 mandates native desktop (Swift macOS, C# Windows). | A single cross-platform framework (e.g., React Native, Flutter) would violate AC-2 (native desktop requirement) and reduce platform parity (Article III). Each app is a thin shell over shared libraries. |
| Shared `contracts/` and `tokens/` packages | API type safety across 4 languages and visual consistency across 4 platforms require generated shared artifacts | Manually maintaining types per platform would diverge immediately and violate Article III (platform parity). Generation from single source is the simplest approach that maintains correctness. |
