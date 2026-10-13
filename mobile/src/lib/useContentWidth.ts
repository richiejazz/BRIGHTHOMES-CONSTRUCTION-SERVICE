import { useWindowDimensions } from 'react-native'

import { layout } from '../theme'

/** The width the app actually renders at: the window on phones, the phone-width frame on the web. */
export function useContentWidth() {
  const { width, height } = useWindowDimensions()
  return { width: Math.min(width, layout.maxWidth), height }
}
