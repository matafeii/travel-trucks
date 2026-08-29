import { RatingStars } from "@/components/RatingStars/RatingStars";
import type { Review } from "@/types/camper";
import styles from "./ReviewsList.module.css";

interface ReviewsListProps {
  reviews: Review[];
}

function reviewerInitial(name: string): string {
  return name.trim().charAt(0).toUpperCase() || "?";
}

export function ReviewsList({ reviews }: ReviewsListProps) {
  if (reviews.length === 0) {
    return <p className={styles.empty}>No reviews yet.</p>;
  }

  return (
    <section className={styles.reviews} aria-labelledby="reviews-heading">
      <h2 id="reviews-heading">Reviews</h2>
      <ul>
        {reviews.map((review) => (
          <li key={review.id}>
            <div className={styles.header}>
              <span className={styles.avatar} aria-hidden>
                {reviewerInitial(review.reviewer_name)}
              </span>
              <div className={styles.reviewer}>
                <h3>{review.reviewer_name}</h3>
                <RatingStars rating={review.reviewer_rating} />
              </div>
            </div>
            <p>{review.comment}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
