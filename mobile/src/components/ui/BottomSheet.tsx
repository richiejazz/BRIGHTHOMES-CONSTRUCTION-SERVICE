import { X } from 'lucide-react-native'
import type { ReactNode } from 'react'
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useReducedMotion } from '../../lib/useReducedMotion'
import { colors, layout, space } from '../../theme'
import { Button, type ButtonVariant } from './Button'
import { Text } from './Text'

type SheetProps = {
  visible: boolean
  onClose: () => void
  title: string
  eyebrow?: string
  children?: ReactNode
}

/** A modal panel anchored to the bottom of the screen. Back button and backdrop both close it. */
export function BottomSheet({ visible, onClose, title, eyebrow, children }: SheetProps) {
  const insets = useSafeAreaInsets()
  const reduced = useReducedMotion()
  return (
    <Modal visible={visible} transparent animationType={reduced ? 'none' : 'fade'} onRequestClose={onClose} statusBarTranslucent>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityRole="button" accessibilityLabel="Close" />
        <View accessibilityViewIsModal style={[styles.sheet, { paddingBottom: insets.bottom + space.xl }]}>
          <View style={styles.header}>
            <View style={styles.headerCopy}>
              {eyebrow ? <Text variant="eyebrow">{eyebrow}</Text> : null}
              <Text variant="title">{title}</Text>
            </View>
            <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Close" hitSlop={8} style={styles.close}>
              <X size={22} color={colors.ink} strokeWidth={1.5} />
            </Pressable>
          </View>
          <ScrollView bounces={false} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.body}>
            {children}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

type ConfirmProps = {
  visible: boolean
  title: string
  message: string
  confirmLabel: string
  confirmVariant?: ButtonVariant
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

/** Confirmation for actions with consequences, such as signing out. */
export function ConfirmSheet({ visible, title, message, confirmLabel, confirmVariant = 'primary', cancelLabel = 'Cancel', onConfirm, onCancel }: ConfirmProps) {
  return (
    <BottomSheet visible={visible} onClose={onCancel} title={title}>
      <Text variant="body">{message}</Text>
      <View style={styles.actions}>
        <Button label={confirmLabel} variant={confirmVariant} onPress={onConfirm} fullWidth />
        <Button label={cancelLabel} variant="secondary" onPress={onCancel} fullWidth />
      </View>
    </BottomSheet>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: colors.scrim },
  sheet: { backgroundColor: colors.paper, borderTopWidth: 2, borderTopColor: colors.bronze, maxHeight: '88%' },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: space.lg, paddingHorizontal: layout.gutter, paddingTop: space.xl, paddingBottom: space.md },
  headerCopy: { flex: 1, gap: space.sm },
  close: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', marginRight: -10, marginTop: -8 },
  body: { paddingHorizontal: layout.gutter, gap: space.lg },
  actions: { gap: space.md, marginTop: space.sm },
})
