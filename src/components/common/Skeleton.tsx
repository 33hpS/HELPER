/**
 * Skeleton - простой компонент скелета для загрузки.
 * Используется в местах, где требуется placeholder контента.
 */
import React from 'react'

/**
 * Пропсы для компонента Skeleton.
 */
interface SkeletonProps {
  /** Дополнительные классы tailwind */
  className?: string
}

/**
 * Отрисовывает анимированный прямоугольник-скелет.
 */
const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
  return <div className={`animate-pulse rounded-md bg-gray-200 dark:bg-gray-800 ${className}`} />
}

export default Skeleton
