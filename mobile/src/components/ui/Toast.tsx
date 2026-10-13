import { CheckCircle2, CircleAlert, Info } from 'lucide-react-native'
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { AccessibilityInfo, Animated, Pressable, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useReducedMotion } from '../../lib/useReducedMotion'
import { darkColors, fonts, layout, space, useTheme } from '../../theme'
import { Text } from './Text'

type ToastTone = 'success' | 'error' | 'info'
type ToastAction = { label: string; onPress: () => void }
type ToastInput = { tone?: ToastTone; title: string; message?: string; action?: ToastAction }
type ToastItem = ToastInput & { id: number }

const ToastContext = createContext<{ show: (toast: ToastInput) => void } | undefined>(undefined)

const icons = { success: CheckCircle2, error: CircleAlert, info: Info }
const DURATION = 3800
const DURATION_WITH_ACTION = 7000

/** Brief, non-blocking confirmations. Each message is also announced to screen readers. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastItem | null>(null)
  const nextId = useRef(0)
  const show = useCallback((input: ToastInput) => {
    nextId.current += 1
    setToast({ tone: 'info', ...input, id: nextId.current })
    AccessibilityInfo.announceForAccessibility([input.title, input.message].filter(Boolean).join('. '))
  }, [])
  const value = useMemo(() => ({ show }), [show])
  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast && <ToastView key={toast.id} toast={toast} onDone={() => setToast((current) => (current?.id === toast.id ? null : current))} />}
    </ToastContext.Provider>
  )
}

function ToastView({ toast, onDone }: { toast: ToastItem; onDone: () => void }) {
  const insets = useSafeAreaInsets()
  const reduced = useReducedMotion()
  const { colors } = useTheme()
  const progress = useRef(new Animated.Value(reduced ? 1 : 0)).current
  const done = useRef(onDone)
  done.current = onDone

  useEffect(() => {
    if (!reduced) Animated.timing(progress, { toValue: 1, duration: 220, useNativeDriver: true }).start()
    const timer = setTimeout(() => done.current(), toast.action ? DURATION_WITH_ACTION : DURATION)
    return () => clearTimeout(timer)
  }, [progress, reduced, toast.action])

  const Icon = icons[toast.tone ?? 'info']
  const inverse = colors.inverse
  // The toast is always dark, so it uses the dark-scheme danger tint for contrast.
  const accent = toast.tone === 'error' ? darkColors.danger : inverse.accent
  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [-12, 0] })
  return (
    <Animated.View style={[styles.wrap, { top: insets.top + 8, opacity: progress, transform: [{ translateY }] }]}>
      <View style={[styles.toast, { backgroundColor: inverse.background, borderLeftColor: accent }]}>
        <Pressable onPress={onDone} accessibilityRole="alert" accessibilityHint="Dismisses this message" style={styles.body}>
          <Icon size={18} color={accent} strokeWidth={1.6} />
          <View style={styles.copy}>
            <Text variant="label" color={inverse.text}>
              {toast.title}
            </Text>
            {toast.message ? (
              <Text variant="small" color={inverse.textMuted}>
                {toast.message}
              </Text>
            ) : null}
          </View>
        </Pressable>
        {toast.action ? (
          <Pressable
            onPress={() => {
              onDone()
              toast.action?.onPress()
            }}
            accessibilityRole="button"
            hitSlop={6}
            style={({ pressed }) => [styles.action, pressed && { opacity: 0.6 }]}
          >
            <Text style={[styles.actionText, { color: accent }]}>{toast.action.label}</Text>
          </Pressable>
        ) : null}
      </View>
    </Animated.View>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within ToastProvider')
  return context
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: layout.gutter, right: layout.gutter, zIndex: 1000, elevation: 12, pointerEvents: 'box-none', alignItems: 'center' },
  toast: { flexDirection: 'row', alignItems: 'center', borderLeftWidth: 2, width: '100%', maxWidth: layout.maxWidth - layout.gutter * 2 },
  body: { flex: 1, flexDirection: 'row', gap: 12, alignItems: 'flex-start', paddingVertical: 14, paddingLeft: 16, paddingRight: space.sm },
  copy: { flex: 1, gap: 2 },
  action: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 16 },
  actionText: { fontFamily: fonts.semibold, fontSize: 12, letterSpacing: 1.4, textTransform: 'uppercase' },
})
