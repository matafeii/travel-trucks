import { render, screen } from '@testing-library/react';
import { ApiError } from '@/lib/api/client';
import { camperDetails } from '@/tests/fixtures/campers';

const { getCamperMock, notFoundMock } = vi.hoisted(() => ({
  getCamperMock: vi.fn(),
  notFoundMock: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
}));

vi.mock('@/lib/api/campers', () => ({ getCamper: getCamperMock }));
vi.mock('next/navigation', () => ({ notFound: notFoundMock }));

import CamperPage from '@/app/catalog/[camperId]/page';

beforeEach(() => {
  getCamperMock.mockReset();
  notFoundMock.mockClear();
});

it('renders the camper overview from the requested id', async () => {
  getCamperMock.mockResolvedValue(camperDetails);

  render(
    await CamperPage({
      params: Promise.resolve({ camperId: 'camper/one' }),
    }),
  );

  expect(getCamperMock).toHaveBeenCalledWith('camper/one');
  expect(screen.getByRole('heading', { level: 1, name: 'Travel Truck' })).toBeInTheDocument();
  expect(screen.getByText('€8000')).toBeInTheDocument();
  expect(screen.getByText('Kyiv, Ukraine')).toBeInTheDocument();
  expect(screen.getByText('4.8 (1 Review)')).toBeInTheDocument();
  expect(screen.getByText('A compact camper for two.')).toBeInTheDocument();
  expect(screen.getByRole('heading', { level: 2, name: 'Vehicle details' })).toBeInTheDocument();
  expect(screen.getAllByText('Panel truck')).toHaveLength(2);
  expect(screen.getByRole('img', { name: 'Travel Truck camper' })).toHaveAttribute(
    'loading',
    'eager',
  );
});

it('maps only an API 404 to the not-found route', async () => {
  getCamperMock.mockRejectedValue(new ApiError('Missing camper', 404));

  await expect(
    CamperPage({ params: Promise.resolve({ camperId: 'missing' }) }),
  ).rejects.toThrow('NEXT_NOT_FOUND');
  expect(notFoundMock).toHaveBeenCalledOnce();
});

it.each([
  ['another API status', new ApiError('Server error', 500)],
  ['a network failure', new TypeError('fetch failed')],
])('rethrows %s', async (_label, error) => {
  getCamperMock.mockRejectedValue(error);

  await expect(
    CamperPage({ params: Promise.resolve({ camperId: 'camper-1' }) }),
  ).rejects.toBe(error);
  expect(notFoundMock).not.toHaveBeenCalled();
});
