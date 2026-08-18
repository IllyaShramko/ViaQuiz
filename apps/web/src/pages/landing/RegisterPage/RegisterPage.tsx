import { useLocale } from '../../../shared/i18n/useLocale';
import { AuthCard, RegisterForm } from '../../../modules/auth/ui';

export function RegisterPage() {
  const { t } = useLocale();

  return (
    <AuthCard
      title={t('register.title')}
      subtitle={t('register.subtitle')}
      footerText={t('register.have_account')}
      footerLinkText={t('register.login_link')}
      footerLinkTo="/login"
      isWide
    >
      <RegisterForm />
    </AuthCard>
  );
}
