import { test, expect } from '@playwright/test';

test.describe('Theming', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any persisted theme before each test
    await page.addInitScript(() => {
      localStorage.removeItem('theme');
    });
  });

  test('should show the theme toggle button on the appearance page', async ({ page }) => {
    await page.goto('/settings/appearance');

    // The ThemeSelector button should be visible
    const selector = page.getByRole('button', { name: /appearance/i });
    await expect(selector).toBeVisible();
  });

  test('should have data-theme attribute on html element', async ({ page }) => {
    await page.goto('/settings/appearance');

    const dataTheme = await page.locator('html').getAttribute('data-theme');
    expect(['light', 'dark']).toContain(dataTheme);
  });

  test('should switch to dark theme and reflect in data-theme attribute', async ({ page }) => {
    await page.goto('/settings/appearance');

    // Click the "Dark" radio option
    const darkRadio = page.getByRole('radio', { name: /dark/i });
    await darkRadio.click();

    // Verify the html data-theme attribute updated
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });

  test('should switch to light theme and reflect in data-theme attribute', async ({ page }) => {
    // Pre-set dark theme in localStorage
    await page.addInitScript(() => {
      localStorage.setItem('theme', 'dark');
    });

    await page.goto('/settings/appearance');

    // Click the "Light" radio option
    const lightRadio = page.getByRole('radio', { name: /light/i });
    await lightRadio.click();

    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  });

  test('should persist theme changes across page navigation', async ({ page }) => {
    await page.goto('/settings/appearance');

    // Select dark theme
    const darkRadio = page.getByRole('radio', { name: /dark/i });
    await darkRadio.click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    // Navigate to another page
    await page.goto('/dashboard');

    // Theme should still be dark
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    // Navigate back to appearance
    await page.goto('/settings/appearance');

    // Theme should still be dark
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });

  test('should persist theme in localStorage', async ({ page }) => {
    await page.goto('/settings/appearance');

    // Select dark theme
    const darkRadio = page.getByRole('radio', { name: /dark/i });
    await darkRadio.click();

    // Verify localStorage was updated
    const stored = await page.evaluate(() => localStorage.getItem('theme'));
    expect(stored).toBe('dark');
  });

  test('should detect system theme preference (dark)', async ({ browser }) => {
    // Create a context with dark color scheme emulation
    const context = await browser.newContext({
      colorScheme: 'dark',
    });
    const page = await context.newPage();

    await page.addInitScript(() => {
      localStorage.removeItem('theme');
    });

    await page.goto('/settings/appearance');

    // With system theme selected by default and system preferring dark,
    // the resolved theme should be dark
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    await context.close();
  });

  test('should detect system theme preference (light)', async ({ browser }) => {
    const context = await browser.newContext({
      colorScheme: 'light',
    });
    const page = await context.newPage();

    await page.addInitScript(() => {
      localStorage.removeItem('theme');
    });

    await page.goto('/settings/appearance');

    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

    await context.close();
  });

  test('should show theme preview cards', async ({ page }) => {
    await page.goto('/settings/appearance');

    // Both light and dark preview cards should be visible
    const lightPreview = page.getByLabel(/light.*preview/i);
    const darkPreview = page.getByLabel(/dark.*preview/i);

    await expect(lightPreview).toBeVisible();
    await expect(darkPreview).toBeVisible();
  });

  test('should display current theme status text', async ({ page }) => {
    await page.goto('/settings/appearance');

    // There should be a status indicator showing the current theme
    const status = page.getByRole('status');
    await expect(status).toBeVisible();
    await expect(status).toContainText(/currently using/i);
  });

  test('should switch to system theme and use OS preference', async ({ browser }) => {
    const context = await browser.newContext({
      colorScheme: 'dark',
    });
    const page = await context.newPage();

    // Start with an explicit light theme
    await page.addInitScript(() => {
      localStorage.setItem('theme', 'light');
    });

    await page.goto('/settings/appearance');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

    // Switch to system theme
    const systemRadio = page.getByRole('radio', { name: /system/i });
    await systemRadio.click();

    // Should now follow the OS dark preference
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    await context.close();
  });
});
