import { openArchive, dismissIntro } from './fixtures';
import { test, expect } from '@playwright/test';
import { mockArchive } from './fixtures';
test('search, detail, history and narrow layout', async ({ page }) => {
  await mockArchive(page);
  await openArchive(page, '/');
  await expect(
    page.getByRole('heading', { name: 'Luke Skywalker' }),
  ).toBeVisible();
  await page.getByRole('searchbox').fill('Luke');
  await expect(page.getByRole('heading', { name: 'Leia Organa' })).toHaveCount(
    0,
  );
  await page.getByRole('link', { name: /Luke Skywalker/ }).click();
  await expect(page).toHaveURL(/character=1/);
  await expect(page.getByText('172 cm')).toBeVisible();
  await page.reload();
  await dismissIntro(page);
  await expect(page.getByText('172 cm')).toBeVisible();
  await page.goBack();
  await expect(page.getByRole('searchbox')).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await expect(page.locator('main')).toBeFocused();
  await openArchive(page, '/');
  await page.keyboard.press('Tab');
  await expect(
    page.getByRole('link', { name: 'Skip to content' }),
  ).toBeFocused();
});
