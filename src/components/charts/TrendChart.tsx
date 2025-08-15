/**
 * TrendChart - универсальный и устойчивый к ошибкам линейный график на базе Recharts.
 * Автоматически определяет ключ оси X (date или label) и создает дефолтную линию,
 * если массив lines не передан.
 */

import React, { useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

/**
 * TrendPoint - точка данных тренда.
 * Поддерживает как ISO-даты (date), так и строковые метки (label).
 */
export interface TrendPoint {
  /** Дата (ISO string), если используется временная шкала */
  date?: string
  /** Строковая метка X-оси, если не используется дата */
  label?: string
  /** Универсальное значение для одиночного графика */
  value?: number
  /** Доп. метрики (например, documents, aiOps и т.п.) */
  [key: string]: string | number | undefined
}

/**
 * TrendChartProps - свойства компонента.
 */
export interface TrendChartProps {
  /** Данные точек */
  data: TrendPoint[]
  /**
   * Описание линий (необязательно). Если не задано — используется один ряд по dataKey="value".
   */
  lines?: Array<{
    dataKey: keyof TrendPoint | string
    name: string
    color?: string
    yAxisId?: 'left' | 'right'
    strokeWidth?: number
  }>
  /** Высота графика в px */
  height?: number
  /** Показывать точки */
  showDots?: boolean
  /** Включить сетку */
  grid?: boolean
  /** Цвет по умолчанию для одиночной линии (когда lines не передан) */
  color?: string
}

/**
 * formatDate - форматирует дату для оси X.
 */
function formatDate(iso?: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return String(iso)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  return `${day}.${month}`
}

/**
 * CustomTooltip - настраиваемый тултип.
 */
const CustomTooltip: React.FC<{
  active?: boolean
  payload?: any[]
  label?: string
  xKey: 'date' | 'label' | 'index'
}> = ({ active, payload, label, xKey }) => {
  if (!active || !payload || !payload.length) return null
  const shownLabel = xKey === 'date' ? formatDate(label) : label
  return (
    <div className="rounded-md border border-black/5 dark:border-white/10 bg-white dark:bg-neutral-900 shadow px-3 py-2">
      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
        {xKey === 'date' ? 'Дата' : 'Метка'}: {shownLabel}
      </div>
      <ul className="space-y-0.5">
        {payload.map((p, i) => (
          <li key={i} className="text-sm" style={{ color: p.color }}>
            {p.name}: <span className="font-medium">{p.value}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * TrendChart - основной компонент графика трендов.
 * Устойчив к:
 * - отсутствию props.lines (рендерит дефолтную линию по dataKey="value")
 * - отсутствию data[0].date (использует label или индекс)
 */
const TrendChart: React.FC<TrendChartProps> = ({
  data,
  lines,
  height = 260,
  showDots = false,
  grid = true,
  color = '#6366f1', // indigo по умолчанию
}) => {
  // Безопасный выбор ключа X: date -> label -> index
  const xKey: 'date' | 'label' | 'index' = useMemo(() => {
    const first = data?.[0]
    if (first && typeof first === 'object') {
      if ('date' in first) return 'date'
      if ('label' in first) return 'label'
    }
    return 'index'
  }, [data])

  // Если требуется индекс, добавим его
  const preparedData = useMemo(() => {
    if (xKey !== 'index') return data
    return (data || []).map((d, i) => ({ ...d, index: i + 1 }))
  }, [data, xKey])

  // Безопасный расчет правой оси
  const hasRightAxis = Array.isArray(lines) && lines.some((l) => l.yAxisId === 'right')

  // Дефолтные линии, если не переданы
  const effectiveLines =
    Array.isArray(lines) && lines.length > 0
      ? lines
      : [
          {
            dataKey: 'value',
            name: 'Значение',
            color,
            yAxisId: 'left' as const,
            strokeWidth: 2,
          },
        ]

  // Форматтер тиков оси X
  const xTickFormatter = (val: any) => {
    if (xKey === 'date') return formatDate(String(val))
    return String(val)
  }

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer>
        <LineChart data={preparedData} margin={{ top: 12, right: 16, left: 0, bottom: 4 }}>
          {grid && (
            <CartesianGrid
              strokeDasharray="4 4"
              stroke="currentColor"
              className="text-black/5 dark:text-white/10"
            />
          )}
          <XAxis
            dataKey={xKey}
            tickFormatter={xTickFormatter}
            tick={{ fontSize: 12, fill: 'currentColor' }}
            axisLine={{ stroke: 'currentColor', opacity: 0.2 }}
            tickLine={{ stroke: 'currentColor', opacity: 0.2 }}
          />
          <YAxis
            yAxisId="left"
            tick={{ fontSize: 12, fill: 'currentColor' }}
            axisLine={{ stroke: 'currentColor', opacity: 0.2 }}
            tickLine={{ stroke: 'currentColor', opacity: 0.2 }}
          />
          {hasRightAxis && (
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 12, fill: 'currentColor' }}
              axisLine={{ stroke: 'currentColor', opacity: 0.2 }}
              tickLine={{ stroke: 'currentColor', opacity: 0.2 }}
            />
          )}
          <Tooltip content={<CustomTooltip xKey={xKey} />} />
          <Legend />
          {effectiveLines.map((l) => (
            <Line
              key={String(l.dataKey)}
              type="monotone"
              dataKey={l.dataKey as string}
              name={l.name}
              stroke={l.color || color}
              strokeWidth={l.strokeWidth ?? 2}
              yAxisId={l.yAxisId || 'left'}
              dot={showDots}
              activeDot={{ r: 4 }}
              isAnimationActive
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default TrendChart
