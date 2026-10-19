import { test, expect } from '@playwright/test';
import { mockArchive, openArchive } from './fixtures';

test('generated planet artwork is visibly labelled while reference artwork remains distinct', async ({
  page,
}) => {
  await mockArchive(page);
  await page.route('**/api/archive/planets', (route) =>
    route.fulfill({
      json: {
        records: [
          {
            id: '1',
            name: 'Tatooine',
            subtitle: 'desert',
            facts: [{ label: 'Climate', value: 'arid' }],
          },
          {
            id: '26',
            name: 'Bestine IV',
            subtitle: 'rocky islands, oceans',
            facts: [{ label: 'Climate', value: 'temperate' }],
          },
          {
            id: '28',
            name: 'unknown',
            subtitle: 'unknown',
            facts: [{ label: 'Climate', value: 'unknown' }],
          },
        ],
      },
    }),
  );
  await openArchive(page, '/?collection=planets');
  await expect(
    page.getByText('AI-generated artist’s impression', { exact: true }),
  ).toHaveCount(2);
  const cards = page.locator('.archive-grid > li');
  await expect(
    cards
      .filter({
        has: page.getByRole('heading', { name: 'Tatooine', exact: true }),
      })
      .getByText('AI-generated artist’s impression'),
  ).toHaveCount(0);
  for (const image of await page.locator('.archive-grid img').all()) {
    await image.scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        image.evaluate(
          (img: HTMLImageElement) => img.complete && img.naturalWidth > 0,
        ),
      )
      .toBe(true);
  }
  await expect(
    page.getByRole('heading', { name: 'unknown', exact: true }),
  ).toBeVisible();
});
