import { useLocale } from '../../../shared/i18n/useLocale';
import { AuthCard, LoginForm } from '../../../modules/auth/ui';
import './LoginPage.css';

export function LoginPage() {
  const { t } = useLocale();

  return (
    <AuthCard
      title={t('login.title')}
      subtitle={t('login.subtitle')}
      footerText={t('login.no_account')}
      footerLinkText={t('login.sign_up_link')}
      footerLinkTo="/register"
    >
      <LoginForm />
    </AuthCard>
  );
}
