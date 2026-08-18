import { useLocale } from '../../../../shared/i18n/useLocale';
import { FeatureCard } from './FeatureCard';
import styles from '../Home.module.css';

export function FeaturesSection() {
  const { t } = useLocale();

  const featureKeys = ['create', 'share', 'analyze', 'ai'] as const;

  const featureIcons = [
    // Create — pencil/edit icon
    <svg
      key="create"
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>,
    // Share — share icon
    <svg
      key="share"
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>,
    // Analyze — bar chart icon
    <svg
      key="analyze"
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>,
    // AI — sparkles/wand icon
    <svg
      key="ai"
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z" />
    </svg>,
  ];

  return (
    <section className={styles['features']}>
      <div className="container">
        <div className={styles['section-header']}>
          <h2 className={styles['section-title']}>{t('features.title')}</h2>
          <p className={styles['section-subtitle']}>{t('features.subtitle')}</p>
        </div>
        <div className={styles['features-grid']}>
          {featureKeys.map((key, i) => (
            <FeatureCard
              key={key}
              icon={featureIcons[i]}
              title={t(`features.${key}.title`)}
              description={t(`features.${key}.description`)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
