import { test, expect } from '@playwright/test';

test.describe('Submit feedback', () => {
  test('can submit new feedback and see it appear', async ({ page }) => {
    await page.goto('/');

    await page.getByText('Choose an event').click();
    const firstEvent = page.locator('[role="option"]').first();
    await firstEvent.click();

    await page.getByRole('button', { name: '5 star' }).click();

    const text = `Great event e2e ${Date.now()}`;
    await page.getByPlaceholder('Share your thoughts about the event...').fill(text);

    await page.getByRole('button', { name: 'Submit Feedback' }).click();

    await expect(page.getByText(text)).toBeVisible({ timeout: 10_000 });
  });
});


