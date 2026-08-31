import { useSearchParams } from 'react-router-dom';
import { useLocale } from '../../../shared/i18n/useLocale';
import { AuthCard, LoginForm } from '../../../modules/auth/ui';

export function LoginPage() {
  const { t } = useLocale();
  const [searchParams] = useSearchParams();
  const rawRedirect = searchParams.get('redirect') || searchParams.get('from');
  const role = searchParams.get('role') || searchParams.get('tab');
  const registerUrlParams = new URLSearchParams();
  if (rawRedirect) registerUrlParams.set('redirect', rawRedirect);
  if (role) registerUrlParams.set('role', role);
  const registerUrl = registerUrlParams.toString()
    ? `/register?${registerUrlParams.toString()}`
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
