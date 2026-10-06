import { router } from 'expo-router'
import { ChevronRight } from 'lucide-react-native'
import { Pressable, StyleSheet, View } from 'react-native'

import type { Service } from '../../api/types'
import { padIndex } from '../../lib/format'
import { colors, fonts, space } from '../../theme'
import { Skeleton } from '../ui/States'
import { Text } from '../ui/Text'

/** Numbered editorial row linking to a service's detail screen. */
export function ServiceRow({ service, index }: { service: Service; index: number }) {
  return (
    <Pressable
      onPress={() => router.push(`/services/${service.slug}`)}
      accessibilityRole="link"
      accessibilityLabel={`${service.name}. ${service.short_description}`}
      accessibilityHint="Opens service details"
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <Text style={styles.number}>{padIndex(index)}</Text>
      <View style={styles.copy}>
        <Text variant="heading">{service.name}</Text>
        <Text variant="small" numberOfLines={2}>
          {service.short_description}
        </Text>
      </View>
      <ChevronRight size={18} color={colors.stone500} strokeWidth={1.5} />
    </Pressable>
  )
}

export function ServiceRowSkeleton() {
  return (
    <View style={styles.row}>
      <Skeleton width={22} height={14} />
      <View style={styles.copy}>
        <Skeleton width="60%" height={20} />
        <Skeleton width="90%" height={13} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.lg, paddingVertical: space.lg, minHeight: 76, borderBottomWidth: 1, borderBottomColor: colors.stone200 },
  pressed: { backgroundColor: colors.bone },
  number: { fontFamily: fonts.semibold, fontSize: 12, letterSpacing: 1.5, color: colors.bronzeDark, width: 22 },
  copy: { flex: 1, gap: 4 },
})
