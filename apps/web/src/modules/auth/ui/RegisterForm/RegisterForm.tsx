import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useLocale } from '../../../../shared/i18n/useLocale';
import {
  useRegisterMutation,
  useCheckUniqueMutation,
  useSendCodeMutation,
} from '../../api/authApi';
import { useUserContext } from '../../context';
import { getUserDashboardPath } from '../../utils';
import type { RegisterFormInputs } from '../../models';
import { RegisterSteps } from './RegisterSteps';
import { StepCredentials } from './StepCredentials';
import { StepProfile } from './StepProfile';
import { StepVerification } from './StepVerification';

export interface RegisterFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function RegisterForm({ onSuccess, onError }: RegisterFormProps) {
  const { t } = useLocale();
  const navigate = useNavigate();
  const { login: setAuthContext } = useUserContext();

  const [currentStep, setCurrentStep] = useState(0);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isCheckingUnique, setIsCheckingUnique] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [targetEmail, setTargetEmail] = useState('');

  const [registerApi] = useRegisterMutation();
  const [checkUnique] = useCheckUniqueMutation();
  const [sendCode] = useSendCodeMutation();

  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormInputs>({
    mode: 'onTouched',
  });

  useEffect(() => {
    let timer: number;
    if (cooldown > 0) {
      timer = window.setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [cooldown]);

  const handleNextStep1 = async () => {
    const isValid = await trigger([
      'login',
      'email',
      'password',
      'confirmPassword',
    ]);
    if (!isValid) return;

    const { login, email } = getValues();
    try {
      setIsCheckingUnique(true);
      setServerError(null);
      const { loginIsTaken, emailIsTaken } = await checkUnique({
        login,
        email,
      }).unwrap();

      let hasError = false;
      if (loginIsTaken) {
        setError('login', {
          type: 'manual',
          message: t('register.error_login_taken'),
        });
        hasError = true;
      }
      if (emailIsTaken) {
        setError('email', {
          type: 'manual',
          message: t('register.error_email_taken'),
        });
        hasError = true;
      }

      if (!hasError) {
        setCurrentStep(1);
      }
    } catch (err: any) {
      const message =
        err.data?.error?.message ||
        err.data?.message ||
        err.message ||
        t('register.error_default');
      setServerError(message);
      if (onError) onError(message);
    } finally {
      setIsCheckingUnique(false);
    }
  };

  const moveToStep3 = async () => {
    const { email } = getValues();
    try {
      setIsSendingCode(true);
      setServerError(null);
      const response = await sendCode({ email }).unwrap();
      setTargetEmail(email);
      setCooldown(response.cooldownSeconds || 60);
      setCurrentStep(2);
    } catch (err: any) {
      const message =
        err.data?.error?.message ||
        err.data?.message ||
        err.message ||
        t('register.error_default');
      setServerError(message);
      if (onError) onError(message);
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleNextStep2 = async () => {
    const isValid = await trigger(['firstName', 'lastName']);
    if (isValid) {
      moveToStep3();
    }
  };

  const handleSkipStep2 = () => {
    moveToStep3();
  };

  const handleResendCode = async () => {
    if (cooldown > 0) return;
    const { email } = getValues();
    try {
      setServerError(null);
      const response = await sendCode({ email }).unwrap();
      setCooldown(response.cooldownSeconds || 60);
    } catch (err: any) {
      const message =
        err.data?.error?.message ||
        err.data?.message ||
        err.message ||
        t('register.error_default');
      setServerError(message);
      if (onError) onError(message);
    }
  };

  const onSubmit = async (data: RegisterFormInputs) => {
    if (currentStep !== 2) return;
    try {
      setServerError(null);
      const response = await registerApi(data).unwrap();
      setAuthContext(response.token, response.user);
      if (onSuccess) {
        onSuccess();
      } else {
        navigate(getUserDashboardPath(response.user), { replace: true });
      }
    } catch (err: any) {
      const message =
        err.data?.error?.message ||
        err.data?.message ||
        err.message ||
        t('register.error_default');
      setServerError(message);
      if (onError) onError(message);
    }
  };

  return (
    <>
      <RegisterSteps currentStep={currentStep} />

      {serverError && <div className="auth-error">{serverError}</div>}

      <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
        <StepCredentials
          register={register}
          errors={errors}
          getValues={getValues}
          onNext={handleNextStep1}
          isLoading={isCheckingUnique}
          isVisible={currentStep === 0}
        />

        <StepProfile
          register={register}
          onNext={handleNextStep2}
          onBack={() => setCurrentStep(0)}
          onSkip={handleSkipStep2}
          isLoading={isSendingCode}
          isVisible={currentStep === 1}
        />

        <StepVerification
          register={register}
          errors={errors}
          targetEmail={targetEmail}
          cooldown={cooldown}
          onResend={handleResendCode}
          onBack={() => setCurrentStep(1)}
          isSubmitting={isSubmitting}
          isVisible={currentStep === 2}
        />
      </form>
    </>
  );
}
