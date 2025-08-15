/**
 * services/api.ts
 * Типы и мок-API для дашборда, поиска и аналитики.
 * Предоставляет функции getDashboardData, getAnalyticsData, getMockAnalytics, searchMock,
 * а также утилиты поиска: formatRelative, getAutocompleteSuggestions, searchVectorMock.
 */

 /** 
  * WeatherData — данные о погоде.
  */
export interface WeatherData {
  /** Город */
  city: string
  /** Температура в °C */
  tempC: number
  /** Текстовое описание */
  description: string
  /** Скорость ветра, км/ч */
  windKmh: number
  /** Влажность, % */
  humidity: number
}

/**
 * CurrencyRate — курс валюты с дельтой в %.
 */
export interface CurrencyRate {
  /** Код валюты, например USD/EUR */
  code: string
  /** Значение в ₽ */
  value: number
  /** Изменение в %, может быть отрицательным */
  delta: number
}

/**
 * CalendarEvent — событие календаря на день.
 */
export interface CalendarEvent {
  /** Время события, строка формата HH:MM */
  time: string
  /** Название события */
  title: string
}

/**
 * SearchItem — элемент результатов поиска (упрощённый).
 */
export interface SearchItem {
  /** Уникальный идентификатор */
  id: string
  /** Тип результата */
  kind: 'document' | 'image'
  /** Заголовок результата */
  title: string
  /** Короткий сниппет */
  snippet: string
  /** Релевантность, % */
  relevance: number
}

/**
 * AnalyticsPoint — точка данных аналитики.
 */
export interface AnalyticsPoint {
  /** ISO дата */
  date: string
  /** Количество обработанных документов */
  documents?: number
  /** Количество AI операций */
  aiOps?: number
  /** Сэкономленное время, часов */
  timeSavedHours?: number
  /** Точность AI, % */
  accuracy?: number
}

/**
 * AnalyticsDataset — набор данных аналитики.
 */
export interface AnalyticsDataset {
  /** Временной ряд */
  points: AnalyticsPoint[]
  /** Распределение по типам задач */
  byTask: Array<{ name: string; value: number }>
  /** Источники данных */
  sources: Array<{ name: string; value: number }>
  /** Тепловая карта активности */
  heatmap: Array<{ day: number; hour: number; value: number }>
}

/**
 * DashboardData — агрегированные данные для демо-дашборда.
 */
export interface DashboardData {
  weather: WeatherData | null
  rates: CurrencyRate[]
  events: CalendarEvent[]
  items: SearchItem[]
  stats: {
    documents: number
    aiOps: number
    timeSavedHours: number
    accuracyPercent: number
  }
}

/**
 * sleep — утилита задержки для имитации сети.
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * clamp — ограничивает значение интервалом [min, max].
 */
function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v))
}

/**
 * rnd — случайное число в диапазоне [min, max] с шагом step.
 */
function rnd(min: number, max: number, step = 1): number {
  const n = Math.floor((Math.random() * (max - min + step)) / step) * step + min
  return n
}

/**
 * formatHM — форматирует число часов/минут в HH:MM.
 */
function formatHM(hours: number, minutes: number): string {
  const h = String(clamp(hours, 0, 23)).padStart(2, '0')
  const m = String(clamp(minutes, 0, 59)).padStart(2, '0')
  return `${h}:${m}`
}

/**
 * buildPoints — генерирует временной ряд для заданного периода.
 */
function buildPoints(period: 7 | 14 | 30): AnalyticsPoint[] {
  const arr: AnalyticsPoint[] = []
  const now = Date.now()
  // Базовые уровни — имитируем умеренный рост
  let docs = rnd(800, 1200)
  let ops = rnd(2500, 4200)
  let time = rnd(80, 180)
  let acc = rnd(90, 96)

  for (let i = period - 1; i >= 0; i--) {
    const ts = now - i * 24 * 3600 * 1000
    // Добавляем небольшую волатильность
    docs = clamp(docs + rnd(-40, 60), 500, 5000)
    ops = clamp(ops + rnd(-120, 180), 800, 12000)
    time = clamp(time + rnd(-6, 10), 20, 600)
    acc = clamp(acc + rnd(-1, 2), 80, 100)

    arr.push({
      date: new Date(ts).toISOString(),
      documents: Math.round(docs),
      aiOps: Math.round(ops),
      timeSavedHours: Math.round(time),
      accuracy: Math.round(acc * 10) / 10,
    })
  }
  return arr
}

/**
 * getMockAnalytics — мок данных аналитики за период.
 * Используется на Home и может использоваться как fallback.
 */
export async function getMockAnalytics(period: 7 | 14 | 30): Promise<AnalyticsDataset> {
  // Имитация небольшой сетевой задержки
  await sleep(350)

  const points = buildPoints(period)

  // Суммаризируем по задачам/источникам
  const totalDocs = points.reduce((s, p) => s + (p.documents || 0), 0)
  const totalOps = points.reduce((s, p) => s + (p.aiOps || 0), 0)

  const byTask = [
    { name: 'Анализ документов', value: Math.round(totalDocs * 0.35) },
    { name: 'Обработка изображений', value: Math.round(totalOps * 0.25) },
    { name: 'Переводы', value: Math.round(totalOps * 0.2) },
    { name: 'Генерация контента', value: Math.round(totalOps * 0.2) },
  ]

  const sources = [
    { name: 'Загрузки', value: Math.round(totalDocs * 0.4) },
    { name: 'Интеграции', value: Math.round(totalDocs * 0.35) },
    { name: 'Email', value: Math.round(totalDocs * 0.15) },
    { name: 'Другое', value: Math.round(totalDocs * 0.1) },
  ]

  // Простая тепловая карта (day: 0-6, hour: 0-23)
  const heatmap: Array<{ day: number; hour: number; value: number }> = []
  for (let d = 0; d < 7; d++) {
    for (let h = 8; h <= 20; h++) {
      heatmap.push({ day: d, hour: h, value: rnd(0, 8) })
    }
  }

  return { points, byTask, sources, heatmap }
}

/**
 * getAnalyticsData — расширенный мок-метод (в перспективе заменяется реальным API).
 * Сейчас просто оборачивает getMockAnalytics.
 */
export async function getAnalyticsData(period: 7 | 14 | 30): Promise<AnalyticsDataset> {
  // Здесь в будущем: запрос к backend /api/dashboard/analytics?period=...
  return getMockAnalytics(period)
}

/**
 * getDashboardData — агрегирует данные для дашборда.
 * Возвращает погоду, курсы, встречи, поисковые элементы и ключевую статистику.
 */
export async function getDashboardData(): Promise<DashboardData> {
  // Имитируем конкурентные запросы
  await sleep(400)

  // Погода
  const weather: WeatherData = {
    city: 'Бишкек',
    tempC: rnd(14, 22),
    description: ['Ясно', 'Переменная облачность', 'Небольшой дождь'][rnd(0, 2)],
    windKmh: rnd(5, 18),
    humidity: rnd(40, 75),
  }

  // Курсы валют (значения — ₽ за 1 единицу валюты)
  const rates: CurrencyRate[] = [
    { code: 'RUB', value: 1, delta: 0 }, // базовая валюта для удобства конвертера
    { code: 'KGS', value: Math.round((0.98 + Math.random() * 0.06) * 100) / 100, delta: Math.round((Math.random() * 0.5 - 0.2) * 100) / 100 },
    { code: 'USD', value: Math.round((88 + Math.random() * 3) * 100) / 100, delta: Math.round((Math.random() * 0.8 + 0.1) * 100) / 100 },
    { code: 'EUR', value: Math.round((96 + Math.random() * 3) * 100) / 100, delta: Math.round((Math.random() * 0.6 - 0.3) * 100) / 100 },
    { code: 'CNY', value: Math.round((12 + Math.random() * 0.6) * 100) / 100, delta: Math.round((Math.random() * 0.5 - 0.2) * 100) / 100 },
    { code: 'KZT', value: Math.round((0.20 + Math.random() * 0.02) * 1000) / 1000, delta: Math.round((Math.random() * 0.5 - 0.2) * 100) / 100 },
  ]

  // События календаря
  const events: CalendarEvent[] = [
    { time: formatHM(9, 0), title: 'Планерка команды' },
    { time: formatHM(14, 30), title: 'Презентация клиенту' },
    { time: formatHM(16, 0), title: 'AI обучение' },
  ]

  // Поисковые элементы (демо)
  const items: SearchItem[] = [
    {
      id: 'doc-q3-2024',
      kind: 'document',
      title: 'Квартальный финансовый отчет Q3 2024',
      snippet: 'Подробный анализ показателей за третий квартал 2024 года, включая прибыль, убытки и прогнозы...',
      relevance: 98,
    },
    {
      id: 'img-showcase-2024',
      kind: 'image',
      title: 'product-showcase-2024.jpg',
      snippet: 'Изображение содержит: продукты, логотип компании, финансовые графики. Обнаружено 3 объекта...',
      relevance: 95,
    },
    {
      id: 'doc-plan-2025',
      kind: 'document',
      title: 'Стратегический план 2025',
      snippet: 'Ключевые инициативы и цели на 2025 год. Влияние на выручку и оптимизацию затрат...',
      relevance: 92,
    },
    {
      id: 'img-team-photos',
      kind: 'image',
      title: 'team-photos-august.webp',
      snippet: 'Распознаны лица: 5. OCR: найдено 2 текста. Теги: команда, ивент, август.',
      relevance: 88,
    },
  ]

  // Актуальная аналитика — используем последние точки для составления сводки
  const analytics = await getAnalyticsData(7)
  const last = analytics.points[analytics.points.length - 1] || {
    documents: 1247,
    aiOps: 3892,
    timeSavedHours: 156,
    accuracy: 94.5,
  }

  const stats = {
    documents: Math.round(last.documents ?? 1247),
    aiOps: Math.round(last.aiOps ?? 3892),
    timeSavedHours: Math.round(last.timeSavedHours ?? 156),
    accuracyPercent: Math.round((last.accuracy ?? 94.5) * 10) / 10,
  }

  return {
    weather,
    rates,
    events,
    items,
    stats,
  }
}

/**
 * searchMock — простая мок-функция поиска (для возможного использования страницей Search).
 * Фильтрация по вхождению текста в title или snippet с сортировкой по релевантности.
 */
export async function searchMock(query: string): Promise<SearchItem[]> {
  const base = [
    {
      id: 'doc-contract-2024',
      kind: 'document' as const,
      title: 'Контракт №2024-458',
      snippet: 'AI анализируется. Юридическая проверка и извлечение action items...',
      relevance: 90,
    },
    {
      id: 'doc-report-q3',
      kind: 'document' as const,
      title: 'Финансовый отчет Q3',
      snippet: 'Суммаризация, ключевые точки, рекомендации CFO...',
      relevance: 96,
    },
    {
      id: 'img-product-hero',
      kind: 'image' as const,
      title: 'product-hero-2024.avif',
      snippet: 'DETR: 4 объекта, OCR: найден текст, Точность: 96%',
      relevance: 88,
    },
  ]
  await sleep(250)
  const q = (query || '').trim().toLowerCase()
  if (!q) return base.sort((a, b) => b.relevance - a.relevance)
  return base
    .filter((i) => (i.title + ' ' + i.snippet).toLowerCase().includes(q))
    .sort((a, b) => b.relevance - a.relevance)
}

/* ========================= ПОИСК: ТИПЫ И УТИЛИТЫ ========================= */

/**
 * SearchResult — элемент результата расширенного поиска.
 * Используется в карточке результата и на странице Search.
 */
export interface SearchResult {
  /** Уникальный ID */
  id: string
  /** Тип результата */
  type: 'document' | 'image'
  /** Заголовок */
  title: string
  /** Краткий сниппет */
  snippet?: string
  /** Релевантность, % (0..100) */
  relevance: number
  /** Временная метка (ms since epoch) */
  timestamp: number
  /** Автор (если есть) */
  author?: string
  /** Рейтинг результата (0..5) */
  rating?: number
  /** Признак, что AI проводил анализ */
  aiAnalyzed?: boolean
  /** Формат документа (для document) */
  format?: 'PDF' | 'DOCX' | 'XLSX' | 'TXT' | string
  /** Короткие метаданные (для document), например: "28 страниц • 5.2 MB" */
  meta?: string
  /** Размеры изображения (для image), например "1920x1080" */
  dimensions?: string
  /** Присутствие OCR (для image) */
  ocr?: boolean
}

/**
 * SearchFilters — фасетные фильтры для поиска.
 */
export interface SearchFilters {
  /** Тип контента: все/документы/изображения */
  type: 'all' | 'documents' | 'images'
  /** Период: all | month | week | today */
  period: 'all' | 'month' | 'week' | 'today'
  /** Автор: any или конкретное имя */
  author: 'any' | string
  /** Только с AI-анализом */
  withAnalysis: boolean
  /** Только с высоким рейтингом (>= 4.5) */
  highRating: boolean
}

/**
 * formatRelative — форматирует метку времени в относительное русскоязычное описание.
 */
export function formatRelative(input: number | string | Date): string {
  const now = Date.now()
  const ts =
    typeof input === 'number'
      ? input
      : typeof input === 'string'
        ? new Date(input).getTime()
        : input.getTime()

  const diff = Math.max(0, now - ts)
  const sec = Math.floor(diff / 1000)
  const min = Math.floor(sec / 60)
  const hour = Math.floor(min / 60)
  const day = Math.floor(hour / 24)
  const week = Math.floor(day / 7)

  if (sec < 45) return 'только что'
  if (min < 2) return 'минуту назад'
  if (min < 5) return 'несколько минут назад'
  if (min < 60) return `${min} мин назад`
  if (hour < 2) return 'час назад'
  if (hour < 5) return `${hour} ч назад`
  if (day < 1) return `${hour} ч назад`
  if (day === 1) return 'вчера'
  if (day < 7) return `${day} дн назад`
  if (week === 1) return 'неделю назад'
  if (week < 5) return `${week} нед назад`
  // Фолбэк — дата в ДД.ММ.ГГ
  const d = new Date(ts)
  const DD = String(d.getDate()).padStart(2, '0')
  const MM = String(d.getMonth() + 1).padStart(2, '0')
  const YY = String(d.getFullYear()).slice(-2)
  return `${DD}.${MM}.${YY}`
}

/**
 * getAutocompleteSuggestions — мок автодополнения.
 * Возвращает до 8 подсказок по префиксу/вхождению.
 */
export async function getAutocompleteSuggestions(query: string): Promise<string[]> {
  const base = [
    'договоры 2024',
    'презентации клиентам',
    'финансовые отчеты',
    'изображения продуктов',
    'стратегический план 2025',
    'AI аналитика эффективности',
    'отчет о продажах',
    'перевод на английский',
  ]
  await sleep(120)
  const q = (query || '').trim().toLowerCase()
  if (!q) return base.slice(0, 6)
  return base.filter((s) => s.toLowerCase().includes(q)).slice(0, 8)
}

/**
 * searchVectorMock — расширенный мок векторного поиска с фасетами и пагинацией.
 * Имитация задержки и простого скоринга.
 */
export async function searchVectorMock(
  query: string,
  filters: SearchFilters,
  page: number,
  pageSize: number,
): Promise<{ items: any[]; total: number; timeSec: number }> {
  // Старт времени для измерения "latency"
  const t0 = performance.now?.() ?? Date.now()

  // База демо-данных
  const now = Date.now()
  const base: any[] = [
    {
      id: 'doc-q3-2024',
      type: 'document',
      title: 'Квартальный финансовый отчет Q3 2024.docx',
      snippet:
        'Подробный анализ финансовых показателей за третий квартал 2024 года включая прибыль, убытки и прогнозы...',
      relevance: 98,
      timestamp: now - 2 * 24 * 3600 * 1000,
      author: 'Анна Иванова',
      rating: 4.8,
      aiAnalyzed: true,
      format: 'DOCX',
      meta: '28 страниц • 5.2 MB',
    },
    {
      id: 'img-showcase-2024',
      type: 'image',
      title: 'product-showcase-2024.jpg',
      snippet:
        'Изображение содержит: продукты, логотип компании, финансовые графики. Обнаружено 3 объекта...',
      relevance: 95,
      timestamp: now - 7 * 24 * 3600 * 1000,
      author: 'Петр Смирнов',
      rating: 4.6,
      aiAnalyzed: true,
      dimensions: '1920x1080',
      ocr: true,
    },
    {
      id: 'doc-plan-2025',
      type: 'document',
      title: 'Стратегический план 2025',
      snippet:
        'Ключевые инициативы и цели на 2025 год. Влияние на выручку и оптимизацию затрат...',
      relevance: 92,
      timestamp: now - 5 * 3600 * 1000,
      author: 'Мария Козлова',
      rating: 4.4,
      aiAnalyzed: true,
      format: 'PDF',
      meta: '12 страниц • 2.1 MB',
    },
    {
      id: 'img-team-photos',
      type: 'image',
      title: 'team-photos-august.webp',
      snippet:
        'Распознаны лица: 5. OCR: найдено 2 текста. Теги: команда, ивент, август.',
      relevance: 88,
      timestamp: now - 10 * 24 * 3600 * 1000,
      author: 'Анна Иванова',
      rating: 4.2,
      aiAnalyzed: false,
      dimensions: '4032x3024',
      ocr: true,
    },
    {
      id: 'doc-contract-2024',
      type: 'document',
      title: 'Контракт №2024-458',
      snippet:
        'Юридическая проверка завершена. Извлечены ключевые действия и сроки исполнения.',
      relevance: 90,
      timestamp: now - 36 * 3600 * 1000,
      author: 'Петр Смирнов',
      rating: 4.9,
      aiAnalyzed: true,
      format: 'PDF',
      meta: '12 страниц • 2.3 MB',
    },
    {
      id: 'img-product-hero',
      type: 'image',
      title: 'product-hero-2024.avif',
      snippet: 'DETR: 4 объекта, OCR: найден текст, Точность анализа: 96%',
      relevance: 88,
      timestamp: now - 3 * 24 * 3600 * 1000,
      author: 'Анна Иванова',
      rating: 4.7,
      aiAnalyzed: true,
      dimensions: '2560x1440',
      ocr: true,
    },
  ]

  // Имитируем сетевую задержку
  await sleep(180)

  // Текстовый фильтр
  const q = (query || '').trim().toLowerCase()
  let filtered = base.filter((it) =>
    q ? (it.title + ' ' + (it.snippet || '')).toLowerCase().includes(q) : true,
  )

  // Фильтр по типу
  if (filters?.type === 'documents') filtered = filtered.filter((i) => i.type === 'document')
  if (filters?.type === 'images') filtered = filtered.filter((i) => i.type === 'image')

  // Фильтр по автору
  if (filters?.author && filters.author !== 'any') {
    filtered = filtered.filter((i) => (i.author || '').toLowerCase() === filters.author.toLowerCase())
  }

  // Фильтр по AI-анализу
  if (filters?.withAnalysis) filtered = filtered.filter((i) => i.aiAnalyzed)

  // Фильтр по рейтингу
  if (filters?.highRating) filtered = filtered.filter((i) => (i.rating ?? 0) >= 4.5)

  // Фильтр по периоду
  if (filters?.period && filters.period !== 'all') {
    const from = (() => {
      const d = new Date()
      switch (filters.period) {
        case 'today':
          d.setHours(0, 0, 0, 0)
          return d.getTime()
        case 'week':
          d.setDate(d.getDate() - 7)
          return d.getTime()
        case 'month':
          d.setMonth(d.getMonth() - 1)
          return d.getTime()
        default:
          return 0
      }
    })()
    filtered = filtered.filter((i) => i.timestamp >= from)
  }

  // Сортировка по релевантности (и слегка — по времени)
  filtered.sort((a, b) => {
    const rel = b.relevance - a.relevance
    if (rel !== 0) return rel
    return b.timestamp - a.timestamp
  })

  const total = filtered.length
  const start = Math.max(0, (page - 1) * pageSize)
  const end = start + pageSize
  const items = filtered.slice(start, end)

  const t1 = performance.now?.() ?? Date.now()
  const timeSec = Math.max(0.08, Math.round(((t1 - t0) / 1000) * 100) / 100)

  return { items, total, timeSec }
}
