import { InstrumentSerif_400Regular, InstrumentSerif_400Regular_Italic } from '@expo-google-fonts/instrument-serif'
import { Manrope_400Regular, Manrope_500Medium, Manrope_600SemiBold, Manrope_700Bold } from '@expo-google-fonts/manrope'
import { focusManager, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import axios from 'axios'
import { useFonts } from 'expo-font'
import { SplashScreen, Stack, type ErrorBoundaryProps } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useEffect } from 'react'
import { AppState, Platform } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import { AuthPromptProvider } from '../src/auth/AuthPrompt'
import { AuthProvider, useAuth } from '../src/auth/AuthProvider'
import { BootScreen, GlobalError } from '../src/components/ui/AppStates'
import { ToastProvider } from '../src/components/ui/Toast'
import { colors, fonts } from '../src/theme'

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
    InstrumentSerif_400Regular,
    InstrumentSerif_400Regular_Italic,
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
  })
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <ToastProvider>
          <AuthProvider>
            <AuthPromptProvider>
              {/* If fonts fail to load the app continues with system fonts rather than stalling. */}
              <AppShell fontsReady={fontsLoaded || Boolean(fontError)} />
            </AuthPromptProvider>
          </AuthProvider>
        </ToastProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  )
}

function AppShell({ fontsReady }: { fontsReady: boolean }) {
  const { status } = useAuth()
  const ready = fontsReady && status !== 'bootstrapping'

  useEffect(() => {
    if (ready) void SplashScreen.hideAsync()
  }, [ready])

  if (!ready) return <BootScreen />

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.paper },
          headerShadowVisible: false,
          headerTintColor: colors.ink,
          headerTitleStyle: { fontFamily: fonts.semibold, fontSize: 16 },
          headerBackButtonDisplayMode: 'minimal',
          contentStyle: { backgroundColor: colors.paper },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false, title: 'Home' }} />
        <Stack.Screen name="projects/[slug]" options={{ headerShown: false, title: 'Project' }} />
        <Stack.Screen name="services/index" options={{ title: 'Services' }} />
        <Stack.Screen name="services/[slug]" options={{ title: 'Service' }} />
        <Stack.Screen name="enquire" options={{ title: 'Make an enquiry' }} />
        <Stack.Screen name="consultation" options={{ title: 'Request a consultation' }} />
        <Stack.Screen name="enquiries/[id]" options={{ title: 'Enquiry' }} />
        <Stack.Screen name="appointments/[id]" options={{ title: 'Consultation request' }} />
        <Stack.Screen name="login" options={{ title: 'Sign in', presentation: 'modal' }} />
        <Stack.Screen name="register" options={{ title: 'Create account', presentation: 'modal' }} />
        <Stack.Screen name="profile/edit" options={{ title: 'Edit profile' }} />
        <Stack.Screen name="about" options={{ title: 'About BRIGHTHOMES' }} />
        <Stack.Screen name="contact" options={{ title: 'Contact' }} />
        <Stack.Screen name="+not-found" options={{ title: 'Not found' }} />
      </Stack>
    </>
  )
}
