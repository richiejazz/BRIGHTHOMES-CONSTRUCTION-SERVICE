import { RotateCcw } from 'lucide-react-native'
import { useEffect, useRef, type ReactNode } from 'react'
import { Animated, StyleSheet, View, type DimensionValue, type StyleProp, type ViewStyle } from 'react-native'

import { loadErrorMessage } from '../../api/errors'
import { useReducedMotion } from '../../lib/useReducedMotion'
import { space, useTheme } from '../../theme'
import { Button } from './Button'
import { Eyebrow } from './Editorial'
import { Text } from './Text'

/** A placeholder block that gently pulses while content loads (static with reduced motion). */
export function Skeleton({ width = '100%', height = 16, style }: { width?: DimensionValue; height?: DimensionValue; style?: StyleProp<ViewStyle> }) {
  const { colors } = useTheme()
  const reduced = useReducedMotion()
  const opacity = useRef(new Animated.Value(1)).current
  useEffect(() => {
    if (reduced) return
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.5, duration: 900, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 900, useNativeDriver: true }),
      ]),
    )
    loop.start()
    return () => loop.stop()
  }, [opacity, reduced])
  return <Animated.View aria-hidden style={[{ width, height, backgroundColor: colors.skeleton, opacity }, style]} />
}

/** Wraps skeletons so screen readers hear one "Loading" announcement instead of nothing. */
export function LoadingBlock({ label = 'Loading', children, style }: { label?: string; children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <View accessible accessibilityLabel={`${label}…`} accessibilityRole="progressbar" accessibilityState={{ busy: true }} style={style}>
      {children}
    </View>
  )
}

type PanelProps = { title: string; message?: ReactNode; action?: ReactNode; eyebrow?: string; tone?: 'page' | 'inverse'; style?: StyleProp<ViewStyle> }

function Panel({ title, message, action, eyebrow, tone = 'page', style, alert = false }: PanelProps & { alert?: boolean }) {
  const { colors } = useTheme()
  const inverse = tone === 'inverse'
  return (
    <View accessibilityRole={alert ? 'alert' : undefined} style={[styles.panel, { borderTopColor: inverse ? colors.inverse.border : colors.borderStrong }, style]}>
      {eyebrow ? <Eyebrow label={eyebrow} color={inverse ? colors.inverse.accent : undefined} /> : null}
      <Text variant="heading" color={inverse ? colors.inverse.text : undefined}>
        {title}
      </Text>
      {message ? (
        typeof message === 'string' ? (
          <Text variant="body" color={inverse ? colors.inverse.textMuted : undefined}>
            {message}
          </Text>
        ) : (
          message
        )
      ) : null}
      {action ? <View style={styles.actions}>{action}</View> : null}
    </View>
  )
}

/** An empty list or section: a ruled, editorial note with an optional next step. */
export function EmptyState(props: PanelProps) {
  return <Panel {...props} />
}

export function ErrorState({ error, message, onRetry, title = 'Couldn’t load this information', tone, style }: { error?: unknown; message?: string; onRetry?: () => void; title?: string; tone?: 'page' | 'inverse'; style?: StyleProp<ViewStyle> }) {
  return (
    <Panel
      alert
      title={title}
      message={message ?? loadErrorMessage(error)}
      tone={tone}
      style={style}
      action={onRetry ? <Button label="Try again" icon={RotateCcw} size="compact" variant={tone === 'inverse' ? 'onImage' : 'secondary'} onPress={onRetry} /> : null}
    />
  )
}

const styles = StyleSheet.create({
  panel: { borderTopWidth: 1, paddingTop: space.xl, paddingBottom: space.lg, gap: space.md },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md, marginTop: space.sm },
})
