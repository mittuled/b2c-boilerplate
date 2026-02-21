'use client';

import { useEffect } from 'react';

/**
 * Next.js App Router global error boundary.
 *
 * This component catches errors in the root layout itself. Since it replaces
 * the root layout when active, it must include its own <html> and <body> tags.
 * It cannot rely on the root layout's CSS or theme provider.
 *
 * See: https://nextjs.org/docs/app/api-reference/file-conventions/error#global-errorjs
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(
      JSON.stringify({
        level: 'ERROR',
        message: 'Global error boundary triggered',
        component: 'app/global-error.tsx',
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
    <html lang="en">
      <body
        style={{
          margin: 0,
          padding: 0,
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          backgroundColor: '#fafafa',
          color: '#1a1a1a',
        }}
      >
        <main
          role="alert"
          aria-live="assertive"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '2rem',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              maxWidth: '480px',
              padding: '2.5rem',
              borderRadius: '12px',
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}
          >
            <div
              aria-hidden="true"
              style={{
                fontSize: '3rem',
                marginBottom: '1rem',
              }}
            >
              &#9888;
            </div>
            <h1
              style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: '#111',
                marginBottom: '0.75rem',
              }}
            >
              Something went wrong
            </h1>
            <p
              style={{
                color: '#555',
                marginBottom: '2rem',
                lineHeight: 1.5,
              }}
            >
              A critical error occurred. Please try refreshing the page. If this
              continues, please contact support.
            </p>
            {error.digest && (
              <p
                style={{
                  fontSize: '0.875rem',
                  color: '#888',
                  marginBottom: '1rem',
                }}
              >
                Error reference: {error.digest}
              </p>
            )}
            <button
              type="button"
              onClick={reset}
              aria-label="Try again"
              style={{
                padding: '0.625rem 2rem',
                fontSize: '1rem',
                fontWeight: 500,
                color: '#fff',
                backgroundColor: '#2563eb',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
