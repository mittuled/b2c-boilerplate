'use client';

import { useEffect } from 'react';
import { messages } from '@b2c/ui-web/i18n/messages';

/**
 * Next.js App Router error boundary for the root route group.
 *
 * This component is rendered when an error occurs within the root layout's
 * children. It has access to the root layout's styles and theme.
 *
 * See: https://nextjs.org/docs/app/api-reference/file-conventions/error
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Structured error logging for observability
    console.error(
      JSON.stringify({
        level: 'ERROR',
        message: 'Unhandled error in route',
        component: 'app/error.tsx',
        error: {
          name: error.name,
          message: error.message,
          digest: error.digest,
        },
        timestamp: new Date().toISOString(),
      }),
    );
  }, [error]);

  return (
    <main
      role="alert"
      aria-live="assertive"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        padding: 'var(--spacing-lg, 2rem)',
        textAlign: 'center',
        fontFamily: 'var(--font-family-body, system-ui, sans-serif)',
      }}
    >
      <div
        style={{
          maxWidth: '480px',
          padding: 'var(--spacing-xl, 2.5rem)',
          borderRadius: 'var(--radius-lg, 12px)',
          backgroundColor: 'var(--color-surface-error, #fef2f2)',
          border: '1px solid var(--color-border-error, #fecaca)',
        }}
      >
        <div
          aria-hidden="true"
          style={{
            fontSize: '3rem',
            marginBottom: 'var(--spacing-md, 1rem)',
          }}
        >
          &#9888;
        </div>
        <h1
          style={{
            fontSize: 'var(--font-size-xl, 1.5rem)',
            fontWeight: 'var(--font-weight-bold, 700)',
            color: 'var(--color-text-heading, #111)',
            marginBottom: 'var(--spacing-sm, 0.75rem)',
          }}
        >
          {messages['common.error']}
        </h1>
        <p
          style={{
            color: 'var(--color-text-secondary, #555)',
            marginBottom: 'var(--spacing-lg, 2rem)',
            lineHeight: 'var(--line-height-body, 1.5)',
          }}
        >
          We encountered an unexpected error. Please try again. If the problem
          persists, contact our support team.
        </p>
        {error.digest && (
          <p
            style={{
              fontSize: 'var(--font-size-sm, 0.875rem)',
              color: 'var(--color-text-tertiary, #888)',
              marginBottom: 'var(--spacing-md, 1rem)',
            }}
          >
            Error reference: {error.digest}
          </p>
        )}
        <button
          type="button"
          onClick={reset}
          aria-label={messages['common.retry']}
          style={{
            padding: 'var(--spacing-xs, 0.5rem) var(--spacing-lg, 2rem)',
            fontSize: 'var(--font-size-md, 1rem)',
            fontWeight: 'var(--font-weight-medium, 500)',
            color: 'var(--color-text-on-primary, #fff)',
            backgroundColor: 'var(--color-primary, #2563eb)',
            border: 'none',
            borderRadius: 'var(--radius-md, 8px)',
            cursor: 'pointer',
          }}
        >
          {messages['common.retry']}
        </button>
      </div>
    </main>
  );
}
