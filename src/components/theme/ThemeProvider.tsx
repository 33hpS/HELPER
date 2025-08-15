/**
 * ThemeProvider - провайдер темы приложения c контекстом.
 * Управляет классами корневого html, хранит тему в localStorage и предоставляет API переключения.
 */
import React, { createContext, PropsWithChildren, useCallback, useEffect, useMemo, useState } from 'react'

/**
 * Интерфейс настроек темы на уровне провайдера.
 */
interface ThemeProviderProps extends PropsWithChildren {
  /** Значение темы по умолчанию */
  defaultTheme?: 'light' | 'dark'
}

/**
 * Значение контекста темы.
 */
interface ThemeContextValue {
  /** Текущая тема */
  theme: 'light' | 'dark'
  /** Переключает тему light/dark */
  toggle: () => void
  /** Принудительно устанавливает тему */
  setTheme: (t: 'light' | 'dark') => void
}

/**
 * ThemeContext - контекст темы для компонентов (например, ThemeToggle).
 */
export const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  toggle: () => {},
  setTheme: () => {},
})

/**
 * safeGetStoredTheme - читает сохранённую тему из localStorage.
 */
function safeGetStoredTheme(): 'light' | 'dark' | null {
  try {
    const stored = localStorage.getItem('theme')
    if (stored === 'light' || stored === 'dark') return stored
    return null
  } catch {
    return null
  }
}

/**
 * safeSetStoredTheme - сохраняет тему в localStorage.
 */
function safeSetStoredTheme(t: 'light' | 'dark') {
  try {
    localStorage.setItem('theme', t)
  } catch {
    // игнорируем ошибки доступа к хранилищу
  }
}

/**
 * applyThemeClass - применяет класс темы на элемент html.
 */
function applyThemeClass(theme: 'light' | 'dark') {
  const root = document.documentElement
  root.classList.remove('light', 'dark')
  root.classList.add(theme)
}

/**
 * ThemeProvider - корневой провайдер темы.
 */
export function ThemeProvider({ defaultTheme = 'light', children }: ThemeProviderProps) {
  const [themeState, setThemeState] = useState<'light' | 'dark'>(() => {
    return safeGetStoredTheme() ?? defaultTheme
  })

  /**
   * setTheme - устанавливает тему и синхронизирует с localStorage.
   */
  const setTheme = useCallback((t: 'light' | 'dark') => {
    setThemeState(t)
    safeSetStoredTheme(t)
  }, [])

  /**
   * toggle - переключает тему между light и dark.
   */
  const toggle = useCallback(() => {
    setTheme(prev => {
      const next = prev === 'light' ? 'dark' : 'light'
      safeSetStoredTheme(next)
      return next
    })
  }, [setTheme])

  // Применение темы к html и синхронизация с localStorage при изменении
  useEffect(() => {
    applyThemeClass(themeState)
    safeSetStoredTheme(themeState)
  }, [themeState])

  // Реакция на изменения localStorage из других вкладок
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === 'theme' && (e.newValue === 'light' || e.newValue === 'dark')) {
        setThemeState(e.newValue)
      }
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  const value = useMemo<ThemeContextValue>(() => ({
    theme: themeState,
    toggle,
    setTheme,
  }), [themeState, toggle, setTheme])

  return (
    <ThemeContext.Provider value={value}>
      {children as JSX.Element}
    </ThemeContext.Provider>
  )
}

