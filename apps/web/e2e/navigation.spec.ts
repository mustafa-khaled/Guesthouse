import { test, expect } from '@playwright/test';

test.describe('site navigation', () => {
  test('header links reach their own pages', async ({ page }) => {
    await page.goto('/');

    const header = page.getByRole('navigation', { name: 'Main' });
    await header.getByRole('link', { name: /^Stays$/ }).click();

    await expect(page).toHaveURL(/\/properties$/);
    await expect(page.getByRole('heading', { level: 1, name: /our stays/i })).toBeVisible();
  });

  test('the current section is marked for assistive tech', async ({ page }) => {
    await page.goto('/spa');

    const header = page.getByRole('navigation', { name: 'Main' });
    await expect(header.getByRole('link', { name: /^Spa$/ })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await expect(header.getByRole('link', { name: /^Stays$/ })).not.toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  test('a child route keeps its parent chapter current', async ({ page }) => {
    await page.goto('/properties/seaside-resort-spa');

    const header = page.getByRole('navigation', { name: 'Main' });
    await expect(header.getByRole('link', { name: /^Stays$/ })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  test('the mobile menu opens, closes, and navigates', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    await page.getByRole('button', { name: /open menu/i }).click();
    const sheet = page.getByRole('dialog', { name: /site menu/i });
    await expect(sheet).toBeVisible();

    await sheet.getByRole('link', { name: /experiences/i }).click();

    await expect(page).toHaveURL(/\/experiences$/);
    await expect(sheet).toBeHidden();
  });

  test('the staff portal has an entry point', async ({ page }) => {
    await page.goto('/staff');

    await expect(page).toHaveURL(/\/login\?redirect=%2Fstaff$/);
    await expect(page.getByRole('heading', { level: 1, name: /log in/i })).toBeVisible();
  });

  test('the 404 page keeps the site chrome', async ({ page }) => {
    await page.goto('/nonexistent-page-xyz');

    await expect(page.getByRole('navigation', { name: 'Main' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 1, name: /page not found/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /back to home/i })).toBeVisible();
  });
});
