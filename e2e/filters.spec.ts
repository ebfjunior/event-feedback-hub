import { test, expect } from '@playwright/test';

test.describe('Filters', () => {
  test('can filter by rating and sort', async ({ page }) => {
    await page.goto('/');

    await page.getByText('All Ratings').click();
    await page.getByRole('option', { name: '5 stars' }).click();

    await page.getByRole('button', { name: 'Highest Rated' }).click();

    const cards = page.getByRole('link', { name: /Open event/i });
    await expect(cards.first()).toBeVisible();
  });
});


