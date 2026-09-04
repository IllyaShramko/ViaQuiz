import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import {
  heroCodeSchema,
  type HeroCodeFormData,
  type HeroCodeFormProps,
} from './HeroCodeForm.types';
import { useLocale } from '../../../../shared/i18n/useLocale';
import styles from '../Home.module.css';

export function HeroCodeForm({ onSubmitCode }: HeroCodeFormProps) {
  const { t } = useLocale();
  const navigate = useNavigate();

  const { register, handleSubmit } = useForm<HeroCodeFormData>({
    resolver: zodResolver(heroCodeSchema),
    defaultValues: {
      code: '',
    },
  });

  const onSubmit = (data: HeroCodeFormData) => {
    const trimmed = data.code.trim();
    if (onSubmitCode) {
      onSubmitCode(trimmed);
      return;
    }

    if (trimmed) {
      navigate(`/join?code=${encodeURIComponent(trimmed)}`);
    } else {
      navigate('/join');
    }
  };

  return (
    <form id="enter-code" className={styles['hero__code-form']} onSubmit={handleSubmit(onSubmit)}>
      <input
        type="text"
        placeholder={t('hero.codePlaceholder')}
        className={styles['hero__code-input']}
        maxLength={12}
        {...register('code')}
      />
      <button type="submit" className={styles['hero__code-submit']} aria-label={t('hero.submitCode')}>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 12h14" />
          <path d="M12 5l7 7-7 7" />
        </svg>
      </button>
    </form>
  );
}
