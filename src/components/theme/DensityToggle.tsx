/**
 * DensityToggle - переключатель плотности интерфейса (compact/comfortable).
 * Сохраняет выбор в zustand и применяется глобально через класс на <html>.
 */
import React from 'react'
import { Minimize2, Maximize2 } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { useUserPrefsStore } from '../../store/userPrefs'

/**
 * DensityToggle component - кнопка смены плотности интерфейса.
 */
const DensityToggle: React.FC = () => {
  const density = useUserPrefsStore((s) => s.density)
  const setDensity = useUserPrefsStore((s) => s.setDensity)
  const isCompact = density === 'compact'

  /** Переключить режим плотности */
  function toggle() {
    setDensity(isCompact ? 'comfortable' : 'compact')
  }

  return (
    <Button
      variant="outline"
      className="bg-transparent h-9 px-2"
      onClick={toggle}
      aria-label={isCompact ? 'Переключить на комфортную плотность' : 'Переключить на компактную плотность'}
      title={isCompact ? 'Comfortable' : 'Compact'}
    >
      {isCompact ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
    </Button>
  )
}

export default DensityToggle
