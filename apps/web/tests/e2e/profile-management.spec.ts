import { test, expect } from '@playwright/test';

test.describe('Profile Management', () => {
  test('should display profile settings page', async ({ page }) => {
    await page.goto('/settings/profile');
    await expect(page.getByRole('heading', { name: /profile/i })).toBeVisible();
  });

  test('should have all profile fields', async ({ page }) => {
    await page.goto('/settings/profile');
    await expect(page.getByLabel(/display name/i)).toBeVisible();
    await expect(page.getByLabel(/bio/i)).toBeVisible();
  });
});
