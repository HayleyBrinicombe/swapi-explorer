import { openArchive, dismissIntro } from './fixtures';
import { test, expect } from '@playwright/test';
import { characters, luke, mockArchive } from './fixtures';
test('failed API request can be retried without a reload', async ({ page }) => {
  let unavailable = true;
  await page.route('**/api/characters', (route) =>
    unavailable
      ? route.fulfill({
          status: 502,
          json: {
            error: { code: 'UPSTREAM_UNAVAILABLE', message: 'Unavailable' },
          },
        })
      : route.fulfill({ json: { characters } }),
  );
  await openArchive(page, '/');
  await expect(page.getByRole('alert')).toContainText(
    'Transmission interrupted',
  );
  unavailable = false;
  await page.getByRole('button', { name: 'Try again' }).click();
  await expect(page.getByRole('heading', { name: luke.name })).toBeVisible();
});
test('empty search announces zero records and clearing restores the collection', async ({
  page,
}) => {
  await mockArchive(page);
  await openArchive(page, '/');
  await page.getByRole('searchbox').fill('not-a-character');
  await expect(
    page.getByRole('heading', { name: 'No matching records' }),
  ).toBeVisible();
  await expect(page.getByRole('status')).toHaveText('0 records found');
  await page.getByRole('button', { name: 'Clear search' }).first().click();
  await expect(page.getByRole('heading', { name: luke.name })).toBeVisible();
  await expect(page.getByRole('status')).toHaveText('2 records found');
});
test('load more reveals additional records and search includes unrevealed records', async ({
  page,
}) => {
  const records = Array.from({ length: 25 }, (_, index) => ({
    ...luke,
    id: String(index + 1),
    name: `Character ${String(index + 1).padStart(2, '0')}`,
  }));
  await mockArchive(page, records);
  await openArchive(page, '/');
  await expect(page.locator('.character-card')).toHaveCount(12);
  await page.getByRole('button', { name: 'Load more records' }).click();
  await expect(page.locator('.character-card')).toHaveCount(24);
  await page.getByRole('searchbox').fill('Character 25');
  await expect(page.locator('.character-card')).toHaveCount(1);
  await expect(
    page.getByRole('heading', { name: 'Character 25' }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Load more records' }),
  ).toHaveCount(0);
});
test('portrait files render locally and a failed portrait falls back without losing navigation', async ({
  page,
}) => {
  await mockArchive(page);
  await openArchive(page, '/');
  const card = page.locator('.character-card').first();
  await expect(card.locator('img')).toBeVisible();
  expect(
    await card
      .locator('img')
      .evaluate(
        (image: HTMLImageElement) => image.complete && image.naturalWidth > 0,
      ),
  ).toBe(true);
  await page.route('**/*luke-skywalker*', (route) =>
    route.request().resourceType() === 'image'
      ? route.abort()
      : route.continue(),
  );
  await page.reload();
  await dismissIntro(page);
  await expect(
    page.locator('.character-card').first().getByText('Portrait unavailable'),
  ).toBeVisible();
  await page.getByRole('link', { name: /Luke Skywalker/ }).click();
  await expect(page.getByText('172 cm')).toBeVisible();
});
test('a missing character offers navigation back to the collection', async ({
  page,
}) => {
  await mockArchive(page);
  await openArchive(page, '/?character=999');
  await expect(page.getByRole('alert')).toContainText(
    'This character could not be found.',
  );
  await page.getByRole('link', { name: 'Back to directory' }).click();
  await expect(page.getByRole('searchbox')).toBeVisible();
});
