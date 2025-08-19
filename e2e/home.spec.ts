import { test, expect } from '@playwright/test';

test.describe('Home page', () => {
  test('loads and shows core UI', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText('Events Feedback HUB')).toBeVisible();
    await expect(page.getByText('Live Feedback Stream')).toBeVisible();

    await expect(page.getByRole('button', { name: 'Newest' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Highest Rated' })).toBeVisible();

    await expect(page.getByText('All Events')).toBeVisible();
    await expect(page.getByText('All Ratings')).toBeVisible();

    const firstEventLink = page.getByRole('link', { name: /Open event/i }).first();
    await expect(firstEventLink).toBeVisible();
  });
});


