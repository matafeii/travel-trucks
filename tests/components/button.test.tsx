import { render, screen } from '@testing-library/react';
import { Button } from '@/components/Button/Button';

it('renders a non-submitting native button by default', () => {
  render(<Button>Search</Button>);

  expect(screen.getByRole('button', { name: 'Search' })).toHaveAttribute('type', 'button');
});
