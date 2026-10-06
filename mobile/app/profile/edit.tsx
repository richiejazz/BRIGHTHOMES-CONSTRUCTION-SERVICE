import { router } from 'expo-router'
import { useState } from 'react'
import { StyleSheet, View } from 'react-native'

import { useUpdateProfile } from '../../src/api/account'
import { toApiError } from '../../src/api/errors'
import type { User } from '../../src/api/types'
import { useAuth } from '../../src/auth/AuthProvider'
import { SignInRequired } from '../../src/auth/SignInRequired'
import { Button } from '../../src/components/ui/Button'
import { FormAlert, FormScreen } from '../../src/components/ui/FormScreen'
import { Text } from '../../src/components/ui/Text'
import { FieldFrame, TextField, fieldStyles } from '../../src/components/ui/TextField'
import { useToast } from '../../src/components/ui/Toast'
import { compact, validateName, type FieldErrors } from '../../src/lib/validation'
import { colors, fonts } from '../../src/theme'

export default function EditProfileScreen() {
  const { user } = useAuth()
  return (
    <SignInRequired title="Sign in to edit your profile" message="Your profile belongs to your client account.">
      {user ? <EditProfileForm user={user} /> : null}
    </SignInRequired>
  )
}

type Field = 'first_name' | 'last_name'

function EditProfileForm({ user }: { user: User }) {
  const toast = useToast()
  const update = useUpdateProfile()
  const [values, setValues] = useState({ first_name: user.first_name, last_name: user.last_name })
  const [errors, setErrors] = useState<FieldErrors<Field>>({})
  const [formError, setFormError] = useState<string>()
  const unchanged = values.first_name.trim() === user.first_name && values.last_name.trim() === user.last_name

  const set = (field: Field) => (value: string) => {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  const onSubmit = () => {
    setFormError(undefined)
    const found = compact<Field>({ first_name: validateName(values.first_name, 'your first name'), last_name: validateName(values.last_name, 'your last name') })
    setErrors(found)
    if (Object.keys(found).length) return
    update.mutate(
      { first_name: values.first_name.trim(), last_name: values.last_name.trim() },
      {
        onSuccess: () => {
          toast.show({ tone: 'success', title: 'Profile updated' })
          router.back()
        },
        onError: (error) => {
          const apiError = toApiError(error)
          setErrors({ first_name: apiError.fieldErrors.first_name, last_name: apiError.fieldErrors.last_name })
          setFormError(apiError.fieldErrors.first_name || apiError.fieldErrors.last_name ? undefined : apiError.message)
        },
      },
    )
  }

  return (
    <FormScreen>
      <Text variant="body">Update the name shown on your account and prefilled on your requests.</Text>
      <FormAlert message={formError} />
      <TextField label="First name" value={values.first_name} onChangeText={set('first_name')} error={errors.first_name} autoComplete="given-name" textContentType="givenName" />
      <TextField label="Last name" value={values.last_name} onChangeText={set('last_name')} error={errors.last_name} autoComplete="family-name" textContentType="familyName" />
      <FieldFrame label="Email address" hint="Your email address is your sign-in and can’t be changed here. Contact us if it needs updating.">
        <View style={[fieldStyles.control, styles.readOnly]} accessible accessibilityLabel={`Email address: ${user.email}. Read only.`}>
          <Text style={styles.readOnlyText}>{user.email}</Text>
        </View>
      </FieldFrame>
      <Button label={update.isPending ? 'Saving…' : 'Save changes'} loading={update.isPending} disabled={unchanged} onPress={onSubmit} fullWidth />
    </FormScreen>
  )
}

const styles = StyleSheet.create({
  readOnly: { justifyContent: 'center', backgroundColor: colors.bone },
  readOnlyText: { fontFamily: fonts.regular, fontSize: 16, color: colors.stone600 },
})
