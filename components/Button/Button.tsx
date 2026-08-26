import clsx from 'clsx';
import type { ButtonHTMLAttributes } from 'react';
import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary';

export const buttonClassNames: Readonly<Record<ButtonVariant, string>> = {
  primary: clsx(styles.button, styles.primary),
  secondary: clsx(styles.button, styles.secondary),
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  fullWidth?: boolean;
}

export function Button({
  className,
  fullWidth = false,
  type = 'button',
  variant = 'primary',
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(buttonClassNames[variant], fullWidth && styles.fullWidth, className)}
      type={type}
      {...props}
    />
  );
}
