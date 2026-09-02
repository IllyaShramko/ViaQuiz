import type { StepItemProps } from './StepItem.types';
import styles from '../Home.module.css';

export function StepItem({ number, title, description }: StepItemProps) {
  return (
    <div className={styles['step-item']}>
      <div className={styles['step-badge']}>{number}</div>
      <h3 className={styles['step-title']}>{title}</h3>
      <p className={styles['step-desc']}>{description}</p>
    </div>
  );
}
