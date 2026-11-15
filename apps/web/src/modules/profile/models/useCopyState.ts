import { useCallback, useEffect, useRef, useState } from 'react';
import { copyToClipboard } from '../../../shared';

/**
 * Tracks temporary copy feedback by key with automatic timer cleanup.
 */
export function useCopyState(durationMs = 1500) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  const copy = useCallback(
    async (value: string, key = 'default'): Promise<boolean> => {
      const ok = await copyToClipboard(value);
      if (!ok) return false;

      setCopiedKey(key);
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
      timerRef.current = window.setTimeout(() => {
        setCopiedKey(null);
        timerRef.current = null;
      }, durationMs);

      return true;
    },
    [durationMs],
  );

  return { copiedKey, copy };
}
