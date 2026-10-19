import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '@playwright/test';
import { mockArchive, openArchive, connections } from './fixtures';
const labels = ['Planets', 'Films', 'Starships', 'Vehicles'] as const;
async function mockCollections(page: import('@playwright/test').Page) {
  await mockArchive(page);
  await page.route('**/api/archive/*', (route) => {
    const kind = new URL(route.request().url()).pathname.split('/').at(-1)!;
    return route.fulfill({
      json: {
        records:
          kind === 'planets'
            ? [connections.homeworld]
            : connections[kind as 'films' | 'starships' | 'vehicles'],
      },
    });
  });
}
test('category navigation opens searchable collections and supports refresh and history', async ({
  page,
}) => {
  await mockCollections(page);
  await openArchive(page);
  const nav = page.getByRole('navigation', { name: 'Main navigation' });
  for (const label of labels) {
    await nav.getByRole('link', { name: label, exact: true }).click();
    await expect(page).toHaveURL(
      new RegExp('collection=' + label.toLowerCase()),
    );
    await expect(
      page.getByRole('heading', { name: label, exact: true }),
    ).toBeVisible();
    await expect(
      nav.getByRole('link', { name: label, exact: true }),
    ).toHaveAttribute('aria-current', 'page');
    await expect(page.locator('.result-count')).toHaveText(/\d+ records found/);
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
          .analyze()
      ).violations,
    ).toEqual([]);
  }
  await page.goBack();
  await expect(
    page.getByRole('heading', { name: 'Starships', exact: true }),
  ).toBeVisible();
  await page.getByRole('searchbox').fill('no such ship');
  await expect(page.getByText('No matching records')).toBeVisible();
  await page
    .getByRole('button', { name: 'Clear search', exact: true })
    .last()
    .click();
  await expect(
    page.getByRole('heading', { name: 'X-wing', exact: true }),
  ).toBeVisible();
  await page.reload();
  await page.getByRole('button', { name: 'Skip intro' }).click();
  await expect(
    page.getByRole('heading', { name: 'X-wing', exact: true }),
  ).toBeVisible();
});
test('mobile header exposes every category and profiles advertise more content above the fold', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await mockCollections(page);
  await openArchive(page, '/?character=1');
  for (const label of ['Characters', ...labels])
    await expect(
      page
        .getByRole('navigation', { name: 'Main navigation' })
        .getByRole('link', { name: label, exact: true }),
    ).toBeInViewport();
  const cue = page.getByRole('link', { name: /Explore below/ });
  await expect(cue).toBeInViewport();
  await cue.click();
  await expect(page.locator('#connections-title')).toBeFocused();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
