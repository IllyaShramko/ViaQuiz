import type { ButtonProps, ButtonSize, ButtonVariant } from './Button.types';
import styles from './Button.module.css';

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: styles.variantPrimary,
  secondary: styles.variantSecondary,
  danger: styles.variantDanger,
  ghost: styles.variantGhost,
};

const SIZE_CLASS: Record<ButtonSize, string> = {
  sm: styles.sizeSm,
  md: styles.sizeMd,
};

export function Button({
  variant = 'secondary',
  size = 'md',
  fullWidth = false,
  type = 'button',
  className,
  children,
  ...rest
}: ButtonProps) {
  const classes = [
    styles.button,
    VARIANT_CLASS[variant],
    SIZE_CLASS[size],
    fullWidth ? styles.fullWidth : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button type={type} className={classes} {...rest}>
      {children}
    </button>
  );
}
