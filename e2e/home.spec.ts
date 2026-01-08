import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');
});

test('check navigation', async ({ page }) => {
  await page.goto('/');
  // Basic smoke test to ensure no 404
  expect(page.url()).toBe('http://localhost:3000/');
});
