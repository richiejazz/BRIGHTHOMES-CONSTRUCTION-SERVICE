import { router, useLocalSearchParams } from 'expo-router'
import { useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useMyAppointments, useMyEnquiries } from '../../src/api/account'
import type { Appointment, Enquiry } from '../../src/api/types'
import { useAuth } from '../../src/auth/AuthProvider'
import { SignInRequired } from '../../src/auth/SignInRequired'
import { AppointmentRow, EnquiryRow, RequestRowSkeleton } from '../../src/components/activity/RequestRows'
import { Button } from '../../src/components/ui/Button'
import { PageHeader } from '../../src/components/ui/PageHeader'
import { EmptyState, ErrorState, LoadingBlock } from '../../src/components/ui/States'
import { Text } from '../../src/components/ui/Text'
import { colors, fonts, layout, space } from '../../src/theme'

type Section = 'enquiries' | 'appointments'

const header = <PageHeader eyebrow="Your requests" title="Activity" intro="Follow your enquiries and consultation requests." />

export default function ActivityScreen() {
  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <SignInRequired title="Sign in to see your activity" message="With a client account, the enquiries and consultation requests you send appear here so you can follow their status." header={header}>
        <ActivityLists />
      </SignInRequired>
    </SafeAreaView>
  )
}

function ActivityLists() {
  const params = useLocalSearchParams<{ tab?: string }>()
  const [section, setSection] = useState<Section>(params.tab === 'appointments' ? 'appointments' : 'enquiries')
  const signedIn = useAuth().status === 'authenticated'
  const enquiries = useMyEnquiries(signedIn)
  const appointments = useMyAppointments(signedIn)
  const [refreshing, setRefreshing] = useState(false)

  // Follow links such as Profile → Appointments while this tab is already mounted.
  useEffect(() => {
    if (params.tab === 'appointments' || params.tab === 'enquiries') setSection(params.tab)
  }, [params.tab])

  const query = section === 'enquiries' ? enquiries : appointments
  const items: (Enquiry | Appointment)[] = section === 'enquiries' ? (enquiries.data?.pages.flatMap((page) => page.results) ?? []) : (appointments.data?.pages.flatMap((page) => page.results) ?? [])
  const counts = { enquiries: enquiries.data?.pages[0]?.count, appointments: appointments.data?.pages[0]?.count }

  const onRefresh = async () => {
    setRefreshing(true)
    await Promise.all([enquiries.refetch(), appointments.refetch()])
    setRefreshing(false)
  }

  const tabs = (
    <View style={styles.tabs} accessibilityRole="tablist">
      {(['enquiries', 'appointments'] as const).map((key) => {
        const active = section === key
        const label = key === 'enquiries' ? 'Enquiries' : 'Appointments'
        const count = counts[key]
        return (
          <Pressable key={key} onPress={() => setSection(key)} accessibilityRole="tab" accessibilityState={{ selected: active }} accessibilityLabel={`${label}${count !== undefined ? `, ${count}` : ''}`} style={[styles.tab, active && styles.tabActive]}>
            <Text style={[styles.tabText, active && styles.tabTextActive]}>
              {label}
              {count !== undefined ? <Text style={styles.count}>{`  ${count}`}</Text> : null}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => `${section}-${item.id}`}
      contentContainerStyle={styles.list}
      ListHeaderComponent={
        <View>
          {header}
          {tabs}
        </View>
      }
      renderItem={({ item }) => <View style={styles.inset}>{section === 'enquiries' ? <EnquiryRow enquiry={item as Enquiry} /> : <AppointmentRow appointment={item as Appointment} />}</View>}
      onEndReached={() => query.hasNextPage && !query.isFetchingNextPage && query.fetchNextPage()}
      onEndReachedThreshold={0.6}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.bronzeDark} colors={[colors.bronzeDark]} />}
      ListEmptyComponent={
        query.isPending ? (
          <LoadingBlock label={`Loading ${section}`} style={styles.inset}>
            <RequestRowSkeleton />
            <RequestRowSkeleton />
          </LoadingBlock>
        ) : query.isError ? (
          <ErrorState error={query.error} onRetry={() => query.refetch()} style={styles.state} />
        ) : section === 'enquiries' ? (
          <EmptyState title="You haven't sent any enquiries yet." message="Questions about a project or service? Send an enquiry and follow its progress here." action={<Button label="Make an enquiry" onPress={() => router.push('/enquire')} />} style={styles.state} />
        ) : (
          <EmptyState title="You haven't requested any consultations yet." message="Request a consultation and our team will contact you to confirm a date and time." action={<Button label="Request a consultation" onPress={() => router.push('/consultation')} />} style={styles.state} />
        )
      }
      ListFooterComponent={
        query.isFetchingNextPage ? (
          <ActivityIndicator color={colors.bronzeDark} style={styles.footer} />
        ) : query.isFetchNextPageError ? (
          <ErrorState title="Couldn’t load more" error={query.error} onRetry={() => query.fetchNextPage()} style={styles.state} />
        ) : null
      }
    />
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  list: { paddingBottom: space.xxxl },
  inset: { marginHorizontal: layout.gutter },
  state: { marginHorizontal: layout.gutter, marginTop: space.lg },
  footer: { marginVertical: space.xl },
  tabs: { flexDirection: 'row', marginHorizontal: layout.gutter, borderBottomWidth: 1, borderBottomColor: colors.stone300 },
  tab: { flex: 1, minHeight: 48, alignItems: 'center', justifyContent: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent', marginBottom: -1 },
  tabActive: { borderBottomColor: colors.ink },
  tabText: { fontFamily: fonts.semibold, fontSize: 14, color: colors.stone500, letterSpacing: 0.3 },
  tabTextActive: { color: colors.ink },
  count: { fontFamily: fonts.semibold, fontSize: 12, color: colors.bronzeDark },
})
