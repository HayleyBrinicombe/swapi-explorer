// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from './App';
const luke = {
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
const leia = { ...luke, id: '5', name: 'Leia Organa' };
beforeEach(() => {
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({ matches: true })),
  );
  window.history.replaceState({}, '', '/');
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
it('searches records, handles no results and navigates into a shareable detail view', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn(
      async (url: string) =>
        new Response(
          JSON.stringify(
            url.endsWith('/1')
              ? { character: luke }
              : { characters: [luke, leia] },
          ),
        ),
    ),
  );
  const user = userEvent.setup();
  render(<App />);
  await screen.findByRole('heading', { name: 'Luke Skywalker' });
  const search = screen.getByRole('searchbox');
  await user.type(search, 'nobody');
  expect(screen.getByText('No matching records')).toBeInTheDocument();
  await user.click(screen.getAllByRole('button', { name: 'Clear search' })[0]);
  await user.type(search, 'LUKE');
  expect(
    screen.queryByRole('heading', { name: 'Leia Organa' }),
  ).not.toBeInTheDocument();
  await user.click(screen.getByRole('link', { name: /Luke Skywalker/ }));
  expect(window.location.search).toBe('?character=1');
  await screen.findByRole('heading', { name: 'Luke Skywalker' });
  expect(screen.getByText('172 cm')).toBeInTheDocument();
  await user.click(screen.getByRole('link', { name: /Back to directory/ }));
  await screen.findByRole('searchbox');
  expect(screen.getByRole('searchbox')).toHaveValue('LUKE');
});
it('shows loading, then an error and recovers on retry', async () => {
  let reject!: (reason: unknown) => void;
  const fetcher = vi
    .fn()
    .mockImplementationOnce(
      () =>
        new Promise((_resolve, rejectPromise) => {
          reject = rejectPromise;
        }),
    )
    .mockResolvedValue(new Response(JSON.stringify({ characters: [luke] })));
  vi.stubGlobal('fetch', fetcher);
  render(<App />);
  expect(screen.getByText('Accessing the archive')).toBeInTheDocument();
  reject(new TypeError('Failed to fetch'));
  await screen.findByRole('alert');
  await userEvent.click(screen.getByRole('button', { name: /Try again/ }));
  await screen.findByRole('heading', { name: 'Luke Skywalker' });
});
it('loads direct detail links and supports browser history changes', async () => {
  window.history.replaceState({}, '', '?character=1');
  vi.stubGlobal(
    'fetch',
    vi.fn(
      async (url: string) =>
        new Response(
          JSON.stringify(
            url.endsWith('/1') ? { character: luke } : { characters: [luke] },
          ),
        ),
    ),
  );
  render(<App />);
  await screen.findByText('172 cm');
  window.history.replaceState({}, '', '/');
  window.dispatchEvent(new PopStateEvent('popstate'));
  await waitFor(() =>
    expect(screen.getByRole('searchbox')).toBeInTheDocument(),
  );
});
