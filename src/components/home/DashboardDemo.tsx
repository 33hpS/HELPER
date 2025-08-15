/**
 * DashboardDemo - демо дашборда с API-запросами и фоллбеком.
 * Добавлены: панель аналитики (Recharts), улучшенные skeleton, быстрые действия.
 * Обновлено: расширенная аналитика (byTask, sources, heatmap) и поддержка compact-spacing.
 * Новое: поддержка переключения периодов (7/14/30) для аналитики.
 */
import React, { useEffect, useMemo, useState } from 'react'
import { CloudRain, Image as ImageIcon, Layers, Search, Send, Sparkles, TrendingUp, Calendar as CalendarIcon, DollarSign } from 'lucide-react'
import { Input } from '../../components/ui/input'
import { Badge } from '../../components/ui/badge'
import { Progress } from '../../components/ui/progress'
import WidgetCard from '../common/WidgetCard'
import StatCard from '../common/StatCard'
import QuickAction from '../common/QuickAction'
import { CalendarEvent, CurrencyRate, SearchItem, WeatherData, getDashboardData, getAnalyticsData } from '../../services/api'
import { useNavigate } from 'react-router'
import Skeleton from '../common/Skeleton'
import AnalyticsPanel from './AnalyticsPanel'
import type { AnalyticsDataset } from '../../services/api'
import { useUserPrefsStore } from '../../store/userPrefs'

/**
 * DashboardDemo component - демонстрационный макет дашборда.
 */
export const DashboardDemo: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [rates, setRates] = useState<CurrencyRate[]>([])
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [items, setItems] = useState<SearchItem[]>([])
  const [stats, setStats] = useState<{ documents: number; aiOps: number; timeSavedHours: number; accuracyPercent: number } | null>(null)
  const [analytics, setAnalytics] = useState<AnalyticsDataset | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingAnalytics, setLoadingAnalytics] = useState(true)

  const [analyticsPeriod, setAnalyticsPeriod] = useState<7 | 14 | 30>(7)

  const [query, setQuery] = useState('')
  const filtered = useMemo(
    () =>
      !query.trim()
        ? items
        : items.filter((i) => [i.title, i.snippet].join(' ').toLowerCase().includes(query.toLowerCase())),
    [items, query],
  )

  const navigate = useNavigate()
  const density = useUserPrefsStore((s) => s.density)
  const isCompact = density === 'compact'
  const sectionY = isCompact ? 'py-8' : 'py-12'
  const gapMain = isCompact ? 'gap-3' : 'gap-4'
  const gapGrid = isCompact ? 'gap-3' : 'gap-4'
  const mtBlock = isCompact ? 'mt-5' : 'mt-6'

  useEffect(() => {
    let mounted = true
    getDashboardData().then((data) => {
      if (!mounted) return
      setWeather(data.weather)
      setRates(data.rates)
      setEvents(data.events)
      setItems(data.items)
      setStats(data.stats)
      setLoading(false)
    })
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    let mounted = true
    setLoadingAnalytics(true)
    getAnalyticsData(analyticsPeriod).then((data) => {
      if (!mounted) return
      setAnalytics(data)
      setLoadingAnalytics(false)
    })
    return () => {
      mounted = false
    }
  }, [analyticsPeriod])

  return (
    <section id="demo" className={`mx-auto max-w-7xl px-4 ${sectionY}`}>
      <div className={`mb-6 flex items-center justify-between gap-4`}>
        <h2 className="text-2xl font-semibold">Пример приложения</h2>
        <Badge variant="secondary" className="h-6">
          Демо • данные через API
        </Badge>
      </div>

      {/* Статистика верхнего уровня */}
      <div className={`grid grid-cols-2 ${gapMain} sm:grid-cols-4`}>
        <StatCard label="Документов обработано" value={stats ? String(stats.documents) : '0'} delta={23} animate />
        <StatCard label="AI операций" value={stats ? String(stats.aiOps) : '0'} delta={45} animate />
        <StatCard label="Экономия времени" value={stats ? `${stats.timeSavedHours} ч` : '0 ч'} delta={12} animate />
        <StatCard label="Точность AI" value={stats ? `${stats.accuracyPercent}%` : '0%'} delta={1.3} animate />
      </div>

      {/* Быстрые действия */}
      <div className={`${mtBlock} flex flex-wrap gap-2`}>
        <QuickAction icon={<Sparkles className="h-4 w-4" />} label="AI Анализ" onClick={() => navigate('/documents')} />
        <QuickAction icon={<Send className="h-4 w-4" />} label="Перевод" onClick={() => navigate('/documents')} />
        <QuickAction icon={<Search className="h-4 w-4" />} label="Поиск" onClick={() => navigate('/search')} />
        <QuickAction icon={<ImageIcon className="h-4 w-4" />} label="Изображения" onClick={() => navigate('/images')} />
        <QuickAction icon={<TrendingUp className="h-4 w-4" />} label="Отчет" onClick={() => navigate('/documents')} />
      </div>

      {/* Основная сетка виджетов */}
      <div className={`${mtBlock} grid grid-cols-1 ${gapGrid} lg:grid-cols-3`}>
        <WidgetCard
          title={`Погода в ${weather?.city ?? '…'}`}
          subtitle="AI: Идеальная погода для продуктивной работы"
          icon={<CloudRain className="h-5 w-5 text-blue-600" />}
        >
          {loading || !weather ? (
            <Skeleton className="h-20" />
          ) : (
            <div className="flex items-end justify-between">
              <div>
                <div className="text-3xl font-semibold">+{weather.tempC}°C</div>
                <div className="text-sm text-muted-foreground">{weather.description}</div>
              </div>
              <div className="text-sm text-muted-foreground">
                <div>Ветер: {weather.windKmh} км/ч</div>
                <div>Влажность: {weather.humidity}%</div>
              </div>
            </div>
          )}
        </WidgetCard>

        <WidgetCard
          title="Курсы валют"
          subtitle="AI: USD может вырасти на ~2% к концу недели"
          icon={<DollarSign className="h-5 w-5 text-emerald-600" />}
        >
          {loading ? (
            <Skeleton className="h-24" />
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {rates.map((r) => (
                <div key={r.code} className="rounded-md border p-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{r.code === 'USD' ? '🇺🇸' : '🇪🇺'} {r.code}</span>
                    <Badge variant={r.delta >= 0 ? 'default' : 'secondary'}>
                      {r.delta >= 0 ? '+' : ''}
                      {r.delta}%
                    </Badge>
                  </div>
                  <div className="mt-1 text-xl font-semibold">{r.value.toFixed(2)} ₽</div>
                  <Progress className="mt-2" value={Math.min(100, 50 + r.delta * 10)} />
                </div>
              ))}
            </div>
          )}
        </WidgetCard>

        <WidgetCard
          title="Сегодняшние встречи"
          subtitle="AI: Оптимальное окно фокуса: 10:30–12:00"
          icon={<CalendarIcon className="h-5 w-5 text-purple-600" />}
        >
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-6" />
              ))}
            </div>
          ) : (
            <ul className="space-y-3">
              {events.map((e) => (
                <li key={e.time} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{e.time}</span>
                  <span className="text-sm font-medium">{e.title}</span>
                </li>
              ))}
            </ul>
          )}
        </WidgetCard>
      </div>

      {/* Поиск */}
      <div className={`${mtBlock} rounded-xl border bg-card p-4`}>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-base font-semibold">Интеллектуальный поиск</h3>
          </div>
          <Badge variant="outline" className="bg-transparent">AI Реранкинг</Badge>
        </div>
        <div className="flex flex-col gap-3 md:flex-row">
          <Input
            placeholder="Например: договоры 2024, презентации клиентам, финансовые отчеты..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Документы</Badge>
            <Badge variant="secondary">Изображения</Badge>
            <Badge variant="secondary">Шаблоны</Badge>
          </div>
        </div>
        {/* Результаты */}
        <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
          {loading ? (
            Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-lg border" />
            ))
          ) : (
            filtered.map((res) => (
              <div key={res.id} className="rounded-lg border p-3 hover:bg-muted/40">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {res.kind === 'image' ? (
                      <ImageIcon className="h-4 w-4 text-blue-600" />
                    ) : (
                      <Layers className="h-4 w-4 text-purple-600" />
                    )}
                    <div className="text-sm font-medium">{res.title}</div>
                  </div>
                  <Badge>{res.relevance}%</Badge>
                </div>
                <div className="mt-1 line-clamp-2 text-sm text-muted-foreground">{res.snippet}</div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Аналитика */}
      <div className={mtBlock}>
        <AnalyticsPanel
          dataset={analytics ?? { points: [], byTask: [], sources: [], heatmap: [] }}
          loading={loadingAnalytics}
          period={analyticsPeriod}
          onChangePeriod={(d) => setAnalyticsPeriod(d as 7 | 14 | 30)}
        />
      </div>
    </section>
  )
}

export default DashboardDemo
