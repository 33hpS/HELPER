/**
 * HomePage - главная страница приложения.
 * Добавлены виджеты: Погода (Бишкек), Часы, Курсы валют + конвертер, Календарь.
 * Сохранены существующие Hero и аналитика.
 */
import React, { useEffect, useMemo, useState } from 'react'
import { Button } from '../components/ui/button'
import { Link } from 'react-router'
import { Calendar as CalendarIcon, FileText, Image as ImageIcon, Search, CloudRain, DollarSign, Clock } from 'lucide-react'
import AnalyticsPanel from '../components/home/AnalyticsPanel'
import type { AnalyticsDataset, CalendarEvent, CurrencyRate, WeatherData } from '../services/api'
import { getMockAnalytics, getDashboardData } from '../services/api'
import WidgetCard from '../components/common/WidgetCard'
import ClockWidget from '../components/home/ClockWidget'
import CurrencyConverter from '../components/home/CurrencyConverter'
import { Badge } from '../components/ui/badge'

/**
 * Главная страница с контентом и навигацией.
 */
const HomePage: React.FC = () => {
  // Параметры аналитики
  const [period, setPeriod] = useState<7 | 14 | 30>(14)
  const [dataset, setDataset] = useState<AnalyticsDataset | undefined>(undefined)
  const [loadingAnalytics, setLoadingAnalytics] = useState<boolean>(true)

  // Дашборд-данные
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [rates, setRates] = useState<CurrencyRate[]>([])
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loadingDash, setLoadingDash] = useState<boolean>(true)

  // Загрузка мок-аналитики при смене периода
  useEffect(() => {
    let cancelled = false
    setLoadingAnalytics(true)
    getMockAnalytics(period).then((data) => {
      if (!cancelled) {
        setDataset(data)
        setLoadingAnalytics(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [period])

  // Загрузка дашборд-данных (погода, курсы, встречи)
  useEffect(() => {
    let mounted = true
    setLoadingDash(true)
    getDashboardData().then((d) => {
      if (!mounted) return
      setWeather(d.weather)
      setRates(d.rates)
      setEvents(d.events)
      setLoadingDash(false)
    })
    return () => { mounted = false }
  }, [])

  // Удобный список валют для бейджей
  const topCodes = useMemo(() => {
    const codes = ['RUB','KGS','USD','EUR','CNY','KZT']
    const map = new Map(rates.map(r => [r.code, r]))
    return codes
      .filter(c => map.has(c))
      .map(c => map.get(c)!)
  }, [rates])

  return (
    <div className="min-h-[calc(100vh-2rem)] bg-gradient-to-br from-gray-50 to-gray-100 dark:from-neutral-950 dark:to-neutral-900">
      <div className="mx-auto max-w-6xl px-4 py-10">
        {/* Hero */}
        <div className="rounded-2xl bg-white/70 dark:bg-neutral-900/70 backdrop-blur border border-black/5 dark:border-white/10 p-8 md:p-10 shadow-sm">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Корпоративный AI-помощник</h1>
          <p className="mt-3 text-gray-700 dark:text-gray-300 max-w-2xl">
            Ускоряйте анализ документов, обработку изображений и поиск знаний. Безопасно. Масштабируемо. Эстетично.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/documents"><FileText className="w-4 h-4 mr-2" /> Документы</Link>
            </Button>
            <Button asChild variant="outline" className="bg-transparent">
              <Link to="/images"><ImageIcon className="w-4 h-4 mr-2" /> Изображения</Link>
            </Button>
            <Button asChild variant="outline" className="bg-transparent">
              <Link to="/search"><Search className="w-4 h-4 mr-2" /> Поиск</Link>
            </Button>
          </div>
        </div>

        {/* Превью изображение + аналитика */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-xl overflow-hidden border border-black/5 dark:border-white/10">
            <img src="https://pub-cdn.sider.ai/u/U07GHKZAW71/web-coder/689a30f5a616cfbf06691f2b/resource/3ca78ae7-fa92-4f31-b65a-9b2640688537.jpg" className="object-cover w-full h-64" alt="office" />
          </div>
          <div className="lg:col-span-1">
            <AnalyticsPanel
              dataset={dataset}
              loading={loadingAnalytics}
              period={period}
              onChangePeriod={(p) => setPeriod(p)}
            />
          </div>
        </div>

        {/* Виджеты: Погода, Часы, Курсы+Конвертер, Календарь */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Погода */}
          <WidgetCard
            title={`Погода в ${weather?.city ?? '…'}`}
            subtitle="AI: Идеальная погода для продуктивной работы"
            icon={<CloudRain className="h-5 w-5 text-blue-600" />}
          >
            {loadingDash || !weather ? (
              <div className="h-20 animate-pulse rounded-md bg-gray-200 dark:bg-neutral-800" />
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

          {/* Часы (Бишкек) */}
          <WidgetCard
            title="Текущее время"
            subtitle="Часовой пояс: Азия/Бишкек"
            icon={<Clock className="h-5 w-5 text-purple-600" />}
          >
            <ClockWidget label="Бишкек" timeZone="Asia/Bishkek" />
          </WidgetCard>

          {/* Курсы валют + конвертер */}
          <WidgetCard
            title="Курсы валют"
            subtitle="RUB • KGS • USD • EUR • CNY • KZT"
            icon={<DollarSign className="h-5 w-5 text-emerald-600" />}
            className="lg:col-span-2"
          >
            {loadingDash ? (
              <div className="space-y-3">
                <div className="h-6 rounded bg-gray-200 dark:bg-neutral-800 animate-pulse" />
                <div className="h-28 rounded bg-gray-200 dark:bg-neutral-800 animate-pulse" />
              </div>
            ) : (
              <>
                <div className="mb-3 flex flex-wrap gap-2">
                  {topCodes.map(r => (
                    <Badge key={r.code} variant={r.delta >= 0 ? 'default' : 'secondary'}>
                      {r.code} {r.code === 'RUB' ? '' : `${r.value.toFixed(2)} ₽`} {r.code !== 'RUB' && `(${r.delta >= 0 ? '+' : ''}${r.delta}%)`}
                    </Badge>
                  ))}
                </div>
                <CurrencyConverter rates={rates} preferredOrder={['RUB','KGS','USD','EUR','CNY','KZT']} />
              </>
            )}
          </WidgetCard>

          {/* Календарь (сегодня) */}
          <WidgetCard
            title="Сегодняшние встречи"
            subtitle="AI: Оптимальное окно фокуса: 10:30–12:00"
            icon={<CalendarIcon className="h-5 w-5 text-pink-600" />}
            className="lg:col-span-2"
          >
            {loadingDash ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-6 rounded bg-gray-200 dark:bg-neutral-800 animate-pulse" />
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
      </div>
    </div>
  )
}

export default HomePage
