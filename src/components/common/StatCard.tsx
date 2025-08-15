/**
 * StatCard - компактная карточка статистики с основной метрикой и трендом.
 */
import React from 'react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import AnimatedNumber from './AnimatedNumber';

export interface StatCardProps {
  /** Название метрики */
  label: string;
  /** Значение метрики (строка, может содержать суффиксы: %, ч и т.п.) */
  value: string;
  /** Изменение в процентах (со знаком) */
  delta?: number;
  /** Включить анимацию значения */
  animate?: boolean;
  /** Доп. класс */
  className?: string;
}

/**
 * StatCard component - маленький информер с метрикой и дельтой.
 */
export const StatCard: React.FC<StatCardProps> = ({ label, value, delta, animate = false, className }) => {
  const positive = (delta ?? 0) >= 0;
  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className="mt-1 flex items-end justify-between">
          <div className="text-2xl font-semibold">
            {animate ? <AnimatedNumber value={value} /> : value}
          </div>
          {typeof delta === 'number' && (
            <div className={`flex items-center text-xs font-medium ${positive ? 'text-emerald-600' : 'text-rose-600'}`}>
              {positive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
              <span className="ml-0.5">{Math.abs(delta).toFixed(1)}%</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
