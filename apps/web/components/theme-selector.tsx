'use client';

import { useEffect, useRef, useState } from 'react';
import { useTheme, type Theme } from '@/lib/theme-provider';
import { messages } from '@b2c/ui-web/i18n/messages';

interface ThemeOption {
  value: Theme;
  label: string;
  icon: React.ReactNode;
}

/** Sun icon for light theme */
function SunIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

/** Moon icon for dark theme */
function MoonIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

/** Monitor icon for system theme */
function MonitorIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}

const ICON_SIZE = 'h-4 w-4';

const themeOptions: ThemeOption[] = [
  { value: 'light', label: messages['theme.light'], icon: <SunIcon className={ICON_SIZE} /> },
  { value: 'dark', label: messages['theme.dark'], icon: <MoonIcon className={ICON_SIZE} /> },
  { value: 'system', label: messages['theme.system'], icon: <MonitorIcon className={ICON_SIZE} /> },
];

function getIconForTheme(theme: Theme) {
  const option = themeOptions.find((o) => o.value === theme);
  return option?.icon ?? null;
}

/**
 * ThemeSelector provides a dropdown menu to switch between light, dark,
 * and system themes. Fully accessible with keyboard navigation.
 */
export function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && open) {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  function handleSelect(value: Theme) {
    setTheme(value);
    setOpen(false);
    buttonRef.current?.focus();
  }

  function handleKeyDownOnOption(event: React.KeyboardEvent, value: Theme) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleSelect(value);
    }
  }

  const currentLabel =
    themeOptions.find((o) => o.value === theme)?.label ?? messages['theme.system'];

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${messages['theme.title']}: ${currentLabel}`}
        className="inline-flex items-center gap-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-border)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2"
      >
        {getIconForTheme(theme)}
        <span>{currentLabel}</span>
        <svg
          className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={messages['theme.title']}
          className="absolute right-0 z-10 mt-1 w-44 origin-top-right rounded-md border border-[var(--color-border)] bg-[var(--color-background)] shadow-lg focus:outline-none"
        >
          {themeOptions.map((option) => (
            <li
              key={option.value}
              role="option"
              aria-selected={theme === option.value}
              tabIndex={0}
              onClick={() => handleSelect(option.value)}
              onKeyDown={(e) => handleKeyDownOnOption(e, option.value)}
              className={`flex cursor-pointer items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-[var(--color-surface)] ${
                theme === option.value
                  ? 'text-[var(--color-primary)] font-medium'
                  : 'text-[var(--color-text-primary)]'
              }`}
            >
              {option.icon}
              <span>{option.label}</span>
              {theme === option.value && (
                <svg
                  className="ml-auto h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * ThemeToggleButton is a simpler inline toggle cycling through
 * light -> dark -> system. Useful for nav bars.
 */
export function ThemeToggleButton() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  function cycleTheme() {
    const order: Theme[] = ['light', 'dark', 'system'];
    const currentIndex = order.indexOf(theme);
    const next = order[(currentIndex + 1) % order.length];
    setTheme(next);
  }

  const label =
    themeOptions.find((o) => o.value === theme)?.label ?? messages['theme.system'];

  return (
    <button
      type="button"
      onClick={cycleTheme}
      aria-label={`${messages['theme.title']}: ${label}`}
      title={label}
      className="rounded-md p-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text-primary)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2"
    >
      {resolvedTheme === 'dark' ? (
        <MoonIcon className="h-5 w-5" />
      ) : (
        <SunIcon className="h-5 w-5" />
      )}
    </button>
  );
}
