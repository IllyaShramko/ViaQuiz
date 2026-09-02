import type { FeatureCardProps } from './FeatureCard.types';
import styles from '../Home.module.css';

export function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className={styles['feature-card']}>
      <div className={styles['feature-icon']}>{icon}</div>
      <h3 className={styles['feature-title']}>{title}</h3>
      <p className={styles['feature-desc']}>{description}</p>
    </div>
  );
}
