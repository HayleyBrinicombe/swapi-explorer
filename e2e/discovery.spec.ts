import { test, expect } from '@playwright/test';
import { mockArchive, openArchive } from './fixtures';

test('homepage previews lead directly to the matching profile section', async ({
  page,
}) => {
  await mockArchive(page);
  await openArchive(page);
  const discovery = page.getByRole('region', { name: 'Explore their galaxy' });
  await expect(
    discovery.getByRole('link', { name: /Explore homeworlds/ }),
  ).toBeVisible();
  await discovery.getByRole('link', { name: /Explore homeworlds/ }).click();
  await expect(page).toHaveURL(/character=1#homeworld-title$/);
  await expect(page.locator('#homeworld-title')).toBeFocused();
  await expect(
    page.getByRole('heading', { name: 'Tatooine', exact: true }),
  ).toBeInViewport();
  await page.getByRole('link', { name: 'Back to directory' }).click();
  await page.getByRole('link', { name: /Explore films/ }).click();
  await expect(page.locator('#films-title')).toBeFocused();
  await expect(
    page.getByRole('heading', { name: 'A New Hope', exact: true }),
  ).toBeInViewport();
});

test('profile exposes section links near the title and clickable connection counts', async ({
  page,
}) => {
  await mockArchive(page);
  await openArchive(page, '/?character=1');
  const links = page.getByRole('navigation', { name: 'Character sections' });
  await links.getByRole('link', { name: /Homeworld/ }).click();
  await expect(page.locator('#homeworld-title')).toBeFocused();
  await page.getByRole('link', { name: /Film appearances 04/ }).click();
  await expect(page.locator('#films-title')).toBeFocused();
});

test('direct section links retain their destination after the opening and refresh', async ({
  page,
}) => {
  await mockArchive(page);
  await page.goto('/?character=1#films-title');
  await page.getByRole('button', { name: 'Skip intro' }).click();
  await expect(page.locator('#films-title')).toBeFocused();
  await page.reload();
  await page.getByRole('button', { name: 'Skip intro' }).click();
  await expect(page.locator('#films-title')).toBeFocused();
});
