import { useSearchParams } from 'react-router-dom';
import { useLocale } from '../../../shared/i18n/useLocale';
import { AuthCard, RegisterForm } from '../../../modules/auth/ui';

export function RegisterPage() {
  const { t } = useLocale();
  const [searchParams] = useSearchParams();
  const rawRedirect = searchParams.get('redirect') || searchParams.get('from');
  const role = searchParams.get('role') || searchParams.get('tab');
  const loginUrlParams = new URLSearchParams();
  if (rawRedirect) loginUrlParams.set('redirect', rawRedirect);
  if (role) loginUrlParams.set('role', role);
  const loginUrl = loginUrlParams.toString()
    ? `/login?${loginUrlParams.toString()}`
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
