<!--
Sync Impact Report
===================
Version change: 1.0.0 → 1.1.0 (MINOR — expanded guidance on two principles)

Modified principles:
  - Article V: "P0 requirements baked into foundation" → phased baseline approach
    (Phase 1 = a11y infrastructure baseline, Phase 3 = full audit/RTL/locales)
  - Article VIII: "Phase 1 requirements" for all observability → tiered approach
    (Phase 1 = structured logging + health checks, Phase 3 = tracing + monitoring)

Added sections: None
Removed sections: None

Templates requiring updates:
  - .specify/templates/plan-template.md: ✅ no changes needed
  - .specify/templates/spec-template.md: ✅ no changes needed
  - .specify/templates/tasks-template.md: ✅ no changes needed

Follow-up TODOs: None
-->

# B2C Multi-Platform SaaS Boilerplate Constitution

## Core Principles

### I. Spec-Driven Implementation

The feature specification is the **primary artifact**. Code is its
expression — not the other way around. Every implementation decision
traces back to a numbered requirement (e.g., AUTH-01, BILL-03). Code
that cannot cite a requirement ID in its commit message or PR
description is unauthorized scope and MUST be rejected.

The spec-kit workflow (`/speckit.specify` → `/speckit.plan` →
`/speckit.tasks`) is the mandatory path from requirement to code.
Direct coding without a spec and plan is prohibited. When production
feedback reveals a spec gap, the spec MUST be updated first and code
follows.

### II. Library-First Architecture

Every functional module MUST originate as a **standalone, reusable
library** before any application-level integration occurs. Libraries
expose their functionality through well-defined public APIs.
Application layers are thin orchestration wrappers that compose
libraries — never the other way around.

A module ships as its own package with its own tests, its own
documentation, and zero dependencies on application-level code. All
target platform applications consume the same libraries through their
respective platform bindings. Monolithic application code that inlines
module logic violates this article.

### III. Platform Parity with Explicit Divergence

All target platforms are first-class citizens. Feature behavior MUST
be identical across platforms **unless** the spec explicitly documents
a divergence (e.g., biometric type, push transport, secure storage
mechanism). Undocumented platform gaps are treated as defects.

Each library from Article II MUST document which platforms it supports
and where behavior differs. Platform-specific code lives in clearly
labeled adapter layers, not scattered through core logic.

### IV. Test-First Imperative

No implementation code shall be written before:

1. Tests are written against the spec's acceptance criteria.
2. Tests are validated and confirmed to **fail** (Red phase).
3. Implementation proceeds only to make failing tests pass (Green).
4. Refactoring follows only after Green (Refactor phase).

Test coverage on boilerplate modules MUST be >= 80%. Integration tests
use realistic environments (real databases, actual service instances)
— mocks and stubs are permitted only for third-party APIs with no
sandbox.

The CI pipeline MUST reject PRs that decrease test coverage below the
threshold. A requirement is not "implemented" until its tests pass on
all target platforms.

### V. Accessibility and Internationalization Are Not Afterthoughts

WCAG 2.1 AA compliance, screen-reader compatibility, RTL layout
support, and full i18n coverage are **foundational requirements** that
mature across phases. Phase 1 MUST establish the a11y/i18n
infrastructure baseline: semantic HTML, ARIA attributes on all form
controls, contrast-validated design tokens, and externalized locale
strings. Full audit, RTL support, and complete locale coverage are
Phase 3 deliverables that build on this baseline.

Every UI-facing requirement implicitly includes a11y acceptance
criteria appropriate to its phase. A feature is not "done" unless it
meets its phase's a11y baseline. Libraries that expose UI components
MUST ship with a11y support built in from their first release.

### VI. Privacy by Default, Compliance by Design

GDPR is the baseline regulatory framework. Data minimization, explicit
consent, right-to-erasure, and encrypted-at-rest/in-transit are
non-negotiable defaults. Additional compliance regimes are layered
per-project.

Every feature that collects, stores, or transmits user data MUST
document its GDPR basis in the spec and data model documentation. PII
fields MUST be annotated in the data model and automatically included
in data-export and data-deletion flows.

### VII. Simplicity and Anti-Abstraction

Implementations MUST favor the **simplest viable approach**:

- Initial implementation of any module is limited to **three projects
  maximum** (library, tests, and one integration point). Additional
  projects require documented justification in the Complexity Tracking
  log.
- Use frameworks and platform APIs **directly** rather than wrapping
  them in custom abstraction layers. A thin adapter for testability is
  acceptable; a multi-layer indirection stack is not.
- No speculative "might need later" code. Every line traces to a spec
  requirement.

PRs that introduce abstraction layers, generic factories, or plugin
systems not required by the spec MUST be rejected with a reference to
this article.

### VIII. Observability from Day One

Observability matures across phases. **Phase 1 baseline**: structured
JSON logging with correlation IDs, health-check endpoints (shallow +
deep), and error tracking with classification. **Phase 3 full**:
distributed tracing, synthetic monitoring, and SLO dashboards. You
cannot debug what you cannot see — Phase 1 ensures every service
emits structured, queryable signals from day one.

The CI/CD pipeline MUST include observability validation — builds that
ship without structured log output or health endpoints fail the
pipeline. Every library MUST emit structured logs at the level
appropriate to its phase.

### IX. Developer Experience Is a Product Feature

Code generators, component libraries, debugging tools, conventional
commit enforcement, onboarding documentation, and bundle analysis are
specified requirements — not optional developer conveniences.

DX requirements are tested like any other feature. Onboarding time and
developer satisfaction are tracked as leading success metrics.

### X. Priority-Driven Phasing

Requirements are triaged into three tiers — P0 (must-have for MVP),
P1 (nice-to-have for v1), P2 (future consideration) — and mapped to
implementation phases. P0 requirements form the critical path; P1 and
P2 requirements MUST NOT delay the phase they are assigned to.

Any new requirement MUST receive a priority tag and a phase assignment
before it is considered accepted. Phase gates are enforced: Phase N+1
does not start until Phase N's P0 items are complete.

## Architectural Constraints

### AC-1: Standalone Admin Panel

The admin dashboard is a **separate deployable application** with its
own build pipeline and authentication context. It is never a route or
section within the consumer-facing app. It consumes the same libraries
(Article II) but assembles them into a distinct application shell.

### AC-2: Native Desktop

Desktop targets are **platform-native applications** (Swift for macOS,
C#/.NET for Windows) — not Electron or Tauri wrappers. Shared
business logic lives in the libraries (Article II); platform-specific
UI and OS integration live in the native shell.

### AC-3: Offline Strategy

The offline model is **read cache + queued writes** — not full
offline-first. Cached data is available for reading when connectivity
drops; mutations are queued and synced when connectivity resumes.
Conflict resolution follows last-write-wins unless the spec explicitly
prescribes otherwise.

### AC-4: Real-Time Delivery

The spec defines **behavioral guarantees** for real-time features but
does **not prescribe transport**. The implementing team chooses the
transport that meets the latency SLA. The library abstraction exposes
a transport-agnostic event interface.

### AC-5: Data Layer Integrity

Database migrations MUST be versioned and reversible. Row-level
security MUST enforce tenant isolation at the data layer. All data
access MUST be type-safe through an ORM or query builder — raw SQL in
application code is prohibited. Deletes are soft by default. The data
layer is a shared library (Article II), not duplicated per-platform.

### AC-6: Modular Domain Boundaries

Each functional module maps to a bounded library package (Article II).
Cross-module dependencies flow through the API layer or a lightweight
event bus — never through direct internal coupling. Circular
dependencies between modules are treated as defects.

## Governance

### Adding Requirements

New requirements MUST follow this process:

1. Assign a module prefix and sequential ID (e.g., `AUTH-10`).
2. Assign a priority tag (P0 / P1 / P2).
3. Write testable acceptance criteria.
4. Map to an implementation phase.
5. Create a feature spec via `/speckit.specify` before any
   implementation begins.

Any requirement that cannot satisfy steps 2–3 is sent back for
clarification — it does not enter the spec in an unresolved state.

### Amending This Constitution

Constitutional principles are **immutable for the duration of a
project's implementation phase**. Amendments require:

- A written rationale explaining why the existing principle is
  insufficient.
- Impact analysis on all existing spec requirements and in-flight
  implementation plans.
- Complexity Tracking entries for every affected feature.
- Explicit sign-off from both Product and Engineering leads.
- Version bump following semantic versioning (MAJOR for principle
  removal/redefinition, MINOR for additions, PATCH for
  clarifications).

### Decision Records

Significant architectural decisions that affect multiple modules MUST
be logged as Architecture Decision Records (ADRs). Each ADR references
the constitutional articles it relies on and the spec requirements it
serves. ADRs are append-only — superseded decisions are marked as
such, never deleted.

### Compliance Review

All PRs and reviews MUST verify constitutional compliance. Complexity
deviations MUST be justified and logged in the Complexity Tracking
section of the relevant plan. The constitution supersedes all other
practices and conventions.

**Version**: 1.1.0 | **Ratified**: 2026-02-21 | **Last Amended**: 2026-02-21
