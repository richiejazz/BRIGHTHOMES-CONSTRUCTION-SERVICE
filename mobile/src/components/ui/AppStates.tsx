import { router, type ErrorBoundaryProps } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { ActivityIndicator, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { company } from '../../content/company'
import { colors, layout, space } from '../../theme'
import { BlueprintGrid } from '../brand/Elevation'
import { LogoMark, Wordmark } from '../brand/Logo'
import { Button } from './Button'
import { Text } from './Text'

/** Shown while fonts and the stored session load (continues the native splash on web). */
export function BootScreen() {
  return (
    <View style={styles.boot} accessible accessibilityLabel="BRIGHTHOMES is loading" accessibilityRole="progressbar">
      <StatusBar style="light" />
      <BlueprintGrid />
      <LogoMark size={72} />
      <ActivityIndicator color={colors.bronzeLight} style={styles.spinner} />
    </View>
  )
}

/**
 * Last-resort screen for unexpected rendering errors. It sits outside the app's providers, so it
 * only uses static content and navigation.
 */
export function GlobalError({ retry }: ErrorBoundaryProps) {
  return (
    <SafeAreaView style={styles.error}>
      <StatusBar style="light" />
      <BlueprintGrid />
      <Wordmark />
      <View style={styles.copy} accessibilityRole="alert">
        <Text variant="eyebrow" color={colors.bronzeLight}>
          Unexpected error
        </Text>
        <Text variant="display" color={colors.paper}>
          Something went wrong.
        </Text>
        <Text variant="body" color={colors.stone300}>
          The app ran into a problem showing this screen. Try again, or return to the home screen. If it keeps happening, contact us on {company.phones[0].display}.
        </Text>
      </View>
      <View style={styles.actions}>
        <Button label="Try again" variant="accent" onPress={() => void retry()} fullWidth />
        <Button label="Go to Home" variant="inverse" onPress={() => router.replace('/')} fullWidth />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  boot: { flex: 1, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
  spinner: { marginTop: space.xxl },
  error: { flex: 1, backgroundColor: colors.ink, paddingHorizontal: layout.gutter, paddingVertical: space.xl, justifyContent: 'space-between' },
  copy: { gap: space.lg },
  actions: { gap: space.md },
})
