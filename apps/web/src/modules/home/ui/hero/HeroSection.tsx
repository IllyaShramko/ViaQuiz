import { Link } from 'react-router-dom';
import { useLocale } from '../../../../shared/i18n/useLocale';
import { HeroCodeForm } from './HeroCodeForm';

export interface HeroSectionProps {
  onEnterCode?: (code: string) => void;
}

export function HeroSection({ onEnterCode }: HeroSectionProps) {
  const { t } = useLocale();

  return (
    <section className="hero">
      <div className="hero__orb" />
      <div className="hero__content">
        <h1 className="hero__title">
          <span className="hero__accent">{t('hero.titleAccent')}</span>{' '}
          {t('hero.title')}
        </h1>
        <p className="hero__subtitle">{t('hero.subtitle')}</p>
        <div className="hero__actions">
          <Link to="/register" className="btn btn--primary btn--lg">
            {t('hero.cta')}
          </Link>
          <HeroCodeForm onSubmitCode={onEnterCode} />
        </div>
      </div>
    </section>
  );
}
