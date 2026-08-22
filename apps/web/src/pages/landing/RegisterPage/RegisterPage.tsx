import { useSearchParams } from 'react-router-dom';
import { useLocale } from '../../../shared/i18n/useLocale';
import { AuthCard, RegisterForm } from '../../../modules/auth/ui';

export function RegisterPage() {
  const { t } = useLocale();
  const [searchParams] = useSearchParams();
  const rawRedirect = searchParams.get('redirect') || searchParams.get('from');
  const loginUrl = rawRedirect
    ? `/login?redirect=${encodeURIComponent(rawRedirect)}`
    : '/login';

  return (
    <AuthCard
      title={t('register.title')}
      subtitle={t('register.subtitle')}
      footerText={t('register.have_account')}
      footerLinkText={t('register.login_link')}
      footerLinkTo={loginUrl}
      isWide
    >
      <RegisterForm />
    </AuthCard>
  );
}
