import { test, expect } from '@playwright/test';

test('home loads', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Tennis League San Diego/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Welcome to Tennis League San Diego');
});

test('product page loads', async ({ page }) => {
  await page.goto('/product/1001');
  await expect(page).toHaveTitle(/Tennis League San Diego/);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('cart page loads', async ({ page }) => {
  await page.goto('/cart');
  await expect(page).toHaveTitle(/Tennis League San Diego/);
  await expect(page.getByText(/Cart|Shopping Cart/i)).toBeVisible();
});

test('login page loads', async ({ page }) => {
  await page.goto('/members/memberlogin');
  await expect(page).toHaveTitle(/Tennis League San Diego/);
  await expect(page.getByText(/Login/i)).toBeVisible();
});

test('champions page loads', async ({ page }) => {
  await page.goto('/champions');
  await expect(page).toHaveTitle(/Tennis League San Diego/);
  await expect(page.getByText(/Select Prior Season/i)).toBeVisible();
});
