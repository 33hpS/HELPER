/**
 * QuickAction - кнопка-ярлык для быстрых действий.
 */
import React from 'react';
import { Button } from '../../components/ui/button';

export interface QuickActionProps {
  /** Иконка lucide */
  icon: React.ReactNode;
  /** Текст действия */
  label: string;
  /** Обработчик клика */
  onClick?: () => void;
  /** Вариант оформления кнопки */
  variant?: 'default' | 'outline';
}

/**
 * QuickAction component - упрощенный ярлык с иконкой и подписью.
 */
export const QuickAction: React.FC<QuickActionProps> = ({ icon, label, onClick, variant = 'outline' }) => {
  const outline = variant === 'outline';
  return (
    <Button
      variant={variant}
      className={`h-10 gap-2 ${outline ? 'bg-transparent' : ''}`}
      onClick={onClick}
    >
      {icon}
      <span className="text-sm">{label}</span>
    </Button>
  );
};

export default QuickAction;
