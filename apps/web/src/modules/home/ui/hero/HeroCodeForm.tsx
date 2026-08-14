import { useState, type FormEvent } from 'react';
import { useLocale } from '../../../../shared/i18n/useLocale';

export interface HeroCodeFormProps {
  onSubmitCode?: (code: string) => void;
}

export function HeroCodeForm({ onSubmitCode }: HeroCodeFormProps) {
  const { t } = useLocale();
  const [code, setCode] = useState('');

  const handleCodeSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (code.trim()) {
      if (onSubmitCode) {
        onSubmitCode(code.trim());
      } else {
        alert(`${t('hero.enterCode')}: ${code.trim()}`);
      }
    }
  };

  return (
    <form id="enter-code" className="hero__code-form" onSubmit={handleCodeSubmit}>
      <input
        type="text"
        placeholder={t('hero.codePlaceholder')}
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="hero__code-input"
        maxLength={12}
      />
      <button type="submit" className="btn btn--secondary" aria-label={t('hero.submitCode')}>
        →
      </button>
    </form>
  );
}
