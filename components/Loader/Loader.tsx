import clsx from 'clsx';
import styles from './Loader.module.css';

interface LoaderProps {
  label?: string;
  compact?: boolean;
}

export function Loader({
  label = 'Loading campers',
  compact = false,
}: LoaderProps) {
  return (
    <div
      className={clsx(styles.loader, compact && styles.compact)}
      role="status"
    >
      <span aria-hidden className={styles.spinner} />
      <span>{label}</span>
    </div>
  );
}
