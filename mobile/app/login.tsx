import { router } from 'expo-router'
import { useRef, useState } from 'react'
import { StyleSheet, View, type TextInput } from 'react-native'

import { toApiError } from '../src/api/errors'
import { useAuth } from '../src/auth/AuthProvider'
import { leaveAuthScreen } from '../src/auth/navigation'
import { Button } from '../src/components/ui/Button'
import { FormAlert, FormScreen } from '../src/components/ui/FormScreen'
import { Text } from '../src/components/ui/Text'
import { TextField } from '../src/components/ui/TextField'
import { useToast } from '../src/components/ui/Toast'
import { validateEmail } from '../src/lib/validation'
import { colors, space } from '../src/theme'

export default function LoginScreen() {
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
    <FormScreen>
      <View style={styles.intro}>
        <Text variant="eyebrow">Client account</Text>
        <Text variant="display">Sign in</Text>
        <Text variant="body">Access your saved projects, enquiries and consultation requests.</Text>
      </View>
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
        <Text variant="heading">New to BRIGHTHOMES?</Text>
        <Text variant="body">Create an account to save projects and keep track of your enquiries and consultation requests.</Text>
        <Button label="Create an account" variant="secondary" onPress={() => router.replace('/register')} fullWidth />
      </View>
    </FormScreen>
  )
}

const styles = StyleSheet.create({
  intro: { gap: space.md },
  alt: { gap: space.md, borderTopWidth: 1, borderTopColor: colors.stone300, paddingTop: space.xl, marginTop: space.md },
})
