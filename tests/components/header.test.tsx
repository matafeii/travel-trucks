import { render, screen } from '@testing-library/react';
import { Header } from '@/components/Header/Header';

vi.mock('next/navigation', () => ({ usePathname: () => '/catalog' }));

it('marks Catalog as the current route', () => {
  render(<Header />);

  expect(screen.getByRole('link', { name: 'Catalog' })).toHaveAttribute('aria-current', 'page');
  expect(screen.getByRole('link', { name: 'Home' })).not.toHaveAttribute('aria-current');
});
