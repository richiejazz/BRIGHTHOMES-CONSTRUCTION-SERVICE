import { router } from 'expo-router'
import { useState } from 'react'
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native'

import { useServices } from '../../api/content'
import { layout, space, useTheme } from '../../theme'
import { ServiceRow, ServiceRowSkeleton } from '../content/ServiceRow'
import { Button } from '../ui/Button'
import { Eyebrow } from '../ui/Editorial'
import { EmptyState, ErrorState, LoadingBlock } from '../ui/States'
import { Text } from '../ui/Text'

/** The verified services as a numbered editorial index. */
export function ServiceBrowser() {
  const { colors } = useTheme()
  const services = useServices()
  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = async () => {
    setRefreshing(true)
    await services.refetch()
    setRefreshing(false)
  }

  return (
    <FlatList
      data={services.data ?? []}
      keyExtractor={(service) => String(service.id)}
      contentContainerStyle={styles.list}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} colors={[colors.accent]} />}
      renderItem={({ item, index }) => (
        <View style={styles.inset}>
          <ServiceRow service={item} index={index} />
        </View>
      )}
      ListEmptyComponent={
        services.isPending ? (
          <LoadingBlock label="Loading services" style={styles.inset}>
            {Array.from({ length: 6 }, (_, key) => (
              <ServiceRowSkeleton key={key} />
            ))}
          </LoadingBlock>
        ) : services.isError ? (
          <ErrorState error={services.error} onRetry={() => services.refetch()} style={styles.inset} />
        ) : (
          <EmptyState title="Services coming soon" message="Contact us to discuss your project in the meantime." action={<Button label="Contact us" size="compact" variant="secondary" onPress={() => router.push('/contact')} />} style={styles.inset} />
        )
      }
      ListFooterComponent={
        services.data?.length ? (
          <View style={[styles.inset, styles.footer]}>
            <Eyebrow label="Not sure where to start?" />
            <Text variant="title">Tell us about your plans.</Text>
            <Text variant="body">We’ll point you to the right service, or bring several together under one accountable team.</Text>
            <Button label="Send an enquiry" onPress={() => router.push('/enquire')} fullWidth />
          </View>
        ) : null
      }
    />
  )
}

const styles = StyleSheet.create({
  list: { paddingTop: space.sm, paddingBottom: space.xxxl },
  inset: { marginHorizontal: layout.gutter },
  footer: { marginTop: space.section, gap: space.md },
})
