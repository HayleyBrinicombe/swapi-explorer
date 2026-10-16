import { test, expect } from '@playwright/test';
import { mockArchive } from './fixtures';
test('opening supports Escape and plays again on refresh', async ({ page }) => {
  await mockArchive(page);
  await page.goto('/');
  await expect(
    page.getByRole('dialog', { name: 'Opening sequence' }),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'Skip intro' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.locator('main')).toBeFocused();
  await page.reload();
  await expect(
    page.getByRole('dialog', { name: 'Opening sequence' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Skip intro' }).click();
  await expect(
    page.getByRole('heading', { name: 'Luke Skywalker' }),
  ).toBeVisible();
});
test('opening completes automatically and can be replayed', async ({
  page,
}) => {
  await mockArchive(page);
  await page.goto('/');
  await expect(page.getByRole('dialog')).toBeVisible();
  // Timing is the behaviour under test: the former 3.6-second intro must not disappear early.
  await page.waitForTimeout(4000);
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('dialog')).toHaveCount(0, { timeout: 7000 });
  await page.getByRole('button', { name: 'Replay opening' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: 'Skip intro' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
});
test('reduced-motion users enter the archive immediately', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await mockArchive(page);
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'Luke Skywalker' }),
  ).toBeVisible();
  await expect(page.getByRole('dialog')).toHaveCount(0);
});
