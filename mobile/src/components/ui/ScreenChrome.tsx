import { router, type Href } from 'expo-router'
import { ArrowLeft, X } from 'lucide-react-native'
import type { ReactNode } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { layout, onImage, space, useTheme } from '../../theme'
import { Text } from './Text'

export function goBackOr(fallback: Href) {
  if (router.canGoBack()) router.back()
  else router.replace(fallback)
}

/** Square back (or close) control that floats over photography at the top of a screen. */
export function FloatingBack({ fallback, close = false, solid = false }: { fallback: Href; close?: boolean; solid?: boolean }) {
  const insets = useSafeAreaInsets()
  const { colors } = useTheme()
  const Icon = close ? X : ArrowLeft
  return (
    <Pressable
      onPress={() => goBackOr(fallback)}
      accessibilityRole="button"
      accessibilityLabel={close ? 'Close' : 'Back'}
      hitSlop={4}
      style={({ pressed }) => [
        styles.floating,
        { top: insets.top + space.sm, left: layout.gutter - 4, backgroundColor: solid ? colors.background : onImage.chrome, borderColor: solid ? colors.border : onImage.border },
        pressed && styles.pressed,
      ]}
    >
      <Icon size={20} color={solid ? colors.text : onImage.text} strokeWidth={1.5} />
    </Pressable>
  )
}

/** Controls pinned to the top-right over photography (save, share). */
export function FloatingActions({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets()
  return <View style={[styles.actions, { top: insets.top + space.sm, right: layout.gutter - 4 }]}>{children}</View>
}

/** Solid title bar that appears once a photographic header has scrolled away. */
export function CondensedBar({ title, visible }: { title: string; visible: boolean }) {
  const insets = useSafeAreaInsets()
  const { colors } = useTheme()
  if (!visible) return null
  return (
    <View style={[styles.bar, { height: insets.top + 60, paddingTop: insets.top, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
      <Text variant="label" numberOfLines={1}>
        {title}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  floating: { position: 'absolute', width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderWidth: 1, zIndex: 10 },
  actions: { position: 'absolute', flexDirection: 'row', gap: space.sm, zIndex: 10 },
  pressed: { opacity: 0.7 },
  bar: { position: 'absolute', top: 0, left: 0, right: 0, justifyContent: 'center', paddingLeft: layout.gutter + 56, paddingRight: layout.gutter + 56, borderBottomWidth: StyleSheet.hairlineWidth, zIndex: 5 },
})
