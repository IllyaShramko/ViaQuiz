import { Link } from 'react-router-dom';
import { useLocale } from '../../../../shared/i18n/useLocale';
import { HeroCodeForm } from './HeroCodeForm';
import styles from '../Home.module.css';

export interface HeroSectionProps {
  onEnterCode?: (code: string) => void;
}

export function HeroSection({ onEnterCode }: HeroSectionProps) {
  const { t } = useLocale();

  return (
    <section className={styles['hero']}>
      <div className={styles['hero__orb']} />
      <div className={styles['hero__content']}>
        <h1 className={styles['hero__title']}>
          <span className={styles['hero__accent']}>{t('hero.titleAccent')}</span>{' '}
          {t('hero.title')}
        </h1>
        <p className={styles['hero__subtitle']}>{t('hero.subtitle')}</p>
        <div className={styles['hero__actions']}>
          <Link to="/register" className="btn btn--primary btn--lg">
            {t('hero.cta')}
          </Link>
          <HeroCodeForm onSubmitCode={onEnterCode} />
        </div>
      </div>
    </section>
  );
}
