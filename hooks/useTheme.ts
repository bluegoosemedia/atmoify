import { useEffect, useState } from "react"
import { themes, defaultTheme } from "@/lib/themes"

const THEME_STORAGE_KEY = "atmoify-theme"

export function useTheme() {
  const [currentTheme, setCurrentTheme] = useState<string>(defaultTheme)
  const [isInitialized, setIsInitialized] = useState(false)

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY)
    if (savedTheme && themes[savedTheme]) {
      setCurrentTheme(savedTheme)
    }
    setIsInitialized(true)
  }, [])

  // Apply theme colors to CSS variables
  useEffect(() => {
    if (!isInitialized) return

    const theme = themes[currentTheme]
    if (!theme) return

    const root = document.documentElement

    // Apply all color variables
    Object.entries(theme.colors).forEach(([key, value]) => {
      // Convert camelCase to kebab-case for CSS variables
      const cssVarName = key.replace(/([A-Z])/g, "-$1").toLowerCase()
      root.style.setProperty(`--${cssVarName}`, value)
    })

    // Save to localStorage
    localStorage.setItem(THEME_STORAGE_KEY, currentTheme)
  }, [currentTheme, isInitialized])

  return {
    currentTheme,
    setTheme: setCurrentTheme,
    themes,
    isInitialized,
  }
}
