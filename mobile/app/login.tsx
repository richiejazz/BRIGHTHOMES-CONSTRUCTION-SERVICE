import { router, useLocalSearchParams } from 'expo-router'
import { useRef, useState } from 'react'
import { StyleSheet, View, type TextInput } from 'react-native'

import { toApiError } from '../src/api/errors'
import { useAuth } from '../src/auth/AuthProvider'
import { leaveAuthScreen } from '../src/auth/navigation'
import { AuthFrame } from '../src/components/account/AuthFrame'
import { Button } from '../src/components/ui/Button'
import { Eyebrow } from '../src/components/ui/Editorial'
import { FormAlert, Notice } from '../src/components/ui/FormScreen'
import { Text } from '../src/components/ui/Text'
import { TextField } from '../src/components/ui/TextField'
import { useToast } from '../src/components/ui/Toast'
import { validateEmail } from '../src/lib/validation'
import { makeStyles, space } from '../src/theme'

export default function LoginScreen() {
  const { reason } = useLocalSearchParams<{ reason?: string }>()
  const styles = useStyles()
  const { login } = useAuth()
  const toast = useToast()
  const passwordRef = useRef<TextInput>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [formError, setFormError] = useState<string>()
  const [submitting, setSubmitting] = useState(false)

  const onSubmit = async () => {
    setFormError(undefined)
    const found = { email: validateEmail(email), password: password ? undefined : 'Please enter your password.' }
    setErrors(found)
    if (found.email || found.password) return
    setSubmitting(true)
    try {
      const user = await login(email.trim(), password)
      toast.show({ tone: 'success', title: `Welcome back${user.first_name ? `, ${user.first_name}` : ''}.` })
      leaveAuthScreen()
    } catch (error) {
      const apiError = toApiError(error)
      setFormError(apiError.kind === 'unauthorized' ? 'That email and password combination isn’t recognised.' : apiError.message)
      setSubmitting(false)
    }
  }

  return (
    <AuthFrame eyebrow="Client account" title="Welcome back." intro="Sign in to see your saved projects and properties, enquiries and consultation requests.">
      {reason === 'expired' ? (
        <Notice tone="accent">
          <Text variant="label">Your session has ended</Text>
          <Text variant="small">For your security, sessions expire after a period of inactivity. Sign in again to continue where you left off.</Text>
        </Notice>
      ) : null}
      <FormAlert message={formError} />
      <TextField
        label="Email address"
        value={email}
        onChangeText={setEmail}
        error={errors.email}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="username"
        returnKeyType="next"
        onSubmitEditing={() => passwordRef.current?.focus()}
        submitBehavior="submit"
      />
      <TextField ref={passwordRef} label="Password" value={password} onChangeText={setPassword} error={errors.password} secureTextEntry autoCapitalize="none" autoComplete="current-password" textContentType="password" returnKeyType="go" onSubmitEditing={onSubmit} />
      <Button label={submitting ? 'Signing in…' : 'Sign in'} loading={submitting} onPress={onSubmit} fullWidth />
      <View style={styles.alt}>
        <Eyebrow label="New to BRIGHTHOMES?" />
        <Text variant="body">Create a free account to keep a shortlist and follow your requests in one place.</Text>
        <Button label="Create an account" variant="secondary" onPress={() => router.replace('/register')} fullWidth />
      </View>
    </AuthFrame>
  )
}

const useStyles = makeStyles((c) =>
  StyleSheet.create({
    alt: { gap: space.md, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.border, paddingTop: space.xl, marginTop: space.md },
  }),
)
