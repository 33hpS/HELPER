/**
 * AnimatedNumber - компонент для анимации числовой части строки.
 * Примеры: "1247", "156 ч", "94.5%", "3,892"
 */
import React, { useMemo } from 'react';
import { useCountUp } from '../../hooks/useCountUp';

export interface AnimatedNumberProps {
  /** Строка со значением, где присутствует число */
  value: string;
  /** Длительность анимации (мс) */
  duration?: number;
}

/**
 * parseNumeric - извлечь число и префикс/суффикс из строки.
 */
function parseNumeric(input: string) {
  const cleaned = input.replace(/\s/g, '');
  const match = cleaned.match(/([-+]?\d{1,3}(?:[\s,]\d{3})*|\d+)(?:\.(\d+))?/);
  if (!match) {
    return { prefix: '', num: NaN, suffix: input, decimals: 0 };
  }
  const full = match[0];
  const start = cleaned.indexOf(full);
  const end = start + full.length;
  const prefix = cleaned.slice(0, start);
  const suffix = cleaned.slice(end);

  // Удаляем разделители тысяч (запятые/пробелы)
  const numeric = full.replace(/[, ]/g, '');
  const decimals = numeric.includes('.') ? (numeric.split('.')[1]?.length || 0) : 0;
  const num = parseFloat(numeric);

  return { prefix, num, suffix, decimals };
}

/**
 * AnimatedNumber - плавно анимирует числовую часть строки.
 */
const AnimatedNumber: React.FC<AnimatedNumberProps> = ({ value, duration = 1200 }) => {
  const parsed = useMemo(() => parseNumeric(value), [value]);
  const current = useCountUp({ end: isNaN(parsed.num) ? 0 : parsed.num, duration, start: 0 });

  const formatter = useMemo(() => {
    const decimals = parsed.decimals;
    return new Intl.NumberFormat(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }, [parsed.decimals]);

  if (isNaN(parsed.num)) {
    return <>{value}</>;
  }

  return (
    <span>
      {parsed.prefix}
      {formatter.format(current)}
      {parsed.suffix}
    </span>
  );
};

export default AnimatedNumber;
