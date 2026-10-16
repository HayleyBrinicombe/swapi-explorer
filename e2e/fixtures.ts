import type { Page } from '@playwright/test';
import type { Character } from '../shared/contracts';
export const luke: Character = {
  id: '1',
  name: 'Luke Skywalker',
  height: '172',
  mass: '77',
  birthYear: '19BBY',
  gender: 'male',
  eyeColor: 'blue',
  hairColor: 'blond',
  skinColor: 'fair',
  filmCount: 4,
  starshipCount: 2,
  vehicleCount: 2,
};
export const characters = [luke, { ...luke, id: '5', name: 'Leia Organa' }];
export async function mockArchive(page: Page, records = characters) {
  await page.route('**/api/characters**', (route) => {
    const match = new URL(route.request().url()).pathname.match(
      /\/characters\/(\d+)$/,
    );
    const character = match && records.find((record) => record.id === match[1]);
    return route.fulfill(
      match
        ? character
          ? { json: { character } }
          : {
              status: 404,
              json: { error: { code: 'NOT_FOUND', message: 'Not found' } },
            }
        : { json: { characters: records } },
    );
  });
}

/** Dismiss the real opening so each feature test starts at the document's tab order. */
export async function dismissIntro(page: Page) {
  await page.getByRole('button', { name: 'Skip intro' }).click();
  await page.evaluate(() => {
    document.body.tabIndex = -1;
    document.body.focus();
    document.body.removeAttribute('tabindex');
  });
}
export async function openArchive(page: Page, path = '/') {
  await page.goto(path);
  await dismissIntro(page);
}
