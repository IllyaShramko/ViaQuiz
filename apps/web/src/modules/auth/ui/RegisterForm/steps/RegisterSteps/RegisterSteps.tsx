import type { RegisterStepsProps } from './RegisterSteps.types';
import { useLocale } from '../../../../../../shared/i18n/useLocale';
import { CheckIcon } from '../../../../../../shared';
import styles from '../../../Auth.module.css';

export function RegisterSteps({ currentStep }: RegisterStepsProps) {
  const { t } = useLocale();

  const labels = [
    t('register.step_credentials'),
    t('register.step_profile'),
    t('register.step_verification'),
  ];

  return (
    <div className={styles['register-steps-container']} style={{ marginBottom: '32px' }}>
      {[0, 1, 2].map((step) => {
        const isActive = currentStep === step;
        const isCompleted = currentStep > step;
        const isUpcoming = currentStep < step;

        return (
          <div key={step} className={styles['register-step-wrapper']}>
            <div
              className={`${styles['register-step']} ${isActive ? styles['register-step--active'] : ''} ${
                isCompleted ? styles['register-step--completed'] : ''
              } ${isUpcoming ? styles['register-step--upcoming'] : ''}`}
            >
              <div className={styles['register-step__number']}>
                {isCompleted ? <CheckIcon size={18} /> : step + 1}
              </div>
              <div className={styles['register-step__label']}>{labels[step]}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
