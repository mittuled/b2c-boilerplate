import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should display signup page with required fields', async ({ page }) => {
    await page.goto('/signup');
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign up/i })).toBeVisible();
  });

  test('should show password strength indicator', async ({ page }) => {
    await page.goto('/signup');
    const passwordInput = page.getByLabel(/^password$/i);
    await passwordInput.fill('weak');
    // Should show strength feedback
    await expect(page.getByText(/at least 8 characters/i)).toBeVisible();
  });

  test('should display login page with required fields', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('should show forgot password link on login page', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('link', { name: /forgot.*password/i })).toBeVisible();
  });

  test('should navigate between signup and login', async ({ page }) => {
    await page.goto('/signup');
    await page.getByRole('link', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/login/);

    await page.getByRole('link', { name: /sign up/i }).click();
    await expect(page).toHaveURL(/\/signup/);
  });

  test('should display social OAuth buttons', async ({ page }) => {
    await page.goto('/signup');
    await expect(page.getByRole('button', { name: /google/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /apple/i })).toBeVisible();
  });

  test('should reject disposable email on signup', async ({ page }) => {
    await page.goto('/signup');
    await page.getByLabel(/email/i).fill('user@tempmail.com');
    await page.getByLabel(/^password$/i).fill('Test1234!');
    await page.getByRole('button', { name: /sign up/i }).click();
    await expect(page.getByText(/disposable.*not allowed/i)).toBeVisible();
  });
});
