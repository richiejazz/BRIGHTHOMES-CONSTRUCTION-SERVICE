import AsyncStorage from '@react-native-async-storage/async-storage'
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useColorScheme } from 'react-native'

import { darkColors, lightColors, type ThemeColors } from './palette'

/** "system" follows the device setting; the other two override it. */
export type ThemePreference = 'system' | 'light' | 'dark'
export type ColorScheme = 'light' | 'dark'

type ThemeContextValue = {
  colors: ThemeColors
  scheme: ColorScheme
  preference: ThemePreference
  setPreference: (preference: ThemePreference) => void
  /** False until the stored preference has been read, so the app never flashes the wrong scheme. */
  ready: boolean
}

const STORAGE_KEY = 'brighthomes.theme'
const preferences: ThemePreference[] = ['system', 'light', 'dark']

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme()
  const [preference, setPreferenceState] = useState<ThemePreference>('system')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let active = true
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (active && preferences.includes(stored as ThemePreference)) setPreferenceState(stored as ThemePreference)
      })
      // An unreadable preference only costs the saved choice; the system scheme still applies.
      .catch(() => undefined)
      .finally(() => active && setReady(true))
    return () => {
      active = false
    }
  }, [])

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next)
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => undefined)
  }, [])

  const scheme: ColorScheme = preference === 'system' ? (system === 'dark' ? 'dark' : 'light') : preference
  const value = useMemo<ThemeContextValue>(
    () => ({ colors: scheme === 'dark' ? darkColors : lightColors, scheme, preference, setPreference, ready }),
    [scheme, preference, setPreference, ready],
  )
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within ThemeProvider')
  return context
}

/**
 * Build a themed style hook: `const useStyles = makeStyles((c) => StyleSheet.create({...}))`.
 * Styles are computed once per scheme and shared by every component that uses the hook.
 */
export function makeStyles<T>(factory: (colors: ThemeColors) => T) {
  const cache = new Map<ThemeColors, T>()
  return function useStyles(): T {
    const { colors } = useTheme()
    let styles = cache.get(colors)
    if (!styles) {
      styles = factory(colors)
      cache.set(colors, styles)
    }
    return styles
  }
}
