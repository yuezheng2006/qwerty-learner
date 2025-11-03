import { currentThemeAtom } from '@/store'
import { type Theme, themes } from '@/themes'
import { useAtom } from 'jotai'
import type React from 'react'
import { createContext, useContext, useEffect, useState } from 'react'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  changeThemeByName: (themeName: string) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

interface ThemeProviderProps {
  children: React.ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [currentThemeName, setCurrentThemeName] = useAtom(currentThemeAtom)
  const [theme, setTheme] = useState<Theme>(themes[0])

  useEffect(() => {
    // 从localStorage读取主题设置
    const savedThemeName = currentThemeName || localStorage.getItem('selected-theme') || 'rainbow-campus'
    const savedTheme = themes.find((t) => t.name === savedThemeName) || themes[0]

    setTheme(savedTheme)
    applyTheme(savedTheme)

    // 保存到atom和localStorage
    setCurrentThemeName(savedThemeName)
    localStorage.setItem('selected-theme', savedThemeName)
  }, [currentThemeName, setCurrentThemeName])

  const applyTheme = (theme: Theme) => {
    const root = document.documentElement
    const cssVars = Object.entries({
      '--color-primary': theme.colors.primary,
      '--color-primary-hover': theme.colors.primaryHover,
      '--color-primary-light': theme.colors.primaryLight,
      '--color-success': theme.colors.success,
      '--color-success-light': theme.colors.successLight,
      '--color-warning': theme.colors.warning,
      '--color-warning-light': theme.colors.warningLight,
      '--color-error': theme.colors.error,
      '--color-error-light': theme.colors.errorLight,
      '--color-background': theme.colors.background,
      '--color-surface': theme.colors.surface,
      '--color-card': theme.colors.card,
      '--color-text': theme.colors.text,
      '--color-text-secondary': theme.colors.textSecondary,
      '--color-text-light': theme.colors.textLight,
      '--color-border': theme.colors.border,
      '--color-border-light': theme.colors.borderLight,
      '--color-correct': theme.colors.correct,
      '--color-incorrect': theme.colors.incorrect,
      '--color-highlight': theme.colors.highlight,
      '--gradient-primary': theme.gradients.primary,
      '--gradient-success': theme.gradients.success,
      '--gradient-background': theme.gradients.background,
    })

    cssVars.forEach(([key, value]) => {
      root.style.setProperty(key, value)
    })
  }

  const changeThemeByName = (themeName: string) => {
    const newTheme = themes.find((t) => t.name === themeName) || themes[0]
    setTheme(newTheme)
    setCurrentThemeName(themeName)
    localStorage.setItem('selected-theme', themeName)
    applyTheme(newTheme)
  }

  const contextValue: ThemeContextType = {
    theme,
    setTheme,
    changeThemeByName,
  }

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
