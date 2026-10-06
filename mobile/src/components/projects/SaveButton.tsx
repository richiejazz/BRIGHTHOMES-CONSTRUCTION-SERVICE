import { Bookmark, BookmarkCheck } from 'lucide-react-native'
import { ActivityIndicator, Pressable, StyleSheet } from 'react-native'

import { useSavedIndex, useToggleSavedProject } from '../../api/account'
import { toApiError } from '../../api/errors'
import { savePrompt, useAuthPrompt } from '../../auth/AuthPrompt'
import { useAuth } from '../../auth/AuthProvider'
import { colors, layout } from '../../theme'
import { Button } from '../ui/Button'
import { useToast } from '../ui/Toast'

type Props = { projectId: number; title: string; variant?: 'icon' | 'button' }

/** Save / unsave a project. Anonymous visitors are invited to sign in instead. */
export function SaveButton({ projectId, title, variant = 'icon' }: Props) {
  const { status, retry } = useAuth()
  const signedIn = status === 'authenticated'
  const promptSignIn = useAuthPrompt()
  const toast = useToast()
  const index = useSavedIndex(signedIn)
  const toggle = useToggleSavedProject()

  const savedId = index.data?.[projectId]
  const saved = savedId !== undefined
  // A pending optimistic save has no record id yet, so it cannot be undone until it settles.
  const busy = toggle.isPending || savedId === -1 || (signedIn && index.isPending) || status === 'loading' || status === 'bootstrapping'

  const onPress = () => {
    if (status === 'anonymous') return promptSignIn(savePrompt)
    if (status === 'unavailable') {
      retry()
      return toast.show({ tone: 'error', title: 'We couldn’t reach your account', message: 'Check your connection and try again.' })
    }
    toggle.mutate(
      { projectId, savedId },
      {
        onSuccess: () => toast.show(saved ? { tone: 'info', title: 'Removed from saved projects' } : { tone: 'success', title: 'Project saved', message: 'Find it any time in the Saved tab.' }),
        onError: (error) => toast.show({ tone: 'error', title: 'We couldn’t update your saved projects', message: toApiError(error).message }),
      },
    )
  }

  const label = saved ? `Remove ${title} from saved projects` : `Save ${title}`

  if (variant === 'button') {
    return <Button label={saved ? 'Saved' : 'Save'} icon={saved ? BookmarkCheck : Bookmark} variant={saved ? 'primary' : 'secondary'} accessibilityLabel={label} accessibilityState={{ selected: saved, busy }} disabled={busy && signedIn} onPress={onPress} />
  }

  const Icon = saved ? BookmarkCheck : Bookmark
  return (
    <Pressable
      onPress={onPress}
      disabled={busy && signedIn}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: saved, busy }}
      hitSlop={4}
      style={({ pressed }) => [styles.icon, saved && styles.iconSaved, pressed && styles.pressed]}
    >
      {busy && signedIn && toggle.isPending ? <ActivityIndicator size="small" color={saved ? colors.paper : colors.ink} /> : <Icon size={20} color={saved ? colors.paper : colors.ink} strokeWidth={1.6} />}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  icon: { width: layout.touch - 4, height: layout.touch - 4, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.paper, borderRadius: layout.radius },
  iconSaved: { backgroundColor: colors.ink },
  pressed: { opacity: 0.75 },
})
