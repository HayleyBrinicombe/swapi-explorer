import { openArchive } from './fixtures';
import { test, expect } from '@playwright/test';
import { mockArchive, luke } from './fixtures';
test('card entrances animate while reduced-motion users get a static interface', async ({
  page,
}) => {
  await mockArchive(page);
  await openArchive(page, '/');
  await expect(page.getByRole('heading', { name: luke.name })).toBeVisible();
  expect(
    await page
      .locator('.character-card')
      .first()
      .evaluate((element) => getComputedStyle(element).animationName),
  ).toBe('card-enter');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  expect(
    await page
      .locator('.character-card')
      .first()
      .evaluate((element) => getComputedStyle(element).animationName),
  ).toBe('none');
  expect(
    await page
      .locator('.hero-copy')
      .evaluate((element) => getComputedStyle(element).animationName),
  ).toBe('none');
});
test('loading placeholders appear while the API is pending and disappear on success', async ({
  page,
}) => {
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route('**/api/characters', async (route) => {
    await gate;
    await route.fulfill({ json: { characters: [luke] } });
  });
  await openArchive(page, '/');
  await expect(page.getByText('Accessing the archive')).toBeVisible();
  await expect(page.locator('.skeleton-grid')).toBeVisible();
  await expect(page.locator('.skeleton-grid')).toHaveAttribute(
    'aria-hidden',
    'true',
  );
  release();
  await expect(page.getByRole('heading', { name: luke.name })).toBeVisible();
  await expect(page.locator('.skeleton-grid')).toHaveCount(0);
});
