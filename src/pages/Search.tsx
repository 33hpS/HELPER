/**
 * SearchPage - страница интеллектуального поиска.
 * Содержит: поле поиска с подсказками, фасетные фильтры, список результатов, пагинацию.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Search, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import SearchFilters from '../components/search/SearchFilters'
import SearchResultCard from '../components/search/SearchResultCard'
import {
  type SearchFilters as Filters,
  type SearchResult,
  searchVectorMock,
  getAutocompleteSuggestions,
} from '../services/api'

/**
 * PaginationProps - свойства компонента пагинации.
 */
interface PaginationProps {
  page: number
  total: number
  pageSize: number
  onChange: (p: number) => void
}

/**
 * Pagination - простая пагинация с кнопками Назад/Вперед.
 */
const Pagination: React.FC<PaginationProps> = ({ page, total, pageSize, onChange }) => {
  const pages = Math.max(1, Math.ceil(total / pageSize))
  const prev = () => onChange(Math.max(1, page - 1))
  const next = () => onChange(Math.min(pages, page + 1))

  if (pages <= 1) return null

  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      <Button variant="outline" className="bg-transparent" onClick={prev} disabled={page === 1}>
        <ChevronLeft className="w-4 h-4 mr-1" /> Предыдущая
      </Button>
      <div className="text-sm text-gray-600 dark:text-gray-300">
        Стр. {page} из {pages}
      </div>
      <Button variant="outline" className="bg-transparent" onClick={next} disabled={page === pages}>
        Следующая <ChevronRight className="w-4 h-4 ml-1" />
      </Button>
    </div>
  )
}

/**
 * EmptyState - пустое состояние, когда результатов нет.
 */
const EmptyState: React.FC<{ query: string }> = ({ query }) => (
  <div className="text-center py-16 border border-dashed rounded-xl border-black/10 dark:border-white/10">
    <div className="mx-auto w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center mb-3">
      <Search className="w-6 h-6 text-blue-600" />
    </div>
    <h3 className="font-medium">Ничего не найдено</h3>
    <p className="text-sm text-gray-500 mt-1">
      Попробуйте изменить запрос{query ? ` «${query}»` : ''} или ослабить фильтры.
    </p>
  </div>
)

/**
 * SuggestionList - список подсказок автодополнения.
 */
const SuggestionList: React.FC<{
  items: string[]
  onPick: (s: string) => void
  visible: boolean
}> = ({ items, onPick, visible }) => {
  if (!visible || !items.length) return null
  return (
    <div className="absolute z-20 mt-1 w-full rounded-md border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900 shadow-lg overflow-hidden">
      {items.map((s, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onPick(s)}
          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-neutral-800"
        >
          {s}
        </button>
      ))}
    </div>
  )
}

/**
 * SearchPage - основной компонент страницы поиска.
 */
const SearchPage: React.FC = () => {
  // Состояния запроса и подсказок
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [suggestionsOpen, setSuggestionsOpen] = useState(false)
  const suggestTimer = useRef<number | null>(null)

  // Фильтры
  const defaultFilters: Filters = useMemo(
    () => ({ type: 'all', period: 'all', author: 'any', withAnalysis: false, highRating: false }),
    [],
  )
  const [filters, setFilters] = useState<Filters>(defaultFilters)

  // Результаты
  const [items, setItems] = useState<SearchResult[]>([])
  const [total, setTotal] = useState(0)
  const [timeSec, setTimeSec] = useState(0)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const pageSize = 5

  // Контроль устаревших запросов
  const fetchId = useRef(0)

  /**
   * loadSuggestions - получает подсказки по вводу.
   */
  const loadSuggestions = useCallback(async (q: string) => {
    try {
      const out = await getAutocompleteSuggestions(q)
      setSuggestions(out)
    } catch {
      setSuggestions([])
    }
  }, [])

  /**
   * runSearch - выполняет поиск.
   */
  const runSearch = useCallback(async () => {
    const id = ++fetchId.current
    setLoading(true)
    try {
      const res = await searchVectorMock(query, filters, page, pageSize)
      if (id !== fetchId.current) return // отбрасываем устаревший ответ
      setItems(res.items)
      setTotal(res.total)
      setTimeSec(res.timeSec)
    } finally {
      if (id === fetchId.current) setLoading(false)
    }
  }, [query, filters, page])

  // Автоподсказки (debounce)
  useEffect(() => {
    if (suggestTimer.current) window.clearTimeout(suggestTimer.current)
    suggestTimer.current = window.setTimeout(() => {
      loadSuggestions(query)
    }, 220)
    return () => {
      if (suggestTimer.current) window.clearTimeout(suggestTimer.current)
    }
  }, [query, loadSuggestions])

  // Автопоиск при изменении фильтров и страницы (debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      runSearch()
    }, 180)
    return () => clearTimeout(timer)
  }, [filters, page, runSearch])

  // Инициализация с первичной загрузкой
  useEffect(() => {
    runSearch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /**
   * onSubmit - отправка формы поиска.
   */
  const onSubmit = useCallback(
    (e?: React.FormEvent) => {
      if (e) e.preventDefault()
      setPage(1)
      runSearch()
      setSuggestionsOpen(false)
    },
    [runSearch],
  )

  /**
   * onPickSuggestion - выбор подсказки.
   */
  const onPickSuggestion = useCallback(
    (s: string) => {
      setQuery(s)
      setPage(1)
      setSuggestionsOpen(false)
      // Немного подождём, чтобы успело обновиться состояние
      setTimeout(() => runSearch(), 0)
    },
    [runSearch],
  )

  /**
   * resetFilters - сброс фасетов.
   */
  const resetFilters = useCallback(() => {
    setFilters(defaultFilters)
    setPage(1)
  }, [defaultFilters])

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Хедер поиска */}
      <div className="mb-5">
        <h1 className="text-2xl font-semibold">Интеллектуальный поиск</h1>
        <p className="text-sm text-gray-500 mt-1">
          Векторный поиск по документам и изображениям с подсказками и фасетами.
        </p>
      </div>

      {/* Поле поиска */}
      <form onSubmit={onSubmit} className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setSuggestionsOpen(true)}
              placeholder="Например: договоры 2024, финансовые отчеты, изображения продуктов..."
              className="pl-9"
            />
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <SuggestionList
              items={suggestions}
              onPick={onPickSuggestion}
              visible={suggestionsOpen}
            />
          </div>
          <Button type="submit">Искать</Button>
        </div>
        {/* Подсказки-быстрый старт */}
        {!query && (
          <div className="mt-2 flex flex-wrap gap-2">
            {['договоры 2024', 'презентации клиентам', 'финансовые отчеты', 'изображения продуктов'].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onPickSuggestion(s)}
                className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </form>

      {/* Контент */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Левая колонка: фильтры */}
        <div className="lg:col-span-4 xl:col-span-3">
          <div className="mb-3 flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-gray-600" />
            <span className="text-sm text-gray-600">Фильтры</span>
          </div>
          <SearchFilters
            value={filters}
            onChange={(next) => {
              setFilters(next)
              setPage(1)
            }}
            onReset={resetFilters}
            disabled={loading}
          />
        </div>

        {/* Правая колонка: результаты */}
        <div className="lg:col-span-8 xl:col-span-9">
          {/* Статистика поиска */}
          <div className="mb-3 flex items-center gap-2">
            <Badge variant="secondary">
              Найдено {total}
            </Badge>
            <span className="text-sm text-gray-500">за {timeSec.toFixed(2)} сек</span>
          </div>

          {/* Скелетоны/контент */}
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-black/5 dark:border-white/10 bg-white dark:bg-neutral-900 p-4 animate-pulse">
                  <div className="h-4 w-1/3 bg-gray-200 dark:bg-neutral-700 rounded" />
                  <div className="mt-3 h-3 w-2/3 bg-gray-200 dark:bg-neutral-700 rounded" />
                  <div className="mt-2 h-3 w-1/2 bg-gray-200 dark:bg-neutral-700 rounded" />
                </div>
              ))}
            </div>
          ) : items.length ? (
            <>
              <div className="space-y-3">
                {items.map((it) => (
                  <SearchResultCard key={it.id} item={it} />
                ))}
              </div>
              <Pagination page={page} total={total} pageSize={pageSize} onChange={setPage} />
            </>
          ) : (
            <EmptyState query={query} />
          )}
        </div>
      </div>
    </div>
  )
}

export default SearchPage
