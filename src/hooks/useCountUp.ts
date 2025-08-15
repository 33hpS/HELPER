/**
 * useCountUp - плавная анимация числа с помощью requestAnimationFrame.
 */
import { useEffect, useRef, useState } from 'react';

export interface UseCountUpOptions {
  /** Конечное значение анимации */
  end: number;
  /** Длительность в мс */
  duration?: number;
  /** Начальное значение */
  start?: number;
}

/**
 * useCountUp - анимирует число от start до end.
 */
export function useCountUp({ end, duration = 1200, start = 0 }: UseCountUpOptions) {
  const [value, setValue] = useState(start);
  const startRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const step = (timestamp: number) => {
      if (startRef.current === null) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const progress = Math.min(1, elapsed / duration);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const next = start + (end - start) * eased;
      setValue(next);
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(step);
      }
    };

    frameRef.current = requestAnimationFrame(step);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      startRef.current = null;
    };
  }, [end, duration, start]);

  return value;
}
