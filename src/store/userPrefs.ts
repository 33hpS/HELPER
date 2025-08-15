/**
 * userPrefs.ts - zustand-хранилище пользовательских настроек (тема, плотность, бренд-override).
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/** Тема интерфейса */
export type Theme = 'light' | 'dark'
/** Плотность интерфейса */
export type Density = 'comfortable' | 'compact'

/**
 * BrandOverride - переопределение бренда без пересборки (через localStorage).
 */
export interface BrandOverride {
  /** Имя бренда */
  name?: string
  /** Градиентные классы Tailwind */
  gradient?: {
    from: string
    to: string
  }
  /** Логотип (URL) */
  logoUrl?: string
}

/**
 * UserPrefsState - состояние предпочтений пользователя.
 */
export interface UserPrefsState {
  /** Тема */
  theme: Theme
  /** Плотность интерфейса */
  density: Density
  /** Переопределение бренда */
  brandOverride?: BrandOverride
  /** Установить тему */
  setTheme: (t: Theme) => void
  /** Переключить тему */
  toggleTheme: () => void
  /** Установить плотность */
  setDensity: (d: Density) => void
  /** Установить brand override */
  setBrandOverride: (b?: BrandOverride) => void
}

/**
 * useUserPrefsStore - zustand store с персистом в localStorage (ключ: user-prefs).
 */
export const useUserPrefsStore = create<UserPrefsState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      density: 'comfortable',
      brandOverride: undefined,
      setTheme: (t) => set({ theme: t }),
      toggleTheme: () => set({ theme: get().theme === 'dark' ? 'light' : 'dark' }),
      setDensity: (d) => set({ density: d }),
      setBrandOverride: (b) => set({ brandOverride: b }),
    }),
    {
      name: 'user-prefs',
      version: 1,
    },
  ),
)
