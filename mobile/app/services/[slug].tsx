import { router, Stack, useLocalSearchParams } from 'expo-router'
import { CalendarClock, MessageSquareText } from 'lucide-react-native'
import { ScrollView, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useService, useServices } from '../../src/api/content'
import { isNotFound } from '../../src/api/errors'
import { BlueprintGrid } from '../../src/components/brand/Elevation'
import { Button } from '../../src/components/ui/Button'
import { EmptyState, ErrorState, LoadingBlock, Skeleton } from '../../src/components/ui/States'
import { Text } from '../../src/components/ui/Text'
import { padIndex } from '../../src/lib/format'
import { colors, layout, space } from '../../src/theme'

export default function ServiceDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>()
  const insets = useSafeAreaInsets()
  const service = useService(slug)
  const services = useServices()

  if (!service.data) {
    return (
      <View style={styles.screen}>
        <Stack.Screen options={{ title: 'Service' }} />
        {service.isError ? (
          isNotFound(service.error) ? (
            <EmptyState title="Service not found" message="This service may have been renamed or is no longer offered in the app." action={<Button label="View all services" onPress={() => router.replace('/services')} />} style={styles.state} />
          ) : (
            <ErrorState error={service.error} onRetry={() => service.refetch()} style={styles.state} />
          )
        ) : (
          <LoadingBlock label="Loading service" style={styles.state}>
            <Skeleton width="30%" height={12} />
            <Skeleton width="80%" height={36} style={styles.gap} />
            <Skeleton height={14} style={styles.gap} />
            <Skeleton width="85%" height={14} style={styles.gapSm} />
          </LoadingBlock>
        )}
      </View>
    )
  }

  const data = service.data
  const position = services.data?.findIndex((item) => item.id === data.id) ?? -1

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: insets.bottom + space.xxxl }}>
      <Stack.Screen options={{ title: data.name }} />
      <View style={styles.hero}>
        <BlueprintGrid />
        <Text variant="eyebrow" color={colors.bronzeLight}>
          {position >= 0 ? `Service ${padIndex(position)}` : 'Service'}
        </Text>
        <Text variant="display" color={colors.paper}>
          {data.name}
        </Text>
        <Text variant="lead" color={colors.stone300}>
          {data.short_description}
        </Text>
      </View>
      <View style={styles.body}>
        <Text variant="body" style={styles.description}>
          {data.description}
        </Text>
        <View style={styles.actions}>
          <Button label="Send an Enquiry" icon={MessageSquareText} onPress={() => router.push({ pathname: '/enquire', params: { service: data.slug } })} fullWidth />
          <Button label="Request a consultation" icon={CalendarClock} variant="secondary" onPress={() => router.push({ pathname: '/consultation', params: { service: data.slug } })} fullWidth />
        </View>
        <Button label="View our projects" variant="link" onPress={() => router.push('/projects')} />
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  state: { marginHorizontal: layout.gutter, marginTop: space.xl },
  gap: { marginTop: space.lg },
  gapSm: { marginTop: space.sm },
  hero: { backgroundColor: colors.ink, paddingHorizontal: layout.gutter, paddingVertical: space.xxxl, gap: space.lg, overflow: 'hidden' },
  body: { paddingHorizontal: layout.gutter, paddingTop: space.xl, gap: space.xl },
  description: { fontSize: 16, lineHeight: 26, color: colors.graphite },
  actions: { gap: space.md, borderTopWidth: 1, borderTopColor: colors.ink, paddingTop: space.xl },
})
