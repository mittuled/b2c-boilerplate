# Research: B2C Boilerplate — Phase 1: Foundation

**Branch**: `001-b2c-foundation` | **Date**: 2026-02-21

## 1. Backend Platform: Supabase

**Decision**: Supabase (PostgreSQL + Auth + Edge Functions + Storage + Realtime)

**Rationale**: Supabase covers ~75% of Phase 1 requirements natively. Auth (email/password, social OAuth, TOTP MFA, CAPTCHA), PostgreSQL with RLS, real-time via Broadcast (<500ms), file storage with image transforms, type generation, and migrations are all built-in. The remaining ~25% is achievable via Edge Functions, Auth Hooks, and security definer functions — no external API server required for Phase 1.

**Alternatives considered**:
- **Firebase**: Stronger mobile SDK ecosystem but vendor lock-in to Google, limited SQL capabilities, no RLS equivalent, NoSQL only
- **AWS Amplify**: More services available but significantly more complex, steeper learning curve, higher ops overhead
- **Custom Backend (NestJS/Express)**: Maximum flexibility but 3-5x more development time for equivalent functionality
- **Clerk + PlanetScale + Upstash**: Best-of-breed stack but multiple vendors, more integration work, higher total cost

### 1.1 Authentication Coverage

| Feature | Supabase Coverage | Implementation Notes |
|---------|------------------|---------------------|
| Email/password registration | Native | `supabase.auth.signUp()`, email confirmation configurable |
| Email verification | Native | Auto-sends verification email, configurable templates |
| Password strength rules | Partial | Min length native; uppercase/digit/special char requires client-side + Edge Function validation |
| Social OAuth (Google, Apple) | Native | `supabase.auth.signInWithOAuth()`, 20+ providers supported |
| TOTP MFA | Native | `supabase.auth.mfa.enroll/challenge/verify()`, AAL tracking |
| Recovery codes | Custom | Not native — generate and store hashed codes in a custom table during MFA enrollment |
| Password reset | Native | `supabase.auth.resetPasswordForEmail()`, configurable templates |
| Disposable email blocking | Custom | Use `email_guard` Trusted Language Extension or Auth Hook (`before_sign_up`) |
| CAPTCHA/bot protection | Native | hCaptcha and Cloudflare Turnstile supported; pass `captchaToken` in auth calls |

### 1.2 Session Management Coverage

| Feature | Supabase Coverage | Implementation Notes |
|---------|------------------|---------------------|
| Short-lived access tokens (15 min) | Native | Configure JWT expiry to 900s in Dashboard |
| Rotating refresh tokens (7 days) | Native | Rotation enabled by default; configure reuse interval (10s grace) |
| Platform-appropriate storage | Client-side | Keychain (iOS/macOS), Keystore (Android), httpOnly cookies (web), DPAPI (Windows) — implemented per platform |
| View active sessions | Custom | `security definer` function querying `auth.sessions` table |
| Revoke individual session | Partial | `supabase.auth.signOut({ scope: 'others' | 'global' })` but no single-session revoke by ID — requires custom Edge Function |
| Force-logout (admin) | Custom | Admin Edge Function calling Supabase Admin API to invalidate user sessions |

### 1.3 RBAC Implementation

Supabase does not provide built-in RBAC but supplies all primitives:

1. **Custom tables**: `user_roles` (user_id → role) and `role_permissions` (role → permission strings)
2. **Custom Access Token Hook**: SQL function that injects `user_role` into JWT claims on every token mint/refresh
3. **`authorize()` helper**: `security definer` function that checks `(auth.jwt()->>'user_role')` against `role_permissions`
4. **RLS policies**: Use `authorize('permission.string')` in policies for data-level enforcement

### 1.4 Rate Limiting

- **Auth endpoints**: Native rate limiting (configurable per endpoint type)
- **Data API (PostgREST)**: Not built-in — implement via Edge Functions + Upstash Redis (`@upstash/ratelimit` with sliding window)
- **Thresholds**: Auth: 10 req/min, Writes: 60 req/min, Reads: 300 req/min per user

### 1.5 Gaps Requiring Custom Implementation

| Gap | Solution | Effort |
|-----|----------|--------|
| Password complexity validation (uppercase, digit, special char) | Edge Function wrapping signup + client-side validation | Low |
| MFA recovery codes | Custom table + generation during enrollment | Low |
| Concurrent session viewing | `security definer` function on `auth.sessions` | Low |
| Single session revocation by ID | Edge Function using Admin API | Low |
| RBAC (roles + permissions) | Custom tables + Auth Hook + RLS authorize() | Medium |
| Rate limiting on data APIs | Edge Functions + Upstash Redis | Medium |
| API versioning | Database views or Edge Functions for versioned endpoints | Low |

---

## 2. Web Framework: Next.js 15 (App Router)

**Decision**: Next.js 15+ with App Router, React 19, TypeScript 5.x

**Rationale**: The spec requires SSR/SSG for public pages (SEO-05) and SPA for authenticated pages. Next.js App Router handles this hybrid natively: Server Components for public routes (landing, pricing, CMS), client components for authenticated app. Largest ecosystem for auth, forms, analytics. Turborepo integration for monorepo with admin panel.

**Alternatives considered**:
- **SvelteKit**: Smaller bundles (20-40%), excellent DX, but smaller ecosystem = more custom code for 22+ modules. Fewer developers available.
- **Nuxt 3**: Excellent SSR via Nitro, but locks into Vue ecosystem. Acquisition by Vercel creates governance uncertainty.
- **Remix (React Router v7)**: Web-standards-first, excellent forms, but less mature static generation. "Forms everywhere" adds friction for real-time features.

---

## 3. Monorepo Strategy: Turborepo + Native Build Systems

**Decision**: Single monorepo with Turborepo orchestrating JS/TS packages. Platform-native build systems (Xcode/SPM, Gradle, MSBuild) for mobile/desktop. Shared artifacts (contracts, tokens) generated and committed.

**Rationale**: Each platform uses its native, idiomatic build system (Article VII — Simplicity). Turborepo handles JS dependency graph and caching. Platforms share artifacts, not runtime code (Article II — Library-First, Article III — Platform Parity).

**Alternatives considered**:
- **Bazel**: Can manage polyglot monorepos but introduces substantial complexity. BUILD files, sandboxed execution, maintaining rules for 4 build systems violates Article VII.
- **Nx**: Strong for JS monorepos but less suited for non-JS platforms. Similar to Turborepo for our JS-only needs, but less lightweight.
- **Multi-repo**: Coordination overhead grows with shared contracts/tokens. Single repo makes atomic changes across platforms possible.

### Key Principle: Shared Artifacts, Not Shared Runtime

Platforms share:
1. **API contracts** — OpenAPI spec generates typed clients per platform
2. **Design tokens** — Style Dictionary generates platform-native token files
3. **Locale files** — JSON strings consumed by all platforms (Phase 3, but structure established now)

---

## 4. Cross-Platform Design Tokens: Style Dictionary v4

**Decision**: Style Dictionary v4 with W3C DTCG token format. Custom C# output format (~60 lines of JS).

**Rationale**: Single source JSON/JSONC tokens generate platform-native output: CSS custom properties (web), Swift enums (iOS/macOS), Kotlin objects (Android), C# static classes (Windows). Dark mode handled via `$extensions.mode.dark` on each token.

**Platform outputs**:
- **Web**: CSS custom properties under `:root` and `[data-theme="dark"]`
- **iOS/macOS**: `UIColor.dynamic(light:dark:)` or SwiftUI Color with asset catalogs
- **Android**: Kotlin object + `values/` and `values-night/` resource directories
- **Windows**: C# static class with theme-aware helpers (custom format plugin)

---

## 5. API Client Generation: OpenAPI 3.1

**Decision**: OpenAPI 3.1 spec as single source of truth. Per-platform generators produce typed clients. Generated code committed to repo.

**Generator selection**:

| Platform | Tool | Rationale |
|----------|------|-----------|
| TypeScript | `openapi-typescript` + `openapi-fetch` | Pure types, no runtime bloat, tiny fetch wrapper |
| Swift | Apple `swift-openapi-generator` | Official Apple tool, async/await, SPM build plugin |
| Kotlin | `openapi-generator` (kotlin) | Mature, coroutines support, Ktor/OkHttp compatible |
| C# | `openapi-generator` (csharp) or NSwag | .NET 8+ compatible, HttpClient-based |

**Why commit generated code**: Article IX (DX) targets 15-minute setup. Requiring Java + Swift toolchain just to generate contracts adds friction. CI ensures generated code stays in sync via diff check.

---

## 6. CI/CD: GitHub Actions

**Decision**: GitHub Actions with path-filtered, platform-specific workflows + shared validation workflow.

**Workflow structure**:
- `shared-validation.yml` — Every PR: contracts sync check, tokens sync check, lint, type check, security audit
- `web.yml` — Path-filtered: `apps/web/**`, `packages/**`. Vitest + Playwright.
- `admin.yml` — Path-filtered: `apps/admin/**`. Same tools as web.
- `ios.yml` — Path-filtered: `apps/ios/**`. Runs on `macos-15`. XCTest via `xcodebuild`.
- `android.yml` — Path-filtered: `apps/android/**`. Gradle `testDebugUnitTest` + `assembleDebug`.
- `desktop-macos.yml` — Path-filtered: `apps/desktop-macos/**`. Runs on `macos-15`.
- `desktop-windows.yml` — Path-filtered: `apps/desktop-windows/**`. Runs on `windows-latest`. `dotnet test`.

**Pipeline (CICD-03)**: lint → test → build → deploy staging → smoke test → (manual approval) → deploy production

---

## 7. Testing Strategy

**Decision**: Per-platform testing tools with real Supabase for integration tests. pgTAP for RLS policy testing.

| Layer | Web | iOS/macOS | Android | Windows | Database |
|-------|-----|-----------|---------|---------|----------|
| Unit | Vitest | XCTest | JUnit 5 | xUnit | pgTAP |
| Component | React Testing Library | ViewInspector | Compose Testing | WinUI Test | — |
| Integration | Vitest + Supabase | XCTest + Supabase | JUnit + Supabase | xUnit + Supabase | pgTAP |
| E2E | Playwright | XCUITest | Espresso | WinAppDriver | — |
| Coverage | >= 80% | >= 80% | >= 80% | >= 80% | All RLS policies |

---

## 8. Linting & Static Analysis

**Decision**: Biome for TypeScript (10-25x faster than ESLint+Prettier), SwiftLint for Swift, ktlint + Detekt for Kotlin, Roslyn analyzers for C#. TruffleHog for secrets detection.

**Pre-commit hooks**: Husky + lint-staged for JS/TS. Platform-specific linting integrated into CI workflows.

---

## 9. Code Generation / Scaffolding CLI

**Decision**: Plop.js with Handlebars templates for web (components, screens, API routes). Shell scripts for iOS (SwiftUI + ViewModels) and Android (Composables + ViewModels).

**Rationale**: Plop.js is lightweight, in-repo, template-driven. Generated code auto-updates barrel exports and route registrations (FR-026).

---

## 10. Environment Validation

**Decision**: Zod schemas for build-time env var validation (web/admin). Separate schemas for dev/staging/prod. Public (`NEXT_PUBLIC_*`) and secret variables explicitly categorized.

**Doctor CLI**: Shell script checking Node version, Git, Docker, Supabase CLI, database connectivity, env var presence, platform-specific tools (Xcode, Android SDK, .NET SDK). Pass/Warn/Fail output with actionable messages.
