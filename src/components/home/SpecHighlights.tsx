/**
 * SpecHighlights - карточки с краткими ключевыми пунктами ТЗ.
 */
import React from 'react';
import { Brain, Cloud, Lock, Network } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

interface Highlight {
  /** Заголовок блока */
  title: string;
  /** Краткое описание */
  desc: string;
  /** Иконка */
  icon: React.ReactNode;
}

/**
 * SpecHighlights component - 4 ключевых раздела ТЗ.
 */
export const SpecHighlights: React.FC = () => {
  const items: Highlight[] = [
    {
      title: 'Архитектура',
      desc: 'Cloudflare Pages/Workers, KV/R2/D1, Vectorize, очереди и Durable Objects. Клиент — React SPA.',
      icon: <Network className="h-5 w-5 text-purple-600" />,
    },
    {
      title: 'AI‑слой',
      desc: 'Claude, Gemini и Workers AI с оркестратором, кэшированием, fallback и аналитикой использования.',
      icon: <Brain className="h-5 w-5 text-blue-600" />,
    },
    {
      title: 'Безопасность',
      desc: 'Zero Trust, JWT, RBAC+ABAC, защитные заголовки, rate‑limit, соответствие GDPR/SOC2.',
      icon: <Lock className="h-5 w-5 text-emerald-600" />,
    },
    {
      title: 'Инфраструктура',
      desc: 'Глобальный CDN, real‑time через WS/SSE, мультитенантность, высокая доступность (99.99%).',
      icon: <Cloud className="h-5 w-5 text-cyan-600" />,
    },
  ];

  return (
    <section id="spec" className="mx-auto max-w-7xl px-4 py-12">
      <h2 className="text-2xl font-semibold">Техническое задание — кратко</h2>
      <p className="mt-2 text-muted-foreground">
        Ниже — краткие акценты из ТЗ. Полная версия представлена в проекте (unified-corporate-assistant-spec.md).
      </p>
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <Card key={item.title}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                {item.icon}
                {item.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 text-sm text-muted-foreground">
              {item.desc}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default SpecHighlights;
