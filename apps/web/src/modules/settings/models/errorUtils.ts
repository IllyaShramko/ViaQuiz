interface ApiErrorPayload {
  data?: {
    message?: string;
    error?: {
      message?: string;
      details?: Array<{ field?: string; message?: string }> | { cooldownSeconds?: number };
    };
  };
  message?: string;
}

/**
 * Extracts and translates backend error messages for account settings forms.
 */
export function formatSettingsError(error: unknown, fallbackMessage: string): string {
  const err = error as ApiErrorPayload | null | undefined;
  const rawMessage =
    err?.data?.error?.message || err?.data?.message || err?.message || '';

  if (!rawMessage) {
    return fallbackMessage;
  }

  if (rawMessage.includes('User with this email already exists')) {
    return 'Користувач із такою електронною поштою вже існує';
  }

  if (
    rawMessage.includes('New email matches your current email') ||
    rawMessage.includes('New email must be different from current email')
  ) {
    return 'Новий email має відрізнятися від поточного';
  }

  if (rawMessage.includes('Please wait')) {
    const match = rawMessage.match(/Please wait\s+(\d+)\s+seconds/i);
    if (match) {
      return `Зачекайте ${match[1]} с перед повторним запитом коду`;
    }
  }

  if (rawMessage.includes('Invalid verification code')) {
    const match = rawMessage.match(/Remaining attempts:\s*(\d+)/i);
    if (match) {
      return `Невірний код підтвердження. Залишилось спроб: ${match[1]}`;
    }
    return 'Невірний код підтвердження';
  }

  if (rawMessage.includes('Maximum verification attempts exceeded')) {
    return 'Вичерпано спроби введення коду. Запросіть новий код';
  }

  if (rawMessage.includes('Verification code has expired')) {
    return 'Термін дії коду закінчився. Запросіть новий код';
  }

  if (rawMessage.includes('Verification code not found')) {
    return 'Код підтвердження не знайдено. Запросіть новий код';
  }

  if (rawMessage.includes('Current password is incorrect')) {
    return 'Поточний пароль введено невірно';
  }

  if (rawMessage.includes('New password must be different from current password')) {
    return 'Новий пароль має відрізнятися від поточного';
  }

  if (rawMessage.includes('Validation failed')) {
    const details = err?.data?.error?.details;
    if (Array.isArray(details) && details[0]?.message) {
      return details[0].message;
    }
  }

  return rawMessage;
}
