import { Moon, Sun } from 'lucide-react'

import { useTheme } from '../../context/useTheme'

/** §05 right cluster: sun/moon toggle with a 44px target. The choice persists (ThemeProvider). */
export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggleTheme } = useTheme()
  const next = theme === 'dark' ? 'light' : 'dark'
  const Icon = theme === 'dark' ? Sun : Moon
  return (
    <button type="button" onClick={toggleTheme} className={`icon-btn ${className}`} aria-label={`Switch to ${next} theme`} title={`Switch to ${next} theme`}>
      <Icon aria-hidden="true" className="size-[17px]" strokeWidth={1.5} />
    </button>
  )
}
