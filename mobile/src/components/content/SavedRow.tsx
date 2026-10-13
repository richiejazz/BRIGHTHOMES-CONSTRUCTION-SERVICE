import { router } from 'expo-router'
import { Pressable, StyleSheet, View } from 'react-native'

import type { SavedKind } from '../../api/account'
import type { GalleryImage } from '../../api/types'
import { makeStyles, space, useTheme } from '../../theme'
import { Photo } from '../media/Media'
import { Skeleton } from '../ui/States'
import { Text } from '../ui/Text'
import { SaveButton } from './SaveButton'

type Props = {
  kind: SavedKind
  itemId: number
  slug: string
  title: string
  meta: string
  detail: string
  cover: GalleryImage | null
  status: React.ReactNode
}

/** A compact saved-item row: thumbnail, details, and an inline control to unsave. */
export function SavedRow({ kind, itemId, slug, title, meta, detail, cover, status }: Props) {
  const styles = useStyles()
  const { colors } = useTheme()
  const href = kind === 'projects' ? `/projects/${slug}` : `/properties/${slug}`
  return (
    <View style={styles.row}>
      <Pressable onPress={() => router.push(href)} accessibilityRole="link" accessibilityLabel={`${title}. ${meta}. ${detail}`} style={({ pressed }) => [styles.main, pressed && styles.pressed]}>
        <Photo image={cover} seed={itemId} title={title} style={styles.thumb} />
        <View style={styles.copy}>
          <Text variant="caption" color={colors.textSubtle} numberOfLines={1}>
            {meta}
          </Text>
          <Text variant="label" numberOfLines={2}>
            {title}
          </Text>
          <View style={styles.status}>{status}</View>
          {detail ? (
            <Text variant="caption" color={colors.textMuted} numberOfLines={1}>
              {detail}
            </Text>
          ) : null}
        </View>
      </Pressable>
      <SaveButton kind={kind} itemId={itemId} title={title} variant="inline" />
    </View>
  )
}

export function SavedRowSkeleton() {
  const styles = useStyles()
  return (
    <View style={styles.row}>
      <Skeleton width={96} height={96} />
      <View style={styles.copy}>
        <Skeleton width="40%" height={11} />
        <Skeleton width="80%" height={20} />
        <Skeleton width="30%" height={11} />
      </View>
    </View>
  )
}

const useStyles = makeStyles((c) =>
  StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingVertical: space.md, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.border },
    main: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: space.lg },
    pressed: { opacity: 0.75 },
    thumb: { width: 96, height: 96 },
    copy: { flex: 1, gap: 4 },
    status: { marginTop: 2 },
  }),
)
