# Feature Specification: B2C Boilerplate — Phase 4: Advanced Features

**Feature Branch**: `004-b2c-advanced`
**Created**: 2026-02-21
**Status**: Draft
**Input**: B2C_Boilerplate_Initial_Spec.md — Phase 4 requirements (AUTH, SESS, RBAC, BILL, NOTIF, FF, CMS, OFF, API, SEC, THEME, I18N, A11Y, OBS, ANLY, DX, CICD, PLAT, SEO)
**Phase Scope**: Advanced post-launch features — passwordless authentication, experimentation, content scheduling, offline writes, webhooks, white-labeling, and operational maturity

## Phasing Strategy

This spec is **Phase 4 of 4** derived from the master B2C Boilerplate Feature Spec. Each phase is a self-contained speckit feature with its own plan and tasks.

| Phase | Branch | Scope | Requirement IDs |
| ----- | ------ | ----- | --------------- |
| 1 — Foundation | `001-b2c-foundation` | Auth, sessions, profile, RBAC, API, data layer, CI/CD, theming, DX, security | AUTH-01–06, AUTH-08–09, SESS-01–02, PROF-01, PROF-04, RBAC-01, RBAC-03, API-01–04, DATA-01, DATA-03–04, CICD-01–03, CICD-05, THEME-01–02, DX-01, DX-05, SEC-01–03, SEC-05 |
| 2 — Monetization & Engagement | `002-b2c-monetization` | Billing, notifications, email, feature flags, admin dashboard, SEO, support | BILL-01–04, BILL-07, NOTIF-01–02, NOTIF-04–06, FF-01, FF-04, ADMIN-01–05, SEO-01–05, PLAT-07 |
| 3 — Scale & Polish | `003-b2c-scale-polish` | i18n, a11y, offline, analytics, observability, platform delivery, RLS | I18N-01–04, A11Y-01–04, OFF-01–02, ANLY-01–02, OBS-01–04, PLAT-01–06, DATA-02, DATA-05, NOTIF-07, DX-02–03 |
| **4 — Advanced** | `004-b2c-advanced` | Passkeys, A/B testing, CMS extras, trials, advanced offline, webhooks, white-labeling | AUTH-03–04, AUTH-07, RBAC-02, SESS-03, BILL-05–06, NOTIF-03, FF-02–03, CMS-04–05, OFF-03–04, API-05–06, SEC-04, THEME-03, I18N-05, A11Y-05, OBS-02, OBS-05, ANLY-03, DX-04, DX-06, CICD-04, PLAT-03, PLAT-05–06, SEO-03 |

## User Scenarios & Testing *(mandatory)*

### User Story 1 — End User Logs In with Magic Link or Phone OTP (Priority: P1)

A returning user chooses to log in without a password. They select "Magic Link" and enter their email address. Within seconds they receive a one-time link that logs them in with a single tap. Alternatively, a mobile-first user enters their phone number, receives a 6-digit code via SMS, enters the code, and is authenticated. Both methods are quick, secure, and eliminate the friction of remembering a password.

**Why this priority**: Passwordless login reduces the number-one source of user drop-off (forgotten passwords) and directly improves conversion and retention.

**Independent Test**: A user can request a magic link, receive it, tap it, and land on their authenticated home screen — or enter a phone number, receive an OTP, submit the code, and be logged in.

**Acceptance Scenarios**:

1. **Given** a registered user, **When** they enter their email and request a magic link, **Then** a one-time link is delivered to their inbox within 60 seconds.
2. **Given** a magic link, **When** the user clicks it within the configurable TTL (default 15 minutes), **Then** they are authenticated and the link is invalidated.
3. **Given** a magic link, **When** the user clicks it after the TTL has expired, **Then** they see a clear expiry message with an option to request a new link.
4. **Given** a registered user, **When** they enter their phone number and request an OTP, **Then** a 6-digit code is delivered via SMS within 30 seconds.
5. **Given** an OTP, **When** the user enters the correct code within the configurable TTL (default 5 minutes), **Then** they are authenticated and the code is invalidated.
6. **Given** OTP requests from the same phone number, **When** the rate limit is exceeded, **Then** further requests are temporarily blocked and the user is informed to try again later.

---

### User Story 2 — End User Uses Passkey or Biometric Login (Priority: P2)

A user who has already logged in with their primary credentials is prompted to enable passkey (WebAuthn/FIDO2) or biometric login for faster future access. Once enrolled, they can authenticate on subsequent visits using a fingerprint, face scan, or hardware security key. The system stores device metadata and tracks authentication counters for replay protection. If biometric authentication fails (e.g., sensor unavailable), the user falls back seamlessly to password or OTP login.

**Why this priority**: Passkeys and biometrics are a convenience layer that increases engagement and security but depend on primary authentication being fully established.

**Independent Test**: A logged-in user can enroll a passkey, log out, and log back in using only their biometric or security key — or see a fallback option if the method is unavailable.

**Acceptance Scenarios**:

1. **Given** an authenticated user, **When** they enroll a passkey, **Then** the system stores the credential with device metadata and confirmation is displayed.
2. **Given** a user with an enrolled passkey, **When** they initiate login on the same device, **Then** they are prompted for biometric/security key verification and authenticated upon success.
3. **Given** a user with an enrolled passkey, **When** biometric verification fails or the sensor is unavailable, **Then** they are presented with password or OTP fallback options.
4. **Given** a passkey credential, **When** it is used, **Then** the authentication counter is incremented and checked to prevent replay attacks.
5. **Given** a user with biometric login enabled on mobile, **When** they return to the app after backgrounding, **Then** biometric re-authentication is requested before restoring the session (if within idle timeout).

---

### User Story 3 — Admin Runs A/B Experiments (Priority: P1)

A product manager creates an experiment in the admin dashboard by defining a hypothesis, naming the variants (e.g., "Control", "Variant A", "Variant B"), selecting a target metric, and starting the test. Users are randomly and stably assigned to variants so their experience is consistent across sessions. The experiment's analytics are tagged with variant identifiers. The admin can pause, resume, or conclude the experiment and view results — including statistical significance — before rolling out the winning variant.

**Why this priority**: Data-driven product decisions are essential to growth. Experimentation is the mechanism that converts feature flags into validated learnings.

**Independent Test**: An admin can create an experiment with two variants, start it, observe that users are consistently assigned to a variant, view tagged analytics, and conclude the experiment.

**Acceptance Scenarios**:

1. **Given** an admin, **When** they create a new experiment with a hypothesis, variants, and target metric, **Then** the experiment is saved in draft state.
2. **Given** a draft experiment, **When** the admin starts it, **Then** users begin receiving stable random variant assignments.
3. **Given** a running experiment, **When** a user is assigned to Variant A, **Then** they see Variant A consistently across all sessions and devices.
4. **Given** a running experiment, **When** analytics events are recorded, **Then** each event is tagged with the user's variant assignment.
5. **Given** a running experiment, **When** the admin pauses it, **Then** all users revert to the default experience and no new assignments are made.
6. **Given** a concluded experiment, **When** the admin reviews results, **Then** they see per-variant metrics and can promote the winning variant to 100% rollout.

---

### User Story 4 — End User Uses Trial and Applies Promo Codes (Priority: P1)

A new user signs up and is automatically enrolled in a free trial period (default 14 days). They receive reminder emails as the trial nears expiration (3 days before, 1 day before). At trial end, their account auto-converts to a paid subscription if a payment method is on file, or downgrades to a free tier if not. During checkout, the user can apply a promo code that grants a percentage or fixed-amount discount, subject to plan or new-user restrictions. The system tracks redemptions and enforces time limits on promotions.

**Why this priority**: Trial periods and promotional pricing are proven levers for conversion and acquisition. They directly impact revenue.

**Independent Test**: A user can sign up, see their trial status and countdown, receive reminder emails, apply a valid promo code at checkout, and see the discount reflected in their invoice.

**Acceptance Scenarios**:

1. **Given** a new user signs up, **When** a trial is configured, **Then** they are enrolled in the trial with a visible countdown showing days remaining.
2. **Given** a user in trial, **When** 3 days remain, **Then** they receive a reminder email. **When** 1 day remains, **Then** they receive a final reminder.
3. **Given** a user whose trial has ended, **When** a payment method is on file, **Then** their subscription auto-converts to the selected paid plan.
4. **Given** a user whose trial has ended, **When** no payment method is on file, **Then** their account is downgraded to the free tier.
5. **Given** a user at checkout, **When** they enter a valid, unexpired promo code, **Then** the discount is applied and reflected in the order total.
6. **Given** a promo code restricted to new users only, **When** an existing subscriber attempts to apply it, **Then** the code is rejected with a clear explanation.
7. **Given** a promo code with a redemption limit, **When** the limit is reached, **Then** subsequent attempts are rejected.

---

### User Story 5 — Admin Schedules Content and Manages Media (Priority: P2)

A content editor creates a blog post and sets a future publish date. The system auto-publishes the content at the scheduled time without manual intervention. Optionally, the editor sets an expiry date, and the content is auto-unpublished when the date passes. While editing, the content editor selects images from a centralized media library where all assets are organized with tags and searchable. Uploaded images are automatically optimized into multiple sizes for different screen densities.

**Why this priority**: Scheduled publishing and media management are content operations features that improve editorial efficiency but depend on the CMS foundation from Phase 2.

**Independent Test**: An editor can create content with a future publish date, upload an image via the media library, and verify the content goes live automatically at the scheduled time.

**Acceptance Scenarios**:

1. **Given** an editor creating content, **When** they set a future publish date, **Then** the content is saved with "Scheduled" status and a visible publish countdown.
2. **Given** a scheduled content item, **When** the publish date arrives, **Then** the content is automatically published without manual action.
3. **Given** published content with an expiry date, **When** the expiry date passes, **Then** the content is automatically unpublished.
4. **Given** an editor, **When** they open the media library, **Then** they see all uploaded assets with search, filtering, and tag-based organization.
5. **Given** an editor uploading an image, **When** the upload completes, **Then** the system automatically generates optimized sizes for web and mobile.

---

### User Story 6 — End User Uploads Files and Uses Offline Writes (Priority: P2)

A user selects a file to upload using a consistent file picker across all platforms. They see a progress indicator and can cancel the upload mid-stream. The server validates the file type and scans for malware before accepting it. Additionally, when the user loses network connectivity, they can continue making changes (e.g., editing a form, favoriting items). Changes are queued locally and automatically synchronized when connectivity returns, with the most recent write winning in case of conflicts.

**Why this priority**: File handling and offline resilience are quality-of-life features that significantly improve the experience on mobile and unreliable networks, but they depend on the baseline offline support from Phase 3.

**Independent Test**: A user can upload a file with visible progress, cancel it, and retry. Separately, a user can toggle airplane mode, make a change, restore connectivity, and see the change synchronized.

**Acceptance Scenarios**:

1. **Given** a user on any platform, **When** they initiate a file upload, **Then** a platform-appropriate file picker appears with consistent behavior.
2. **Given** an active upload, **When** the user views the upload screen, **Then** they see a progress indicator. **When** they tap cancel, **Then** the upload stops.
3. **Given** a completed upload, **When** the file reaches the server, **Then** it passes MIME type validation and malware scanning before being accepted.
4. **Given** a user who is offline, **When** they perform a write operation, **Then** the change is queued locally with a visible "pending sync" indicator.
5. **Given** a user with queued offline writes, **When** connectivity is restored, **Then** all queued changes are automatically synchronized to the server.
6. **Given** conflicting writes from offline sync, **When** the server receives them, **Then** the last-write-wins conflict resolution is applied by default.
7. **Given** a web user, **When** they load the app while offline, **Then** the service worker serves a cached app shell and queued writes are retried via background sync.

---

### User Story 7 — Developer Uses Conventional Commits and Monitors Bundle Size (Priority: P3)

A developer makes changes to the codebase and writes a commit message following the Conventional Commits format. A pre-commit hook validates the format before the commit is accepted. On merge, the CI pipeline automatically determines the next semantic version, generates a changelog, and creates a release. The developer also reviews a bundle analysis report attached to their pull request, showing a treemap of dependencies and flagging any budget violations or unused dependencies.

**Why this priority**: Automated releases and bundle analysis are developer productivity features that improve long-term maintainability but are not blocking for user-facing features.

**Independent Test**: A developer can write a properly formatted commit, see it validated, merge it, and observe an auto-generated changelog. They can also view the bundle analysis report on their PR and see budget pass/fail status.

**Acceptance Scenarios**:

1. **Given** a developer writing a commit, **When** the message does not follow Conventional Commits format, **Then** the pre-commit hook rejects the commit with guidance on the correct format.
2. **Given** a merged pull request, **When** CI runs the release pipeline, **Then** the next semantic version is calculated from commit types and a changelog is auto-generated.
3. **Given** a pull request, **When** CI completes, **Then** a bundle analysis report is posted showing a dependency treemap and total bundle size.
4. **Given** a configurable performance budget, **When** a pull request exceeds the budget, **Then** the CI check fails with a clear size violation message.
5. **Given** the analysis report, **When** unused dependencies are detected, **Then** they are flagged for removal.

---

### Edge Cases

- What happens when a magic link is opened on a different device than the one that requested it? The link authenticates the user on the device where it is opened; the requesting device is notified to retry login.
- What happens when an OTP code is entered after it has already been used? The user sees an "already used" error with the option to request a new code.
- What happens when a passkey credential is enrolled on a device the user no longer has access to? The user can manage enrolled credentials from their profile and remove stale devices using a fallback login method.
- What happens when a trial expires while the user is mid-session? The user is notified in-app with a grace period to add a payment method before access is restricted.
- What happens when a promo code and a trial are both applied to the same account? The trial runs first; the promo code discount applies to the first paid billing cycle after trial ends.
- What happens when an experiment variant is deleted while the experiment is running? The system prevents deletion of active variants; the experiment must be paused or concluded first.
- What happens when scheduled content references a media asset that has been deleted? Publishing fails with an error directing the editor to replace the missing asset before retrying.
- What happens when offline writes queue grows very large (hundreds of changes)? The system caps the queue size with a configurable limit and warns the user to reconnect before further writes are lost.
- What happens when a webhook endpoint is consistently failing? After 5 retries with exponential backoff, the webhook is marked as failing and the admin is notified. It can be manually retried or disabled.
- What happens when a file upload fails the server-side malware scan? The file is rejected, the user is informed, and the event is logged for security audit.

## Requirements *(mandatory)*

### Functional Requirements

**Authentication — Passwordless & Biometric**

- **FR-001** (AUTH-03): System MUST support magic link (passwordless) login where the user enters an email, receives a one-time link with a configurable TTL (default 15 minutes), and is authenticated upon clicking. Each link MUST be single-use.
- **FR-002** (AUTH-04): System MUST support phone number login via OTP where the user enters a phone number, receives a 6-digit code with a configurable TTL (default 5 minutes), and is authenticated upon entering the code. OTP requests MUST be rate-limited per phone number.
- **FR-003** (AUTH-07): System MUST support passkey/WebAuthn (FIDO2) biometric login as a convenience layer over primary credentials. The system MUST store device metadata, track authentication counters for replay protection, and support all major platforms.

**Session Management**

- **FR-004** (SESS-03): System MUST enforce configurable idle timeouts (default 30 minutes on web) and absolute session lifetimes (default 7 days on web, 30 days on mobile). Users MUST receive a warning before session expiry with the option to extend.

**Role-Based Access Control**

- **FR-005** (RBAC-02): System MUST allow administrators to create custom roles with arbitrary permission sets. Custom roles MUST be visible in the user management interface. Deleting a custom role MUST require reassignment of affected users to another role first.

**Billing — Trials & Promotions**

- **FR-006** (BILL-05): System MUST support configurable trial periods (default 14 days) with optional payment method requirement upfront. Reminder emails MUST be sent at 3 days and 1 day before expiry. Trials MUST auto-convert to a paid subscription or downgrade to free tier upon expiration.
- **FR-007** (BILL-06): System MUST support coupon/promo codes that are time-limited and provide either a percentage or fixed-amount discount. Codes MUST support restrictions by plan or new-user status. The system MUST track redemption counts and enforce limits.

**Notifications — Push Broadcast**

- **FR-008** (NOTIF-03): System MUST allow administrators to send push notifications to all users, a segment, or specific individuals. Notifications MUST support scheduling and rich content (images, action buttons).

**Feature Flags — Experimentation**

- **FR-009** (FF-02): System MUST support multi-variate feature flags that resolve to one of N string values. Assignment MUST be sticky per user across sessions and devices, enabling A/B/n testing.
- **FR-010** (FF-03): System MUST support A/B experiment tracking with hypothesis definition, variant configuration, metric selection, and random stable user assignment. Analytics events MUST be tagged with variant identifiers. Admins MUST be able to start, pause, and conclude experiments.

**CMS — Scheduling & Media**

- **FR-011** (CMS-04): System MUST support scheduled publishing with a configurable future publish date and automatic publishing at the scheduled time. An optional expiry date MUST trigger automatic unpublishing.
- **FR-012** (CMS-05): System MUST provide a centralized media library for uploading and managing assets. Uploaded images MUST be automatically optimized into multiple sizes. Assets MUST be searchable and taggable.

**Offline — Advanced**

- **FR-013** (OFF-03): System MUST support offline-capable write operations. Changes MUST be queued locally and automatically synchronized when connectivity is restored. Last-write-wins MUST be the default conflict resolution strategy.
- **FR-014** (OFF-04): System MUST provide a service worker (web) for asset caching and offline app shell delivery. Background sync MUST retry queued writes. The caching strategy MUST be network-first for API calls and cache-first for static assets.

**API — Webhooks & GraphQL**

- **FR-015** (API-05): System MUST support a webhook system where consumers register URLs for specific events. Payloads MUST include HMAC signatures for verification. Failed deliveries MUST retry with exponential backoff (up to 5 attempts). A delivery log MUST be available to administrators.
- **FR-016** (API-06): System MUST provide a GraphQL gateway as an alternative to the REST API. The gateway MUST support schema federation, and enforce query depth and complexity limits to prevent abuse.

**Security — Compliance**

- **FR-017** (SEC-04): System MUST support SOC 2 readiness with comprehensive audit logging, documented RBAC policies, an incident response playbook, and an annual review cadence.

**Theming — White-Labeling**

- **FR-018** (THEME-03): System MUST support brand customization (white-labeling) where administrators can configure the application name, logo, and brand colors. Changes MUST apply in real time on web. Mobile assets MUST be replaceable.

**Internationalization — Translation Workflow**

- **FR-019** (I18N-05): System MUST support a translation workflow with export to JSON/XLIFF format, import with validation, and a coverage dashboard showing translation completeness per locale.

**Accessibility — CI Integration**

- **FR-020** (A11Y-05): System MUST include automated accessibility testing in the CI pipeline. Error-level a11y violations MUST fail the build. A manual accessibility checklist MUST be maintained alongside automated checks.

**Observability — Tracing & Synthetic Monitoring**

- **FR-021** (OBS-02): System MUST implement distributed tracing with trace context propagation across services, spans for each request, and exportable trace data.
- **FR-022** (OBS-05): System MUST implement synthetic monitoring that validates critical user flows (signup, login, checkout) on a schedule from multiple regions. Alerts MUST be configurable and monitoring definitions MUST be maintained as code.

**Analytics — Revenue**

- **FR-023** (ANLY-03): System MUST provide revenue analytics including MRR, ARR, ARPU, LTV, churn rate analysis, and conversion funnel visualization.

**Developer Experience — Releases & Performance**

- **FR-024** (DX-04): System MUST enforce Conventional Commits format via pre-commit hooks. Merges MUST trigger automated semantic versioning and changelog generation.
- **FR-025** (DX-06): System MUST provide bundle analysis with a dependency treemap (web) and binary size tracking (mobile). Configurable performance budgets MUST fail CI on violation. Unused dependencies MUST be detected and flagged.

**CI/CD — Monorepo Support**

- **FR-026** (CICD-04): System MUST support either monorepo or multi-repo structure with extractable shared packages and incremental builds that only rebuild affected modules.

**Platform — Biometric, Navigation & File Handling**

- **FR-027** (PLAT-03): System MUST support biometric authentication on mobile as a convenience layer after initial login. Biometric MUST fall back to password or PIN when unavailable.
- **FR-028** (PLAT-05): System MUST preserve navigation state (stack position, scroll position) across app backgrounding. Deep links MUST reconstruct the correct back-stack. Tab state MUST be retained across tab switches.
- **FR-029** (PLAT-06): System MUST provide unified file upload with a platform-appropriate file picker, client-side image resizing, progress indication, and cancellation. Server-side MUST perform virus scanning and MIME type validation.

**SEO — Structured Data**

- **FR-030** (SEO-03): System MUST output JSON-LD structured data on key content pages. Structured data MUST validate against Google's Rich Results Test. JSON-LD schemas MUST be configurable per CMS content type.

### Key Entities

- **Magic Link**: One-time authentication token — ID, user email, token hash, TTL, used flag, created timestamp.
- **OTP Code**: Phone-based authentication code — ID, phone number, code hash, TTL, used flag, attempt count, created timestamp.
- **Passkey Credential**: WebAuthn registration — ID, user ID, credential public key, device metadata (name, OS, last used), authentication counter, created timestamp.
- **Custom Role**: Admin-defined permission group — ID, name, description, permission set, created-by user, created/updated timestamps.
- **Trial**: Subscription trial period — ID, user ID, plan ID, start date, end date, payment method required flag, converted flag.
- **Promo Code**: Discount coupon — ID, code string, discount type (percent or fixed), discount value, valid-from date, valid-until date, plan restriction, new-user-only flag, max redemptions, current redemption count.
- **Experiment**: A/B test definition — ID, name, hypothesis, status (draft, running, paused, concluded), variants list, target metric, start date, end date.
- **Experiment Assignment**: User-to-variant mapping — ID, experiment ID, user ID, variant name, assigned timestamp.
- **Scheduled Content**: Content with a future publish date — extends base content entity with scheduled publish date, optional expiry date, publish status (draft, scheduled, published, expired).
- **Media Asset**: Centralized file record — ID, file name, MIME type, file size, tags, optimized variants (sizes), uploaded-by user, created timestamp.
- **Offline Write Queue Entry**: Locally queued mutation — ID, operation type, payload, created timestamp, sync status (pending, synced, failed).
- **Webhook Subscription**: Event listener registration — ID, owner user/org, target URL, subscribed events, HMAC secret hash, active flag.
- **Webhook Delivery Log**: Delivery attempt record — ID, webhook subscription ID, event type, payload hash, HTTP status, attempt count, last attempted timestamp, outcome (success, failed, exhausted).
- **Synthetic Monitor**: Scheduled health check — ID, name, flow definition, schedule, target regions, alert configuration.
- **Bundle Report**: CI performance artifact — ID, commit SHA, total size, budget threshold, pass/fail status, unused dependency list, generated timestamp.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Magic link and OTP login complete end-to-end (request, delivery, authentication) within 60 seconds 95% of the time.
- **SC-002**: Passkey enrollment and subsequent biometric login complete in under 10 seconds on all supported platforms.
- **SC-003**: OTP delivery withstands rate limiting — no more than 5 OTP requests per phone number per 15-minute window.
- **SC-004**: Trial reminder emails are delivered at the correct intervals (3 day, 1 day) with 99% reliability.
- **SC-005**: Promo code validation and application occur within the checkout flow without requiring a page reload or additional steps.
- **SC-006**: A/B experiment assignment is stable — a user assigned to Variant A sees Variant A on 100% of subsequent sessions.
- **SC-007**: Scheduled content publishes within 5 minutes of the configured publish time.
- **SC-008**: Offline writes synchronize within 30 seconds of connectivity restoration with zero data loss under normal queue sizes.
- **SC-009**: Webhook deliveries succeed on the first attempt >= 95% of the time; failed deliveries are retried up to 5 times with exponential backoff.
- **SC-010**: GraphQL query depth and complexity limits prevent any single query from consuming more than 10 seconds of server processing time.
- **SC-011**: Accessibility CI checks run on every pull request and catch 100% of error-level WCAG violations.
- **SC-012**: Distributed traces cover all cross-service requests with trace context propagated end-to-end.
- **SC-013**: Synthetic monitors execute on schedule and alert within 5 minutes of a detected failure in any critical flow.
- **SC-014**: Revenue analytics dashboard displays MRR, ARR, ARPU, LTV, and churn metrics with data no more than 24 hours stale.
- **SC-015**: Bundle analysis reports are generated on every pull request and CI fails within 2 minutes when performance budgets are exceeded.
- **SC-016**: Incremental builds in the monorepo/multi-repo structure rebuild only affected modules, reducing average build time by at least 40% compared to full builds.

### Assumptions

- Phases 1, 2, and 3 are complete — authentication, billing, feature flags, CMS, offline basics, observability, and platform delivery are all operational.
- A transactional SMS provider is available for OTP delivery.
- Target devices support WebAuthn/FIDO2 APIs for passkey enrollment and authentication.
- The existing feature flag infrastructure (Phase 2) supports extension to multi-variate flags and experiment tracking.
- The existing CMS infrastructure (Phase 2) supports scheduled publish dates and media asset management.
- The existing offline infrastructure (Phase 3) supports extension to write-ahead queuing and background sync.
- A webhook delivery queue (message broker or equivalent) is available for reliable retry processing.
- Bundle analysis and conventional commit tooling can be integrated into the existing CI/CD pipeline without replacing it.
- SOC 2 readiness is a documentation and process milestone, not a certification — actual audit is out of scope.
- The spec remains technology-agnostic; success criteria are measured at the functional level, not the implementation level.
