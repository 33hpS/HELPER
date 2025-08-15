/**
 * SiteHeader - общий верхний бар с брендингом, навигацией и переключателем темы.
 * Использует react-router (без react-router-dom), поддерживает активное состояние ссылок.
 */
import React, { useMemo } from 'react'
import { Link, useLocation } from 'react-router'
import { Button } from '../ui/button'
import ThemeToggle from '../theme/ThemeToggle'
import { Bot, FileText, Image as ImageIcon, Search as SearchIcon, Settings as SettingsIcon, Home } from 'lucide-react'

/**
 * Тип пункта навигации.
 */
interface NavItem {
  /** Путь маршрута */
  to: string
  /** Отображаемое имя */
  label: string
  /** Иконка Lucide */
  icon: React.FC<React.SVGProps<SVGSVGElement>>
}

/**
 * Возвращает массив пунктов меню.
 */
function useNavItems(): NavItem[] {
  return useMemo(
    () => [
      { to: '/', label: 'Главная', icon: Home },
      { to: '/documents', label: 'Документы', icon: FileText },
      { to: '/images', label: 'Изображения', icon: ImageIcon },
      { to: '/search', label: 'Поиск', icon: SearchIcon },
      { to: '/settings', label: 'Настройки', icon: SettingsIcon },
    ],
    []
  )
}

/**
 * Проверяет активность пути.
 */
function isActivePath(current: string, to: string): boolean {
  if (to === '/') return current === '/' || current === ''
  return current.startsWith(to)
}

/**
 * SiteHeader component - основной компонент хедера.
 */
const SiteHeader: React.FC = () => {
  const { pathname } = useLocation()
  const nav = useNavItems()

  return (
    <header className="sticky top-0 z-40 border-b border-black/5 dark:border-white/10 backdrop-blur bg-white/70 dark:bg-neutral-900/70">
      <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
        {/* Бренд */}
        <Link to="/" className="flex items-center gap-2 group">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 text-white shadow-sm">
            <Bot className="w-4 h-4" />
          </span>
          <span className="font-semibold text-gray-900 dark:text-white group-hover:opacity-90">
            Corporate AI
          </span>
        </Link>

        {/* Навигация */}
        <nav className="hidden md:flex items-center gap-1">
          {nav.map(item => {
            const active = isActivePath(pathname.replace('#', ''), item.to)
            return (
              <Link key={item.to} to={item.to} className="inline-flex">
                <Button
                  variant={active ? 'default' : 'outline'}
                  className={active ? '' : 'bg-transparent'}
                  size="sm"
                >
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.label}
                </Button>
              </Link>
            )
          })}
        </nav>

        {/* Действия */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>

      {/* Мобильная навигация */}
      <div className="md:hidden border-t border-black/5 dark:border-white/10 px-2 py-2 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          {nav.map(item => {
            const active = isActivePath(pathname.replace('#', ''), item.to)
            return (
              <Link key={item.to} to={item.to} className="inline-flex">
                <Button
                  variant={active ? 'default' : 'outline'}
                  className={active ? '' : 'bg-transparent'}
                  size="sm"
                >
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.label}
                </Button>
              </Link>
            )
          })}
        </div>
      </div>
    </header>
  )
}

export default SiteHeader
