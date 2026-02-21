import { test, expect } from '@playwright/test';

test.describe('RBAC Enforcement', () => {
  test('should display 403 page for unauthorized access', async ({ page }) => {
    await page.goto('/forbidden');
    await expect(page.getByText(/access denied/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /go back/i })).toBeVisible();
  });
});
