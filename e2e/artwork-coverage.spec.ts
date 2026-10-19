import { test, expect } from '@playwright/test';
import { mockArchive, openArchive } from './fixtures';
import collections from './data/referenceCollections.json' with { type: 'json' };

for (const kind of ['vehicles', 'starships'] as const) {
  test(`every ${kind} record has working local artwork, including records behind Load more`, async ({
    page,
  }) => {
    await mockArchive(page);
    const records = collections[kind];
    await page.route(`**/api/archive/${kind}`, (route) =>
      route.fulfill({ json: { records } }),
    );
    await openArchive(page, `/?collection=${kind}`);
    await expect(page.locator('.archive-grid > li')).toHaveCount(12);
    for (let visible = 12; visible < records.length; visible += 12) {
      await page.getByRole('button', { name: 'Load more records' }).click();
      await expect(page.locator('.archive-grid > li')).toHaveCount(
        Math.min(visible + 12, records.length),
      );
    }
    const images = page.locator('.archive-grid img');
    await expect(images).toHaveCount(records.length);
    for (const image of await images.all()) {
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
      page.getByText('Image unavailable', { exact: true }),
    ).toHaveCount(0);
    await expect(
      page.getByText('Reference artwork · StarWars.jp').first(),
    ).toBeVisible();
  });
}
