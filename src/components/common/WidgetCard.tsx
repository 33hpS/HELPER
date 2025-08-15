/**
 * WidgetCard - универсальная карточка-виджет для отображения блока информации с заголовком и иконкой.
 */
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

export interface WidgetCardProps {
  /** Заголовок карточки */
  title: string;
  /** Дополнительный подзаголовок */
  subtitle?: string;
  /** Иконка слева от заголовка */
  icon?: React.ReactNode;
  /** Основное содержимое */
  children: React.ReactNode;
  /** Дополнительные классы Tailwind */
  className?: string;
}

/**
 * WidgetCard component - базовый контейнер для виджетов на дашборде.
 */
export const WidgetCard: React.FC<WidgetCardProps> = ({ title, subtitle, icon, children, className }) => {
  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          {icon && <span className="text-muted-foreground">{icon}</span>}
          <span>{title}</span>
        </CardTitle>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
};

export default WidgetCard;
