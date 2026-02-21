# Feature Specification: B2C Boilerplate — Phase 3: Scale & Polish

**Feature Branch**: `003-b2c-scale-polish`
**Created**: 2026-02-21
**Status**: Draft
**Input**: B2C_Boilerplate_Initial_Spec.md — Phase 3 requirements (I18N, A11Y, OFF, ANLY, OBS, PLAT, DATA, NOTIF, DX)
**Phase Scope**: Scale & polish layer — internationalization, accessibility, offline resilience, analytics, observability, multi-platform delivery, and developer tooling that elevate the product from functional to world-ready

## Phasing Strategy

This spec is **Phase 3 of 4** derived from the master B2C Boilerplate Feature Spec. Each phase is a self-contained speckit feature with its own plan and tasks.

| Phase | Branch | Scope | Requirement IDs |
| ----- | ------ | ----- | --------------- |
| 1 — Foundation | `001-b2c-foundation` | Auth, sessions, profile, RBAC, API, data layer, CI/CD, theming, DX, security | AUTH-01–06, AUTH-08–09, SESS-01–02, PROF-01, PROF-04, RBAC-01, RBAC-03, API-01–04, DATA-01, DATA-03–04, CICD-01–03, CICD-05, THEME-01–02, DX-01, DX-05, SEC-01–03, SEC-05 |
| 2 — Monetization & Engagement | `002-b2c-monetization` | Billing, notifications, email, feature flags, admin dashboard, SEO, support | BILL-01–04, BILL-07, NOTIF-01–02, NOTIF-04–06, FF-01, FF-04, ADMIN-01–05, SEO-01–05, PLAT-07 |
| **3 — Scale & Polish** | `003-b2c-scale-polish` | i18n, a11y, offline, analytics, observability, platform delivery, RLS, developer tooling | I18N-01–04, A11Y-01–04, OFF-01–02, ANLY-01–02, OBS-01, OBS-03–04, PLAT-01–02, PLAT-04, DATA-02, DATA-05, NOTIF-07, DX-02–03 |
| 4 — Advanced | `004-b2c-advanced` | Passkeys, A/B testing, CMS extras, trials, advanced offline, webhooks, white-labeling | AUTH-03–04, AUTH-07, RBAC-02, SESS-03, BILL-05–06, NOTIF-03, FF-02–03, CMS-04–05, OFF-03–04, API-05–06, SEC-04, THEME-03, I18N-05, A11Y-05, OBS-02, OBS-05, ANLY-03, DX-04, DX-06, CICD-04, PLAT-03, PLAT-05–06, SEO-03 |

## User Scenarios & Testing *(mandatory)*

### User Story 1 — End User Uses the App in Their Language Including RTL (Priority: P1)

A user in Cairo opens the app for the first time. The system detects their device locale (Arabic) and automatically displays the interface in Arabic with a right-to-left layout. All text, navigation, icons, dates, times, numbers, and currency values render correctly for the Arabic locale. The user can also manually switch to French from settings and the entire UI — including CMS-managed content — re-renders in French with a left-to-right layout. If a specific piece of CMS content has not been translated to French, the system falls back to English gracefully.

**Why this priority**: Internationalization unlocks global markets. Without it, the product is limited to English-speaking audiences — a fraction of the addressable market.

**Independent Test**: A user can open the app, see it in their detected locale (including RTL for Arabic), switch languages, and confirm that all UI text, dates, numbers, and CMS content render correctly in each locale.

**Acceptance Scenarios**:

1. **Given** a user whose device is set to Arabic, **When** they launch the app for the first time, **Then** the interface displays in Arabic with a right-to-left layout.
2. **Given** a user viewing the app in Arabic, **When** they look at dates, times, numbers, and currency values, **Then** all values are formatted according to Arabic locale conventions.
3. **Given** a user viewing the app in Arabic, **When** they navigate through all screens, **Then** the entire layout is mirrored (navigation, icons, scroll direction, text alignment) with no visual breaks.
4. **Given** a user on any locale, **When** they switch to French in settings, **Then** the entire UI re-renders in French with a left-to-right layout immediately.
5. **Given** a CMS article that exists in English and Arabic but not French, **When** a French-locale user views it, **Then** the English version is displayed with a visible indicator that it is a fallback.
6. **Given** an admin, **When** they open the CMS translation editor, **Then** they can see the source text and target translation side by side for any locale.

---

### User Story 2 — End User with Disabilities Navigates the App (Priority: P1)

A visually impaired user navigates the entire app using a screen reader. Every interactive element is announced with its purpose and state. A motor-impaired user navigates using only a keyboard with a logical tab order and visible focus indicators. A photosensitive user has animations automatically reduced because their OS preference is set to "reduce motion." A user with low vision increases their system font size to 200%, and the app remains fully usable without content being cut off or overlapping.

**Why this priority**: Accessibility is both a legal obligation (ADA, EAA) and a moral imperative. An inaccessible product excludes millions of potential users and exposes the business to compliance risk.

**Independent Test**: A tester can navigate every screen using only a keyboard, verify screen reader announcements, confirm contrast ratios meet AA standards, increase font size to 200%, and confirm no content loss.

**Acceptance Scenarios**:

1. **Given** a keyboard-only user, **When** they press Tab through any screen, **Then** focus moves in a logical order with a visible focus indicator on every interactive element.
2. **Given** a screen reader user, **When** they navigate to an image, **Then** they hear descriptive alt text. When they navigate to a form field, they hear its label and any error state.
3. **Given** any screen in the app, **When** contrast is measured, **Then** normal text meets 4.5:1 contrast ratio and large text meets 3:1 against its background.
4. **Given** a user whose OS is set to "reduce motion", **When** they use the app, **Then** all animations are replaced with instant transitions or subtle fades.
5. **Given** a user who sets system font size to 200%, **When** they view any screen, **Then** all content remains readable and accessible without truncation or overlap.
6. **Given** a browser zoomed to 200% at 1280px viewport width, **When** the user views any screen, **Then** no horizontal scrolling is required.
7. **Given** any interactive element, **When** measured on mobile, **Then** its touch target is at least 44x44pt (iOS) or 48x48dp (Android).

---

### User Story 3 — End User Uses the App Offline (Priority: P1)

A commuter opens the app while riding a subway with no connectivity. Previously loaded content (e.g., their profile, recent articles, saved items) is still visible and browsable. A clear but non-intrusive indicator shows they are offline. When the train emerges above ground and connectivity returns, the app automatically detects the restored connection, syncs any pending state, and removes the offline indicator — all without the user having to refresh or take any action.

**Why this priority**: Users expect apps to work in low-connectivity environments. Offline support prevents a blank screen, reduces churn, and builds trust.

**Independent Test**: A tester can load key screens, disable network connectivity, confirm cached content is still visible with an offline indicator, re-enable connectivity, and confirm the indicator disappears and data refreshes.

**Acceptance Scenarios**:

1. **Given** a user who has previously loaded the app, **When** they lose network connectivity, **Then** critical read-only data (profile, previously viewed content) remains accessible from cache.
2. **Given** a user who is offline, **When** they view cached content, **Then** a stale-data indicator is visible so they know the data may not be current.
3. **Given** a user who is offline, **When** connectivity is lost, **Then** a non-intrusive offline indicator appears within 3 seconds.
4. **Given** a user who was offline, **When** connectivity is restored, **Then** the app detects the change, syncs pending state, refreshes stale data, and removes the offline indicator automatically.

---

### User Story 4 — Admin Views Analytics and Monitors System Health (Priority: P1)

A product manager logs into the admin dashboard and opens the analytics section. They see daily, weekly, and monthly active user trends, retention cohort tables (day 1, day 7, day 30), and funnel visualizations for key user journeys. They filter data by platform, subscription plan, locale, and date range. Separately, an operations engineer checks the system health dashboard and sees structured log streams, health check status for all dependencies, and error tracking with alerts configured for new error types and error-rate spikes.

**Why this priority**: Without analytics, the business is flying blind. Without observability, the engineering team cannot detect or diagnose production issues before users are impacted.

**Independent Test**: An admin can view DAU/WAU/MAU charts, filter by platform and locale, view retention cohorts, and inspect health check output. An engineer can view structured logs, see error groups, and confirm alerts fire on simulated failures.

**Acceptance Scenarios**:

1. **Given** an admin on the analytics dashboard, **When** they view user trends, **Then** they see DAU, WAU, and MAU over a configurable date range.
2. **Given** an admin, **When** they view retention cohorts, **Then** they see day-1, day-7, and day-30 retention rates broken down by cohort.
3. **Given** an admin, **When** they apply filters (platform, plan, locale, date range), **Then** all analytics charts and tables update to reflect the filtered data.
4. **Given** an admin, **When** they view funnel visualization for a key user journey, **Then** they see step-by-step conversion rates with drop-off percentages.
5. **Given** the health check endpoint, **When** called in shallow mode, **Then** it returns system status and version. When called in deep mode, it also returns dependency health for each connected service.
6. **Given** a new unhandled exception in production, **When** it occurs, **Then** it is captured, grouped with similar errors, and an alert is sent to the configured channel.
7. **Given** structured logs, **When** a request is traced, **Then** all log entries for that request share a correlation/trace ID and contain no PII.

---

### User Story 5 — End User Opens Deep Links Across Platforms (Priority: P2)

A user receives a shared link (e.g., to a specific article or profile) via a messaging app. When they tap it on their phone, the app opens directly to that content — or, if the app is not installed, they are taken to the app store and then routed to the correct content after installation (deferred deep linking). On desktop, the same link opens in the browser and navigates to the correct page. The app adapts its layout responsively whether viewed on a 320px phone, a tablet, or a 4K desktop monitor.

**Why this priority**: Deep linking and responsive layouts are growth multipliers. They reduce friction in sharing, re-engagement campaigns, and cross-platform usage, but the core product functions without them.

**Independent Test**: A tester can generate a shareable link, open it on mobile (with and without the app installed), confirm correct routing, and resize a browser window from 320px to 4K to verify responsive breakpoints.

**Acceptance Scenarios**:

1. **Given** a user with the app installed, **When** they tap a deep link, **Then** the app opens and navigates directly to the linked content.
2. **Given** a user without the app installed, **When** they tap a deep link, **Then** they are directed to the app store, and after installation the app opens to the originally linked content.
3. **Given** a shareable link, **When** generated by any user, **Then** the link works correctly across all supported platforms.
4. **Given** a web browser at 320px width, **When** the user views any screen, **Then** the layout adapts with appropriate breakpoints and remains fully usable up to 4K resolution.
5. **Given** a mobile app on a tablet, **When** the user rotates the device, **Then** the layout adapts between phone and tablet layouts appropriately.
6. **Given** a desktop app, **When** the user resizes below 800x600, **Then** the window does not shrink further and content remains usable.

---

### User Story 6 — End User Receives Real-Time Alerts (Priority: P1)

A user is browsing the app when a time-sensitive notification is triggered (e.g., a flash sale, a message from support, a security alert). The notification appears on their screen within 500 milliseconds of being sent. If the user was briefly disconnected and missed a notification, the system recovers the missed event and delivers it when connectivity is restored. The delivery mechanism works regardless of whether the user is on mobile, web, or desktop.

**Why this priority**: Real-time delivery is essential for time-sensitive communications like security alerts and transactional updates. Delayed or lost notifications erode trust.

**Independent Test**: A tester can trigger a notification, confirm it appears within 500ms on a connected client, simulate a brief disconnection, and confirm the missed notification is delivered upon reconnection.

**Acceptance Scenarios**:

1. **Given** a connected user, **When** a real-time notification is triggered, **Then** it is delivered and displayed within 500 milliseconds.
2. **Given** a user on any platform (mobile, web, desktop), **When** a real-time notification is sent, **Then** it is delivered via the appropriate transport for that platform.
3. **Given** a user who was briefly disconnected, **When** they reconnect, **Then** all missed notifications are recovered and delivered in order.
4. **Given** the real-time delivery system, **When** the primary transport is unavailable, **Then** the system degrades gracefully by queuing events and retrying delivery.

---

### User Story 7 — Developer Uses Debugging and Component Showcase Tools (Priority: P2)

A frontend developer working on a new feature opens the component showcase to browse all available UI components. Each component is displayed with interactive examples, usage documentation, prop/parameter descriptions, and automated accessibility checks. While debugging an issue, the developer uses the built-in network inspector to view API requests and responses, and the state inspector to view current application state. When the app is built for production, all debugging tools are automatically stripped out.

**Why this priority**: Developer tooling accelerates feature delivery and reduces defects, but is not user-facing and does not block any end-user functionality.

**Independent Test**: A developer can open the component showcase, browse components with examples and docs, run accessibility checks, open the network and state inspectors in development mode, and confirm they are absent in a production build.

**Acceptance Scenarios**:

1. **Given** a developer, **When** they open the component showcase, **Then** they see an interactive catalog of all UI components with usage examples and prop documentation.
2. **Given** a component in the showcase, **When** accessibility checks run, **Then** the results display any violations with severity and remediation guidance.
3. **Given** a developer in development mode, **When** they open the network inspector, **Then** they see all API requests and responses in real time.
4. **Given** a developer in development mode, **When** they open the state inspector, **Then** they see the current application state tree and can search/filter.
5. **Given** a production build, **When** the app is inspected, **Then** no debugging tools (network inspector, state inspector) are present in the bundle.

---

### Edge Cases

- What happens when a translation string is missing for the active locale? The system falls back through the locale chain (e.g., `es-MX` -> `es` -> `en`) and logs a warning for the missing key.
- What happens when a screen contains mixed RTL and LTR content (e.g., an Arabic paragraph with an English brand name)? Each text run renders in its correct direction using Unicode bidirectional algorithm rules.
- What happens when a screen reader encounters a dynamically updated region (e.g., a live notification count)? The region is announced via ARIA live region without interrupting the user's current focus.
- What happens when the app is opened offline for the first time (no cached data exists)? The user sees a friendly empty state explaining that content will load when connectivity is available.
- What happens when the analytics event queue grows very large during a period of high activity? Events are batched asynchronously and flushed in manageable chunks to avoid blocking the UI thread or overwhelming the collection endpoint.
- What happens when a health check dependency (e.g., a third-party service) is intermittently failing? The health endpoint reports degraded status for that dependency while the overall system remains operational, and an alert is triggered.
- What happens when a deep link points to content the user does not have permission to view? The user is routed to the app and shown an appropriate access-denied or login prompt rather than a broken page.
- What happens when a user's device clock is significantly wrong, affecting locale-aware date formatting? The system uses server-provided timestamps for critical data and formats them using the user's locale preferences.
- What happens when a forced app update is required but the user is in the middle of an important workflow? The force-update prompt appears but allows the user to complete their current action (e.g., saving a draft) before requiring the update.
- What happens when real-time delivery encounters a network partition lasting several minutes? Events are queued server-side, and the missed-event recovery mechanism delivers all queued events in order when the client reconnects.

## Requirements *(mandatory)*

### Functional Requirements

**Internationalization & Localization**

- **FR-001** (I18N-01): System MUST support multiple languages with all user-facing strings externalized into locale resource files. At launch, the system MUST support five locales: English (en), Arabic (ar), Spanish (es), French (fr), and Simplified Chinese (zh-CN). Arabic MUST validate correct RTL rendering. The system MUST auto-detect the user's locale from their device/browser settings and apply a fallback chain (specific locale -> language -> English) when a translation is missing.
- **FR-002** (I18N-02): System MUST provide full right-to-left layout support including UI mirroring (navigation, icons, scroll direction, text alignment) driven by the active locale. Content containing mixed text directions MUST render correctly.
- **FR-003** (I18N-03): System MUST format all dates, times, numbers, and currency values according to the active locale's conventions. Pluralization MUST follow CLDR rules. Relative time expressions (e.g., "3 hours ago") MUST be locale-aware.
- **FR-004** (I18N-04): System MUST support per-locale variants of CMS-managed content. The admin interface MUST provide a side-by-side translation editing experience. The content API MUST return content in the requested locale with automatic fallback to the default locale when a translation does not exist.

**Accessibility**

- **FR-005** (A11Y-01): System MUST meet WCAG 2.1 Level AA compliance. All interactive elements MUST be keyboard navigable with a logical focus order and visible focus indicators. Text MUST meet a minimum contrast ratio of 4.5:1, and large text MUST meet 3:1. No information MUST be conveyed by color alone.
- **FR-006** (A11Y-02): System MUST provide full screen reader support. All images MUST have descriptive alt text. All form inputs MUST have associated labels. Dynamic content updates MUST use ARIA live regions. The page structure MUST use semantic landmarks and a logical heading hierarchy.
- **FR-007** (A11Y-03): System MUST respect the operating system's "prefers-reduced-motion" setting by disabling or minimizing animations. All auto-playing media MUST be pauseable. No content MUST flash more than three times per second.
- **FR-008** (A11Y-04): System MUST remain fully usable when the system font size is increased to 200%. At 200% browser zoom on a 1280px viewport, no horizontal scrolling MUST be required. Touch targets on mobile MUST be at least 44x44pt (iOS) or 48x48dp (Android).

**Offline Support**

- **FR-009** (OFF-01): System MUST cache critical read-only data for offline access. The cache MUST be automatically populated during normal usage. When displaying cached data, the system MUST show a stale-data indicator so users understand the data may not be current.
- **FR-010** (OFF-02): System MUST detect online/offline connectivity state in real time and display a non-intrusive indicator when the user is offline. When connectivity is restored, the system MUST automatically sync any pending state and refresh stale data without requiring user action.

**Product Analytics**

- **FR-011** (ANLY-01): System MUST capture client-side user events including screen views, taps/clicks, and feature usage. Each event MUST conform to a standard schema containing: event name, timestamp, user identifier, session identifier, device information, platform, and custom properties. Event capture MUST be asynchronous and batched to avoid impacting UI performance.
- **FR-012** (ANLY-02): System MUST provide an analytics dashboard accessible to admins showing: daily/weekly/monthly active user trends, retention cohort tables (day 1, day 7, day 30), and funnel visualization for key user journeys. All views MUST support filtering by platform, subscription plan, locale, and date range.

**System Observability**

- **FR-013** (OBS-01): System MUST produce structured JSON logs with a correlation/trace ID on every request, configurable log levels (debug, info, warn, error), and automatic PII redaction for sensitive fields.
- **FR-014** (OBS-03): System MUST expose a health check endpoint that returns system status, application version, and dependency health. The endpoint MUST support both a shallow mode (status and version only) and a deep mode (including individual dependency checks). Alerting MUST be triggered when the health check reports failure.
- **FR-015** (OBS-04): System MUST capture all unhandled exceptions with contextual metadata, group them by root cause, and send alerts when a new error type appears or when the error rate spikes. Client-side crash reporting MUST be included. Errors MUST be classified as FATAL (app crash) or HANDLED (caught and degraded gracefully).

**Multi-Platform Delivery**

- **FR-016** (PLAT-01): System MUST support deep linking and universal links that route users directly to specific in-app content. Deferred deep linking MUST work for users who do not yet have the app installed. All shareable links MUST function correctly across all supported platforms.
- **FR-017** (PLAT-02): System MUST support auto-update mechanisms. Mobile apps MUST prompt users for force updates (blocking, when minimum version is not met) and soft updates (dismissible). Web apps MUST deploy updates instantly. Desktop apps MUST download updates in the background. The minimum required version MUST be configurable server-side.
- **FR-018** (PLAT-04): System MUST provide responsive and adaptive layouts. Web MUST be usable from 320px to 4K resolution with defined breakpoints. Mobile MUST adapt between phone and tablet form factors. Desktop MUST be resizable with a minimum window size of 800x600.

**Data Layer**

- **FR-019** (DATA-02): System MUST enforce row-level security ensuring users can only read and write their own data. Admin access policies MUST be explicitly defined. Billing and subscription data MUST be isolated per user/account. Any data intended to be publicly readable MUST be explicitly marked as such.
- **FR-020** (DATA-05): System MUST implement a soft-delete pattern using a `deleted_at` timestamp. Soft-deleted records MUST be excluded from standard queries by default. Admins MUST be able to view soft-deleted records. A configurable retention period (defaulting to 90 days) MUST govern when soft-deleted records are eligible for permanent purge.

**Notifications**

- **FR-021** (NOTIF-07): System MUST deliver real-time notifications to connected clients within 500 milliseconds. Delivery MUST be transport-agnostic (working across mobile, web, and desktop). When real-time delivery is not possible, the system MUST degrade gracefully by queuing events. A missed-event recovery mechanism MUST deliver all queued notifications when the client reconnects.

**Developer Experience**

- **FR-022** (DX-02): System MUST include an interactive component showcase (UI catalog) displaying all reusable UI components with usage examples, prop/parameter documentation, and automated accessibility checks.
- **FR-023** (DX-03): System MUST provide development-mode debugging tools including a network inspector (API request/response viewer) and a state inspector (application state viewer). These tools MUST be automatically stripped from production builds.

### Key Entities

- **Locale Resource**: Externalized string bundle — locale code, key-value translation pairs, fallback locale, last updated timestamp.
- **CMS Content Variant**: Localized version of CMS content — content ID, locale code, title, body, publication status, created/updated timestamps.
- **Analytics Event**: Client-side user action record — event name, timestamp, user ID, session ID, device info, platform, custom properties.
- **Retention Cohort**: Aggregated user return metric — cohort date, cohort size, day-1/day-7/day-30 return counts.
- **Health Check Result**: System status snapshot — overall status (healthy/degraded/unhealthy), application version, list of dependency statuses, check timestamp.
- **Error Group**: Clustered exception record — error signature, classification (FATAL/HANDLED), occurrence count, first seen, last seen, alert status.
- **Deep Link Route**: In-app content address — URL pattern, target screen/content, parameter schema, platform-specific configuration.
- **Cached Resource**: Offline-available data record — resource type, content, cached timestamp, stale threshold.
- **App Version Policy**: Update enforcement rule — platform, minimum required version, recommended version, force-update flag, message.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All five launch locales (en, ar, es, fr, zh-CN) render correctly with zero layout-breaking issues, including full RTL mirroring for Arabic.
- **SC-002**: The application passes a WCAG 2.1 Level AA audit with zero critical or major violations across all screens.
- **SC-003**: All interactive elements are keyboard navigable with a logical tab order, and 100% of form inputs have associated screen reader labels.
- **SC-004**: Cached content is accessible within 2 seconds of opening the app offline after a previous online session.
- **SC-005**: Real-time notifications are delivered to connected clients within 500 milliseconds of being triggered, measured at the 95th percentile.
- **SC-006**: Missed notifications during a connectivity gap of up to 5 minutes are recovered and delivered within 10 seconds of reconnection.
- **SC-007**: The analytics dashboard displays accurate DAU/WAU/MAU trends, retention cohorts, and funnels with data latency under 5 minutes.
- **SC-008**: The health check endpoint responds within 1 second (shallow) and 5 seconds (deep), and alerts fire within 60 seconds of a dependency failure.
- **SC-009**: Zero unhandled exceptions go untracked — 100% of production errors are captured, grouped, and available in the error tracking system.
- **SC-010**: Deep links route to the correct in-app content on all supported platforms, including deferred deep linking for new installs.
- **SC-011**: The application is usable at 200% browser zoom (1280px viewport) with no horizontal scrolling and at 200% system font size with no content truncation.
- **SC-012**: All touch targets on mobile meet minimum size requirements (44x44pt iOS, 48x48dp Android) on every screen.
- **SC-013**: Production builds contain zero debugging tool artifacts (network inspector, state inspector).
- **SC-014**: Row-level security prevents 100% of cross-user data access attempts — no user can read or modify another user's private data.
- **SC-015**: Soft-deleted records are invisible in standard queries and recoverable by admins within the 90-day default retention window.

### Assumptions

- Phase 1 (Foundation) and Phase 2 (Monetization & Engagement) are fully implemented and operational before Phase 3 work begins.
- The admin dashboard from Phase 2 is available for hosting the analytics dashboard and CMS translation management views.
- The notification infrastructure from Phase 2 is in place and Phase 3 extends it with real-time delivery guarantees.
- Professional translations for launch locales are provided by the business team; the system provides the infrastructure, not the translations themselves.
- WCAG 2.1 AA compliance is validated using industry-standard automated tooling supplemented by manual testing for keyboard and screen reader flows.
- The analytics event collection endpoint can handle batched events from all active clients without impacting API response times.
- The target platforms (mobile, web, desktop) all support the connectivity detection and offline caching capabilities required by the offline support requirements.
- The spec remains technology-agnostic; success criteria are measured at the functional level, not the implementation level.
