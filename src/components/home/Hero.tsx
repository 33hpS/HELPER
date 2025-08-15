/**
 * Hero - крупный верхний блок с заголовком и призывами к действию.
 */
import React from 'react';
import { Button } from '../../components/ui/button';
import { ArrowRight, FileText, Play } from 'lucide-react';
import { getGradientBg } from '../../config/brand';

/**
 * Hero component - обложка страницы с CTA кнопками.
 */
export const Hero: React.FC = () => {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section className="relative overflow-hidden">
      <div className={`pointer-events-none absolute inset-0 -z-10 ${getGradientBg()} opacity-10`} />
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 px-4 py-12 md:grid-cols-2 md:py-16">
        <div>
          <h1 className="bg-gradient-to-br from-gray-900 to-gray-600 bg-clip-text text-4xl font-bold leading-tight text-transparent dark:from-white dark:to-neutral-400 sm:text-5xl">
            Корпоративный AI‑помощник следующего поколения
          </h1>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            Единое веб‑приложение для анализа документов, обработки изображений, интеллектуального поиска и персональных AI‑инсайтов. Архитектура Edge‑native, безопасность Zero Trust.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={() => scrollTo('demo')}>
              <Play className="mr-2 h-4 w-4" />
              Смотреть демо
            </Button>
            <Button
              variant="outline"
              className="bg-transparent"
              onClick={() => scrollTo('spec')}
            >
              <FileText className="mr-2 h-4 w-4" />
              Техническое задание
            </Button>
          </div>
          <div className="mt-6 flex items-center gap-3 text-sm text-muted-foreground">
            <ArrowRight className="h-4 w-4" />
            Базовый пример на этой странице — локальная демо‑визуализация без бэкенда (с фоллбеком).
          </div>
        </div>
        <div className="relative">
          <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
            <img src="https://pub-cdn.sider.ai/u/U07GHKZAW71/web-coder/689a30f5a616cfbf06691f2b/resource/b8aabae3-b137-4acd-bff4-1e7da1125e8e.jpg" className="object-cover h-64 w-full md:h-80" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
