import { CormorantGaramond_400Regular, CormorantGaramond_400Regular_Italic, CormorantGaramond_500Medium, CormorantGaramond_500Medium_Italic, CormorantGaramond_600SemiBold } from '@expo-google-fonts/cormorant-garamond'
import { Manrope_400Regular, Manrope_500Medium, Manrope_600SemiBold, Manrope_700Bold, Manrope_800ExtraBold } from '@expo-google-fonts/manrope'
import { focusManager, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import axios from 'axios'
import { useFonts } from 'expo-font'
import { SplashScreen, Stack, type ErrorBoundaryProps } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useEffect } from 'react'
import { AppState, Platform, StyleSheet, View } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import { AuthPromptProvider } from '../src/auth/AuthPrompt'
import { AuthProvider, useAuth } from '../src/auth/AuthProvider'
import { BootScreen, GlobalError } from '../src/components/ui/AppStates'
import { ToastProvider } from '../src/components/ui/Toast'
import { useReducedMotion } from '../src/lib/useReducedMotion'
import { fonts, layout, ThemeProvider, useTheme } from '../src/theme'

void SplashScreen.preventAutoHideAsync()

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      // Retry transient failures once; a 4xx answer will not change on retry.
      retry: (failureCount, error) => failureCount < 1 && !(axios.isAxiosError(error) && error.response && error.response.status < 500),
    },
  },
})

// Refetch stale data when the app returns to the foreground.
if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => focusManager.setFocused(state === 'active'))
}

export function ErrorBoundary(props: ErrorBoundaryProps) {
  return <GlobalError {...props} />
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    CormorantGaramond_400Regular,
    CormorantGaramond_500Medium,
    CormorantGaramond_400Regular_Italic,
    CormorantGaramond_500Medium_Italic,
    CormorantGaramond_600SemiBold,
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  })
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <ThemeProvider>
          <ToastProvider>
            <AuthProvider>
              <AuthPromptProvider>
                {/* If fonts fail to load the app continues with system fonts rather than stalling. */}
                <AppShell fontsReady={fontsLoaded || Boolean(fontError)} />
              </AuthPromptProvider>
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  )
}

function AppShell({ fontsReady }: { fontsReady: boolean }) {
  const { status } = useAuth()
  const { colors, scheme, ready: themeReady } = useTheme()
  const reduced = useReducedMotion()
  const ready = fontsReady && themeReady && status !== 'bootstrapping'

  useEffect(() => {
    if (ready) void SplashScreen.hideAsync()
  }, [ready])

  if (!ready) return <BootScreen />

  const stack = (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerShadowVisible: false,
        headerTintColor: colors.text,
        headerTitleStyle: { fontFamily: fonts.semibold, fontSize: 13 },
        headerBackButtonDisplayMode: 'minimal',
        contentStyle: { backgroundColor: colors.background },
        animation: reduced ? 'none' : 'default',
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false, title: 'Home' }} />
      <Stack.Screen name="projects/[slug]" options={{ headerShown: false, title: 'Project' }} />
      <Stack.Screen name="properties/[slug]" options={{ headerShown: false, title: 'Property' }} />
      <Stack.Screen name="services/index" options={{ headerShown: false, title: 'Services' }} />
      <Stack.Screen name="services/[slug]" options={{ headerShown: false, title: 'Service' }} />
      <Stack.Screen name="enquire" options={{ title: 'Enquiry' }} />
      <Stack.Screen name="consultation" options={{ title: 'Consultation' }} />
      <Stack.Screen name="enquiries/[id]" options={{ title: 'Enquiry' }} />
      <Stack.Screen name="appointments/[id]" options={{ title: 'Consultation request' }} />
      <Stack.Screen name="login" options={{ headerShown: false, title: 'Sign in', presentation: 'modal' }} />
      <Stack.Screen name="register" options={{ headerShown: false, title: 'Create account', presentation: 'modal' }} />
      <Stack.Screen name="profile/edit" options={{ title: 'Edit profile' }} />
      <Stack.Screen name="about" options={{ headerShown: false, title: 'About BRIGHTHOMES' }} />
      <Stack.Screen name="contact" options={{ title: 'Contact' }} />
      <Stack.Screen name="+not-found" options={{ title: 'Not found' }} />
    </Stack>
  )

  return (
    <>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      {Platform.OS === 'web' ? (
        // The web preview frames the app at phone width so it reads as the mobile product.
        <View style={[styles.webBackdrop, { backgroundColor: colors.surface }]}>
          <View testID="app-frame" style={[styles.webFrame, { backgroundColor: colors.background, borderColor: colors.border }]}>
            {stack}
          </View>
        </View>
      ) : (
        stack
      )}
    </>
  )
}

const styles = StyleSheet.create({
  webBackdrop: { flex: 1, alignItems: 'center' },
  webFrame: { flex: 1, width: '100%', maxWidth: layout.maxWidth, borderLeftWidth: StyleSheet.hairlineWidth, borderRightWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
})
