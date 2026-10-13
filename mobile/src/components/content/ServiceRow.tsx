import { router } from 'expo-router'
import { ChevronRight } from 'lucide-react-native'
import { Pressable, StyleSheet, View } from 'react-native'

import type { Service } from '../../api/types'
import { padIndex } from '../../lib/format'
import { fonts, makeStyles, space, useTheme } from '../../theme'
import { Skeleton } from '../ui/States'
import { Text } from '../ui/Text'

/** Numbered list row linking to a service. */
export function ServiceRow({ service, index, first = false }: { service: Service; index: number; first?: boolean }) {
  const styles = useStyles()
  const { colors } = useTheme()
  return (
    <Pressable
      onPress={() => router.push(`/services/${service.slug}`)}
      accessibilityRole="link"
      accessibilityLabel={`${padIndex(index)}. ${service.name}. ${service.short_description}`}
      accessibilityHint="Opens the service"
      style={({ pressed }) => [styles.row, first && styles.first, pressed && styles.pressed]}
    >
      <Text style={styles.number}>{padIndex(index)}</Text>
      <View style={styles.copy}>
        <Text style={styles.name}>{service.name}</Text>
        <Text variant="small" numberOfLines={2}>
          {service.short_description}
        </Text>
      </View>
      <ChevronRight size={18} color={colors.textSubtle} strokeWidth={1.5} />
    </Pressable>
  )
}

export function ServiceRowSkeleton() {
  const styles = useStyles()
  return (
    <View style={styles.row}>
      <Skeleton width={28} height={28} />
      <View style={styles.copy}>
        <Skeleton width="60%" height={16} />
        <Skeleton width="90%" height={13} />
      </View>
    </View>
  )
}

const useStyles = makeStyles((c) =>
  StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', gap: space.lg, paddingVertical: space.lg, minHeight: 72, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.border },
    first: { borderTopWidth: 1, borderTopColor: c.borderStrong },
    pressed: { backgroundColor: c.surface },
    number: { fontFamily: fonts.displayItalic, fontSize: 24, lineHeight: 28, color: c.accentText, width: 32 },
    copy: { flex: 1, gap: 4 },
    name: { fontFamily: fonts.medium, fontSize: 15, lineHeight: 20, color: c.text },
  }),
)
