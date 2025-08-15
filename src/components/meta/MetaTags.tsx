/**
 * MetaTags - базовый компонент установки мета-информации страницы.
 * Устанавливает title и несколько мета-тегов через побочный эффект.
 */
import { useEffect } from 'react'

/**
 * Props интерфейс для MetaTags.
 */
interface MetaTagsProps {
  /** Заголовок страницы */
  title?: string
  /** Краткое описание страницы */
  description?: string
}

/**
 * Устанавливает заголовок и мета-теги документа.
 */
export default function MetaTags({ title = 'Corporate AI Assistant', description = 'AI-first корпоративное приложение-помощник' }: MetaTagsProps) {
  useEffect(() => {
    const prevTitle = document.title
    document.title = title

    const metaDesc = document.querySelector('meta[name="description"]') || (() => {
      const m = document.createElement('meta')
      m.setAttribute('name', 'description')
      document.head.appendChild(m)
      return m
    })()
    metaDesc.setAttribute('content', description)

    return () => {
      document.title = prevTitle
    }
  }, [title, description])

  return null
}
