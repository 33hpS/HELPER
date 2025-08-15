/**
 * AssistantWidget - плавающий AI-ассистент со встроенным чатом.
 * Поддерживает: пресеты задач, drag & drop и вставку изображений, localStorage историю,
 * индикатор загрузки, тосты ошибок/успеха и очистку истории.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Sparkles, X, Send, Image as ImageIcon, Loader2, Trash2, Wand2, Languages, Lightbulb } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Textarea } from '../../components/ui/textarea'
import { Badge } from '../../components/ui/badge'

/**
 * Роли сообщения в чате.
 */
type Role = 'user' | 'assistant'

/**
 * Представление сообщения.
 */
interface Message {
  /** Роль автора сообщения */
  role: Role
  /** Текстовое содержимое */
  content: string
  /** Приложенные изображения в base64 (первый — превью) */
  images?: string[]
}

/**
 * Тип задачи для пресета.
 */
type Task = 'analyze' | 'translate' | 'generate' | 'ideas'

/**
 * Внутренний хук: преобразование File изображения в base64-строку.
 */
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * Валидация изображений: тип и размер.
 */
function validateImage(file: File): string | null {
  const isImage = file.type.startsWith('image/')
  if (!isImage) return 'Можно прикреплять только изображения.'
  const maxMB = 10
  if (file.size > maxMB * 1024 * 1024) return `Файл слишком большой. Максимум ${maxMB}MB.`
  return null
}

/**
 * Основной компонент ассистента.
 */
const AssistantWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [task, setTask] = useState<Task>('analyze')
  const [language, setLanguage] = useState('English')
  const [droppedImages, setDroppedImages] = useState<string[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  // Инициализация истории из localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('assistant:history')
      if (raw) {
        const parsed = JSON.parse(raw) as Message[]
        setMessages(parsed)
      }
    } catch {
      // игнор
    }
  }, [])

  // Сохранение истории
  useEffect(() => {
    localStorage.setItem('assistant:history', JSON.stringify(messages))
    // автопрокрутка вниз
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  // Обработка вставки изображений из буфера обмена (Ctrl+V)
  useEffect(() => {
    const onPaste = async (e: ClipboardEvent) => {
      if (!isOpen) return
      const items = e.clipboardData?.items || []
      const files: File[] = []
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile()
          if (file) files.push(file)
        }
      }
      if (files.length) {
        const errors: string[] = []
        const imgs: string[] = []
        for (const f of files) {
          const err = validateImage(f)
          if (err) errors.push(`${f.name}: ${err}`)
          else imgs.push(await fileToBase64(f))
        }
        if (errors.length) toast.error(errors.join('\n'))
        if (imgs.length) {
          setDroppedImages(prev => [...prev, ...imgs])
          toast.success(`Добавлено изображений: ${imgs.length}`)
        }
      }
    }
    window.addEventListener('paste', onPaste)
    return () => window.removeEventListener('paste', onPaste)
  }, [isOpen])

  // Подсказка placeholder на основе выбранного пресета
  const placeholder = useMemo(() => {
    switch (task) {
      case 'analyze':
        return 'Опишите документ/контент для анализа...'
      case 'translate':
        return `Текст для перевода на ${language}...`
      case 'generate':
        return 'Опишите, что нужно сгенерировать...'
      case 'ideas':
        return 'Коротко сформулируйте запрос для идей...'
      default:
        return 'Введите сообщение...'
    }
  }, [task, language])

  /**
   * Отправляет сообщение в API или имитирует ответ.
   */
  const sendMessage = useCallback(async () => {
    const text = input.trim()
    if (!text && droppedImages.length === 0) {
      toast.message('Введите сообщение или прикрепите изображение')
      return
    }
    const userMsg: Message = { role: 'user', content: text, images: droppedImages.length ? droppedImages : undefined }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setDroppedImages([])
    setLoading(true)

    try {
      // Попытка реального API, если доступен
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          images: userMsg.images,
          task,
          language,
          history: messages.slice(-20), // последние 20 сообщений
        })
      })
      if (res.ok) {
        const data = await res.json()
        setMessages(prev => [...prev, { role: 'assistant', content: data.response ?? 'Готово ✅' }])
      } else {
        // Фоллбэк на мок-ответ
        setMessages(prev => [...prev, { role: 'assistant', content: mockAnswer(text, task, language, !!userMsg.images?.length) }])
      }
    } catch {
      // Фоллбэк на мок-ответ при ошибке сети
      setMessages(prev => [...prev, { role: 'assistant', content: mockAnswer(text, task, language, !!userMsg.images?.length) }])
    } finally {
      setLoading(false)
    }
  }, [input, droppedImages, task, language, messages])

  /**
   * Обработчик выбора файлов через диалог.
   */
  const onPickFiles = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files?.length) return
    const errors: string[] = []
    const imgs: string[] = []
    for (const f of Array.from(files)) {
      const err = validateImage(f)
      if (err) errors.push(`${f.name}: ${err}`)
      else imgs.push(await fileToBase64(f))
    }
    if (errors.length) toast.error(errors.join('\n'))
    if (imgs.length) {
      setDroppedImages(prev => [...prev, ...imgs])
      toast.success(`Добавлено изображений: ${imgs.length}`)
    }
    // сброс значения, чтобы одно и то же можно выбрать повторно
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [])

  /**
   * Обработчик Drag & Drop.
   */
  const onDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (!files?.length) return
    const errors: string[] = []
    const imgs: string[] = []
    for (const f of Array.from(files)) {
      const err = validateImage(f)
      if (err) errors.push(`${f.name}: ${err}`)
      else imgs.push(await fileToBase64(f))
    }
    if (errors.length) toast.error(errors.join('\n'))
    if (imgs.length) {
      setDroppedImages(prev => [...prev, ...imgs])
      toast.success(`Добавлено изображений: ${imgs.length}`)
    }
  }, [])

  /** Очистка истории чата. */
  const clearHistory = useCallback(() => {
    setMessages([])
    setDroppedImages([])
    localStorage.removeItem('assistant:history')
    toast.success('История чата очищена')
  }, [])

  return (
    <>
      {/* Плавающая кнопка ассистента */}
      <button
        className="fixed bottom-6 right-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl z-50 transition-transform active:scale-95"
        onClick={() => setIsOpen(true)}
        aria-label="Открыть AI ассистент"
        title="AI ассистент"
      >
        <Sparkles className="w-6 h-6" />
      </button>

      {/* Окно чата */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-6 w-[380px] sm:w-96 h-[600px] bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl z-50 flex flex-col border border-black/5 dark:border-white/10"
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
        >
          {/* Шапка */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-t-2xl flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              <h3 className="font-semibold">AI Ассистент</h3>
              <Badge variant="secondary" className="text-xs bg-white/20 text-white border-white/20">Онлайн</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="bg-transparent h-8 px-2" onClick={clearHistory} title="Очистить историю">
                <Trash2 className="w-4 h-4" />
              </Button>
              <Button variant="outline" className="bg-transparent h-8 px-2" onClick={() => setIsOpen(false)} title="Закрыть">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Пресеты задач */}
          <div className="px-4 pt-3 flex flex-wrap gap-2">
            <Button size="sm" variant={task === 'analyze' ? 'default' : 'outline'} className={task === 'analyze' ? '' : 'bg-transparent'} onClick={() => setTask('analyze')}>
              <Wand2 className="w-4 h-4 mr-2" /> Анализ
            </Button>
            <Button size="sm" variant={task === 'translate' ? 'default' : 'outline'} className={task === 'translate' ? '' : 'bg-transparent'} onClick={() => setTask('translate')}>
              <Languages className="w-4 h-4 mr-2" /> Перевод
            </Button>
            <Button size="sm" variant={task === 'generate' ? 'default' : 'outline'} className={task === 'generate' ? '' : 'bg-transparent'} onClick={() => setTask('generate')}>
              <Sparkles className="w-4 h-4 mr-2" /> Генерация
            </Button>
            <Button size="sm" variant={task === 'ideas' ? 'default' : 'outline'} className={task === 'ideas' ? '' : 'bg-transparent'} onClick={() => setTask('ideas')}>
              <Lightbulb className="w-4 h-4 mr-2" /> Идеи
            </Button>
          </div>

          {/* Панель выбора языка для перевода */}
          {task === 'translate' && (
            <div className="px-4 pt-2">
              <Input
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                placeholder="Целевой язык (например, English, Deutsch, Español)"
              />
            </div>
          )}

          {/* Зона сообщений */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-lg ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-neutral-800 text-gray-800 dark:text-gray-100'}`}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  {!!msg.images?.length && (
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      {msg.images.map((src, i) => (
                        <img key={i} src={src} className="object-cover w-full h-20 rounded-md border border-black/5 dark:border-white/10" alt={`attachment-${i}`} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-neutral-800 p-3 rounded-lg text-gray-600 dark:text-gray-300 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Думаю...
                </div>
              </div>
            )}
          </div>

          {/* Зона предварительного просмотра прикреплённых изображений */}
          {!!droppedImages.length && (
            <div className="px-4 pb-2">
              <div className="grid grid-cols-5 gap-2">
                {droppedImages.map((src, i) => (
                  <img key={i} src={src} className="object-cover w-full h-16 rounded-md border border-black/5 dark:border-white/10" alt={`preview-${i}`} />
                ))}
              </div>
            </div>
          )}

          {/* Drag & Drop подсветка */}
          {isDragging && (
            <div className="absolute inset-0 rounded-2xl border-2 border-dashed border-blue-400/70 bg-blue-400/10 pointer-events-none flex items-center justify-center">
              <span className="text-blue-700 dark:text-blue-300 font-medium">Отпустите, чтобы прикрепить изображение</span>
            </div>
          )}

          {/* Поле ввода и кнопки */}
          <div className="border-t border-black/5 dark:border-white/10 p-3">
            <div className="flex items-start gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="h-10 w-10 flex items-center justify-center rounded-md border border-black/10 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
                title="Прикрепить изображение"
                aria-label="Прикрепить изображение"
              >
                <ImageIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={onPickFiles}
                hidden
                multiple
              />
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={placeholder}
                className="flex-1 resize-none h-10 min-h-10 max-h-28"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    sendMessage()
                  }
                }}
              />
              <Button onClick={sendMessage} disabled={loading} className="h-10 px-3" title="Отправить">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
            <p className="mt-2 text-xs text-gray-500">Поддержка: вставка (Ctrl+V), Drag&Drop изображений, пресеты задач.</p>
          </div>
        </div>
      )}
    </>
  )
}

/**
 * Генерирует мок-ответ ассистента при отсутствии бэкенда.
 */
function mockAnswer(query: string, task: Task, language: string, withImage: boolean): string {
  const imgNote = withImage ? ' (учтены прикреплённые изображения)' : ''
  switch (task) {
    case 'analyze':
      return `Краткий анализ:${imgNote}\n• Ключевые пункты выделены.\n• Риски минимальны.\n• Рекомендация: продолжить с корректировками.\n\nЗапрос: ${truncate(query)}`
    case 'translate':
      return `Перевод на ${language}:${imgNote}\n"${truncate(query)}"\n\n(Демонстрационный перевод)`
    case 'generate':
      return `Черновик сгенерирован:${imgNote}\nЗаголовок: Идеальный заголовок\nВступление: Краткое и ёмкое.\nПлан: 1) Введение 2) Основное 3) Вывод`
    case 'ideas':
      return `Идеи:${imgNote}\n1) Вариант A\n2) Вариант B\n3) Вариант C`
    default:
      return `Ответ на: ${truncate(query)}`
  }
}

/**
 * Урезает строку до разумной длины.
 */
function truncate(s: string, n = 180): string {
  return s.length > n ? s.slice(0, n) + '…' : s
}

export default AssistantWidget
