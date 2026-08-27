import type { CamperListItem } from '@/types/camper';
import { CamperCard } from './CamperCard';
import styles from './CamperList.module.css';

interface CamperListProps {
  campers: CamperListItem[];
}

export function CamperList({ campers }: CamperListProps) {
  return (
    <ul aria-label="Campers" className={styles.list}>
      {campers.map((camper) => (
        <li key={camper.id}>
          <CamperCard camper={camper} />
        </li>
      ))}
    </ul>
  );
}
