# Feature Specification: B2C Boilerplate — Phase 2: Monetization & Engagement

**Feature Branch**: `002-b2c-monetization`
**Created**: 2026-02-21
**Status**: Draft
**Input**: B2C_Boilerplate_Initial_Spec.md — Phase 2 requirements (BILL, NOTIF, FF, ADMIN, SEO, CMS, PLAT)
**Phase Scope**: Revenue, engagement, and operational tooling — the features that turn a functional app into a sustainable business
**Depends On**: Phase 1 (`001-b2c-foundation`) — Auth, sessions, RBAC, API layer, data layer, CI/CD, theming

## Phasing Strategy

This spec is **Phase 2 of 4** derived from the master B2C Boilerplate Feature Spec. Each phase is a self-contained speckit feature with its own plan and tasks.

| Phase | Branch | Scope | Requirement IDs |
| ----- | ------ | ----- | --------------- |
| 1 — Foundation | `001-b2c-foundation` | Auth, sessions, profile, RBAC, API, data layer, CI/CD, theming, DX, security | AUTH-01–06, AUTH-08–09, SESS-01–02, PROF-01, PROF-04, RBAC-01, RBAC-03, API-01–04, DATA-01, DATA-03–04, CICD-01–03, CICD-05, THEME-01–02, DX-01, DX-05, SEC-01–03, SEC-05 |
| **2 — Monetization & Engagement** | `002-b2c-monetization` | Billing, notifications, email, feature flags, admin dashboard, SEO, CMS, support | BILL-01–04, BILL-07, NOTIF-01–02, NOTIF-04–06, FF-01, FF-04, ADMIN-01–05, SEO-01–02, SEO-04–05, CMS-01–03, PLAT-07 |
| 3 — Scale & Polish | `003-b2c-scale-polish` | i18n, a11y, offline, analytics, observability, platform delivery, RLS | I18N-01–04, A11Y-01–04, OFF-01–02, ANLY-01–02, OBS-01–04, PLAT-01–06, DATA-02, DATA-05, NOTIF-07, DX-02–03 |
| 4 — Advanced | `004-b2c-advanced` | Passkeys, A/B testing, CMS extras, trials, advanced offline, webhooks, white-labeling | AUTH-03–04, AUTH-07, RBAC-02, SESS-03, BILL-05–06, NOTIF-03, FF-02–03, CMS-04–05, OFF-03–04, API-05–06, SEC-04, THEME-03, I18N-05, A11Y-05, OBS-02, OBS-05, ANLY-03, DX-04, DX-06, CICD-04, PLAT-03, PLAT-05–06, SEO-03 |

## User Scenarios & Testing *(mandatory)*

### User Story 1 — End User Subscribes and Manages Billing (Priority: P1)

A free-tier user discovers a premium feature, sees an upgrade prompt explaining the benefits, and subscribes to a paid plan. On mobile, the purchase flows through the platform's native billing (App Store or Google Play). On web, the user enters payment details in a secure checkout. After subscribing, all premium features unlock instantly. The user can later upgrade, downgrade, or cancel their subscription from account settings. Cancellations take effect at the end of the current billing period. If a payment fails, the user receives a notification and has a 3-day grace period before losing access.

**Why this priority**: Revenue is the core business objective of Phase 2. Without billing, no other engagement feature generates value.

**Independent Test**: A user can subscribe to a paid plan, see premium features unlock immediately, manage their subscription (upgrade/downgrade/cancel), and receive an invoice — delivering a complete monetization flow.

**Acceptance Scenarios**:

1. **Given** a free-tier user, **When** they attempt to access a premium feature, **Then** they see an upgrade prompt with plan details, pricing, and a clear call to action.
2. **Given** a user on a mobile device, **When** they choose to subscribe, **Then** the purchase flows through the platform's native billing (Apple/Google) and completes without leaving the app.
3. **Given** a user on web, **When** they subscribe, **Then** they complete a PCI-compliant checkout, their payment method is saved, and they receive an auto-generated receipt.
4. **Given** a subscribed user, **When** they upgrade to a higher plan mid-cycle, **Then** charges are prorated and the new features unlock instantly.
5. **Given** a subscribed user, **When** they cancel, **Then** the cancellation takes effect at the end of the current billing period and they retain access until then.
6. **Given** a user whose payment fails, **When** the grace period (3 days) elapses without successful payment, **Then** their subscription is downgraded and they receive a clear notification.
7. **Given** a subscribed user, **When** they view their billing history, **Then** they see a list of all invoices with downloadable receipts.

---

### User Story 2 — End User Receives Notifications Across Channels (Priority: P1)

An authenticated user receives timely notifications through their preferred channels — push notifications on mobile and desktop, in-app alerts, and transactional emails. They can view all notifications in a centralized notification center, mark items as read, and tap to navigate to the relevant content. The user controls which categories of notifications they receive and can set quiet hours to suppress non-urgent alerts during specified times.

**Why this priority**: Notifications drive re-engagement and are critical for subscription lifecycle events (payment failures, renewal reminders, receipt delivery).

**Independent Test**: A user receives a push notification, sees it in the in-app notification center, taps to navigate to the relevant screen, and adjusts their notification preferences — delivering a complete engagement loop.

**Acceptance Scenarios**:

1. **Given** a user with push enabled on iOS, **When** a notification is triggered, **Then** it is delivered via APNs and a delivery receipt is logged.
2. **Given** a user on web, **When** an in-app alert fires, **Then** a dismissible toast appears, auto-dismisses after 5 seconds, and tapping it navigates to the relevant screen.
3. **Given** any user, **When** they open the notification center, **Then** they see a scrollable list of all notifications with unread badges, read/unread state, and deep-link capability.
4. **Given** a user who reads a notification on their phone, **When** they open the app on another device, **Then** the notification is already marked as read (cross-device sync).
5. **Given** a user, **When** they configure quiet hours (e.g., 10 PM to 7 AM), **Then** non-urgent push notifications are suppressed during that window.
6. **Given** a user who opts out of a notification category, **When** a notification of that category fires, **Then** it is not delivered to that user.

---

### User Story 3 — Admin Manages Users and System Configuration (Priority: P1)

An administrator logs into the admin dashboard — a standalone web application on its own subdomain — and manages the user base: searching, filtering, viewing details, editing roles, suspending accounts, forcing password resets or logouts, and performing bulk actions. They also configure system-wide settings: app name, feature flag toggles, plan/pricing management, and notification templates. Every admin action is recorded in an immutable audit log that is searchable and exportable.

**Why this priority**: Admin tooling is essential for day-to-day operations, user support, and business management. Without it, everything requires database-level access.

**Independent Test**: An admin can log in, search for a user, change their role, toggle a feature flag, update a plan price, and see all actions in the audit log — delivering a complete operational workflow.

**Acceptance Scenarios**:

1. **Given** an admin, **When** they access the admin dashboard URL, **Then** they are authenticated via the existing auth system and authorized via RBAC.
2. **Given** an admin on the users page, **When** they search and filter the user list, **Then** results are paginated and can be sorted by registration date, role, or subscription status.
3. **Given** an admin viewing a user's detail, **When** they suspend the account, **Then** the user's active sessions are terminated and they cannot log in until reactivated.
4. **Given** an admin, **When** they toggle a feature flag from the system configuration page, **Then** the change propagates to all connected clients near-instantly.
5. **Given** an admin, **When** they update plan pricing, **Then** the new price applies to future subscriptions while existing subscribers retain their current rate until renewal.
6. **Given** any admin action, **When** the action completes, **Then** an immutable audit log entry is created with the admin's identity, action type, target, and timestamp.
7. **Given** an admin viewing the audit log, **When** they search and filter entries, **Then** results can be exported for compliance reporting.

---

### User Story 4 — Admin Manages Content via CMS (Priority: P1)

An administrator creates and manages structured content (blog posts, help articles, announcements) through the admin dashboard. They define content types with configurable fields, create drafts, preview content, and publish or unpublish as needed. All content is versioned. Published content is served through a read-only API that supports filtering by type, status, tag, and locale, with built-in caching for performance.

**Why this priority**: Content management powers marketing pages, help centers, and announcements — all of which drive user acquisition and retention.

**Independent Test**: An admin can create a content type, author a content item with rich text, publish it, and retrieve it via the content delivery API — delivering a complete content workflow.

**Acceptance Scenarios**:

1. **Given** an admin, **When** they define a new content type (e.g., "Blog Post") with custom fields (title, body, featured image, tags), **Then** the content type is saved and available for content creation.
2. **Given** an admin authoring content, **When** they save a draft, **Then** the draft is persisted and does not appear in the public content API.
3. **Given** an admin, **When** they publish a content item, **Then** it becomes available via the content delivery API immediately.
4. **Given** a published content item, **When** it is edited, **Then** a new version is created and the previous version is preserved.
5. **Given** a consumer of the content API, **When** they request content filtered by type, status, tag, or locale, **Then** the API returns matching results with appropriate caching headers.

---

### User Story 5 — End User Contacts Support (Priority: P2)

A user encounters an issue and opens the in-app support form. They fill in a subject and message, optionally attach a screenshot, and submit. The system automatically captures relevant metadata (device info, app version, subscription status, user ID) and routes the submission to the configured support channel. The user receives a confirmation that their request was received.

**Why this priority**: Support is important for user retention but is a simpler feature that does not block other Phase 2 work.

**Independent Test**: A user can open the support form, fill in details, attach a screenshot, submit, and see confirmation — delivering a complete support contact flow.

**Acceptance Scenarios**:

1. **Given** an authenticated user, **When** they open the support form, **Then** they see fields for subject, message, and an optional screenshot attachment.
2. **Given** a user submitting a support request, **When** they tap submit, **Then** the system attaches device metadata (OS, app version, user ID, subscription status) automatically.
3. **Given** a submitted support request, **When** submission succeeds, **Then** the user sees a confirmation message and the request is routed to the configured support channel.

---

### User Story 6 — Admin Views Revenue Analytics (Priority: P1)

An administrator navigates to the revenue overview in the admin dashboard and sees key business metrics: monthly recurring revenue (MRR), active subscriber count, churn rate, and trial-to-paid conversion rate. They can drill down by plan, time period, and geography to understand revenue trends. The data updates in near-real-time as subscriptions change.

**Why this priority**: Revenue visibility is essential for business decision-making and is tightly coupled with the subscription system.

**Independent Test**: An admin can view MRR, subscriber count, and churn rate on the dashboard and drill down by plan and time period — delivering a complete revenue visibility flow.

**Acceptance Scenarios**:

1. **Given** an admin on the revenue overview, **When** they load the page, **Then** they see MRR, active subscribers, churn rate, and trial conversion rate.
2. **Given** an admin, **When** they filter by a specific plan, **Then** revenue metrics update to reflect only that plan's subscribers.
3. **Given** an admin, **When** they select a time period (e.g., last 30 days, last quarter), **Then** metrics and trend graphs update accordingly.
4. **Given** an admin, **When** they drill down by geography, **Then** they see revenue distribution by region.
5. **Given** a new subscription event, **When** the admin refreshes the dashboard, **Then** the metrics reflect the change.

---

### User Story 7 — Developer Uses Feature Flags to Control Rollouts (Priority: P2)

A developer creates a boolean feature flag from the admin dashboard, assigns it a descriptive name, owner, and description. The flag defaults to OFF and is evaluated server-side. They can target the flag globally or by user segment. When the flag is no longer needed, they archive it (making it read-only) or delete it. Changes propagate to all clients near-instantly.

**Why this priority**: Feature flags are a developer-facing utility that improves deployment safety, but are not user-facing and can be deferred behind core P1 work.

**Independent Test**: A developer can create a flag, toggle it on for a segment, verify that the flag value is reflected in the app, and then archive the flag — delivering a complete flag lifecycle.

**Acceptance Scenarios**:

1. **Given** an admin or developer, **When** they create a new feature flag, **Then** it is created with a default value of OFF, a required name, owner, and description.
2. **Given** an active feature flag, **When** it is toggled ON globally, **Then** all server-side evaluations return ON near-instantly.
3. **Given** an active feature flag, **When** it is targeted to a specific user segment, **Then** only users in that segment see the flag as ON.
4. **Given** a feature flag that is no longer needed, **When** an admin archives it, **Then** the flag becomes read-only and continues to evaluate to its last value.
5. **Given** an archived feature flag, **When** an admin deletes it, **Then** it is removed from the system permanently.

---

### User Story 8 — Web Visitor Discovers Content via SEO (Priority: P2)

A potential user searches for a topic on a search engine and finds a page from the application in the results. The result displays a rich snippet with title, description, and structured metadata. The page loads server-rendered (or statically generated) content, so search engines index it fully. The sitemap is auto-generated and kept up to date with published content. Canonical URLs prevent duplicate content issues.

**Why this priority**: SEO drives organic acquisition but is only relevant for web and does not block core product functionality.

**Independent Test**: A public page renders with correct meta tags (title, description, OG, Twitter Cards), appears in the auto-generated sitemap, has a canonical URL, and loads with server-rendered content — delivering a complete discoverability flow.

**Acceptance Scenarios**:

1. **Given** a public page, **When** it is rendered, **Then** it has a unique title, meta description, Open Graph tags, and Twitter Card tags.
2. **Given** CMS-managed content, **When** a content item is published, **Then** its metadata is dynamically populated from the CMS fields.
3. **Given** the application, **When** a search engine crawls the sitemap, **Then** the auto-generated sitemap includes all public pages with lastmod timestamps and hreflang attributes.
4. **Given** the robots.txt file, **When** a crawler reads it, **Then** admin and authenticated routes are excluded.
5. **Given** any public page, **When** it loads, **Then** critical content is server-side rendered (or statically generated) without requiring client-side JavaScript.
6. **Given** a page with multiple possible URLs, **When** it is rendered, **Then** a canonical URL tag is present, and non-canonical URLs 301-redirect to the canonical.

---

### Edge Cases

- What happens when a user's subscription is managed by Apple/Google but they try to manage it on web? The web UI displays a message directing them to manage billing through the platform where they subscribed.
- What happens when a mobile receipt validation fails? The system retries validation; the user retains access during retry attempts until a definitive rejection is received.
- What happens when a user subscribes on iOS and logs in on Android? The entitlement engine recognizes the cross-platform subscription and unlocks premium features on all platforms.
- What happens when a push notification token becomes stale? The system removes invalid tokens on delivery failure and prompts the user to re-enable notifications on next app launch.
- What happens when a notification is triggered during a user's quiet hours? The notification is held and delivered when quiet hours end (or suppressed if it is time-sensitive and has expired).
- What happens when two admins edit the same content item simultaneously? The second save is rejected with a conflict error showing who made the conflicting change, prompting a refresh.
- What happens when a feature flag is archived but code still references it? The flag continues to evaluate to its last value; the system logs a warning for flags that are archived but still being evaluated.
- What happens when a plan is deleted but users are still subscribed to it? The plan is soft-deleted; existing subscribers retain their entitlements and pricing until they change plans.
- What happens when a transactional email fails to send? The system retries with exponential backoff and logs the failure; critical emails (password reset, verification) are retried up to 3 times.
- What happens when the sitemap exceeds the search-engine size limit? The system automatically splits into a sitemap index with multiple child sitemaps.

## Requirements *(mandatory)*

### Functional Requirements

**Subscription & Billing**

- **FR-001** (BILL-01): System MUST provide a plan catalog with at minimum two tiers (Free and Premium), configurable feature gates per plan, monthly and annual billing intervals, multi-currency support, and admin-editable plan metadata (name, description, features list, pricing).
- **FR-002** (BILL-02): System MUST support the full subscription lifecycle — subscribe, upgrade, downgrade, cancel, and reactivate — with proration on mid-cycle changes, end-of-billing-period cancellation, and a configurable grace period (default 3 days) for failed payments before access is revoked.
- **FR-003** (BILL-03): System MUST support platform-native in-app purchases on iOS (App Store) and Android (Google Play), including server-side receipt validation, real-time subscription sync via platform webhooks, and messaging within the app when billing is managed by the mobile platform.
- **FR-004** (BILL-04): System MUST provide PCI-compliant web payment processing with saved payment methods, an invoice history page, and auto-generated receipts for every transaction.
- **FR-005** (BILL-07): System MUST implement an entitlement engine that maps plans to feature access, enforces entitlements on both server and client, displays upgrade prompts when gated features are accessed, and propagates entitlement changes instantly when a subscription changes.

**Notifications & Messaging**

- **FR-006** (NOTIF-01): System MUST deliver cross-platform push notifications via iOS APNs, Android FCM, Web Push API, and desktop native mechanisms, with push token lifecycle management (registration, refresh, invalidation), delivery receipts, and support for silent push.
- **FR-007** (NOTIF-02): System MUST provide user-configurable notification preferences with per-category opt-in/out, quiet hours scheduling, and cross-device sync of preference state.
- **FR-008** (NOTIF-04): System MUST provide an in-app notification center with a scrollable list of notifications, unread badge count, read/unread state management, deep-link navigation on tap, server-side persistence, and cross-device sync.
- **FR-009** (NOTIF-05): System MUST display real-time in-app alerts as transient, dismissible toasts with tap-to-navigate behavior and configurable auto-dismiss duration (default 5 seconds).
- **FR-010** (NOTIF-06): System MUST send transactional emails from templates (welcome, email verification, password reset, subscription confirmation, payment receipt) with dynamic content injection, one-click unsubscribe links for non-critical emails, and delivery tracking.

**Feature Flags**

- **FR-011** (FF-01): System MUST support boolean feature flags that can be toggled globally or per user segment, evaluated server-side, defaulting to OFF, with near-instant propagation of changes.
- **FR-012** (FF-04): System MUST provide flag lifecycle management from the admin dashboard — create, archive, and delete — where archived flags are read-only and every flag has a required owner and description.

**Admin Dashboard**

- **FR-013** (ADMIN-01): System MUST provide a standalone, web-based admin panel hosted on its own subdomain with its own build pipeline, protected by the existing RBAC system, with a responsive desktop-first layout.
- **FR-014** (ADMIN-02): System MUST provide user management in the admin panel — list, search, filter, and paginate users; view user details; edit roles; suspend and reactivate accounts; force password reset and force logout; and perform bulk actions on selected users.
- **FR-015** (ADMIN-03): System MUST provide a subscription and revenue overview displaying MRR, active subscriber count, churn rate, and trial-to-paid conversion rate, with drill-down capability by plan, time period, and geography.
- **FR-016** (ADMIN-04): System MUST provide a system configuration section in the admin panel for managing app-wide settings, feature flag toggles, plan and pricing management, and notification template editing.
- **FR-017** (ADMIN-05): System MUST maintain an immutable audit log of all admin actions with the acting admin's identity, action type, target entity, timestamp, and before/after state. The log MUST be searchable, filterable, and exportable.

**SEO & Web Discoverability**

- **FR-018** (SEO-01): System MUST render unique, structured metadata on every public page — title, meta description, Open Graph tags, and Twitter Card tags — with the ability to populate metadata dynamically from CMS content.
- **FR-019** (SEO-02): System MUST auto-generate a sitemap including all public pages with lastmod timestamps and hreflang attributes for localized content, and provide a robots.txt that excludes admin and authenticated routes.
- **FR-020** (SEO-04): System MUST enforce canonical URLs on all public pages, support configurable 301 redirects, and maintain a consistent trailing-slash policy.
- **FR-021** (SEO-05): System MUST server-side render or statically generate all public-facing pages so that critical content is fully indexable without client-side JavaScript execution. Authenticated pages may be client-rendered.

**CMS-Lite**

- **FR-022** (CMS-01): System MUST support admin-definable structured content types with configurable fields (text, rich text, image, date, select, etc.) and content versioning.
- **FR-023** (CMS-02): System MUST provide content CRUD in the admin panel — create, edit, publish, unpublish, and archive content items — with draft vs. published state management and a rich text editor.
- **FR-024** (CMS-03): System MUST expose a read-only content delivery API that supports filtering by content type, publication status, tags, and locale, with localized content support and cacheable responses.

**Contact & Support**

- **FR-025** (PLAT-07): System MUST provide an in-app support form with subject, message body, and optional screenshot attachment. The system MUST auto-capture device metadata (OS, app version, user ID, subscription status) and route submissions to a configurable support channel.

### Key Entities

- **Plan**: Subscription tier definition — ID, name, description, feature list, monthly price, annual price, currency, billing interval options, active/archived status.
- **Subscription**: Active user subscription — ID, user ID, plan ID, status (active, past_due, canceled, expired), current period start/end, billing platform (web, iOS, Android), payment method reference, grace period end date.
- **Entitlement**: Feature access grant — plan ID, feature key, access level (boolean or usage limit).
- **Invoice**: Billing transaction record — ID, subscription ID, amount, currency, status (paid, failed, refunded), issued date, receipt URL.
- **Notification**: Persisted notification record — ID, user ID, category, title, body, deep-link target, read/unread state, created timestamp.
- **Notification Preference**: Per-user channel and category settings — user ID, category, channel (push, email, in-app), enabled flag, quiet hours start/end.
- **Push Token**: Device push registration — user ID, device ID, platform (iOS, Android, web, desktop), token value, last refreshed timestamp.
- **Feature Flag**: Runtime toggle — ID, key, description, owner, default value, status (active, archived), segment targeting rules.
- **Content Type**: CMS schema definition — ID, name, field definitions (name, type, required, default), version, created/updated timestamps.
- **Content Item**: CMS content instance — ID, content type ID, field values, status (draft, published, archived), version number, locale, author ID, created/published/updated timestamps.
- **Audit Entry (Admin)**: Immutable action record — ID, admin user ID, action type, target entity type and ID, before/after state snapshot, timestamp.
- **Support Request**: Contact submission — ID, user ID, subject, message, screenshot attachment, device metadata, routing destination, created timestamp.
- **Email Template**: Transactional email definition — ID, template key (welcome, verification, reset, subscription, receipt), subject line, body template, dynamic field mappings.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A free-tier user can discover a premium feature, subscribe, and have all gated features unlock within 60 seconds of payment confirmation.
- **SC-002**: Subscription lifecycle operations (upgrade, downgrade, cancel, reactivate) complete within 30 seconds and are reflected across all platforms immediately.
- **SC-003**: Platform-native in-app purchases on iOS and Android validate server-side and sync entitlements within 10 seconds of purchase completion.
- **SC-004**: Push notifications achieve delivery receipt confirmation on >= 95% of active, opted-in devices.
- **SC-005**: Transactional emails (verification, password reset, receipts) are dispatched within 60 seconds of the triggering event.
- **SC-006**: Notification preference changes (opt-out, quiet hours) take effect within 5 seconds and are respected on the next notification event.
- **SC-007**: The admin dashboard loads within 3 seconds and user search returns results within 2 seconds for a user base of 100,000+.
- **SC-008**: All admin actions are logged in the audit trail with zero gaps — 100% of admin write operations produce an audit entry.
- **SC-009**: Feature flag changes propagate to all connected clients within 5 seconds of toggle.
- **SC-010**: CMS content published via the admin panel is available through the content delivery API within 10 seconds.
- **SC-011**: All public pages pass a structured-data validation check (valid OG tags, Twitter Cards, canonical URL, sitemap inclusion) with zero errors.
- **SC-012**: Server-rendered public pages achieve a Lighthouse SEO score of >= 90.
- **SC-013**: Revenue analytics (MRR, churn, subscriber count) are accurate to within a 5-minute lag of real subscription events.
- **SC-014**: Failed payment grace period (3 days) is enforced — no user loses access before the grace period expires, and all users lose access after it does.

### Assumptions

- Phase 1 (001-b2c-foundation) is complete and stable — auth, sessions, RBAC, API layer, data layer, CI/CD, and theming are fully operational.
- Apple and Google developer accounts with billing capabilities are configured before testing in-app purchase flows.
- A PCI-compliant payment processing provider is available for web billing.
- A transactional email delivery provider is available for all environments.
- Push notification credentials (APNs certificates, FCM keys, VAPID keys) are configured per platform.
- The admin dashboard subdomain and hosting infrastructure are provisioned before deployment.
- The spec remains technology-agnostic; success criteria are measured at the functional level, not the implementation level.
- Multi-currency support requires exchange rate configuration but does not require real-time rate feeds — rates are admin-managed.
