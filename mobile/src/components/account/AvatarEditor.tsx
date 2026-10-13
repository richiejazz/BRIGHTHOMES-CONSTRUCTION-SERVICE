import { Camera } from 'lucide-react-native'
import { useState } from 'react'
import { ActivityIndicator, Linking, Platform, Pressable, StyleSheet, View } from 'react-native'

import { useRemoveAvatar, useUploadAvatar } from '../../api/account'
import { toApiError } from '../../api/errors'
import type { User } from '../../api/types'
import { pickAvatar } from '../../lib/avatarPicker'
import { useTheme } from '../../theme'
import { Avatar } from '../ui/Avatar'
import { BottomSheet } from '../ui/BottomSheet'
import { Button } from '../ui/Button'
import { Text } from '../ui/Text'
import { useToast } from '../ui/Toast'

/** The profile photo with a control to upload, replace or remove it. */
export function AvatarEditor({ user, size = 96 }: { user: User; size?: number }) {
  const { colors } = useTheme()
  const toast = useToast()
  const upload = useUploadAvatar()
  const remove = useRemoveAvatar()
  const [open, setOpen] = useState(false)
  const busy = upload.isPending || remove.isPending

  const choose = async () => {
    setOpen(false)
    try {
      const result = await pickAvatar()
      if (result.status === 'denied') {
        toast.show({
          tone: 'error',
          title: 'Photo access is turned off',
          message: 'Allow BRIGHTHOMES to access your photos in Settings to choose a profile photo.',
          action: Platform.OS === 'web' ? undefined : { label: 'Settings', onPress: () => void Linking.openSettings() },
        })
        return
      }
      if (result.status !== 'picked') return
      upload.mutate(result.image, {
        onSuccess: () => toast.show({ tone: 'success', title: 'Profile photo updated' }),
        onError: (error) => toast.show({ tone: 'error', title: 'We couldn’t update your photo', message: toApiError(error).fieldErrors.avatar ?? toApiError(error).message }),
      })
    } catch {
      toast.show({ tone: 'error', title: 'We couldn’t open that photo', message: 'Please try a different image.' })
    }
  }

  const removePhoto = () => {
    setOpen(false)
    remove.mutate(undefined, {
      onSuccess: () => toast.show({ tone: 'info', title: 'Profile photo removed' }),
      onError: (error) => toast.show({ tone: 'error', title: 'We couldn’t remove your photo', message: toApiError(error).message }),
    })
  }

  return (
    <>
      <Pressable
        onPress={() => (user.avatar ? setOpen(true) : void choose())}
        disabled={busy}
        accessibilityRole="button"
        accessibilityLabel={user.avatar ? 'Change or remove your profile photo' : 'Add a profile photo'}
        accessibilityState={{ busy }}
        style={({ pressed }) => [styles.target, pressed && styles.pressed]}
      >
        <Avatar user={user} size={size} />
        <View style={[styles.badge, { backgroundColor: colors.primaryFill, borderColor: colors.background }]}>
          {busy ? <ActivityIndicator size="small" color={colors.onPrimary} /> : <Camera size={15} color={colors.onPrimary} strokeWidth={1.6} />}
        </View>
      </Pressable>
      <BottomSheet visible={open} onClose={() => setOpen(false)} eyebrow="Profile photo" title="Update your photo">
        <Text variant="body">Your photo appears on your account in the app. It’s stored as a small square image.</Text>
        <View style={styles.actions}>
          <Button label="Choose a new photo" onPress={() => void choose()} fullWidth />
          <Button label="Remove photo" variant="secondary" onPress={removePhoto} fullWidth />
        </View>
      </BottomSheet>
    </>
  )
}

const styles = StyleSheet.create({
  target: { alignSelf: 'flex-start' },
  pressed: { opacity: 0.85 },
  badge: { position: 'absolute', right: 0, bottom: 0, width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  actions: { gap: 12, marginTop: 4 },
})
