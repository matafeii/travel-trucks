import Image from 'next/image';
import { BookingForm } from '@/features/booking/BookingForm';
import { CamperGallery } from '@/features/camper-details/CamperGallery';
import { ReviewsList } from '@/features/camper-details/ReviewsList';
import type {
  Amenity,
  CamperDetails,
  CamperForm,
  Engine,
  Transmission,
  Review,
} from '@/types/camper';
import styles from './CamperOverview.module.css';

interface CamperOverviewProps {
  camper: CamperDetails;
  reviews?: Review[];
}

type FeatureValue = Amenity | CamperForm | Engine | Transmission;

const featureLabels: Record<FeatureValue, string> = {
  ac: 'AC',
  bathroom: 'Bathroom',
  kitchen: 'Kitchen',
  tv: 'TV',
  radio: 'Radio',
  refrigerator: 'Refrigerator',
  microwave: 'Microwave',
  gas: 'Gas',
  water: 'Water',
  alcove: 'Alcove',
  panel_van: 'Panel truck',
  integrated: 'Fully integrated',
  semi_integrated: 'Semi-integrated',
  diesel: 'Diesel',
  petrol: 'Petrol',
  hybrid: 'Hybrid',
  electric: 'Electric',
  automatic: 'Automatic',
  manual: 'Manual',
};

function featureValues(camper: CamperDetails): FeatureValue[] {
  const hasAirConditioning = camper.amenities.includes('ac');
  const otherAmenities = camper.amenities.filter((amenity) => amenity !== 'ac');

  return [
    camper.transmission,
    ...(hasAirConditioning ? (['ac'] as const) : []),
    camper.engine,
    ...otherAmenities,
    camper.form,
  ];
}

export function CamperOverview({ camper, reviews = [] }: CamperOverviewProps) {
  const reviewLabel = camper.totalReviews === 1 ? 'Review' : 'Reviews';
  const details = [
    ['Form', featureLabels[camper.form]],
    ['Length', camper.length],
    ['Width', camper.width],
    ['Height', camper.height],
    ['Tank', camper.tank],
    ['Consumption', camper.consumption],
  ];

  return (
    <section className={styles.overview} aria-labelledby="camper-name">
      <CamperGallery camperName={camper.name} images={camper.gallery} />

      <div className={styles.information}>
        <div className={styles.summaryCard}>
          <div className={styles.headingGroup}>
            <h1 id="camper-name">{camper.name}</h1>

            <div className={styles.commercialDetails}>
              <div className={styles.meta}>
                <span className={styles.rating}>
                  <Image
                    aria-hidden
                    src="/icons/star-filled.svg"
                    alt=""
                    width={16}
                    height={16}
                  />
                  {camper.rating} ({camper.totalReviews} {reviewLabel})
                </span>
                <span>
                  <Image
                    aria-hidden
                    src="/icons/map-details.svg"
                    alt=""
                    width={16}
                    height={16}
                  />
                  {camper.location}
                </span>
              </div>

              <p className={styles.price}>€{camper.price.toFixed(2)}</p>
            </div>
          </div>

          <p className={styles.description}>{camper.description}</p>
        </div>

        <div className={styles.detailsCard}>
          <div className={styles.featuresSection}>
            <h2>Vehicle details</h2>
            <ul aria-label="Camper features" className={styles.features}>
              {featureValues(camper).map((feature, index) => (
                <li key={`${feature}-${index}`}>{featureLabels[feature]}</li>
              ))}
            </ul>
          </div>

          <span className={styles.divider} aria-hidden>
            <Image
              src="/icons/divider.svg"
              alt=""
              fill
              sizes="650px"
            />
          </span>

          <dl className={styles.specifications}>
            {details.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <ReviewsList reviews={reviews} />
        <BookingForm camperId={camper.id} />
      </div>
    </section>
  );
}
