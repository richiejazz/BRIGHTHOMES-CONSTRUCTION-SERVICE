import { Image } from 'expo-image'
import { StyleSheet, View } from 'react-native'

import type { User } from '../../api/types'
import { fonts, useTheme } from '../../theme'
import { Text } from './Text'

export function initials(user: Pick<User, 'first_name' | 'last_name' | 'email'>) {
  return `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase() || user.email.charAt(0).toUpperCase()
}

/** The user's profile photo, or their initials set in the display serif. */
export function Avatar({ user, size = 96 }: { user: Pick<User, 'first_name' | 'last_name' | 'email' | 'avatar'>; size?: number }) {
  const { colors } = useTheme()
  return (
    <View style={[styles.frame, { width: size, height: size, borderRadius: size / 2, backgroundColor: colors.inverse.background, borderColor: colors.accent }]} aria-hidden>
      {user.avatar ? (
        <Image source={{ uri: user.avatar }} contentFit="cover" transition={200} style={StyleSheet.absoluteFill} />
      ) : (
        <Text style={[styles.initials, { fontSize: size * 0.38, lineHeight: size * 0.46, color: colors.inverse.accent }]} maxFontSizeMultiplier={1}>
          {initials(user)}
        </Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  frame: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderWidth: 1 },
  initials: { fontFamily: fonts.display },
})
