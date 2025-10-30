'use client'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function ThemeSwitch() {
  const { theme, setTheme } = useTheme()
  const isDark = theme === 'dark'

  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  return (
    <button
      type="button"
      aria-pressed={isDark}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={`
        relative w-14 h-8 rounded-full transition-colors
        ${isDark ? 'bg-primary' : 'bg-gray-500'}
        ring-2 ring-ring
      `}
    >
      <span
        className={`
          absolute top-1 left-1 w-6 h-6 rounded-full transition-transform
          flex items-center justify-center
          bg-background shadow
          ${isDark ? 'translate-x-6' : 'translate-x-0'}
        `}
      >
        {isDark ? (
          <Moon className="w-4 h-4 text-primary" />
        ) : (
          <Sun className="w-4 h-4 text-yellow-500" />
        )}
      </span>
      <span className="sr-only">Toggle theme</span>
    </button>
  )
}
