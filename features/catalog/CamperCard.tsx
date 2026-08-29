import Image from "next/image";
import Link from "next/link";
import { buttonClassNames } from "@/components/Button/Button";
import type {
  Amenity,
  CamperForm,
  CamperListItem,
  Engine,
  Transmission,
} from "@/types/camper";
import styles from "./CamperCard.module.css";

interface CamperCardProps {
  camper: CamperListItem;
}

interface Feature {
  icon?: string;
  label: string;
}

const featureLabels: Record<
  Amenity | CamperForm | Engine | Transmission,
  string
> = {
  ac: "AC",
  bathroom: "Bathroom",
  kitchen: "Kitchen",
  tv: "TV",
  radio: "Radio",
  refrigerator: "Refrigerator",
  microwave: "Microwave",
  gas: "Gas",
  water: "Water",
  alcove: "Alcove",
  panel_van: "Panel Van",
  integrated: "Integrated",
  semi_integrated: "Semi Integrated",
  diesel: "Diesel",
  petrol: "Petrol",
  hybrid: "Hybrid",
  electric: "Electric",
  automatic: "Automatic",
  manual: "Manual",
};

const featureIcons: Partial<
  Record<Amenity | CamperForm | Engine | Transmission, string>
> = {
  alcove: "/icons/alcove.svg",
  automatic: "/icons/automatic.svg",
  petrol: "/icons/petrol.svg",
};

function toFeature(
  value: Amenity | CamperForm | Engine | Transmission,
): Feature {
  return { icon: featureIcons[value], label: featureLabels[value] };
}

export function CamperCard({ camper }: CamperCardProps) {
  const features = [
    toFeature(camper.transmission),
    toFeature(camper.engine),
    toFeature(camper.form),
    ...camper.amenities.map(toFeature),
  ];

  return (
    <article className={styles.card}>
      <div className={styles.cover}>
        <Image
          src={camper.coverImage}
          alt={`${camper.name} camper`}
          fill
          loading="eager"
          sizes="219px"
        />
      </div>

      <div className={styles.content}>
        <div className={styles.details}>
          <div className={styles.headingRow}>
            <h2 title={camper.name}>{camper.name}</h2>
            <p className={styles.price}>€{camper.price.toFixed(2)}</p>
          </div>

          <div className={styles.meta}>
            <span className={styles.rating}>
              <Image
                aria-hidden
                src="/icons/star-filled.svg"
                alt=""
                width={16}
                height={16}
              />
              {camper.rating} ({camper.totalReviews} Reviews)
            </span>
            <span>
              <Image
                aria-hidden
                src="/icons/map.svg"
                alt=""
                width={16}
                height={16}
              />
              {camper.location}
            </span>
          </div>

          <p className={styles.description} title={camper.description}>
            {camper.description}
          </p>

          <ul aria-label="Camper features" className={styles.features}>
            {features.map(({ icon, label }, index) => (
              <li key={`${label}-${index}`}>
                {icon ? (
                  <Image aria-hidden src={icon} alt="" width={20} height={20} />
                ) : null}
                <span>{label}</span>
              </li>
            ))}
          </ul>
        </div>

        <Link
          className={`${buttonClassNames.primary} ${styles.moreLink}`}
          href={`/catalog/${camper.id}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Show more
        </Link>
      </div>
    </article>
  );
}
