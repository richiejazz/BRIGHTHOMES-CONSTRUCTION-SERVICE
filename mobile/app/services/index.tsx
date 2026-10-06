import { router } from 'expo-router'
import { useState } from 'react'
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useServices } from '../../src/api/content'
import { ServiceRow, ServiceRowSkeleton } from '../../src/components/services/ServiceRow'
import { Button } from '../../src/components/ui/Button'
import { PageHeader } from '../../src/components/ui/PageHeader'
import { EmptyState, ErrorState, LoadingBlock } from '../../src/components/ui/States'
import { Text } from '../../src/components/ui/Text'
import { colors, layout, space } from '../../src/theme'

export default function ServicesScreen() {
  const insets = useSafeAreaInsets()
  const services = useServices()
  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = async () => {
    setRefreshing(true)
    await services.refetch()
    setRefreshing(false)
  }

  return (
    <FlatList
      style={styles.screen}
      data={services.data ?? []}
      keyExtractor={(service) => String(service.id)}
      contentContainerStyle={{ paddingBottom: insets.bottom + space.xxxl }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.bronzeDark} colors={[colors.bronzeDark]} />}
      ListHeaderComponent={
        <PageHeader eyebrow="What we do" title="Our services" intro="From drawings and approvals to supervision, construction management and real estate — one accountable partner throughout." />
      }
      renderItem={({ item, index }) => (
        <View style={styles.inset}>
          <ServiceRow service={item} index={index} />
        </View>
      )}
      ListEmptyComponent={
        services.isPending ? (
          <LoadingBlock label="Loading services" style={styles.inset}>
            {Array.from({ length: 8 }, (_, key) => (
              <ServiceRowSkeleton key={key} />
            ))}
          </LoadingBlock>
        ) : services.isError ? (
          <ErrorState error={services.error} onRetry={() => services.refetch()} style={styles.inset} />
        ) : (
          <EmptyState title="Services coming soon" message="Contact us to discuss your project in the meantime." action={<Button label="Contact us" variant="secondary" onPress={() => router.push('/contact')} />} style={styles.inset} />
        )
      }
      ListFooterComponent={
        services.data?.length ? (
          <View style={[styles.inset, styles.footer]}>
            <Text variant="title">Not sure which service you need?</Text>
            <Text variant="body">Tell us about your plans and we’ll point you in the right direction.</Text>
            <Button label="Send an Enquiry" onPress={() => router.push('/enquire')} fullWidth />
          </View>
        ) : null
      }
    />
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  inset: { marginHorizontal: layout.gutter },
  footer: { marginTop: space.xxxl, gap: space.md },
})
