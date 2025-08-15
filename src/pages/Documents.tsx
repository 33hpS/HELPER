/**
 * DocumentsPage - страница управления документами с AI.
 * Содержит список документов, фильтры, имитацию анализа и действий (перевод, экспорт).
 */
import React, { useEffect, useMemo, useState } from 'react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { FileText, Loader2, Play, Languages, Download, CheckCircle2, AlertCircle } from 'lucide-react'

/**
 * Тип тональности анализа.
 */
type Sentiment = 'positive' | 'neutral' | 'negative'

/**
 * Статус обработки документа.
 */
type DocStatus = 'done' | 'processing' | 'new'

/**
 * Модель данных документа.
 */
interface DocumentItem {
  id: string
  name: string
  pages: number
  sizeMB: number
  format: 'PDF' | 'DOCX' | 'XLSX' | 'TXT'
  category: string
  status: DocStatus
  progress: number
  ai: {
    analyzed: boolean
    points: number
    actions: number
    sentiment: Sentiment
    confidence?: number
  }
  updatedAt: string
  author: string
}

/**
 * Генерирует мок-данные документов.
 */
function makeMockDocuments(): DocumentItem[] {
  return [
    {
      id: 'doc-1',
      name: 'Стратегический план 2025',
      pages: 28,
      sizeMB: 5.2,
      format: 'DOCX',
      category: 'Бизнес',
      status: 'done',
      progress: 100,
      ai: { analyzed: true, points: 12, actions: 5, sentiment: 'positive', confidence: 97 },
      updatedAt: '2 часа назад',
      author: 'Анна Иванова',
    },
    {
      id: 'doc-2',
      name: 'Контракт №2024-458',
      pages: 12,
      sizeMB: 2.1,
      format: 'PDF',
      category: 'Договор',
      status: 'processing',
      progress: 60,
      ai: { analyzed: false, points: 0, actions: 0, sentiment: 'neutral' },
      updatedAt: 'Вчера',
      author: 'Петр Смирнов',
    },
    {
      id: 'doc-3',
      name: 'Quarterly Report Q3 2024',
      pages: 16,
      sizeMB: 3.4,
      format: 'XLSX',
      category: 'Отчет',
      status: 'new',
      progress: 0,
      ai: { analyzed: false, points: 0, actions: 0, sentiment: 'neutral' },
      updatedAt: '3 дня назад',
      author: 'Мария Козлова',
    },
  ]
}

/**
 * Возвращает цветовую метку тональности.
 */
function sentimentBadge(s: Sentiment): { label: string; className: string } {
  switch (s) {
    case 'positive':
      return { label: 'Позитивный', className: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300' }
    case 'negative':
      return { label: 'Негативный', className: 'bg-rose-500/15 text-rose-600 dark:text-rose-300' }
    default:
      return { label: 'Нейтральный', className: 'bg-gray-500/15 text-gray-600 dark:text-gray-300' }
  }
}

/**
 * DocumentsPage - основной компонент страницы "Документы".
 */
const DocumentsPage: React.FC = () => {
  const [query, setQuery] = useState('')
  const [onlyAnalyzed, setOnlyAnalyzed] = useState(false)
  const [category, setCategory] = useState<string>('Все')
  const [docs, setDocs] = useState<DocumentItem[]>(() => makeMockDocuments())

  // Фильтрация по запросу, категории и флагу анализа
  const filtered = useMemo(() => {
    return docs.filter(d => {
      const byQuery = !query || d.name.toLowerCase().includes(query.toLowerCase())
      const byCat = category === 'Все' || d.category === category
      const byAnalyzed = !onlyAnalyzed || d.ai.analyzed
      return byQuery && byCat && byAnalyzed
    })
  }, [docs, query, category, onlyAnalyzed])

  /**
   * Имитация анализа документа: переключает в processing и увеличивает прогресс до 100%.
   */
  const analyzeDocument = (id: string) => {
    setDocs(prev =>
      prev.map(d => (d.id === id ? { ...d, status: 'processing', progress: Math.max(5, d.progress) } : d))
    )
    let pct =  Math.max(5, docs.find(d => d.id === id)?.progress ?? 5)
    const timer = setInterval(() => {
      pct += Math.round(5 + Math.random() * 15)
      setDocs(prev => prev.map(d => (d.id === id ? { ...d, progress: Math.min(100, pct) } : d)))
      if (pct >= 100) {
        clearInterval(timer)
        setDocs(prev =>
          prev.map(d => (d.id === id
            ? {
                ...d,
                status: 'done',
                ai: { analyzed: true, points: 8 + Math.floor(Math.random() * 5), actions: 3, sentiment: 'positive', confidence: 95 + Math.floor(Math.random() * 3) },
              }
            : d))
        )
      }
    }, 350)
  }

  /**
   * Имитация перевода.
   */
  const translateDocument = (id: string) => {
    // Здесь можно вызвать реальный API /api/ai/gemini-multimodal или /api/ai/translate.
    alert(`Перевожу документ ${id}... (демо)`)
  }

  /**
   * Имитация экспорта.
   */
  const exportDocument = (id: string, format: DocumentItem['format']) => {
    // Здесь можно вызвать /api/documents/:id/export
    alert(`Экспорт документа ${id} в ${format}... (демо)`)
  }

  // Доступные категории
  const categories = useMemo(() => ['Все', ...Array.from(new Set(docs.map(d => d.category)))], [docs])

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gradient-to-br from-gray-50 to-gray-100 dark:from-neutral-950 dark:to-neutral-900 py-8 px-4">
      <div className="mx-auto max-w-6xl">
        {/* Заголовок */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Документы</h1>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Создание, анализ и оптимизация с AI</p>
            </div>
          </div>
        </div>

        {/* Панель управления */}
        <div className="mt-6 rounded-xl border border-black/5 dark:border-white/10 bg-white/70 dark:bg-neutral-900/70 backdrop-blur p-4">
          <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
            <div className="flex-1">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Поиск по названию..."
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map(c => (
                <Button
                  key={c}
                  variant={category === c ? 'default' : 'outline'}
                  className={category === c ? '' : 'bg-transparent'}
                  size="sm"
                  onClick={() => setCategory(c)}
                >
                  {c}
                </Button>
              ))}
              <Button
                variant={onlyAnalyzed ? 'default' : 'outline'}
                className={onlyAnalyzed ? '' : 'bg-transparent'}
                size="sm"
                onClick={() => setOnlyAnalyzed(v => !v)}
              >
                Только с анализом
              </Button>
            </div>
          </div>
        </div>

        {/* Таблица */}
        <div className="mt-6 rounded-xl border border-black/5 dark:border-white/10 overflow-hidden">
          <div className="hidden md:grid grid-cols-12 bg-gray-100/70 dark:bg-neutral-800/70 text-sm text-gray-600 dark:text-gray-300 px-4 py-2">
            <div className="col-span-4">Документ</div>
            <div className="col-span-2">AI статус</div>
            <div className="col-span-2">Формат</div>
            <div className="col-span-2">Обновлен</div>
            <div className="col-span-2 text-right">Действия</div>
          </div>

          {filtered.map(d => (
            <div key={d.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-0 px-4 py-4 border-t border-black/5 dark:border-white/10 bg-white dark:bg-neutral-900">
              {/* Документ */}
              <div className="md:col-span-4">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-gray-100 dark:bg-neutral-800 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">{d.name}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {d.pages} стр • {d.sizeMB} MB • {d.category} • Автор: {d.author}
                    </div>
                  </div>
                </div>
              </div>

              {/* AI статус */}
              <div className="md:col-span-2">
                {d.status === 'processing' && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Анализируется...
                    </div>
                    <div className="h-2 w-full rounded bg-gray-100 dark:bg-neutral-800 overflow-hidden">
                      <div className="h-2 bg-gradient-to-r from-indigo-500 to-blue-500" style={{ width: `${d.progress}%` }} />
                    </div>
                  </div>
                )}
                {d.status === 'done' && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-sm">
                      <CheckCircle2 className="w-4 h-4" />
                      Проанализирован {d.ai.confidence ? `• ${d.ai.confidence}%` : ''}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {d.ai.points} ключ. точек • {d.ai.actions} действий
                    </div>
                    <div className={`inline-flex mt-1`}>
                      <span className={`text-xs px-2 py-0.5 rounded ${sentimentBadge(d.ai.sentiment).className}`}>
                        {sentimentBadge(d.ai.sentiment).label}
                      </span>
                    </div>
                  </div>
                )}
                {d.status === 'new' && (
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    Требуется анализ
                  </div>
                )}
              </div>

              {/* Формат */}
              <div className="md:col-span-2 text-sm text-gray-700 dark:text-gray-200">
                <Badge variant="secondary">{d.format}</Badge>
              </div>

              {/* Обновлен */}
              <div className="md:col-span-2 text-sm text-gray-600 dark:text-gray-400">{d.updatedAt}</div>

              {/* Действия */}
              <div className="md:col-span-2">
                <div className="flex md:justify-end gap-2">
                  {d.status !== 'processing' && (
                    <Button size="sm" onClick={() => analyzeDocument(d.id)}>
                      <Play className="w-4 h-4 mr-2" /> Анализ
                    </Button>
                  )}
                  <Button size="sm" variant="outline" className="bg-transparent" onClick={() => translateDocument(d.id)}>
                    <Languages className="w-4 h-4 mr-2" /> Перевод
                  </Button>
                  <Button size="sm" variant="outline" className="bg-transparent" onClick={() => exportDocument(d.id, d.format)}>
                    <Download className="w-4 h-4 mr-2" /> Экспорт
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="px-4 py-10 bg-white dark:bg-neutral-900 text-center text-gray-600 dark:text-gray-300">
              Ничего не найдено. Измените критерии поиска.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DocumentsPage
