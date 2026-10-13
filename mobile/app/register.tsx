import { router } from 'expo-router'
import { useRef, useState } from 'react'
import { StyleSheet, View, type ScrollView, type TextInput } from 'react-native'

import { toApiError } from '../src/api/errors'
import { useAuth } from '../src/auth/AuthProvider'
import { leaveAuthScreen } from '../src/auth/navigation'
import { AuthFrame } from '../src/components/account/AuthFrame'
import { Button } from '../src/components/ui/Button'
import { Eyebrow } from '../src/components/ui/Editorial'
import { FormAlert } from '../src/components/ui/FormScreen'
import { Text } from '../src/components/ui/Text'
import { TextField } from '../src/components/ui/TextField'
import { useToast } from '../src/components/ui/Toast'
import { compact, validateEmail, validateName, type FieldErrors } from '../src/lib/validation'
import { makeStyles, space } from '../src/theme'

type Field = 'first_name' | 'last_name' | 'email' | 'password' | 'confirm'

export default function RegisterScreen() {
  const styles = useStyles()
  const { register } = useAuth()
  const toast = useToast()
  const scroll = useRef<ScrollView>(null)
  const refs = { last_name: useRef<TextInput>(null), email: useRef<TextInput>(null), password: useRef<TextInput>(null), confirm: useRef<TextInput>(null) }
  const [values, setValues] = useState<Record<Field, string>>({ first_name: '', last_name: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState<FieldErrors<Field>>({})
  const [formError, setFormError] = useState<string>()
  const [submitting, setSubmitting] = useState(false)

  const set = (field: Field) => (value: string) => {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => (current[field] ? { ...current, [field]: undefined } : current))
  }

  const onSubmit = async () => {
    setFormError(undefined)
    const found = compact<Field>({
      first_name: validateName(values.first_name, 'your first name'),
      last_name: validateName(values.last_name, 'your last name'),
      email: validateEmail(values.email),
      password: !values.password ? 'Please choose a password.' : values.password.length < 8 ? 'Your password must be at least 8 characters.' : undefined,
      confirm: !values.confirm ? 'Please confirm your password.' : values.confirm !== values.password ? 'Passwords don’t match.' : undefined,
    })
    setErrors(found)
    if (Object.keys(found).length) return
    setSubmitting(true)
    try {
      await register({ first_name: values.first_name.trim(), last_name: values.last_name.trim(), email: values.email.trim(), password: values.password })
      toast.show({ tone: 'success', title: 'Your account is ready.', message: 'You’re now signed in.' })
      leaveAuthScreen()
    } catch (error) {
      // Field messages from the API (such as an email already in use) appear on their fields,
      // as on the website.
      const apiError = toApiError(error)
      const fieldErrors: FieldErrors<Field> = {}
      for (const [field, message] of Object.entries(apiError.fieldErrors)) if (field in values) fieldErrors[field as Field] = message
      setErrors(fieldErrors)
      if (!Object.keys(fieldErrors).length || apiError.kind !== 'validation') setFormError(apiError.message)
      scroll.current?.scrollTo({ y: 0, animated: true })
      setSubmitting(false)
    }
  }

  return (
    <AuthFrame ref={scroll} eyebrow="Client account" title="Create your account." intro="Save projects and properties, and follow your enquiries and consultation requests in one place.">
      <FormAlert message={formError} />
      <TextField label="First name" value={values.first_name} onChangeText={set('first_name')} error={errors.first_name} autoComplete="given-name" textContentType="givenName" returnKeyType="next" onSubmitEditing={() => refs.last_name.current?.focus()} submitBehavior="submit" />
      <TextField ref={refs.last_name} label="Last name" value={values.last_name} onChangeText={set('last_name')} error={errors.last_name} autoComplete="family-name" textContentType="familyName" returnKeyType="next" onSubmitEditing={() => refs.email.current?.focus()} submitBehavior="submit" />
      <TextField ref={refs.email} label="Email address" value={values.email} onChangeText={set('email')} error={errors.email} keyboardType="email-address" autoCapitalize="none" autoComplete="email" textContentType="emailAddress" returnKeyType="next" onSubmitEditing={() => refs.password.current?.focus()} submitBehavior="submit" />
      <TextField
        ref={refs.password}
        label="Password"
        value={values.password}
        onChangeText={set('password')}
        error={errors.password}
        hint="At least 8 characters. Avoid common or entirely numeric passwords."
        secureTextEntry
        autoCapitalize="none"
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="next"
        onSubmitEditing={() => refs.confirm.current?.focus()}
        submitBehavior="submit"
      />
      <TextField ref={refs.confirm} label="Confirm password" value={values.confirm} onChangeText={set('confirm')} error={errors.confirm} secureTextEntry autoCapitalize="none" autoComplete="new-password" textContentType="newPassword" returnKeyType="go" onSubmitEditing={onSubmit} />
      <Button label={submitting ? 'Creating account…' : 'Create account'} loading={submitting} onPress={onSubmit} fullWidth />
      <View style={styles.alt}>
        <Eyebrow label="Already registered?" />
        <Button label="Sign in" variant="secondary" onPress={() => router.replace('/login')} fullWidth />
      </View>
    </AuthFrame>
  )
}

const useStyles = makeStyles((c) =>
  StyleSheet.create({
    alt: { gap: space.md, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.border, paddingTop: space.xl, marginTop: space.md },
  }),
)
