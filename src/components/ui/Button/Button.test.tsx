// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it, vi } from 'vitest';
import { Button } from './Button';
afterEach(cleanup);
it('does not accidentally submit a form and honours native disabled behaviour', async () => {
  const submit = vi.fn((event) => event.preventDefault());
  const click = vi.fn();
  const { rerender } = render(
    <form onSubmit={submit}>
      <Button onClick={click}>Retry</Button>
    </form>,
  );
  await userEvent.click(screen.getByRole('button', { name: 'Retry' }));
  expect(click).toHaveBeenCalledTimes(1);
  expect(submit).not.toHaveBeenCalled();
  rerender(
    <Button disabled onClick={click}>
      Retry
    </Button>,
  );
  await userEvent.click(screen.getByRole('button', { name: 'Retry' }));
  expect(click).toHaveBeenCalledTimes(1);
  expect(screen.getByRole('button', { name: 'Retry' })).toBeDisabled();
});
