import { useLocale } from '../../../../shared/i18n/useLocale';
import { StepItem } from './StepItem';

export function HowItWorksSection() {
  const { t } = useLocale();

  return (
    <section className="how-it-works">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">{t('howItWorks.title')}</h2>
        </div>
        <div className="steps-container">
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
