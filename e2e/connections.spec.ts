import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mockArchive, openArchive, connections } from './fixtures';

test('profile connections show named records, local images and explicit empty groups', async ({
  page,
}) => {
  await mockArchive(page);
  await openArchive(page, '/?character=1');
  await expect(
    page.getByRole('heading', { name: 'Tatooine', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText('Episode IV · 1977', { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'X-wing', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText('No vehicles recorded for this character.'),
  ).toBeVisible();
  const section = page.getByRole('region', { name: 'Explore their galaxy' });
  await section.scrollIntoViewIfNeeded();
  for (const image of await section.locator('img').all()) {
    await image.scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        image.evaluate(
          (img: HTMLImageElement) => img.complete && img.naturalWidth > 0,
        ),
      )
      .toBe(true);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze()
    ).violations,
  ).toEqual([]);
});

test('related-data failures do not hide the biography and can be retried', async ({
  page,
}) => {
  await mockArchive(page);
  let unavailable = true;
  await page.route('**/api/characters/1/connections', (route) => {
    return route.fulfill(
      unavailable
        ? {
            status: 502,
            json: {
              error: {
                code: 'UPSTREAM_UNAVAILABLE',
                message: 'Connections unavailable.',
              },
            },
          }
        : { json: connections },
    );
  });
  await openArchive(page, '/?character=1');
  await expect(page.getByText('172 cm', { exact: true })).toBeVisible();
  await expect(page.getByRole('alert')).toBeVisible();
  unavailable = false;
  await page.getByRole('button', { name: 'Try again' }).click();
  await expect(
    page.getByRole('heading', { name: 'Tatooine', exact: true }),
  ).toBeVisible();
});

test('unknown homeworld and unavailable artwork have honest fallbacks', async ({
  page,
}) => {
  await mockArchive(page);
  await page.route('**/api/characters/1/connections', (route) =>
    route.fulfill({
      json: {
        ...connections,
        homeworld: null,
        starships: [
          { ...connections.starships[0], id: '999', name: 'Unpictured craft' },
        ],
      },
    }),
  );
  await page.route('**/assets/images/films/**', (route) =>
    route.request().resourceType() === 'image'
      ? route.abort()
      : route.continue(),
  );
  await openArchive(page, '/?character=1');
  await expect(
    page.getByText('Homeworld unknown in the source records.'),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Unpictured craft', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'A New Hope', exact: true }),
  ).toBeVisible();
});
