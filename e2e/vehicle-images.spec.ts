import { test, expect } from '@playwright/test';
import { mockArchive, openArchive } from './fixtures';

const vehicles = [
  ['4', 'Sand Crawler'],
  ['6', 'T-16 skyhopper'],
  ['7', 'X-34 landspeeder'],
  ['8', 'TIE/LN starfighter'],
  ['14', 'Snowspeeder'],
  ['16', 'TIE bomber'],
  ['18', 'AT-AT'],
  ['19', 'AT-ST'],
  ['20', 'Storm IV Twin-Pod cloud car'],
  ['24', 'Sail barge'],
  ['25', 'Bantha-II cargo skiff'],
  ['26', 'TIE/IN interceptor'],
].map(([id, name]) => ({ id, name, subtitle: 'Vehicle archive', facts: [] }));

test('the initial vehicle collection has working local artwork, including the Sandcrawler', async ({
  page,
}) => {
  await mockArchive(page);
  await page.route('**/api/archive/vehicles', (route) =>
    route.fulfill({ json: { records: vehicles } }),
  );
  await openArchive(page, '/?collection=vehicles');
  const images = page.locator('.archive-grid img');
  await expect(images).toHaveCount(12);
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
  await expect(page.getByText('Image unavailable')).toHaveCount(0);
});

test('missing artwork and failed downloads are labelled without hiding vehicle information', async ({
  page,
}) => {
  await mockArchive(page);
  await page.route('**/api/archive/vehicles', (route) =>
    route.fulfill({
      json: {
        records: [
          vehicles[0],
          {
            id: '999',
            name: 'Uncatalogued vehicle',
            subtitle: 'Swoop bike',
            facts: [],
          },
        ],
      },
    }),
  );
  await page.route('**/assets/images/vehicles/4-sandcrawler.jpg*', (route) =>
    route.request().resourceType() === 'image'
      ? route.abort()
      : route.continue(),
  );
  await openArchive(page, '/?collection=vehicles');
  await expect(
    page.getByRole('heading', { name: 'Sand Crawler', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Uncatalogued vehicle', exact: true }),
  ).toBeVisible();
  await expect(page.getByText('Image unavailable')).toHaveCount(2);
});
