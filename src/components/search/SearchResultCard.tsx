/**
 * SearchResultCard - карточка результата поиска для документов и изображений.
 * Показывает метаданные, сниппет и визуальные элементы.
 */

import React, { useMemo } from 'react'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { FileText, Image as ImageIcon, Sparkles, Star, Clock, User, ExternalLink } from 'lucide-react'
import type { SearchResult } from '../../services/api'
import { formatRelative } from '../../services/api'

/**
 * SearchResultCardProps - свойства карточки результата.
 */
interface SearchResultCardProps {
  /** Результат поиска */
  item: SearchResult
}

/**
 * ratingToStars - простая визуализация рейтинга.
 */
function ratingToStars(r?: number): number[] {
  const v = Math.round((r ?? 0) * 2) / 2
  return [1, 2, 3, 4, 5].map((i) => (i <= v ? 1 : i - 0.5 === v ? 0.5 : 0))
}

/**
 * SearchResultCard - основной компонент карточки.
 */
const SearchResultCard: React.FC<SearchResultCardProps> = ({ item }) => {
  const isDoc = item.type === 'document'
  const isImg = item.type === 'image'
  const Icon = isDoc ? FileText : ImageIcon
  const rel = `${Math.round(item.relevance)}%`

  const stars = useMemo(() => ratingToStars(item.rating), [item.rating])

  return (
    <div className="rounded-xl border border-black/5 dark:border-white/10 bg-white dark:bg-neutral-900 p-4 hover:shadow-md transition-shadow">
      <div className="flex gap-4">
        {/* Превью для изображений */}
        {isImg && (
          <div className="w-28 h-20 overflow-hidden rounded-md border border-black/5 dark:border-white/10 shrink-0">
            <img
              src={`https://pub-cdn.sider.ai/u/U07GHKZAW71/web-coder/689a30f5a616cfbf06691f2b/resource/95fb3815-7a90-405a-a12f-78cea9473836.jpg`}
              className="object-cover w-full h-full"
              alt="preview"
            />
          </div>
        )}

        <div className="flex-1 min-w-0">
          {/* Заголовок */}
          <div className="flex items-start gap-2">
            <Icon className="w-5 h-5 text-gray-500 mt-0.5" />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-medium truncate">{item.title}</h3>
                <Badge variant="secondary" className="text-[10px]">
                  {rel} релевантность
                </Badge>
                {item.aiAnalyzed && (
                  <Badge className="text-[10px]">
                    <Sparkles className="w-3 h-3 mr-1" /> AI анализ
                  </Badge>
                )}
              </div>
              {/* Метаданные */}
              <div className="mt-1 text-xs text-gray-500 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {formatRelative(item.timestamp)}
                </span>
                {!!item.author && (
                  <span className="inline-flex items-center gap-1">
                    <User className="w-3 h-3" /> {item.author}
                  </span>
                )}
                {typeof item.rating === 'number' && (
                  <span className="inline-flex items-center gap-1">
                    {stars.map((s, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${s ? 'text-amber-500' : 'text-gray-300'}`}
                        fill={s === 1 ? 'currentColor' : 'none'}
                      />
                    ))}
                    <span className="ml-1">{item.rating?.toFixed(1)}</span>
                  </span>
                )}
                {isDoc && (item as any).format && (item as any).meta && (
                  <span className="inline-flex items-center gap-1">
                    {(item as any).format} • {(item as any).meta}
                  </span>
                )}
                {isImg && (
                  <span className="inline-flex items-center gap-1">
                    {(item as any).dimensions}
                    {(item as any).ocr && ' • OCR'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Сниппет */}
          {!!item.snippet && (
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
              {item.snippet}
            </p>
          )}

          {/* Действия */}
          <div className="mt-3 flex items-center gap-2">
            <Button size="sm" variant="outline" className="bg-transparent">
              Открыть <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
            {/* Можно добавить дополнительные действия */}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SearchResultCard
