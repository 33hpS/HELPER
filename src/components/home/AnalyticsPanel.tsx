/**
 * AnalyticsPanel - компактная панель аналитики с адаптивными кнопками и мини-графиком.
 * Отображает метрику (документы/операции/экономия/точность), период и простую SVG-линейку.
 */

import React, { useMemo, useState } from 'react'
import type { AnalyticsDataset, AnalyticsPoint } from '../../services/api'
import { Button } from '../ui/button'
import { Download, FileText, Image as ImageIcon, Percent, Timer } from 'lucide-react'

/**
 * AnalyticsPanelProps - свойства панели аналитики.
 */
export interface AnalyticsPanelProps {
  /** Датасет аналитики */
  dataset?: AnalyticsDataset
  /** Признак загрузки */
  loading?: boolean
  /** Период (дней) */
  period: 7 | 14 | 30
  /** Колбэк изменения периода */
  onChangePeriod: (p: 7 | 14 | 30) => void
}

/**
 * MetricKey - ключи поддерживаемых метрик.
 * documents -> Документы
 * aiOps -> Изображения (как прокси для активности)
 * timeSavedHours -> Экономия
 * accuracy -> Точность
 */
type MetricKey = 'documents' | 'aiOps' | 'timeSavedHours' | 'accuracy'

/**
 * METRICS - конфигурация вкладок метрик.
 */
const METRICS: Array<{ key: MetricKey; label: string; icon: React.ReactNode }> = [
  { key: 'documents', label: 'Документы', icon: <FileText className="h-3.5 w-3.5" /> },
  { key: 'aiOps', label: 'Изображения', icon: <ImageIcon className="h-3.5 w-3.5" /> },
  { key: 'timeSavedHours', label: 'Экономия', icon: <Timer className="h-3.5 w-3.5" /> },
  { key: 'accuracy', label: 'Точность', icon: <Percent className="h-3.5 w-3.5" /> },
]

/**
 * formatValue - форматирует значение в зависимости от метрики.
 */
function formatValue(v: number, key: MetricKey): string {
  if (!Number.isFinite(v)) return '—'
  if (key === 'accuracy') return `${Math.round(v)}%`
  if (key === 'timeSavedHours') return `${Math.round(v)} ч`
  return v.toLocaleString('ru-RU')
}

/**
 * buildPath - строит SVG path для линии.
 */
function buildPath(values: number[], width: number, height: number): string {
  if (!values.length) return ''
  const max = Math.max(...values)
  const min = Math.min(...values)
  const range = Math.max(1, max - min)
  const padX = 6
  const padY = 6
  const innerW = Math.max(1, width - padX * 2)
  const innerH = Math.max(1, height - padY * 2)

  const points = values.map((v, i) => {
    const x = padX + (i / Math.max(1, values.length - 1)) * innerW
    const y = padY + (1 - (v - min) / range) * innerH
    return [x, y] as const
  })

  return points
    .map(([x, y], i) => (i === 0 ? `M ${x},${y}` : `L ${x},${y}`))
    .join(' ')
}

/**
 * extract - извлекает числовой ряд по ключу.
 */
function extract(points: AnalyticsPoint[], key: MetricKey): number[] {
  return points.map((p) => {
    const v = (p as any)[key]
    return typeof v === 'number' ? v : 0
  })
}

/**
 * deltaPercent - изменение в % между первой и последней точкой.
 */
function deltaPercent(values: number[]): number {
  if (values.length < 2) return 0
  const a = values[0]
  const b = values[values.length - 1]
  if (!a) return 0
  return Math.round(((b - a) / a) * 100)
}

/**
 * AnalyticsPanel - основной компонент.
 */
const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({ dataset, loading, period, onChangePeriod }) => {
  const [metric, setMetric] = useState<MetricKey>('documents')

  const points = useMemo(() => dataset?.points ?? [], [dataset])
  const values = useMemo(() => extract(points, metric), [points, metric])
  const currentValue = useMemo(() => (values.length ? values[values.length - 1] : 0), [values])
  const delta = useMemo(() => deltaPercent(values), [values])

  return (
    <div className="rounded-xl border border-black/5 dark:border-white/10 bg-card/60 backdrop-blur px-4 py-4 md:px-5 md:py-5">
      {/* Верхние элементы управления */}
      <div className="flex flex-wrap items-center gap-2 md:gap-3">
        {/* Метрики */}
        <div className="flex flex-1 min-w-0 flex-wrap items-center gap-1">
          {METRICS.map((m) => {
            const active = metric === m.key
            return (
              <Button
                key={m.key}
                size="sm"
                variant={active ? 'default' : 'outline'}
                className={`bg-transparent whitespace-nowrap px-3 py-1 h-8 ${active ? '' : 'bg-transparent'}`}
                onClick={() => setMetric(m.key)}
              >
                <span className="mr-1.5 -ml-0.5 opacity-80">{m.icon}</span>
                <span className="text-xs sm:text-sm">{m.label}</span>
              </Button>
            )
          })}
        </div>

        {/* Период */}
        <div className="flex flex-wrap items-center gap-1">
          {[7, 14, 30].map((d) => {
            const active = period === d
            return (
              <Button
                key={d}
                size="sm"
                variant={active ? 'default' : 'outline'}
                className="bg-transparent h-8 whitespace-nowrap px-3 py-1"
                onClick={() => onChangePeriod(d as 7 | 14 | 30)}
              >
                <span className="text-xs sm:text-sm">{d} дней</span>
              </Button>
            )
          })}
        </div>

        {/* Экспорт */}
        <div className="ml-auto flex flex-wrap items-center gap-1 basis-full sm:basis-auto">
          <Button size="sm" variant="outline" className="bg-transparent h-8">
            <Download className="h-4 w-4 mr-1" /> CSV
          </Button>
          <Button size="sm" variant="outline" className="bg-transparent h-8">
            <Download className="h-4 w-4 mr-1" /> JSON
          </Button>
        </div>
      </div>

      {/* Карточки метрик */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        <div className="rounded-lg bg-muted/40 p-3 min-w-0">
          <div className="text-xs text-muted-foreground">Метрика</div>
          {/* Защита от переполнения: уменьшенные размеры на xs, обрезка и плотный leading */}
          <div className="mt-1 font-semibold text-lg sm:text-xl md:text-2xl leading-snug truncate">
            {METRICS.find((m) => m.key === metric)?.label}
          </div>
        </div>
        <div className="rounded-lg bg-muted/40 p-3">
          <div className="text-xs text-muted-foreground">Значение</div>
          <div className="mt-1 font-semibold text-2xl">{formatValue(currentValue, metric)}</div>
        </div>
        <div className="rounded-lg bg-muted/40 p-3">
          <div className="text-xs text-muted-foreground">Изменение</div>
          <div className={`mt-1 font-semibold text-2xl ${delta >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
            {delta >= 0 ? '+' : ''}
            {delta}%
          </div>
        </div>
      </div>

      {/* Мини-график */}
      <div className="mt-3 rounded-xl border border-black/5 dark:border-white/10 p-3">
        <div className="relative h-40 w-full overflow-hidden">
          <svg viewBox="0 0 600 180" preserveAspectRatio="none" className="h-full w-full">
            {/* Сетка */}
            <g stroke="currentColor" className="opacity-10">
              {[0, 1, 2, 3, 4].map((i) => (
                <line key={i} x1="0" x2="600" y1={36 * (i + 1)} y2={36 * (i + 1)} />
              ))}
            </g>
            {/* Линия */}
            {!loading && values.length > 1 && (
              <path
                d={buildPath(values, 600, 180)}
                fill="none"
                stroke="currentColor"
                className="text-emerald-400"
                strokeWidth="3"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            )}
          </svg>
        </div>
        <div className="mt-2 text-xs text-muted-foreground">• Значение</div>
      </div>
    </div>
  )
}

export default AnalyticsPanel
