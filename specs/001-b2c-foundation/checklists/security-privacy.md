# Security & Privacy Checklist: B2C Boilerplate — Phase 1: Foundation

**Purpose**: Validate that security and privacy requirements are complete, specific, and aligned across spec, plan, and data model — covering OWASP, GDPR, auth hardening, and secrets management.
**Created**: 2026-02-21
**Feature**: [spec.md](../spec.md) | [plan.md](../plan.md) | [data-model.md](../data-model.md)

## Authentication Hardening

- [ ] CHK001 - Is the password hashing algorithm specified or left to Supabase defaults? Are the cost parameters (work factor, memory, parallelism) documented? [Clarity, Spec §FR-001]
- [ ] CHK002 - Is account enumeration prevention defined for all auth endpoints — signup (generic "check email" response), login (same error for wrong email vs wrong password), and password reset? [Coverage, Spec §Edge Cases]
- [ ] CHK003 - Are brute-force thresholds specified for login attempts — SC-005 says "within 5 failed attempts" but FR-014 says auth rate limit is "10 req/min". Are these consistent? [Conflict, Spec §SC-005 vs §FR-014]
- [ ] CHK004 - Is the CAPTCHA provider choice documented (hCaptcha vs Cloudflare Turnstile) and the fallback behavior if the CAPTCHA service is unavailable? [Gap, Spec §FR-006]
- [ ] CHK005 - Are timing attack mitigations specified for auth endpoints (constant-time comparison for passwords, tokens)? [Gap, Spec §FR-029]
- [ ] CHK006 - Is the disposable email domain list size and update frequency specified — how many domains, how often updated, and what happens when a legitimate domain is falsely blocked? [Edge Case, Spec §FR-005]

## Token & Session Security

- [ ] CHK007 - Are JWT claims specified — what data is included in the access token payload (user_id, role, permissions, issued_at)? Is there a size limit concern? [Clarity, Spec §FR-007 vs data-model.md]
- [ ] CHK008 - Is the refresh token storage mechanism specified per platform (httpOnly cookie on web, Keychain on iOS, Keystore on Android, DPAPI on Windows)? [Completeness, Spec §FR-007]
- [ ] CHK009 - Is refresh token theft detection specified — what happens when a rotated-out refresh token is reused (should all tokens for that user be invalidated)? [Edge Case, Spec §FR-007]
- [ ] CHK010 - Are session fixation protections specified — is a new session ID issued after successful authentication? [Gap, Spec §FR-007]
- [ ] CHK011 - Is the token revocation propagation time acceptable — with 15-minute access tokens, a revoked user can continue accessing the API for up to 15 minutes? [Clarity, Spec §FR-008]

## OWASP Top 10 Coverage

- [ ] CHK012 - A01 Broken Access Control: Are RLS policies specified for every table in the data model? Is the `authorize()` function tested for all permission combinations? [Coverage, Spec §FR-029 vs data-model.md]
- [ ] CHK013 - A02 Cryptographic Failures: Is TLS 1.2+ enforcement specified for all connections (Supabase handles this, but is it documented)? Is HSTS specified? [Clarity, Spec §FR-028]
- [ ] CHK014 - A03 Injection: Is SQL injection prevention addressed by using PostgREST/Supabase client exclusively? Are Edge Functions validated against injection in their inputs? [Consistency, Spec §FR-029 vs plan.md]
- [ ] CHK015 - A04 Insecure Design: Is the threat model documented — what are the primary attack vectors for a B2C SaaS boilerplate? [Gap, Spec §FR-029]
- [ ] CHK016 - A05 Security Misconfiguration: Are default Supabase security settings reviewed — is the anon key properly scoped, are RLS policies enabled on all tables? [Gap, plan.md]
- [ ] CHK017 - A06 Vulnerable Components: Is dependency scanning specified in CI (Spec §FR-021 mentions "dependency audit") — which tool, what severity threshold triggers build failure? [Clarity, Spec §FR-021]
- [ ] CHK018 - A07 Auth Failures: Are all authentication failure scenarios enumerated (wrong password, expired token, revoked session, unverified email, suspended account, deactivated account)? [Coverage, Spec §FR-001/FR-007]
- [ ] CHK019 - A08 Software/Data Integrity: Are Supabase Edge Function deployments verified — is there a checksum or signature verification step? [Gap, plan.md]
- [ ] CHK020 - A09 Logging/Monitoring: Are security-relevant events logged (failed logins, permission denials, role changes, password resets)? [Gap, Spec §FR-029]
- [ ] CHK021 - A10 SSRF: Are Edge Functions that make outbound requests (e.g., disposable email API) protected against SSRF? [Gap, plan.md]

## GDPR Compliance

- [ ] CHK022 - Is the privacy policy content requirements specified — what specific sections must it contain for GDPR compliance? [Gap, Spec §FR-030]
- [ ] CHK023 - Is the cookie consent banner behavior fully specified — which cookies require consent, what happens when consent is denied, is the banner re-shown periodically? [Clarity, Spec §FR-030]
- [ ] CHK024 - Is the data processing record format specified — what fields are tracked, where is it stored, who has access? [Gap, Spec §FR-030]
- [ ] CHK025 - Is the right to erasure (account deletion) flow specified in Phase 1, or is it deferred? If deferred, is this a GDPR compliance risk? [Gap, Spec §FR-030 vs master spec §PROF-02]
- [ ] CHK026 - Is the right to access (data export) flow specified in Phase 1, or is it deferred? [Gap, Spec §FR-030 vs master spec §PROF-03]
- [ ] CHK027 - Are data retention periods specified for each entity — how long are profiles, sessions, consent entries, and MFA recovery codes retained? [Gap, data-model.md]
- [ ] CHK028 - Is the lawful basis for processing documented for each data category (profile data: contract, consent data: legal obligation, session data: legitimate interest)? [Gap, Spec §FR-030]
- [ ] CHK029 - Are PII fields explicitly marked in the data model — display_name, email, phone, bio, avatar, IP address, user_agent? [Gap, data-model.md]
- [ ] CHK030 - Is the data controller vs data processor relationship defined for Supabase as a third-party service? [Gap, Spec §FR-030]

## Secrets Management

- [ ] CHK031 - Is the boundary between "environment variables" and "vault-managed secrets" defined — which secrets use each mechanism? [Clarity, Spec §FR-031]
- [ ] CHK032 - Is the key rotation policy specified — which keys are rotated (API keys, JWT signing key, encryption keys), how often, and is zero-downtime rotation supported? [Gap, Spec §FR-031]
- [ ] CHK033 - Are service account permissions documented — does each service (CI, Edge Functions, admin panel) have least-privilege access? [Gap, Spec §FR-031]
- [ ] CHK034 - Is the `.env.example` file specified to contain ONLY placeholder values (no real secrets), and is there a CI check to prevent `.env` files from being committed? [Consistency, plan.md vs Spec §FR-031]

## Security Headers

- [ ] CHK035 - Are the specific Content-Security-Policy directives specified for the web app and admin panel? [Gap, Spec §FR-029]
- [ ] CHK036 - Are X-Frame-Options, X-Content-Type-Options, Referrer-Policy, and Permissions-Policy requirements enumerated? [Clarity, Spec §FR-029]
- [ ] CHK037 - Is CORS configuration specified — which origins are allowed for the API, admin panel, and mobile apps? [Gap, Spec §FR-029]

## Notes

- GDPR items (CHK022–CHK030) are critical — if right to erasure and right to access are deferred to later phases, this must be explicitly justified as the spec claims GDPR compliance baseline in Phase 1.
- OWASP items reference the 2021 OWASP Top 10 categories (A01–A10).
- Several items highlight potential conflicts between the spec's security claims and the plan's actual Supabase capabilities.
