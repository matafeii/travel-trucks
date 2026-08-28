import Image from "next/image";
import styles from "./RatingStars.module.css";

interface RatingStarsProps {
  rating: number;
}

const STAR_COUNT = 5;

export function RatingStars({ rating }: RatingStarsProps) {
  const normalizedRating = Math.max(
    0,
    Math.min(STAR_COUNT, Math.round(rating)),
  );

  return (
    <span
      className={styles.rating}
      aria-label={`${normalizedRating} out of ${STAR_COUNT} stars`}
    >
      {Array.from({ length: STAR_COUNT }, (_, index) => {
        const active = index < normalizedRating;

        return (
          <span
            className={styles.star}
            data-active={active}
            data-testid="rating-star"
            key={index}
          >
            <Image
              aria-hidden
              src={active ? "/icons/star-filled.svg" : "/icons/star-empty.svg"}
              alt=""
              width={16}
              height={16}
            />
          </span>
        );
      })}
    </span>
  );
}
