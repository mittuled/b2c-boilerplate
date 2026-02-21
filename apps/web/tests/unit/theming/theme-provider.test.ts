import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ---------------------------------------------------------------------------
// Types mirroring the ThemeProvider implementation
// ---------------------------------------------------------------------------

type Theme = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';

const STORAGE_KEY = 'theme';
const DARK_MEDIA_QUERY = '(prefers-color-scheme: dark)';

// ---------------------------------------------------------------------------
// Pure helpers extracted from the provider for isolated testing
// ---------------------------------------------------------------------------

function getStoredTheme(storage: Storage | null): Theme {
  if (!storage) return 'system';
  try {
    const stored = storage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored;
    }
  } catch {
    // unavailable
  }
  return 'system';
}

function resolveTheme(theme: Theme, systemPrefersDark: boolean): ResolvedTheme {
  if (theme === 'system') return systemPrefersDark ? 'dark' : 'light';
  return theme;
}

function applyThemeToDOM(
  resolved: ResolvedTheme,
  docElement: { setAttribute: (n: string, v: string) => void; style: { colorScheme: string } },
) {
  docElement.setAttribute('data-theme', resolved);
  docElement.style.colorScheme = resolved;
}

function persistTheme(storage: Storage | null, theme: Theme): boolean {
  if (!storage) return false;
  try {
    storage.setItem(STORAGE_KEY, theme);
    return true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Mock localStorage
// ---------------------------------------------------------------------------

function createMockStorage(): Storage {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => { store.set(key, value); },
    removeItem: (key: string) => { store.delete(key); },
    clear: () => store.clear(),
    get length() { return store.size; },
    key: (index: number) => [...store.keys()][index] ?? null,
  };
}

// ---------------------------------------------------------------------------
// Mock matchMedia
// ---------------------------------------------------------------------------

function createMockMatchMedia(prefersDark: boolean) {
  const listeners: Array<(e: MediaQueryListEvent) => void> = [];

  const mql = {
    matches: prefersDark,
    media: DARK_MEDIA_QUERY,
    onchange: null as null | ((e: MediaQueryListEvent) => void),
    addEventListener: (_event: string, cb: (e: MediaQueryListEvent) => void) => {
      listeners.push(cb);
    },
    removeEventListener: (_event: string, cb: (e: MediaQueryListEvent) => void) => {
      const i = listeners.indexOf(cb);
      if (i >= 0) listeners.splice(i, 1);
    },
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  };

  function setPrefersDark(value: boolean) {
    mql.matches = value;
    const event = { matches: value, media: DARK_MEDIA_QUERY } as MediaQueryListEvent;
    listeners.forEach((cb) => cb(event));
  }

  return { mql, setPrefersDark, getListenerCount: () => listeners.length };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Theme Provider - Initialization from localStorage', () => {
  it('should return "system" when localStorage is empty', () => {
    const storage = createMockStorage();
    expect(getStoredTheme(storage)).toBe('system');
  });

  it('should return "light" when localStorage has "light"', () => {
    const storage = createMockStorage();
    storage.setItem(STORAGE_KEY, 'light');
    expect(getStoredTheme(storage)).toBe('light');
  });

  it('should return "dark" when localStorage has "dark"', () => {
    const storage = createMockStorage();
    storage.setItem(STORAGE_KEY, 'dark');
    expect(getStoredTheme(storage)).toBe('dark');
  });

  it('should return "system" when localStorage has "system"', () => {
    const storage = createMockStorage();
    storage.setItem(STORAGE_KEY, 'system');
    expect(getStoredTheme(storage)).toBe('system');
  });

  it('should return "system" for invalid stored value', () => {
    const storage = createMockStorage();
    storage.setItem(STORAGE_KEY, 'invalid-value');
    expect(getStoredTheme(storage)).toBe('system');
  });

  it('should return "system" when storage is null', () => {
    expect(getStoredTheme(null)).toBe('system');
  });

  it('should handle localStorage throwing errors gracefully', () => {
    const storage = createMockStorage();
    const originalGetItem = storage.getItem;
    storage.getItem = () => { throw new Error('SecurityError'); };
    expect(getStoredTheme(storage)).toBe('system');
    storage.getItem = originalGetItem;
  });
});

describe('Theme Provider - Theme Toggle (light/dark/system)', () => {
  it('should resolve "light" to "light"', () => {
    expect(resolveTheme('light', false)).toBe('light');
    expect(resolveTheme('light', true)).toBe('light');
  });

  it('should resolve "dark" to "dark"', () => {
    expect(resolveTheme('dark', false)).toBe('dark');
    expect(resolveTheme('dark', true)).toBe('dark');
  });

  it('should resolve "system" to "light" when system prefers light', () => {
    expect(resolveTheme('system', false)).toBe('light');
  });

  it('should resolve "system" to "dark" when system prefers dark', () => {
    expect(resolveTheme('system', true)).toBe('dark');
  });
});

describe('Theme Provider - System Preference Detection (matchMedia)', () => {
  it('should detect system dark preference', () => {
    const { mql } = createMockMatchMedia(true);
    expect(mql.matches).toBe(true);
  });

  it('should detect system light preference', () => {
    const { mql } = createMockMatchMedia(false);
    expect(mql.matches).toBe(false);
  });

  it('should react to system preference changes', () => {
    const { mql, setPrefersDark } = createMockMatchMedia(false);

    let latestPrefersDark = mql.matches;
    mql.addEventListener('change', (e: MediaQueryListEvent) => {
      latestPrefersDark = e.matches;
    });

    expect(latestPrefersDark).toBe(false);

    setPrefersDark(true);
    expect(latestPrefersDark).toBe(true);

    setPrefersDark(false);
    expect(latestPrefersDark).toBe(false);
  });

  it('should support removing listeners', () => {
    const { mql, setPrefersDark, getListenerCount } = createMockMatchMedia(false);

    let callCount = 0;
    const handler = () => { callCount++; };

    mql.addEventListener('change', handler);
    expect(getListenerCount()).toBe(1);

    setPrefersDark(true);
    expect(callCount).toBe(1);

    mql.removeEventListener('change', handler);
    expect(getListenerCount()).toBe(0);

    setPrefersDark(false);
    expect(callCount).toBe(1); // not called again
  });
});

describe('Theme Provider - Persistence to localStorage', () => {
  it('should persist theme choice to localStorage', () => {
    const storage = createMockStorage();

    persistTheme(storage, 'dark');
    expect(storage.getItem(STORAGE_KEY)).toBe('dark');

    persistTheme(storage, 'light');
    expect(storage.getItem(STORAGE_KEY)).toBe('light');

    persistTheme(storage, 'system');
    expect(storage.getItem(STORAGE_KEY)).toBe('system');
  });

  it('should return false when storage is unavailable', () => {
    expect(persistTheme(null, 'dark')).toBe(false);
  });

  it('should return false when storage throws', () => {
    const storage = createMockStorage();
    storage.setItem = () => { throw new Error('QuotaExceeded'); };
    expect(persistTheme(storage, 'dark')).toBe(false);
  });

  it('should survive a full round-trip: persist then read', () => {
    const storage = createMockStorage();

    persistTheme(storage, 'dark');
    expect(getStoredTheme(storage)).toBe('dark');

    persistTheme(storage, 'system');
    expect(getStoredTheme(storage)).toBe('system');
  });
});

describe('Theme Provider - CSS data-theme Attribute on Document', () => {
  it('should set data-theme="light" on document element', () => {
    const docElement = {
      setAttribute: vi.fn(),
      style: { colorScheme: '' },
    };

    applyThemeToDOM('light', docElement);

    expect(docElement.setAttribute).toHaveBeenCalledWith('data-theme', 'light');
    expect(docElement.style.colorScheme).toBe('light');
  });

  it('should set data-theme="dark" on document element', () => {
    const docElement = {
      setAttribute: vi.fn(),
      style: { colorScheme: '' },
    };

    applyThemeToDOM('dark', docElement);

    expect(docElement.setAttribute).toHaveBeenCalledWith('data-theme', 'dark');
    expect(docElement.style.colorScheme).toBe('dark');
  });

  it('should update when switching themes', () => {
    const docElement = {
      setAttribute: vi.fn(),
      style: { colorScheme: '' },
    };

    applyThemeToDOM('light', docElement);
    expect(docElement.setAttribute).toHaveBeenLastCalledWith('data-theme', 'light');

    applyThemeToDOM('dark', docElement);
    expect(docElement.setAttribute).toHaveBeenLastCalledWith('data-theme', 'dark');
    expect(docElement.setAttribute).toHaveBeenCalledTimes(2);
  });

  it('should set color-scheme CSS property for native form controls', () => {
    const docElement = {
      setAttribute: vi.fn(),
      style: { colorScheme: '' },
    };

    applyThemeToDOM('dark', docElement);
    expect(docElement.style.colorScheme).toBe('dark');

    applyThemeToDOM('light', docElement);
    expect(docElement.style.colorScheme).toBe('light');
  });
});

describe('Theme Provider - Anti-flash Script', () => {
  it('should contain localStorage read in init script', async () => {
    // Dynamically import to verify the exported script content
    const { themeInitScript } = await import('../../../lib/theme-provider');

    expect(themeInitScript).toContain('localStorage.getItem');
    expect(themeInitScript).toContain('data-theme');
    expect(themeInitScript).toContain('prefers-color-scheme: dark');
    expect(themeInitScript).toContain('colorScheme');
  });
});
