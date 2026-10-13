import { router, type ErrorBoundaryProps } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { ActivityIndicator, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { company } from '../../content/company'
import { darkColors, layout, space, ThemeProvider } from '../../theme'
import { BlueprintGrid } from '../brand/Elevation'
import { LogoMark, Wordmark } from '../brand/Logo'
import { Button } from './Button'
import { Eyebrow } from './Editorial'
import { Text } from './Text'

/**
 * Shown while fonts, the stored session and the theme preference load. It continues the
 * native splash, which is always dark, so it doesn't read the theme.
 */
export function BootScreen() {
  return (
    <View style={styles.boot} accessible accessibilityLabel="BRIGHTHOMES is loading" accessibilityRole="progressbar">
      <StatusBar style="light" />
      <BlueprintGrid />
      <LogoMark size={64} />
      <ActivityIndicator color={darkColors.accent} style={styles.spinner} />
    </View>
  )
}

/**
 * Last-resort screen for unexpected rendering errors. It renders outside the app's providers, so
 * it brings its own theme and only uses static content and navigation.
 */
export function GlobalError({ retry }: ErrorBoundaryProps) {
  return (
    <ThemeProvider>
      <SafeAreaView style={styles.error}>
        <StatusBar style="light" />
        <BlueprintGrid />
        <Wordmark />
        <View style={styles.copy} accessibilityRole="alert">
          <Eyebrow label="Unexpected error" color={darkColors.accentText} />
          <Text variant="display" color={darkColors.text}>
            Something went wrong.
          </Text>
          <Text variant="body" color={darkColors.textMuted}>
            The app ran into a problem showing this screen. Try again, or return to the home screen. If it keeps happening, call us on {company.phones[0].display}.
          </Text>
        </View>
        <View style={styles.actions}>
          <Button label="Try again" variant="accent" onPress={() => void retry()} fullWidth />
          <Button label="Go to Home" variant="onImage" onPress={() => router.replace('/')} fullWidth />
        </View>
      </SafeAreaView>
    </ThemeProvider>
  )
}

const styles = StyleSheet.create({
  boot: { flex: 1, backgroundColor: darkColors.background, alignItems: 'center', justifyContent: 'center' },
  spinner: { marginTop: space.xxl },
  error: { flex: 1, backgroundColor: darkColors.background, paddingHorizontal: layout.gutter, paddingVertical: space.xl, justifyContent: 'space-between' },
  copy: { gap: space.lg },
  actions: { gap: space.md },
})
