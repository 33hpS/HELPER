/**
 * SearchFilters - фасетные фильтры поиска: тип контента, период, автор, флаги.
 * Управляет значением через контролируемые props.
 */

import React, { useCallback } from 'react'
import { type SearchFilters as Filters } from '../../services/api'
import { Button } from '../ui/button'
import { Label } from '../ui/label'
import { Switch } from '../ui/switch'
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectValue,
  SelectItem,
} from '../ui/select'
import { FileText, Images, LayoutGrid, ListChecks, RefreshCw } from 'lucide-react'

/**
 * SearchFiltersProps - свойства компонента SearchFilters.
 */
interface SearchFiltersProps {
  /** Текущее значение фильтров */
  value: Filters
  /** Изменение фильтров */
  onChange: (next: Filters) => void
  /** Сброс фильтров */
  onReset?: () => void
  /** Неактивное состояние (например, во время загрузки) */
  disabled?: boolean
}

/**
 * mapType - пользовательские подписи типов.
 */
const mapTypeLabel: Record<Filters['type'], string> = {
  all: 'Все',
  documents: 'Документы',
  images: 'Изображения',
  templates: 'Шаблоны',
}

/**
 * SearchFilters - основной компонент фильтров.
 */
const SearchFilters: React.FC<SearchFiltersProps> = ({ value, onChange, onReset, disabled }) => {
  const update = useCallback(
    (patch: Partial<Filters>) => onChange({ ...value, ...patch }),
    [value, onChange],
  )

  return (
    <div className="rounded-xl border border-black/5 dark:border-white/10 bg-white dark:bg-neutral-900 p-4 space-y-4">
      {/* Тип контента */}
      <div className="space-y-2">
        <Label className="text-sm">Тип контента</Label>
        <div className="flex flex-wrap gap-2">
          {(['all', 'documents', 'images', 'templates'] as Filters['type'][]).map((t) => {
            const active = value.type === t
            const Icon =
              t === 'documents' ? FileText : t === 'images' ? Images : t === 'templates' ? LayoutGrid : ListChecks
            return (
              <Button
                key={t}
                size="sm"
                variant={active ? 'default' : 'outline'}
                className={active ? '' : 'bg-transparent'}
                disabled={disabled}
                onClick={() => update({ type: t })}
              >
                <Icon className="w-4 h-4 mr-2" />
                {mapTypeLabel[t]}
              </Button>
            )
          })}
        </div>
      </div>

      {/* Период и Автор */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label className="text-sm">Период</Label>
          <Select
            value={value.period}
            onValueChange={(val) => update({ period: val as Filters['period'] })}
            disabled={disabled}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Период" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все время</SelectItem>
              <SelectItem value="month">Последний месяц</SelectItem>
              <SelectItem value="week">Последняя неделя</SelectItem>
              <SelectItem value="today">Сегодня</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-sm">Автор</Label>
          <Select
            value={value.author}
            onValueChange={(val) => update({ author: val as Filters['author'] })}
            disabled={disabled}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Автор" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Все авторы</SelectItem>
              <SelectItem value="anna">Анна</SelectItem>
              <SelectItem value="peter">Пётр</SelectItem>
              <SelectItem value="maria">Мария</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Флаги */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex items-center justify-between rounded-md border border-black/5 dark:border-white/10 px-3 py-2">
          <div>
            <div className="text-sm font-medium">С AI анализом</div>
            <div className="text-xs text-gray-500">Показывать только проанализированные</div>
          </div>
          <Switch
            checked={value.withAnalysis}
            onCheckedChange={(v) => update({ withAnalysis: Boolean(v) })}
            disabled={disabled}
          />
        </div>
        <div className="flex items-center justify-between rounded-md border border-black/5 dark:border-white/10 px-3 py-2">
          <div>
            <div className="text-sm font-medium">Высокий рейтинг</div>
            <div className="text-xs text-gray-500">Рейтинг 4.5+</div>
          </div>
          <Switch
            checked={value.highRating}
            onCheckedChange={(v) => update({ highRating: Boolean(v) })}
            disabled={disabled}
          />
        </div>
      </div>

      {/* Сброс */}
      <div className="pt-1">
        <Button
          variant="outline"
          className="bg-transparent"
          onClick={onReset}
          disabled={disabled}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Сбросить фильтры
        </Button>
      </div>
    </div>
  )
}

export default SearchFilters
