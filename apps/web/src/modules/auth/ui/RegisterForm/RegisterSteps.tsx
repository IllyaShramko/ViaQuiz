import { useLocale } from '../../../../shared/i18n/useLocale';

export interface RegisterStepsProps {
  currentStep: number;
}

export function RegisterSteps({ currentStep }: RegisterStepsProps) {
  const { t } = useLocale();

  const labels = [
    t('register.step_credentials'),
    t('register.step_profile'),
    t('register.step_verification'),
  ];

  return (
    <div className="register-steps-container" style={{ marginBottom: '32px' }}>
      {[0, 1, 2].map((step) => {
        const isActive = currentStep === step;
        const isCompleted = currentStep > step;
        const isUpcoming = currentStep < step;

        let className = 'register-step-wrapper';
        if (isActive) className += ' active';
        if (isCompleted) className += ' completed';
        if (isUpcoming) className += ' upcoming';

        return (
          <div key={step} className={className}>
            <div
              className={`register-step ${isActive ? 'register-step--active' : ''} ${
                isCompleted ? 'register-step--completed' : ''
              } ${isUpcoming ? 'register-step--upcoming' : ''}`}
            >
              <div className="register-step__number">
                {isCompleted ? '✓' : step + 1}
              </div>
              <div className="register-step__label">{labels[step]}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
