/** 
 * ClockWidget - компактный виджет часов с учетом часового пояса (по умолчанию Азия/Бишкек).
 * Показывает текущее время и дату, обновляется каждую секунду.
 */
import React, { useEffect, useState } from 'react'

/** 
 * ClockWidgetProps - свойства часов.
 */
export interface ClockWidgetProps {
  /** Локаль форматирования времени */
  locale?: string
  /** Часовой пояс, например 'Asia/Bishkek' */
  timeZone?: string
  /** Подпись рядом с временем, например 'Бишкек' */
  label?: string
}

/**
 * format - форматирует дату/время по заданным параметрам.
 */
function format(d: Date, locale = 'ru-RU', timeZone = 'Asia/Bishkek') {
  const time = d.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone,
    hour12: false,
  })
  const date = d.toLocaleDateString(locale, { day: '2-digit', month: 'long', year: 'numeric', timeZone })
  return { time, date }
}

/**
 * ClockWidget - основной компонент часов.
 */
const ClockWidget: React.FC<ClockWidgetProps> = ({ locale = 'ru-RU', timeZone = 'Asia/Bishkek', label = 'Бишкек' }) => {
  const [now, setNow] = useState<Date>(new Date())

  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(t)
  }, [])

  const { time, date } = format(now, locale, timeZone)

  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="text-3xl font-semibold leading-none">{time}</div>
        <div className="text-sm text-muted-foreground">{date}</div>
      </div>
      <div className="text-right">
        <div className="text-xs text-muted-foreground">Часовой пояс</div>
        <div className="text-sm font-medium">{label}</div>
      </div>
    </div>
  )
}

export default ClockWidget
