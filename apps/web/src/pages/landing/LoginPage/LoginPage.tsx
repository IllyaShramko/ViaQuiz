import { useSearchParams } from 'react-router-dom';
import { useLocale } from '../../../shared/i18n/useLocale';
import { AuthCard, LoginForm } from '../../../modules/auth/ui';

export function LoginPage() {
  const { t } = useLocale();
  const [searchParams] = useSearchParams();
  const rawRedirect = searchParams.get('redirect') || searchParams.get('from');
  const registerUrl = rawRedirect
    ? `/register?redirect=${encodeURIComponent(rawRedirect)}`
    : '/register';

  return (
    <AuthCard
      title={t('login.title')}
      subtitle={t('login.subtitle')}
      footerText={t('login.no_account')}
      footerLinkText={t('login.sign_up_link')}
      footerLinkTo={registerUrl}
    >
      <LoginForm />
    </AuthCard>
  );
}
