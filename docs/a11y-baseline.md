# Accessibility Baseline Guidelines — Phase 1

## Overview

All Phase 1 UI components MUST follow these accessibility patterns per Constitution Article V.

## Required Patterns

### Form Controls

Every form input MUST have:
- A visible `<label>` element associated via `htmlFor`/`id`
- `aria-describedby` pointing to help text or error messages
- `aria-invalid="true"` when validation fails
- `aria-required="true"` for required fields

```tsx
<label htmlFor="email">Email address</label>
<input
  id="email"
  type="email"
  aria-describedby="email-error email-help"
  aria-invalid={!!error}
  aria-required="true"
/>
{error && <p id="email-error" role="alert">{error}</p>}
<p id="email-help">We'll never share your email.</p>
```

### Interactive Elements

- All buttons MUST have visible text or `aria-label`
- Icon-only buttons MUST have `aria-label`
- Links MUST have descriptive text (not "click here")
- Toggle switches MUST have `role="switch"` and `aria-checked`

### Navigation

- Use `<nav>` with `aria-label` for navigation regions
- Use `<main>` for primary content
- Use `<header>` and `<footer>` for page structure
- Use heading hierarchy (`h1` → `h2` → `h3`) without skipping levels

### Focus Management

- All interactive elements MUST be keyboard accessible
- Focus order MUST follow visual order
- Modal dialogs MUST trap focus
- After form submission, focus MUST move to the result message

### Color & Contrast

- Text MUST meet WCAG AA contrast ratio (4.5:1 for normal text, 3:1 for large text)
- Information MUST NOT be conveyed by color alone
- Design tokens are validated for contrast in the build pipeline

### Loading States

- Use `aria-busy="true"` on containers loading content
- Use `aria-live="polite"` for non-critical updates
- Use `aria-live="assertive"` for error messages

## Enforcement

- All UI tasks in Phase 1 MUST follow these patterns
- Components that fail a11y review will be blocked from merge
- Automated contrast validation runs in the token pipeline
