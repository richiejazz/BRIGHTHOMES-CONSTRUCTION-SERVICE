import { router } from 'expo-router'
import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { StyleSheet, View } from 'react-native'

import { BottomSheet } from '../components/ui/BottomSheet'
import { Button } from '../components/ui/Button'
import { Text } from '../components/ui/Text'
import { space } from '../theme'

type Prompt = { title: string; message: string }

const AuthPromptContext = createContext<((prompt: Prompt) => void) | undefined>(undefined)

/** Asks anonymous visitors to sign in when they reach a feature that needs an account. */
export function AuthPromptProvider({ children }: { children: ReactNode }) {
  const [prompt, setPrompt] = useState<Prompt | null>(null)
  const [visible, setVisible] = useState(false)
  const show = useCallback((next: Prompt) => {
    setPrompt(next)
    setVisible(true)
  }, [])
  const go = (path: '/login' | '/register') => {
    setVisible(false)
    router.push(path)
  }
  return (
    <AuthPromptContext.Provider value={show}>
      {children}
      <BottomSheet visible={visible} onClose={() => setVisible(false)} eyebrow="Client account" title={prompt?.title ?? 'Sign in to continue'}>
        <Text variant="body">{prompt?.message}</Text>
        <View style={styles.actions}>
          <Button label="Sign In" onPress={() => go('/login')} fullWidth />
          <Button label="Create Account" variant="secondary" onPress={() => go('/register')} fullWidth />
        </View>
      </BottomSheet>
    </AuthPromptContext.Provider>
  )
}

export function useAuthPrompt() {
  const context = useContext(AuthPromptContext)
  if (!context) throw new Error('useAuthPrompt must be used within AuthPromptProvider')
  return context
}

export const savePrompts: Record<'projects' | 'properties', Prompt> = {
  projects: {
    title: 'Sign in to save projects',
    message: 'Create a free client account or sign in to keep a shortlist of projects you’re interested in.',
  },
  properties: {
    title: 'Sign in to save properties',
    message: 'Create a free client account or sign in to keep a shortlist of properties you’d like to follow up on.',
  },
}

const styles = StyleSheet.create({
  actions: { gap: space.md, marginTop: space.sm },
})
