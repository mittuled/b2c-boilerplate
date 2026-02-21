'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type Theme = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

interface ThemeContextValue {
  /** The user-selected theme preference (light, dark, or system). */
  theme: Theme;
  /** Set the theme preference. Persists to localStorage and updates the DOM. */
  setTheme: (theme: Theme) => void;
  /** The actual resolved theme after applying system preference. */
  resolvedTheme: ResolvedTheme;
}

const STORAGE_KEY = 'theme';
const DARK_MEDIA_QUERY = '(prefers-color-scheme: dark)';

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * Resolves system preference to a concrete light/dark value.
 */
function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia(DARK_MEDIA_QUERY).matches ? 'dark' : 'light';
}

/**
 * Reads the persisted theme from localStorage, falling back to 'system'.
 */
function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'system';
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored;
    }
  } catch {
    // localStorage may be unavailable (e.g. private browsing, SSR)
  }
  return 'system';
}

/**
 * Applies the resolved theme to the document element via data-theme attribute
 * and updates the color-scheme CSS property for native form controls.
 */
function applyThemeToDOM(resolved: ResolvedTheme): void {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', resolved);
  document.documentElement.style.colorScheme = resolved;
}

/**
 * Inline script to prevent flash of incorrect theme on initial page load.
 * Runs synchronously before React hydrates, reading from localStorage.
 * Inject this as a <script> in the HTML <head>.
 */
export const themeInitScript = `
(function() {
  try {
    var theme = localStorage.getItem('${STORAGE_KEY}');
    var resolved = theme;
    if (!theme || theme === 'system') {
      resolved = window.matchMedia('${DARK_MEDIA_QUERY}').matches ? 'dark' : 'light';
    }
    document.documentElement.setAttribute('data-theme', resolved);
    document.documentElement.style.colorScheme = resolved;
  } catch(e) {}
})();
`;

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getStoredTheme);
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(getSystemTheme);

  const resolvedTheme: ResolvedTheme =
    theme === 'system' ? systemTheme : theme;

  // Listen for system preference changes
  useEffect(() => {
    const mql = window.matchMedia(DARK_MEDIA_QUERY);

    function handleChange(e: MediaQueryListEvent) {
      setSystemTheme(e.matches ? 'dark' : 'light');
    }

    mql.addEventListener('change', handleChange);
    return () => mql.removeEventListener('change', handleChange);
  }, []);

  // Apply theme to DOM whenever resolved theme changes
  useEffect(() => {
    applyThemeToDOM(resolvedTheme);
  }, [resolvedTheme]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(STORAGE_KEY, newTheme);
    } catch {
      // Silently fail if localStorage is unavailable
    }
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, setTheme, resolvedTheme }),
    [theme, setTheme, resolvedTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

/**
 * Hook to access the current theme and theme setter.
 * Must be used within a <ThemeProvider>.
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
