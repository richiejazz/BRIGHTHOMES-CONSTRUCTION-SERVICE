import { CheckCircle2, CircleAlert, Info } from 'lucide-react-native'
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { AccessibilityInfo, Animated, Pressable, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useReducedMotion } from '../../lib/useReducedMotion'
import { colors, layout } from '../../theme'
import { Text } from './Text'

type ToastTone = 'success' | 'error' | 'info'
type ToastInput = { tone?: ToastTone; title: string; message?: string }
type ToastItem = ToastInput & { id: number }

const ToastContext = createContext<{ show: (toast: ToastInput) => void } | undefined>(undefined)

const icons = { success: CheckCircle2, error: CircleAlert, info: Info }
const DURATION = 3800

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
  const opacity = useRef(new Animated.Value(reduced ? 1 : 0)).current
  const done = useRef(onDone)
  done.current = onDone

  useEffect(() => {
    if (!reduced) Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }).start()
    const timer = setTimeout(() => done.current(), DURATION)
    return () => clearTimeout(timer)
  }, [opacity, reduced])

  const Icon = icons[toast.tone ?? 'info']
  const accent = toast.tone === 'error' ? colors.dangerLight : colors.bronzeLight
  return (
    <Animated.View style={[styles.wrap, { top: insets.top + 8, opacity }]}>
      <Pressable onPress={onDone} accessibilityRole="alert" accessibilityHint="Dismisses this message" style={[styles.toast, { borderLeftColor: accent }]}>
        <Icon size={20} color={accent} strokeWidth={1.6} />
        <View style={styles.copy}>
          <Text variant="label" color={colors.paper}>
            {toast.title}
          </Text>
          {toast.message ? (
            <Text variant="small" color={colors.stone300}>
              {toast.message}
            </Text>
          ) : null}
        </View>
      </Pressable>
    </Animated.View>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within ToastProvider')
  return context
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: layout.gutter, right: layout.gutter, zIndex: 1000, elevation: 12, pointerEvents: 'box-none' },
  toast: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', backgroundColor: colors.ink, borderLeftWidth: 3, borderRadius: layout.radius, paddingVertical: 14, paddingHorizontal: 16 },
  copy: { flex: 1, gap: 2 },
})
