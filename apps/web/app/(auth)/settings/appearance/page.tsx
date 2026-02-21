'use client';

import { useTheme, type Theme } from '@/lib/theme-provider';
import { ThemeSelector } from '@/components/theme-selector';
import { messages } from '@b2c/ui-web/i18n/messages';

interface ThemePreviewCardProps {
  mode: 'light' | 'dark';
  label: string;
  isActive: boolean;
}

function ThemePreviewCard({ mode, label, isActive }: ThemePreviewCardProps) {
  const bg = mode === 'light' ? '#ffffff' : '#0f172a';
  const surface = mode === 'light' ? '#f8fafc' : '#1e293b';
  const text = mode === 'light' ? '#0f172a' : '#f8fafc';
  const textMuted = mode === 'light' ? '#64748b' : '#94a3b8';
  const border = mode === 'light' ? '#e2e8f0' : '#334155';
  const primary = mode === 'light' ? '#2563eb' : '#3b82f6';

  return (
    <div
      className={`rounded-lg border-2 p-1 transition-colors ${
        isActive
          ? 'border-[var(--color-primary)]'
          : 'border-[var(--color-border)]'
      }`}
      aria-label={`${label} ${messages['theme.title'].toLowerCase()} preview`}
    >
      <div
        className="rounded-md p-3 space-y-2"
        style={{ backgroundColor: bg }}
      >
        {/* Simulated header */}
        <div className="flex items-center gap-2">
          <div
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: primary }}
          />
          <div
            className="h-2 flex-1 rounded"
            style={{ backgroundColor: surface }}
          />
        </div>
        {/* Simulated content lines */}
        <div className="space-y-1.5">
          <div
            className="h-2 w-3/4 rounded"
            style={{ backgroundColor: text, opacity: 0.2 }}
          />
          <div
            className="h-2 w-1/2 rounded"
            style={{ backgroundColor: textMuted, opacity: 0.3 }}
          />
        </div>
        {/* Simulated card */}
        <div
          className="rounded p-2 space-y-1"
          style={{ backgroundColor: surface, border: `1px solid ${border}` }}
        >
          <div
            className="h-2 w-2/3 rounded"
            style={{ backgroundColor: text, opacity: 0.15 }}
          />
          <div
            className="h-2 w-1/3 rounded"
            style={{ backgroundColor: primary, opacity: 0.4 }}
          />
        </div>
      </div>
      <p
        className="mt-1 text-center text-xs font-medium"
        style={{ color: isActive ? undefined : 'var(--color-text-secondary)' }}
      >
        {label}
      </p>
    </div>
  );
}

export default function AppearancePage() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const themeChoices: { value: Theme; label: string }[] = [
    { value: 'light', label: messages['theme.light'] },
    { value: 'dark', label: messages['theme.dark'] },
    { value: 'system', label: messages['theme.system'] },
  ];

  return (
    <main className="mx-auto max-w-lg p-6">
      <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
        {messages['theme.title']}
      </h1>
      <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
        Customize how the application looks on your device.
      </p>

      {/* Quick selector dropdown */}
      <section className="mt-6" aria-labelledby="theme-selector-heading">
        <h2
          id="theme-selector-heading"
          className="text-sm font-medium text-[var(--color-text-primary)]"
        >
          {messages['theme.title']}
        </h2>
        <div className="mt-2">
          <ThemeSelector />
        </div>
      </section>

      {/* Radio group for theme selection */}
      <fieldset className="mt-8" aria-label={messages['theme.title']}>
        <legend className="text-sm font-medium text-[var(--color-text-primary)]">
          Choose a theme
        </legend>
        <div className="mt-3 grid grid-cols-3 gap-3">
          {themeChoices.map((choice) => {
            const isSelected = theme === choice.value;
            return (
              <label key={choice.value} className="cursor-pointer">
                <input
                  type="radio"
                  name="theme"
                  value={choice.value}
                  checked={isSelected}
                  onChange={() => setTheme(choice.value)}
                  className="sr-only"
                  aria-label={choice.label}
                />
                <div
                  className={`rounded-lg border-2 p-3 text-center text-sm transition-colors ${
                    isSelected
                      ? 'border-[var(--color-primary)] bg-[color-mix(in_srgb,var(--color-primary)_5%,transparent)]'
                      : 'border-[var(--color-border)] hover:border-[var(--color-text-muted)]'
                  }`}
                >
                  <span
                    className={
                      isSelected
                        ? 'font-medium text-[var(--color-primary)]'
                        : 'text-[var(--color-text-primary)]'
                    }
                  >
                    {choice.label}
                  </span>
                </div>
              </label>
            );
          })}
        </div>
      </fieldset>

      {/* Live preview */}
      <section className="mt-8" aria-labelledby="preview-heading">
        <h2
          id="preview-heading"
          className="text-sm font-medium text-[var(--color-text-primary)]"
        >
          Preview
        </h2>
        <div className="mt-3 grid grid-cols-2 gap-4">
          <ThemePreviewCard
            mode="light"
            label={messages['theme.light']}
            isActive={resolvedTheme === 'light'}
          />
          <ThemePreviewCard
            mode="dark"
            label={messages['theme.dark']}
            isActive={resolvedTheme === 'dark'}
          />
        </div>
      </section>

      {/* Status text */}
      <p className="mt-6 text-sm text-[var(--color-text-secondary)]" role="status">
        Currently using{' '}
        <span className="font-medium text-[var(--color-text-primary)]">
          {themeChoices.find((c) => c.value === theme)?.label}
        </span>{' '}
        theme
        {theme === 'system' && (
          <>
            {' '}(resolved to{' '}
            <span className="font-medium text-[var(--color-text-primary)]">
              {resolvedTheme}
            </span>
            )
          </>
        )}
        .
      </p>
    </main>
  );
}
