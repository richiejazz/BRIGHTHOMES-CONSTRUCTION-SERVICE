import { useHeaderHeight } from 'expo-router/react-navigation'
import { CircleAlert } from 'lucide-react-native'
import { forwardRef, type ReactNode } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { colors, layout, space } from '../../theme'
import { Text } from './Text'

/** Scrollable form body that stays clear of the keyboard on both platforms. */
export const FormScreen = forwardRef<ScrollView, { children: ReactNode }>(function FormScreen({ children }, ref) {
  const insets = useSafeAreaInsets()
  const headerHeight = useHeaderHeight()
  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={headerHeight}>
      <ScrollView ref={ref} style={styles.screen} contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + space.xxxl }]} keyboardShouldPersistTaps="handled" keyboardDismissMode="interactive">
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  )
})

/** Form-level error, announced to screen readers. */
export function FormAlert({ message }: { message?: string }) {
  if (!message) return null
  return (
    <View accessibilityRole="alert" accessibilityLiveRegion="assertive" style={styles.alert}>
      <CircleAlert size={18} color={colors.danger} strokeWidth={1.6} />
      <Text variant="small" color={colors.danger} style={styles.flex}>
        {message}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { flex: 1, backgroundColor: colors.paper },
  content: { paddingHorizontal: layout.gutter, paddingTop: space.xl, gap: space.xl },
  alert: { flexDirection: 'row', gap: space.sm, alignItems: 'flex-start', padding: space.md, borderWidth: 1, borderColor: 'rgba(155,59,47,0.4)', backgroundColor: '#f8ece9' },
})
