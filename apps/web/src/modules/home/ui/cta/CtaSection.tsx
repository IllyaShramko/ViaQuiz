import { Link } from 'react-router-dom';
import { useLocale } from '../../../../shared/i18n/useLocale';

export function CtaSection() {
  const { t } = useLocale();

  return (
    <section className="cta-section">
      <div className="container">
        <div className="cta-card">
          <h2 className="cta-title">{t('cta.title')}</h2>
          <p className="cta-subtitle">{t('cta.subtitle')}</p>
          <Link to="/register" className="btn btn--primary btn--lg">
            {t('cta.button')}
          </Link>
        </div>
      </div>
    </section>
  );
}
