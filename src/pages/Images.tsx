/**
 * ImagesPage - страница AI-обработки изображений.
 * Содержит drag&drop загрузку, предпросмотр, мини-метрики и умную библиотеку с плейсхолдерами.
 */
import React, { useCallback, useMemo, useRef, useState } from 'react'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Image as ImageIcon, UploadCloud, Check, Sparkles, Trash2 } from 'lucide-react'

/**
 * Модель загруженного изображения (предпросмотр).
 */
interface LocalImage {
  id: string
  name: string
  size: number
  type: string
  dataUrl: string
}

/**
 * Конвертирует файл в dataURL.
 */
async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * Валидация изображения.
 */
function validateImage(file: File): string | null {
  if (!file.type.startsWith('image/')) return 'Можно загружать только изображения.'
  const maxMB = 50
  if (file.size > maxMB * 1024 * 1024) return `Файл слишком большой (>${maxMB}MB).`
  return null
}

/**
 * ImagesPage component - основной компонент страницы "Изображения".
 */
const ImagesPage: React.FC = () => {
  const [items, setItems] = useState<LocalImage[]>([])
  const [dragOver, setDragOver] = useState(false)
  const [autoAnalyze, setAutoAnalyze] = useState(true)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  /**
   * Обрабатывает список файлов: валидация и конвертация в dataURL.
   */
  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files?.length) return
    const next: LocalImage[] = []
    for (const f of Array.from(files)) {
      const err = validateImage(f)
      if (err) {
        alert(`${f.name}: ${err}`)
        continue
      }
      const dataUrl = await fileToDataUrl(f)
      next.push({
        id: crypto.randomUUID(),
        name: f.name,
        size: f.size,
        type: f.type,
        dataUrl,
      })
    }
    setItems(prev => [...prev, ...next])
  }, [])

  /**
   * Обработчик drop.
   */
  const onDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(false)
    await handleFiles(e.dataTransfer.files)
  }, [handleFiles])

  /**
   * Удаление выбранных загруженных изображений.
   */
  const clearUploads = useCallback(() => {
    setItems([])
  }, [])

  // Простейшие вычисления "AI метрик"
  const metrics = useMemo(() => {
    const count = items.length
    const categories = Math.min(24, Math.max(4, Math.round(count * 1.5)))
    const accuracy = Math.min(99, 90 + Math.round(Math.random() * 9))
    const space = Math.min(80, count > 0 ? 40 + Math.round(Math.random() * 30) : 0)
    return { count, categories, accuracy, space }
  }, [items.length])

  // Пресеты галереи с умными плейсхолдерами
  const gallery = useMemo(() => {
    const tags = ['products', 'people', 'documents', 'landscape']
    return new Array(12).fill(null).map((_, i) => {
      const t = tags[i % tags.length]
      return { id: `ph-${i}`, name: `${t}-${i + 1}.jpg`, src: `https://pub-cdn.sider.ai/u/U07GHKZAW71/web-coder/689a30f5a616cfbf06691f2b/resource/8eb43897-0d7f-4505-85f7-f5a822354af9.jpg` }
    })
  }, [])

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gradient-to-br from-gray-50 to-gray-100 dark:from-neutral-950 dark:to-neutral-900 py-8 px-4">
      <div className="mx-auto max-w-6xl">
        {/* Заголовок */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-cyan-600 text-white flex items-center justify-center">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI обработка изображений</h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">Пакетная обработка, категоризация, OCR, распознавание объектов</p>
          </div>
        </div>

        {/* Метрики */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="rounded-xl p-4 bg-white/70 dark:bg-neutral-900/70 border border-black/5 dark:border-white/10">
            <div className="text-xs text-gray-500">Обработано сегодня</div>
            <div className="text-2xl font-semibold">{metrics.count}</div>
          </div>
          <div className="rounded-xl p-4 bg-white/70 dark:bg-neutral-900/70 border border-black/5 dark:border-white/10">
            <div className="text-xs text-gray-500">AI категорий</div>
            <div className="text-2xl font-semibold">{metrics.categories}</div>
          </div>
          <div className="rounded-xl p-4 bg-white/70 dark:bg-neutral-900/70 border border-black/5 dark:border-white/10">
            <div className="text-xs text-gray-500">Точность распознавания</div>
            <div className="text-2xl font-semibold">{metrics.accuracy}%</div>
          </div>
          <div className="rounded-xl p-4 bg-white/70 dark:bg-neutral-900/70 border border-black/5 dark:border-white/10">
            <div className="text-xs text-gray-500">Экономия места</div>
            <div className="text-2xl font-semibold">{metrics.space}%</div>
          </div>
        </div>

        {/* Загрузка файлов */}
        <div
          className={`mt-6 rounded-2xl border-2 border-dashed ${dragOver ? 'border-blue-400 bg-blue-400/10' : 'border-black/10 dark:border-white/10'} p-8 bg-white/70 dark:bg-neutral-900/70`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
        >
          <div className="flex flex-col items-center text-center gap-3">
            <UploadCloud className="w-8 h-8 text-gray-600 dark:text-gray-300" />
            <div className="text-gray-900 dark:text-white font-medium">Перетащите изображения сюда</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              AI автоматически обработает и категоризирует файлы
            </div>
            <div className="text-xs text-gray-500">Поддерживается: JPG, PNG, WebP, AVIF, HEIC • До 50MB • Пакетно до 100 файлов</div>
            <div className="flex items-center gap-2 mt-2">
              <Button onClick={() => fileInputRef.current?.click()}>
                Выбрать файлы
              </Button>
              <Button
                variant={autoAnalyze ? 'default' : 'outline'}
                className={autoAnalyze ? '' : 'bg-transparent'}
                onClick={() => setAutoAnalyze(v => !v)}
              >
                <Sparkles className="w-4 h-4 mr-2" /> Режим реального времени AI анализа
              </Button>
              {items.length > 0 && (
                <Button variant="outline" className="bg-transparent" onClick={clearUploads}>
                  <Trash2 className="w-4 h-4 mr-2" /> Очистить
                </Button>
              )}
            </div>
            <input
              ref={fileInputRef}
              hidden
              type="file"
              multiple
              accept="image/*"
              onChange={e => handleFiles(e.target.files)}
            />
          </div>
        </div>

        {/* Предпросмотр */}
        {items.length > 0 && (
          <div className="mt-6">
            <div className="mb-3 text-sm text-gray-600 dark:text-gray-300">Загружено: {items.length}</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {items.map(img => (
                <div key={img.id} className="rounded-xl overflow-hidden border border-black/5 dark:border-white/10 bg-white dark:bg-neutral-900">
                  <img src={img.dataUrl} className="object-cover w-full h-40" alt={img.name} />
                  <div className="p-3 text-sm">
                    <div className="font-medium text-gray-900 dark:text-white truncate">{img.name}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">{(img.size / (1024 * 1024)).toFixed(2)} MB</div>
                    {autoAnalyze ? (
                      <div className="mt-2 inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs">
                        <Check className="w-4 h-4" /> Проанализировано
                      </div>
                    ) : (
                      <div className="mt-2 inline-flex items-center gap-1 text-gray-600 dark:text-gray-300 text-xs">
                        <ImageIcon className="w-4 h-4" /> Ожидает анализа
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Умная библиотека (плейсхолдеры) */}
        <div className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Умная библиотека</h2>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">Все категории</Badge>
              <Badge variant="secondary" className="text-xs">Продукты</Badge>
              <Badge variant="secondary" className="text-xs">Люди</Badge>
              <Badge variant="secondary" className="text-xs">Документы</Badge>
              <Badge variant="secondary" className="text-xs">Пейзажи</Badge>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {gallery.map(item => (
              <div key={item.id} className="rounded-xl overflow-hidden border border-black/5 dark:border-white/10 bg-white dark:bg-neutral-900">
                <img src={item.src} className="object-cover w-full h-32" />
                <div className="px-3 py-2 text-xs text-gray-700 dark:text-gray-200 truncate">{item.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ImagesPage
