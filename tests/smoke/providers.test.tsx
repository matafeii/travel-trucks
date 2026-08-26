import { render, screen } from '@testing-library/react';
import { Providers } from '@/app/providers';

describe('Providers', () => {
  it('renders children inside application providers', () => {
    render(
      <Providers>
        <p>TravelTrucks ready</p>
      </Providers>,
    );

    expect(screen.getByText('TravelTrucks ready')).toBeInTheDocument();
  });
});
