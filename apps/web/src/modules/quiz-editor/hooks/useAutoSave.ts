import { useEffect, useRef, useState } from 'react';
import type { SaveStatus } from '../models/types';

export function useAutoSave<T>(
  value: T,
  saveFn: (value: T) => Promise<unknown>,
  delay = 1500
): { status: SaveStatus } {
  const [status, setStatus] = useState<SaveStatus>('idle');
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialMount = useRef(true);
  const latestValueRef = useRef(value);
  const latestSaveFnRef = useRef(saveFn);

  useEffect(() => {
    latestValueRef.current = value;
    latestSaveFnRef.current = saveFn;
  });

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setStatus('saving');

    timeoutRef.current = setTimeout(async () => {
      try {
        await latestSaveFnRef.current(latestValueRef.current);
        setStatus('saved');
        // Reset to idle after 2 seconds
        setTimeout(() => setStatus('idle'), 2000);
      } catch {
        setStatus('error');
      }
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay]);

  return { status };
}
