import { router } from 'expo-router'
import type { ReactNode } from 'react'
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native'

import { Button } from '../components/ui/Button'
import { EmptyState, ErrorState } from '../components/ui/States'
import { layout, space, useTheme } from '../theme'
import { useAuth, type AuthStatus } from './AuthProvider'

/**
 * Renders children for signed-in clients. Anonymous visitors see an invitation to sign in,
 * and a session that cannot be confirmed (usually offline) gets a retry.
 */
export function SignInRequired({ title, message, header, footer, children }: { title: string; message: string; header?: ReactNode; footer?: ReactNode; children: ReactNode }) {
  const { status, retry } = useAuth()
  if (status === 'authenticated') return <>{children}</>
  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      {header}
      <Fallback status={status} retry={retry} title={title} message={message} />
      {footer}
    </ScrollView>
  )
}

function Fallback({ status, retry, title, message }: { status: AuthStatus; retry: () => void; title: string; message: string }) {
  const { colors } = useTheme()
  if (status === 'loading' || status === 'bootstrapping') {
    return (
      <View style={styles.loading} accessible accessibilityLabel="Loading your account" accessibilityRole="progressbar">
        <ActivityIndicator color={colors.accent} />
      </View>
    )
  }
  if (status === 'unavailable') return <ErrorState message="Check your connection and try again." title="We couldn’t reach your account" onRetry={retry} style={styles.panel} />
  return (
    <EmptyState
      eyebrow="Client account"
      title={title}
      message={message}
      style={styles.panel}
      action={
        <View style={styles.actions}>
          <Button label="Sign In" onPress={() => router.push('/login')} fullWidth />
          <Button label="Create Account" variant="secondary" onPress={() => router.push('/register')} fullWidth />
        </View>
      }
    />
  )
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: space.xxxl, gap: space.xl },
  loading: { paddingVertical: space.xxxl, alignItems: 'center' },
  panel: { marginHorizontal: layout.gutter, marginTop: space.md },
  actions: { flex: 1, gap: space.md },
})
