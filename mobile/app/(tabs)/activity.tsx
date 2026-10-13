import { router, useLocalSearchParams } from 'expo-router'
import { useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useMyAppointments, useMyEnquiries } from '../../src/api/account'
import type { Appointment, Enquiry } from '../../src/api/types'
import { useAuth } from '../../src/auth/AuthProvider'
import { SignInRequired } from '../../src/auth/SignInRequired'
import { AppointmentRow, EnquiryRow, RequestRowSkeleton } from '../../src/components/activity/RequestRows'
import { Button } from '../../src/components/ui/Button'
import { Segmented } from '../../src/components/ui/Chip'
import { ScreenHeader } from '../../src/components/ui/Editorial'
import { EmptyState, ErrorState, LoadingBlock } from '../../src/components/ui/States'
import { layout, makeStyles, space, useTheme } from '../../src/theme'

type Section = 'enquiries' | 'appointments'

const header = <ScreenHeader title="Activity" subtitle="Consultations stay requests until our team confirms them." />

export default function ActivityScreen() {
  const styles = useStyles()
  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <SignInRequired title="Follow your requests" message="With a client account, the enquiries and consultation requests you send appear here so you can follow their status." header={header}>
        <ActivityLists />
      </SignInRequired>
    </SafeAreaView>
  )
}

function ActivityLists() {
  const styles = useStyles()
  const { colors } = useTheme()
  const params = useLocalSearchParams<{ tab?: string }>()
  const [section, setSection] = useState<Section>(params.tab === 'appointments' ? 'appointments' : 'enquiries')
  const signedIn = useAuth().status === 'authenticated'
  const enquiries = useMyEnquiries(signedIn)
  const appointments = useMyAppointments(signedIn)
  const [refreshing, setRefreshing] = useState(false)

  // Follow links such as Profile → Consultations while this tab is already mounted.
  useEffect(() => {
    if (params.tab === 'appointments' || params.tab === 'enquiries') setSection(params.tab)
  }, [params.tab])

  const query = section === 'enquiries' ? enquiries : appointments
  const items: (Enquiry | Appointment)[] = section === 'enquiries' ? (enquiries.data?.pages.flatMap((page) => page.results) ?? []) : (appointments.data?.pages.flatMap((page) => page.results) ?? [])

  const onRefresh = async () => {
    setRefreshing(true)
    await Promise.all([enquiries.refetch(), appointments.refetch()])
    setRefreshing(false)
  }

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => `${section}-${item.id}`}
      contentContainerStyle={styles.list}
      stickyHeaderIndices={[0]}
      ListHeaderComponent={
        <View style={styles.header}>
          {header}
          <Segmented
            options={[
              { value: 'enquiries', label: 'Enquiries', count: enquiries.data?.pages[0]?.count },
              { value: 'appointments', label: 'Consultations', count: appointments.data?.pages[0]?.count },
            ]}
            value={section}
            onChange={setSection}
            accessibilityLabel="Activity"
          />
        </View>
      }
      renderItem={({ item }) => <View style={styles.inset}>{section === 'enquiries' ? <EnquiryRow enquiry={item as Enquiry} /> : <AppointmentRow appointment={item as Appointment} />}</View>}
      onEndReached={() => query.hasNextPage && !query.isFetchingNextPage && query.fetchNextPage()}
      onEndReachedThreshold={0.6}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} colors={[colors.accent]} />}
      ListEmptyComponent={
        query.isPending ? (
          <LoadingBlock label={`Loading ${section}`} style={styles.inset}>
            <RequestRowSkeleton />
            <RequestRowSkeleton />
          </LoadingBlock>
        ) : query.isError ? (
          <ErrorState error={query.error} onRetry={() => query.refetch()} style={styles.state} />
        ) : section === 'enquiries' ? (
          <EmptyState title="No enquiries yet" message="Questions about a property, project or service? Send an enquiry and follow its progress here." action={<Button label="Make an enquiry" size="compact" onPress={() => router.push('/enquire')} />} style={styles.state} />
        ) : (
          <EmptyState title="No consultation requests yet" message="Request a consultation and our team will contact you to confirm a date and time." action={<Button label="Request a consultation" size="compact" onPress={() => router.push('/consultation')} />} style={styles.state} />
        )
      }
      ListFooterComponent={
        query.isFetchingNextPage ? (
          <ActivityIndicator color={colors.accent} style={styles.footer} />
        ) : query.isFetchNextPageError ? (
          <ErrorState title="Couldn’t load more" error={query.error} onRetry={() => query.fetchNextPage()} style={styles.state} />
        ) : null
      }
    />
  )
}

const useStyles = makeStyles((c) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.background },
    list: { paddingBottom: space.xxxl },
    inset: { marginHorizontal: layout.gutter },
    header: { backgroundColor: c.background, paddingBottom: space.sm },
    state: { marginHorizontal: layout.gutter, marginTop: space.xl },
    footer: { marginVertical: space.xl },
  }),
)
