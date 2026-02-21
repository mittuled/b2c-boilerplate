import { test, expect } from '@playwright/test';

test.describe('Session Management', () => {
  test('should display sessions page with session list', async ({ page }) => {
    await page.goto('/settings/sessions');
    await expect(page.getByRole('heading', { name: /active sessions/i })).toBeVisible();
  });

  test('should show current session badge', async ({ page }) => {
    await page.goto('/settings/sessions');
    await expect(page.getByText(/current session/i)).toBeVisible();
  });

  test('should have revoke all button', async ({ page }) => {
    await page.goto('/settings/sessions');
    await expect(page.getByRole('button', { name: /revoke all/i })).toBeVisible();
  });
});
