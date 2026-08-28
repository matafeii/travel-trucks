import { ApiError } from '@/lib/api/client';
import { camperDetails } from '@/tests/fixtures/campers';

const { getCamperMock } = vi.hoisted(() => ({ getCamperMock: vi.fn() }));

vi.mock('@/lib/api/campers', () => ({ getCamper: getCamperMock }));

import { generateMetadata } from '@/app/catalog/[camperId]/page';

beforeEach(() => {
  getCamperMock.mockReset();
});

it('uses the camper name and description in dynamic metadata', async () => {
  const longDescription = 'A'.repeat(200);
  getCamperMock.mockResolvedValue({ ...camperDetails, description: longDescription });

  const metadata = await generateMetadata({
    params: Promise.resolve({ camperId: 'camper-1' }),
  });

  expect(getCamperMock).toHaveBeenCalledWith('camper-1');
  expect(metadata).toEqual({
    title: 'Travel Truck | TravelTrucks',
    description: longDescription.slice(0, 155),
  });
});

it('returns useful metadata when the camper is missing', async () => {
  getCamperMock.mockRejectedValue(new ApiError('Missing camper', 404));

  await expect(
    generateMetadata({ params: Promise.resolve({ camperId: 'missing' }) }),
  ).resolves.toEqual({
    title: 'Camper not found | TravelTrucks',
    description: 'The requested camper could not be found.',
  });
});

it.each([
  ['another API status', new ApiError('Server error', 500)],
  ['a network failure', new TypeError('fetch failed')],
])('rethrows %s while generating metadata', async (_label, error) => {
  getCamperMock.mockRejectedValue(error);

  await expect(
    generateMetadata({ params: Promise.resolve({ camperId: 'camper-1' }) }),
  ).rejects.toBe(error);
});
