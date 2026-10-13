import { Bookmark, BookmarkCheck } from 'lucide-react-native'
import { useEffect, useRef } from 'react'
import { ActivityIndicator, Animated, Pressable, StyleSheet } from 'react-native'

import { useSavedIndex, useToggleSaved, type SavedKind } from '../../api/account'
import { toApiError } from '../../api/errors'
import { savePrompts, useAuthPrompt } from '../../auth/AuthPrompt'
import { useAuth } from '../../auth/AuthProvider'
import { haptics } from '../../lib/haptics'
import { useReducedMotion } from '../../lib/useReducedMotion'
import { layout, onImage, useTheme } from '../../theme'
import { Button } from '../ui/Button'
import { useToast } from '../ui/Toast'

type Props = {
  kind: SavedKind
  itemId: number
  title: string
  /** icon: square control over photography; button: labelled, for action bars; inline: bare icon for list rows. */
  variant?: 'icon' | 'button' | 'inline'
}

const nouns: Record<SavedKind, { one: string; many: string; tab: string }> = {
  projects: { one: 'Project', many: 'saved projects', tab: 'Projects' },
  properties: { one: 'Property', many: 'saved properties', tab: 'Properties' },
}

/** Save / unsave a project or property. Anonymous visitors are invited to sign in instead. */
export function SaveButton({ kind, itemId, title, variant = 'icon' }: Props) {
  const { status, retry } = useAuth()
  const { colors } = useTheme()
  const signedIn = status === 'authenticated'
  const promptSignIn = useAuthPrompt()
  const toast = useToast()
  const reduced = useReducedMotion()
  const index = useSavedIndex(kind, signedIn)
  const toggle = useToggleSaved(kind)
  const scale = useRef(new Animated.Value(1)).current

  const savedId = index.data?.[itemId]
  const saved = savedId !== undefined
  // A pending optimistic save has no record id yet, so it cannot be undone until it settles.
  const busy = toggle.isPending || savedId === -1 || (signedIn && index.isPending) || status === 'loading' || status === 'bootstrapping'
  const noun = nouns[kind]

  // A small settle when the saved state changes, so the action feels acknowledged.
  const previous = useRef(saved)
  useEffect(() => {
    if (previous.current === saved || reduced) {
      previous.current = saved
      return
    }
    previous.current = saved
    scale.setValue(0.82)
    Animated.spring(scale, { toValue: 1, friction: 4, tension: 160, useNativeDriver: true }).start()
  }, [saved, reduced, scale])

  const onPress = () => {
    if (status === 'anonymous') return promptSignIn(savePrompts[kind])
    if (status === 'unavailable') {
      retry()
      return toast.show({ tone: 'error', title: 'We couldn’t reach your account', message: 'Check your connection and try again.' })
    }
    toggle.mutate(
      { itemId, savedId },
      {
        onSuccess: () => {
          if (saved) haptics.light()
          else haptics.success()
          toast.show(saved ? { tone: 'info', title: `Removed from ${noun.many}` } : { tone: 'success', title: `${noun.one} saved`, message: `Find it any time under Saved → ${noun.tab}.` })
        },
        onError: (error) => toast.show({ tone: 'error', title: `We couldn’t update your ${noun.many}`, message: toApiError(error).message }),
      },
    )
  }

  const label = saved ? `Remove ${title} from ${noun.many}` : `Save ${title}`

  if (variant === 'button') {
    return (
      <Button
        label={saved ? 'Saved' : 'Save'}
        icon={saved ? BookmarkCheck : Bookmark}
        variant="secondary"
        accessibilityLabel={label}
        accessibilityState={{ selected: saved, busy }}
        disabled={busy && signedIn}
        onPress={onPress}
      />
    )
  }

  const Icon = saved ? BookmarkCheck : Bookmark
  if (variant === 'inline') {
    return (
      <Pressable onPress={onPress} disabled={busy && signedIn} accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ selected: saved, busy }} hitSlop={6} style={({ pressed }) => [styles.inline, pressed && styles.pressed]}>
        <Animated.View style={{ transform: [{ scale }] }}>
          <Icon size={20} color={saved ? colors.accentText : colors.textMuted} strokeWidth={1.6} />
        </Animated.View>
      </Pressable>
    )
  }
  return (
    <Pressable
      onPress={onPress}
      disabled={busy && signedIn}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: saved, busy }}
      hitSlop={4}
      style={({ pressed }) => [styles.icon, { backgroundColor: saved ? colors.accentFill : onImage.chrome, borderColor: saved ? colors.accentFill : onImage.border }, pressed && styles.pressed]}
    >
      {busy && signedIn && toggle.isPending ? (
        <ActivityIndicator size="small" color={saved ? colors.onAccent : onImage.text} />
      ) : (
        <Animated.View style={{ transform: [{ scale }] }}>
          <Icon size={19} color={saved ? colors.onAccent : onImage.text} strokeWidth={1.5} />
        </Animated.View>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  icon: { width: layout.touch - 4, height: layout.touch - 4, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  inline: { width: layout.touch, height: layout.touch, alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.75 },
})
