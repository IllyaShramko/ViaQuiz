import type { ReactNode } from 'react';
import styles from '../Home.module.css';

export interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className={styles['feature-card']}>
      <div className={styles['feature-icon']}>{icon}</div>
      <h3 className={styles['feature-title']}>{title}</h3>
      <p className={styles['feature-desc']}>{description}</p>
    </div>
  );
}
