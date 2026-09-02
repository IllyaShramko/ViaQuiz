import type { DraftsHeroProps } from './DraftsHero.types';
import styles from '../Drafts.module.css';

export function DraftsHero({
  title = 'Ваші чернетки вікторин',
  subtitle,
  maxDrafts = 3,
}: DraftsHeroProps) {
  const defaultSubtitle = `Оберіть існуючу чернетку для продовження редагування або створіть нову (максимум ${maxDrafts})`;

  return (
    <div className={styles['drafts-hero']}>
      <h2 className={styles['drafts-hero__title']}>{title}</h2>
      <p className={styles['drafts-hero__subtitle']}>{subtitle || defaultSubtitle}</p>
    </div>
  );
}
