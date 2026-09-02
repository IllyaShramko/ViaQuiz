import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import type { HeroCodeFormProps } from './HeroCodeForm.types';
import { useLocale } from '../../../../shared/i18n/useLocale';
import styles from '../Home.module.css';

export function HeroCodeForm({ onSubmitCode }: HeroCodeFormProps) {
  const { t } = useLocale();
  const navigate = useNavigate();
  const [code, setCode] = useState('');

  const handleCodeSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (onSubmitCode) {
      onSubmitCode(code.trim());
      return;
    }

    if (code.trim()) {
      navigate(`/join?code=${encodeURIComponent(code.trim())}`);
    } else {
      navigate('/join');
    }
  };


  return (
    <form id="enter-code" className={styles['hero__code-form']} onSubmit={handleCodeSubmit}>
      <input
        type="text"
        placeholder={t('hero.codePlaceholder')}
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className={styles['hero__code-input']}
        maxLength={12}
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
