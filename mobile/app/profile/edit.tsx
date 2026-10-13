import { useState } from 'react'
import { StyleSheet, View } from 'react-native'

import { useUpdateProfile } from '../../src/api/account'
import { toApiError } from '../../src/api/errors'
import type { User } from '../../src/api/types'
import { useAuth } from '../../src/auth/AuthProvider'
import { SignInRequired } from '../../src/auth/SignInRequired'
import { AvatarEditor } from '../../src/components/account/AvatarEditor'
import { Button } from '../../src/components/ui/Button'
import { Eyebrow } from '../../src/components/ui/Editorial'
import { FormAlert, FormScreen } from '../../src/components/ui/FormScreen'
import { goBackOr } from '../../src/components/ui/ScreenChrome'
import { Text } from '../../src/components/ui/Text'
import { FieldFrame, TextField, useFieldStyles } from '../../src/components/ui/TextField'
import { useToast } from '../../src/components/ui/Toast'
import { compact, validateName, validatePhone, type FieldErrors } from '../../src/lib/validation'
import { makeStyles, space } from '../../src/theme'

export default function EditProfileScreen() {
  const { user } = useAuth()
  return (
    <SignInRequired title="Sign in to edit your profile" message="Your profile belongs to your client account.">
      {user ? <EditProfileForm user={user} /> : null}
    </SignInRequired>
  )
}

type Field = 'first_name' | 'last_name' | 'phone'

function EditProfileForm({ user }: { user: User }) {
  const toast = useToast()
  const field = useFieldStyles()
  const styles = useStyles()
  const update = useUpdateProfile()
  const [values, setValues] = useState<Record<Field, string>>({ first_name: user.first_name, last_name: user.last_name, phone: user.phone })
  const [errors, setErrors] = useState<FieldErrors<Field>>({})
  const [formError, setFormError] = useState<string>()
  const unchanged = values.first_name.trim() === user.first_name && values.last_name.trim() === user.last_name && values.phone.trim() === user.phone

  const set = (name: Field) => (value: string) => {
    setValues((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const onSubmit = () => {
    setFormError(undefined)
    const found = compact<Field>({ first_name: validateName(values.first_name, 'your first name'), last_name: validateName(values.last_name, 'your last name'), phone: validatePhone(values.phone) })
    setErrors(found)
    if (Object.keys(found).length) return
    update.mutate(
      { first_name: values.first_name.trim(), last_name: values.last_name.trim(), phone: values.phone.trim() },
      {
        onSuccess: () => {
          toast.show({ tone: 'success', title: 'Profile updated' })
          goBackOr('/profile')
        },
        onError: (error) => {
          const apiError = toApiError(error)
          const fieldErrors = { first_name: apiError.fieldErrors.first_name, last_name: apiError.fieldErrors.last_name, phone: apiError.fieldErrors.phone }
          setErrors(fieldErrors)
          setFormError(Object.values(fieldErrors).some(Boolean) ? undefined : apiError.message)
        },
      },
    )
  }

  return (
    <FormScreen>
      <View style={styles.photo}>
        <AvatarEditor user={user} size={88} />
        <View style={styles.photoCopy}>
          <Eyebrow label="Profile photo" />
          <Text variant="small">Tap the photo to add, change or remove it. Without one, your initials are shown.</Text>
        </View>
      </View>
      <FormAlert message={formError} />
      <TextField label="First name" value={values.first_name} onChangeText={set('first_name')} error={errors.first_name} autoComplete="given-name" textContentType="givenName" />
      <TextField label="Last name" value={values.last_name} onChangeText={set('last_name')} error={errors.last_name} autoComplete="family-name" textContentType="familyName" />
      <TextField label="Phone number" optional value={values.phone} onChangeText={set('phone')} error={errors.phone} hint="Used to prefill your enquiries, so our team can call you back." keyboardType="phone-pad" autoComplete="tel" textContentType="telephoneNumber" />
      <FieldFrame label="Email address" hint="Your email address is your sign-in and can’t be changed here. Contact us if it needs updating.">
        <View style={[field.control, styles.readOnly]} accessible accessibilityLabel={`Email address: ${user.email}. Read only.`}>
          <Text style={field.value}>{user.email}</Text>
        </View>
      </FieldFrame>
      <Button label={update.isPending ? 'Saving…' : 'Save changes'} loading={update.isPending} disabled={unchanged} onPress={onSubmit} fullWidth />
    </FormScreen>
  )
}

const useStyles = makeStyles((c) =>
  StyleSheet.create({
    photo: { flexDirection: 'row', alignItems: 'center', gap: space.xl, paddingBottom: space.xl, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.border },
    photoCopy: { flex: 1, gap: space.sm },
    readOnly: { justifyContent: 'center', backgroundColor: c.surface },
  }),
)
