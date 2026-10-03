import { test, expect } from '@playwright/test';

test('homepage loads', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /find your stillness/i })).toBeVisible();
});

test('login page loads', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByRole('heading', { name: /log in/i })).toBeVisible();
});

test('search page loads', async ({ page }) => {
  await page.goto('/search');
  await expect(page.getByPlaceholder(/search by name/i)).toBeVisible();
});

test('404 page shows home link', async ({ page }) => {
  await page.goto('/nonexistent-page-xyz');
  await expect(page.getByText(/page not found/i)).toBeVisible();
  await expect(page.getByRole('link', { name: /back to home/i })).toBeVisible();
});
