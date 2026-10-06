import { RotateCcw } from 'lucide-react-native'
import { useEffect, useRef, type ReactNode } from 'react'
import { Animated, StyleSheet, View, type DimensionValue, type StyleProp, type ViewStyle } from 'react-native'

import { loadErrorMessage } from '../../api/errors'
import { useReducedMotion } from '../../lib/useReducedMotion'
import { colors, space } from '../../theme'
import { Button } from './Button'
import { Text } from './Text'

/** A placeholder block that gently pulses while content loads (static with reduced motion). */
export function Skeleton({ width = '100%', height = 16, style }: { width?: DimensionValue; height?: DimensionValue; style?: StyleProp<ViewStyle> }) {
  const reduced = useReducedMotion()
  const opacity = useRef(new Animated.Value(1)).current
  useEffect(() => {
    if (reduced) return
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.55, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
      ]),
    )
    loop.start()
    return () => loop.stop()
  }, [opacity, reduced])
  return <Animated.View aria-hidden style={[{ width, height, backgroundColor: colors.stone200, opacity }, style]} />
}

/** Wraps skeletons so screen readers hear one "Loading" announcement instead of nothing. */
export function LoadingBlock({ label = 'Loading', children, style }: { label?: string; children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <View accessible accessibilityLabel={`${label}…`} accessibilityRole="progressbar" accessibilityState={{ busy: true }} style={style}>
      {children}
    </View>
  )
}

type PanelProps = { title: string; message?: ReactNode; action?: ReactNode; tone?: 'light' | 'dark'; style?: StyleProp<ViewStyle>; icon?: ReactNode }

function Panel({ title, message, action, tone = 'light', style, icon, alert = false }: PanelProps & { alert?: boolean }) {
  const dark = tone === 'dark'
  return (
    <View accessibilityRole={alert ? 'alert' : undefined} style={[styles.panel, style]}>
      {icon}
      <Text variant="title" color={dark ? colors.paper : colors.ink}>
        {title}
      </Text>
      {message ? (
        typeof message === 'string' ? (
          <Text variant="body" color={dark ? colors.stone300 : colors.stone600}>
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

export function EmptyState(props: PanelProps) {
  return <Panel {...props} />
}

export function ErrorState({ error, message, onRetry, title = 'Couldn’t load this information', tone, style }: { error?: unknown; message?: string; onRetry?: () => void; title?: string; tone?: 'light' | 'dark'; style?: StyleProp<ViewStyle> }) {
  return (
    <Panel
      alert
      title={title}
      message={message ?? loadErrorMessage(error)}
      tone={tone}
      style={style}
      action={onRetry ? <Button label="Try again" icon={RotateCcw} variant={tone === 'dark' ? 'inverse' : 'secondary'} onPress={onRetry} /> : null}
    />
  )
}

const styles = StyleSheet.create({
  panel: { borderLeftWidth: 2, borderLeftColor: colors.bronze, paddingVertical: space.xl, paddingLeft: space.xl, paddingRight: space.sm, gap: space.md },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md, marginTop: space.sm },
})
