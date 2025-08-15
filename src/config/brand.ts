/**
 * brand.ts - конфигурация бренда: название, градиенты, логотип.
 * Поддерживает динамический override через localStorage ('user-prefs' -> brandOverride).
 */
import type { BrandOverride } from '../store/userPrefs'

/** Конфиг бренда */
export interface BrandConfig {
  /** Имя бренда для хедера и меток */
  name: string
  /** Классы Tailwind для градиента (from-... to-...) */
  gradient: {
    from: string
    to: string
  }
  /** URL логотипа (опционально) */
  logoUrl?: string
}

/**
 * BRAND - дефолтная конфигурация бренда.
 * Логотип обновлен на предоставленный вами URL.
 * Градиент по умолчанию: emerald → teal (легкий, корпоративный).
 * При необходимости укажите свои классы Tailwind (from-*, to-*).
 */
export const BRAND: BrandConfig = {
  name: 'Corporate AI Assistant',
  gradient: {
    // Варианты, из которых можно выбрать:
    // A) Энергичный фиолетовый: from-indigo-600 / to-fuchsia-600
    // B) Корпоративный бирюзовый (по умолчанию): from-emerald-600 / to-teal-600
    // C) Спокойный сине-голубой: from-sky-600 / to-cyan-600
    from: 'from-emerald-600',
    to: 'to-teal-600',
  },
  // Ваш логотип:
  logoUrl: 'https://i.ibb.co/cXMDnwSB/AdRZdXE.png',
}

/**
 * getGradientBg - получить класс градиентного фона с учетом override.
 */
export function getGradientBg(): string {
  const effective = getEffectiveBrand()
  const from = effective.gradient?.from ?? BRAND.gradient.from
  const to = effective.gradient?.to ?? BRAND.gradient.to
  return `bg-gradient-to-br ${from} ${to}`
}

/**
 * getEffectiveBrand - читает override бренда из localStorage (если установлен через zustand).
 * Это позволяет менять логотип/цвета без пересборки.
 */
export function getEffectiveBrand(): Partial<BrandConfig> {
  try {
    const raw = localStorage.getItem('user-prefs')
    if (!raw) return {}
    const parsed = JSON.parse(raw) as { state?: { brandOverride?: BrandOverride } }
    const o = parsed?.state?.brandOverride
    if (!o) return {}
    return {
      name: o.name,
      gradient: o.gradient,
      logoUrl: o.logoUrl,
    }
  } catch {
    return {}
  }
}
