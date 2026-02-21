# Developer Experience Checklist: B2C Boilerplate — Phase 1: Foundation

**Purpose**: Validate that DX requirements are complete, measurable, and practically achievable across the monorepo, scaffolding CLI, CI/CD, and onboarding documentation.
**Created**: 2026-02-21
**Feature**: [spec.md](../spec.md) | [plan.md](../plan.md) | [quickstart.md](../quickstart.md)

## Onboarding & Quick-Start (FR-027, SC-001)

- [ ] CHK001 - Is the 15-minute setup target realistic given Docker image pulls (~2 min), `pnpm install`, Supabase start, migrations, and type generation? Are cold-start vs warm-start times distinguished? [Measurability, Spec §SC-001 vs quickstart.md]
- [ ] CHK002 - Are prerequisite tool versions specified with minimum bounds (Node >= 20, pnpm >= 9, Docker >= 24, etc.) — are maximum/incompatible versions noted? [Completeness, quickstart.md]
- [ ] CHK003 - Is the setup path defined for developers who only work on one platform (e.g., web-only dev doesn't need Xcode/Android Studio)? [Clarity, quickstart.md]
- [ ] CHK004 - Is the architecture overview document specified as a deliverable — quickstart.md references `docs/architecture.md` but is it in the plan's deliverables? [Gap, quickstart.md vs plan.md]
- [ ] CHK005 - Are inline code documentation requirements specified — which public interfaces need doc-comments (JSDoc, KDoc, Swift doc-comments)? [Clarity, Spec §FR-027]
- [ ] CHK006 - Is the "developer satisfaction score >= 4.0/5.0" (SC-012) measurable — is the survey instrument defined, when is it administered, and to whom? [Measurability, Spec §SC-012]

## Doctor CLI Command (FR-027)

- [ ] CHK007 - Are the doctor command's specific checks enumerated in the spec — runtime versions, env vars, database connectivity, platform tools? [Completeness, Spec §FR-027 vs quickstart.md]
- [ ] CHK008 - Is the doctor command's output format specified — Pass/Warn/Fail per check, exit code on failure, suggested fixes? [Clarity, Spec §FR-027]
- [ ] CHK009 - Is the doctor command cross-platform — does it work on macOS, Linux (CI), and Windows? [Coverage, Spec §FR-027]
- [ ] CHK010 - Does the doctor command validate Supabase CLI installation and local Supabase status? [Completeness, quickstart.md]

## Scaffolding CLI (FR-026)

- [ ] CHK011 - Are the generator template types enumerated — "screens, components, API endpoints, and data models" per spec. Are these scoped to web-only or all platforms? [Clarity, Spec §FR-026 vs plan.md]
- [ ] CHK012 - Are the naming conventions that generated code must follow documented — file naming, component naming, barrel export patterns? [Gap, Spec §FR-026]
- [ ] CHK013 - Is the template customization mechanism specified — Handlebars templates stored in-repo per plan, but is this in the spec? [Consistency, Spec §FR-026 vs plan.md]
- [ ] CHK014 - Is the "barrel exports updated automatically" requirement specified for all generator types? [Clarity, Spec §FR-026]
- [ ] CHK015 - Is the generator's behavior when a file already exists specified — overwrite, skip, or error? [Edge Case, Spec §FR-026]

## CI/CD Pipeline (FR-020 through FR-023)

- [ ] CHK016 - Is the CI pipeline's 10-minute target (SC-010) measured per-platform or for all platforms combined? Path-filtered workflows run independently, so which measurement applies? [Clarity, Spec §SC-010 vs plan.md]
- [ ] CHK017 - Are the specific "critical paths" for integration tests defined — auth flow, RBAC enforcement, session management? [Clarity, Spec §FR-020]
- [ ] CHK018 - Are the specific "key user flows" for E2E tests defined — signup → verify → login → profile update → logout? [Clarity, Spec §FR-020]
- [ ] CHK019 - Is the coverage measurement tool specified per platform — Istanbul/V8 (web), Xcode coverage (iOS), JaCoCo (Android), Coverlet (.NET)? [Gap, plan.md]
- [ ] CHK020 - Is the coverage threshold enforcement mechanism specified — does CI fail on < 80% per-package, per-app, or per-platform? [Clarity, Spec §FR-020]
- [ ] CHK021 - Is the pre-commit hook setup specified — Husky + lint-staged per plan, but does the spec require cross-platform pre-commit (Swift, Kotlin linting)? [Consistency, Spec §FR-021 vs plan.md]
- [ ] CHK022 - Is the rollback mechanism defined — "deploy previous version with one command" but which command, and does it include database rollback? [Clarity, Spec §FR-022]
- [ ] CHK023 - Is the deployment rollback time target (SC-011: within 5 minutes) achievable given Supabase migration limitations (no native rollback)? [Conflict, Spec §SC-011 vs research.md]

## Environment Variable Validation (FR-023)

- [ ] CHK024 - Are environment variables enumerated — is there a complete list of all required variables for dev, staging, and production? [Gap, Spec §FR-023]
- [ ] CHK025 - Is the public vs secret variable categorization documented — which variables are NEXT_PUBLIC_* (client-safe) vs server-only? [Completeness, Spec §FR-023]
- [ ] CHK026 - Is the validation schema format specified — Zod per plan, but does the spec remain tool-agnostic? [Consistency, Spec §FR-023 vs plan.md]
- [ ] CHK027 - Are the build failure messages specified — "clear error message naming each missing variable" per spec. Is the error format defined? [Clarity, Spec §FR-023]

## Monorepo & Build System

- [ ] CHK028 - Is the Turborepo pipeline configuration specified — which tasks depend on which (e.g., `contracts:generate` before `api-client-ts:build`)? [Gap, plan.md]
- [ ] CHK029 - Is the pnpm workspace configuration specified — which directories are workspace members? [Gap, plan.md]
- [ ] CHK030 - Are build caching strategies defined — Turborepo remote caching, Xcode derived data caching, Gradle build cache? [Gap, plan.md]
- [ ] CHK031 - Is the path-filtered CI workflow configuration specified — which file patterns trigger which platform workflows? [Completeness, plan.md]

## Code Quality & Standards

- [ ] CHK032 - Are linting rules specified per platform — Biome config (web), SwiftLint rules (iOS/macOS), ktlint rules (Android), Roslyn analyzers (.NET)? [Gap, plan.md]
- [ ] CHK033 - Is the secrets detection tool specified — TruffleHog per research, but is it in the spec? [Consistency, Spec §FR-021 vs plan.md]
- [ ] CHK034 - Is the type checking scope defined — TypeScript strict mode, Swift strict concurrency, Kotlin explicit API mode? [Gap, plan.md]
- [ ] CHK035 - Are security linting rules specified beyond dependency audit — static analysis for injection, XSS, CSRF vulnerabilities? [Gap, Spec §FR-021]

## Cross-Platform Development

- [ ] CHK036 - Is the contract regeneration workflow documented — when a developer changes openapi.yaml, which steps must they run locally? [Gap, plan.md vs quickstart.md]
- [ ] CHK037 - Is the token regeneration workflow documented — when a developer changes token source files, which steps must they run? [Gap, plan.md vs quickstart.md]
- [ ] CHK038 - Is the local Supabase → remote Supabase migration workflow specified — how do local schema changes get promoted? [Gap, plan.md]
- [ ] CHK039 - Are development debugging tools specified per platform — the master spec mentions Reactotron/Flipper (mobile), browser DevTools (web), but Phase 1 defers DX-03 to later? [Clarity, Spec vs master spec §DX-03]

## Notes

- DX requirements are tested like any other feature per Constitution Article IX. Checklist items focus on whether the DX requirements themselves are well-specified.
- The 15-minute setup target (SC-001) and 10-minute CI target (SC-010) are the two most concrete measurability requirements — both need realistic validation against the actual toolchain.
- Several items highlight gaps where the plan makes tool choices not reflected in the spec. Decide whether the spec should remain tool-agnostic or explicitly adopt plan decisions.
