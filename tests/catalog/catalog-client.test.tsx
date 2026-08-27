import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { CatalogClient } from '@/features/catalog/CatalogClient';
import { API_BASE_URL } from '@/lib/api/client';
import { camperDetails } from '@/tests/fixtures/campers';
import { server } from '@/tests/msw/server';
import type {
  CamperListItem,
  CamperListResponse,
  CatalogFilters,
} from '@/types/camper';

const replaceMock = vi.hoisted(() => vi.fn());

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: replaceMock }),
}));

const emptyFilters: CatalogFilters = {
  location: '',
  form: '',
  engine: '',
  transmission: '',
};

function makeCamper(index: number, location = 'Kyiv, Ukraine'): CamperListItem {
  return {
    id: `camper-${index}`,
    name: `Camper ${index}`,
    price: camperDetails.price + index,
    rating: camperDetails.rating,
    totalReviews: camperDetails.totalReviews,
    location,
    description: camperDetails.description,
    form: camperDetails.form,
    length: camperDetails.length,
    width: camperDetails.width,
    height: camperDetails.height,
    tank: camperDetails.tank,
    consumption: camperDetails.consumption,
    transmission: camperDetails.transmission,
    engine: camperDetails.engine,
    amenities: camperDetails.amenities,
    coverImage: camperDetails.gallery[0].thumb,
  };
}

function response(
  page: number,
  campers: CamperListItem[],
  totalPages: number,
): CamperListResponse {
  return {
    page,
    perPage: 4,
    total: totalPages * 4,
    totalPages,
    campers,
  };
}

function renderCatalog(initialFilters: CatalogFilters = emptyFilters) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <CatalogClient initialFilters={initialFilters} />
    </QueryClientProvider>,
  );
}

beforeEach(() => replaceMock.mockReset());

it('loads backend pages and resets accumulated cards when filters change', async () => {
  const user = userEvent.setup();
  const requestedUrls: string[] = [];
  const firstPage = [1, 2, 3, 4].map((index) => makeCamper(index));
  const secondPage = [5, 6, 7, 8].map((index) => makeCamper(index));
  const filteredCamper = makeCamper(9, 'Lviv, Ukraine');

  server.use(
    http.get(`${API_BASE_URL}/campers`, ({ request }) => {
      const url = new URL(request.url);
      requestedUrls.push(url.toString());

      if (url.searchParams.get('location') === 'Lviv') {
        return HttpResponse.json(response(1, [filteredCamper], 1));
      }

      return HttpResponse.json(
        url.searchParams.get('page') === '2'
          ? response(2, secondPage, 2)
          : response(1, firstPage, 2),
      );
    }),
  );

  renderCatalog();

  expect(await screen.findAllByRole('article')).toHaveLength(4);
  await user.click(screen.getByRole('button', { name: 'Load More' }));
  expect(await screen.findAllByRole('article')).toHaveLength(8);
  expect(
    screen.queryByRole('button', { name: 'Load More' }),
  ).not.toBeInTheDocument();

  await user.type(screen.getByLabelText('Location'), ' Lviv ');
  await user.click(screen.getByRole('button', { name: 'Search' }));

  expect(await screen.findAllByRole('article')).toHaveLength(1);
  expect(screen.getByText('Camper 9')).toBeInTheDocument();
  expect(screen.queryByText('Camper 1')).not.toBeInTheDocument();
  expect(replaceMock).toHaveBeenCalledWith('/catalog?location=Lviv');
  expect(requestedUrls).toEqual([
    `${API_BASE_URL}/campers?page=1&perPage=4`,
    `${API_BASE_URL}/campers?page=2&perPage=4`,
    `${API_BASE_URL}/campers?page=1&perPage=4&location=Lviv`,
  ]);
});

it('renders a distinct empty result state and hides Load More', async () => {
  server.use(
    http.get(`${API_BASE_URL}/campers`, () =>
      HttpResponse.json(response(1, [], 1)),
    ),
  );

  renderCatalog();

  expect(await screen.findByText('No campers found.')).toBeInTheDocument();
  expect(screen.queryByRole('article')).not.toBeInTheDocument();
  expect(
    screen.queryByRole('button', { name: 'Load More' }),
  ).not.toBeInTheDocument();
});

it('renders a distinct catalog error state', async () => {
  server.use(
    http.get(`${API_BASE_URL}/campers`, () =>
      HttpResponse.json({ message: 'Catalog unavailable' }, { status: 503 }),
    ),
  );

  renderCatalog();

  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Catalog unavailable',
  );
});

it('disables Load More only while the next page request is active', async () => {
  const user = userEvent.setup();
  const firstPage = [1, 2, 3, 4].map((index) => makeCamper(index));
  const secondPage = [5, 6, 7, 8].map((index) => makeCamper(index));
  let resolveNextPage: (() => void) | undefined;

  server.use(
    http.get(`${API_BASE_URL}/campers`, async ({ request }) => {
      const page = new URL(request.url).searchParams.get('page');

      if (page === '2') {
        await new Promise<void>((resolve) => {
          resolveNextPage = resolve;
        });
        return HttpResponse.json(response(2, secondPage, 2));
      }

      return HttpResponse.json(response(1, firstPage, 2));
    }),
  );

  renderCatalog();
  await screen.findAllByRole('article');

  const loadMore = screen.getByRole('button', { name: 'Load More' });
  await user.click(loadMore);

  expect(loadMore).toBeDisabled();
  expect(screen.getByRole('status')).toHaveTextContent('Loading more campers');

  resolveNextPage?.();
  await waitFor(() => expect(screen.getAllByRole('article')).toHaveLength(8));
});
