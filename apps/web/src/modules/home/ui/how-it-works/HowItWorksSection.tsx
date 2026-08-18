import { useLocale } from '../../../../shared/i18n/useLocale';
import { StepItem } from './StepItem';
import styles from '../Home.module.css';

export function HowItWorksSection() {
  const { t } = useLocale();

  return (
    <section className={styles['how-it-works']}>
      <div className="container">
        <div className={styles['section-header']}>
          <h2 className={styles['section-title']}>{t('howItWorks.title')}</h2>
        </div>
        <div className={styles['steps-container']}>
          {[1, 2, 3].map((num) => (
            <StepItem
              key={num}
              number={num}
              title={t(`howItWorks.step${num}.title`)}
              description={t(`howItWorks.step${num}.description`)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
