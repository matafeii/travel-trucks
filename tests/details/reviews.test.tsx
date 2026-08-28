import { render, screen, within } from '@testing-library/react';
import { RatingStars } from '@/components/RatingStars/RatingStars';
import { ReviewsList } from '@/features/camper-details/ReviewsList';
import type { Review } from '@/types/camper';

const reviews: Review[] = [
  {
    id: 'review-2',
    camperId: 'camper-1',
    reviewer_name: 'Bob Stone',
    reviewer_rating: 3,
    comment: 'Second API review.',
    createdAt: '2026-01-02T00:00:00.000Z',
  },
  {
    id: 'review-1',
    camperId: 'camper-1',
    reviewer_name: 'Alice Ray',
    reviewer_rating: 5,
    comment: 'First API review.',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
];

it('renders exactly five stars with one readable rating label', () => {
  render(<RatingStars rating={3} />);

  const stars = screen.getAllByTestId('rating-star');
  expect(stars).toHaveLength(5);
  expect(stars.filter((star) => star.dataset.active === 'true')).toHaveLength(3);
  expect(screen.getByLabelText('3 out of 5 stars')).toBeInTheDocument();
  expect(screen.getAllByRole('presentation', { hidden: true })).toHaveLength(5);
});

it('preserves API review order and renders reviewer initials, ratings, and comments', () => {
  render(<ReviewsList reviews={reviews} />);

  const items = screen.getAllByRole('listitem');
  expect(items[0]).toHaveTextContent('Bob Stone');
  expect(items[0]).toHaveTextContent('B');
  expect(items[0]).toHaveTextContent('Second API review.');
  expect(within(items[0]).getByLabelText('3 out of 5 stars')).toBeInTheDocument();
  expect(items[1]).toHaveTextContent('Alice Ray');
  expect(items[1]).toHaveTextContent('First API review.');
});

it('renders a neutral message when there are no reviews', () => {
  render(<ReviewsList reviews={[]} />);

  expect(screen.getByText('No reviews yet.')).toBeInTheDocument();
  expect(screen.queryByRole('list')).not.toBeInTheDocument();
});
