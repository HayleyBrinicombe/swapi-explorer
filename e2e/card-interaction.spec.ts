import { test, expect } from '@playwright/test';
import { mockArchive, openArchive } from './fixtures';
test('character preview reveals facts on hover and keyboard focus', async ({
  page,
}) => {
  await mockArchive(page);
  await openArchive(page);
  const card = page.locator('.character-link').first();
  const preview = card.locator('.card-reveal');
  await expect(preview).toHaveCSS('opacity', '0');
  await card.hover();
  await expect(preview).toHaveCSS('opacity', '1');
  await expect(preview).toContainText('172 cm');
  await expect(preview).toContainText('77 kg');
  await page.getByRole('searchbox').hover();
  await expect(preview).toHaveCSS('opacity', '0');
  await card.focus();
  await expect(preview).toHaveCSS('opacity', '1');
  await page.keyboard.press('Enter');
  await expect(page.getByText('172 cm')).toBeVisible();
});
