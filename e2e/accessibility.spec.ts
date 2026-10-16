import { openArchive } from './fixtures';
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mockArchive, luke } from './fixtures';
test('browse and detail pass automated WCAG A/AA checks', async ({ page }) => {
  await mockArchive(page);
  await openArchive(page, '/');
  await expect(page.getByRole('heading', { name: luke.name })).toBeVisible();
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze()
    ).violations,
  ).toEqual([]);
  await page.getByRole('link', { name: /Luke Skywalker/ }).click();
  await expect(page.getByText('172 cm')).toBeVisible();
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze()
    ).violations,
  ).toEqual([]);
});
test('keyboard users can skip navigation, search, and open a character', async ({
  page,
}) => {
  await mockArchive(page);
  await openArchive(page, '/');
  await page.keyboard.press('Tab');
  await expect(
    page.getByRole('link', { name: 'Skip to content' }),
  ).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
  await page.keyboard.press('Tab'); // Explore the characters
  await page.keyboard.press('Tab'); // Search
  await expect(page.getByRole('searchbox')).toBeFocused();
  await page.keyboard.type('Luke');
  await page.keyboard.press('Tab'); // Clear search
  await page.keyboard.press('Tab'); // Character card
  await expect(
    page.getByRole('link', { name: /Luke Skywalker/ }),
  ).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByText('172 cm')).toBeVisible();
  await expect(page.locator('main')).toBeFocused();
});
for (const width of [320, 390, 768, 1440]) {
  test(`layout fits a ${width}px viewport`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await mockArchive(page);
    await openArchive(page, '/');
    await expect(page.getByRole('heading', { name: luke.name })).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.getByRole('link', { name: /Luke Skywalker/ }).click();
    await expect(page.getByText('172 cm')).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
}
