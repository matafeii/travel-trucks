import clsx from 'clsx';
import type { HTMLAttributes } from 'react';
import styles from './Container.module.css';

export function Container({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx(styles.container, className)} {...props} />;
}
