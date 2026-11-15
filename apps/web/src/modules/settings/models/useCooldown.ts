import { useEffect, useState } from 'react';

/**
 * Manages a 1-second countdown timer for verification code resend cooldowns.
 */
export function useCooldown() {
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setInterval(() => {
      setCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  return {
    cooldown,
    startCooldown: (seconds: number) => setCooldown(seconds > 0 ? seconds : 0),
    resetCooldown: () => setCooldown(0),
  };
}
