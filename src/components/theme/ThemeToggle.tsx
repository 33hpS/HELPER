/**
 * ThemeToggle - кнопка переключения темы в хедере.
 */
import React, { useContext } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { ThemeContext } from './ThemeProvider';

/**
 * ThemeToggle component - переключатель светлой/тёмной темы.
 */
const ThemeToggle: React.FC = () => {
  const { theme, toggle } = useContext(ThemeContext);

  return (
    <Button
      variant="outline"
      className="bg-transparent h-9 px-2"
      aria-label="Toggle theme"
      onClick={toggle}
      title={theme === 'dark' ? 'Переключить на светлую' : 'Переключить на тёмную'}
    >
      {theme === 'dark' ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </Button>
  );
};

export default ThemeToggle;
