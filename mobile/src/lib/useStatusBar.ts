import { useFocusEffect } from 'expo-router'
import { setStatusBarStyle } from 'expo-status-bar'
import { useCallback } from 'react'

import { useTheme } from '../theme'

/**
 * Light status-bar content while a screen with a photographic header is focused; the theme's
 * default comes back when the screen loses focus.
 */
export function useLightStatusBar(active = true) {
  const { scheme } = useTheme()
  useFocusEffect(
    useCallback(() => {
      if (!active) return undefined
      setStatusBarStyle('light', true)
      return () => setStatusBarStyle(scheme === 'dark' ? 'light' : 'dark', true)
    }, [active, scheme]),
  )
}
