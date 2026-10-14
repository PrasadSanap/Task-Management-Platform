import { useCallback, useEffect, useRef, useState } from 'react';

export function useToast() {
  const [toast, setToast] = useState(null);
  const timerRef = useRef(null);

  const dismiss = useCallback(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    setToast(null);
  }, []);

  const showToast = useCallback((message, type = 'success') => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
    }

    setToast({
      message,
      type,
      id: Date.now(),
    });

    timerRef.current = window.setTimeout(() => {
      setToast(null);
      timerRef.current = null;
    }, 3200);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  return { toast, showToast, dismiss };
}