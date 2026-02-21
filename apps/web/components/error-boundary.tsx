'use client';

import React from 'react';
import { messages } from '@b2c/ui-web/i18n/messages';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * React error boundary component that catches rendering errors in its subtree.
 *
 * Displays a user-friendly fallback UI with a retry button.
 * Logs error details for observability.
 *
 * Usage:
 *   <ErrorBoundary>
 *     <MyComponent />
 *   </ErrorBoundary>
 *
 *   <ErrorBoundary fallback={<CustomFallback />}>
 *     <MyComponent />
 *   </ErrorBoundary>
 */
export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Structured error logging for observability
    console.error(
      JSON.stringify({
        level: 'ERROR',
        message: 'React error boundary caught an error',
        component: 'ErrorBoundary',
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
      }),
    );
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          role="alert"
          aria-live="assertive"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '200px',
            padding: 'var(--spacing-lg, 2rem)',
            textAlign: 'center',
            fontFamily: 'var(--font-family-body, system-ui, sans-serif)',
          }}
        >
          <div
            style={{
              maxWidth: '480px',
              padding: 'var(--spacing-lg, 2rem)',
              borderRadius: 'var(--radius-lg, 12px)',
              backgroundColor: 'var(--color-surface-error, #fef2f2)',
              border: '1px solid var(--color-border-error, #fecaca)',
            }}
          >
            <h2
              style={{
                fontSize: 'var(--font-size-lg, 1.25rem)',
                fontWeight: 'var(--font-weight-semibold, 600)',
                color: 'var(--color-text-error, #dc2626)',
                marginBottom: 'var(--spacing-sm, 0.75rem)',
              }}
            >
              {messages['common.error']}
            </h2>
            <p
              style={{
                color: 'var(--color-text-secondary, #555)',
                marginBottom: 'var(--spacing-md, 1.5rem)',
                lineHeight: 'var(--line-height-body, 1.5)',
              }}
            >
              An unexpected error occurred while rendering this page. Please try
              again or contact support if the problem persists.
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details
                style={{
                  marginBottom: 'var(--spacing-md, 1rem)',
                  textAlign: 'left',
                  fontSize: 'var(--font-size-sm, 0.875rem)',
                  color: 'var(--color-text-secondary, #666)',
                }}
              >
                <summary style={{ cursor: 'pointer', marginBottom: '0.5rem' }}>
                  Error details
                </summary>
                <pre
                  style={{
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    padding: '0.75rem',
                    backgroundColor: 'var(--color-surface-code, #f5f5f5)',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    overflow: 'auto',
                    maxHeight: '200px',
                  }}
                >
                  {this.state.error.message}
                  {'\n\n'}
                  {this.state.error.stack}
                </pre>
              </details>
            )}
            <button
              type="button"
              onClick={this.handleReset}
              aria-label={messages['common.retry']}
              style={{
                padding: 'var(--spacing-xs, 0.5rem) var(--spacing-md, 1.5rem)',
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
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
