import { forwardRef, type ReactNode } from 'react'
import { StyleSheet, View, type ScrollView } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useLightStatusBar } from '../../lib/useStatusBar'
import { editorial } from '../../content/media'
import { layout, onImage, space } from '../../theme'
import { Wordmark } from '../brand/Logo'
import { EditorialPhoto, Scrim } from '../media/Media'
import { Eyebrow } from '../ui/Editorial'
import { FormScreen } from '../ui/FormScreen'
import { FloatingBack } from '../ui/ScreenChrome'
import { Text } from '../ui/Text'

/** Sign-in and registration share an editorial image band above the form. */
export const AuthFrame = forwardRef<ScrollView, { eyebrow: string; title: string; intro: string; children: ReactNode }>(function AuthFrame({ eyebrow, title, intro, children }, ref) {
  const insets = useSafeAreaInsets()
  useLightStatusBar()
  return (
    <View style={styles.flex}>
      <FormScreen
        ref={ref}
        header={
          <EditorialPhoto source={editorial.facade.source} alt={editorial.facade.alt} style={{ minHeight: 300 + insets.top }}>
            <Scrim from={0.5} to={0.88} />
            <View style={[styles.band, { paddingTop: insets.top + 72 }]}>
              <Wordmark tone="light" compact />
              <View style={styles.copy}>
                <Eyebrow label={eyebrow} color={onImage.accent} ruleColor={onImage.accent} />
                <Text variant="display" color={onImage.text}>
                  {title}
                </Text>
                <Text variant="body" color={onImage.textMuted}>
                  {intro}
                </Text>
              </View>
            </View>
          </EditorialPhoto>
        }
      >
        {children}
      </FormScreen>
      <FloatingBack fallback="/" close />
    </View>
  )
})

const styles = StyleSheet.create({
  flex: { flex: 1 },
  band: { flex: 1, justifyContent: 'space-between', paddingHorizontal: layout.gutter, paddingBottom: space.xl, gap: space.xl },
  copy: { gap: space.md },
})
