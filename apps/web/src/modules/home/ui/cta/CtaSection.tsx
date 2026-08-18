import { Link } from 'react-router-dom';
import { useLocale } from '../../../../shared/i18n/useLocale';
import styles from '../Home.module.css';

export function CtaSection() {
  const { t } = useLocale();

  return (
    <section className={styles['cta-section']}>
      <div className="container">
        <div className={styles['cta-card']}>
          <h2 className={styles['cta-title']}>{t('cta.title')}</h2>
          <p className={styles['cta-subtitle']}>{t('cta.subtitle')}</p>
          <Link to="/register" className="btn btn--primary btn--lg">
            {t('cta.button')}
          </Link>
        </div>
      </div>
    </section>
  );
}
