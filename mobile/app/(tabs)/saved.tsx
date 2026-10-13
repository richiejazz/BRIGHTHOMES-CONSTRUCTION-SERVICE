import { router, useLocalSearchParams } from 'expo-router'
import { useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useSavedIndex, useSavedList, type SavedKind } from '../../src/api/account'
import type { SavedProject, SavedProperty } from '../../src/api/types'
import { useAuth } from '../../src/auth/AuthProvider'
import { SignInRequired } from '../../src/auth/SignInRequired'
import { ProjectStatusLabel } from '../../src/components/content/ProjectCard'
import { PropertyAvailability, cardPrice, propertyEyebrow } from '../../src/components/content/PropertyCard'
import { SavedRow, SavedRowSkeleton } from '../../src/components/content/SavedRow'
import { Button } from '../../src/components/ui/Button'
import { Segmented } from '../../src/components/ui/Chip'
import { ScreenHeader } from '../../src/components/ui/Editorial'
import { EmptyState, ErrorState, LoadingBlock } from '../../src/components/ui/States'
import { layout, makeStyles, space, useTheme } from '../../src/theme'

const header = <ScreenHeader title="Saved" subtitle="Your shortlist of projects and properties." />

export default function SavedScreen() {
  const styles = useStyles()
  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <SignInRequired title="Keep a shortlist" message="Create a free client account or sign in to save projects and properties and find them here on any visit." header={header}>
        <SavedLists />
      </SignInRequired>
    </SafeAreaView>
  )
}

const empty: Record<SavedKind, { title: string; message: string; action: string; section: string }> = {
  projects: { title: 'No saved projects yet', message: 'Tap the bookmark on any project to keep it here for later.', action: 'Explore projects', section: 'projects' },
  properties: { title: 'No saved properties yet', message: 'Tap the bookmark on any property to build a shortlist you can come back to.', action: 'Browse properties', section: 'properties' },
}

function SavedLists() {
  const styles = useStyles()
  const { colors } = useTheme()
  const params = useLocalSearchParams<{ tab?: string }>()
  const [kind, setKind] = useState<SavedKind>(params.tab === 'properties' ? 'properties' : 'projects')
  const signedIn = useAuth().status === 'authenticated'
  const projects = useSavedList('projects', signedIn)
  const properties = useSavedList('properties', signedIn)
  const projectIndex = useSavedIndex('projects', signedIn)
  const propertyIndex = useSavedIndex('properties', signedIn)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (params.tab === 'projects' || params.tab === 'properties') setKind(params.tab)
  }, [params.tab])

  const query = kind === 'projects' ? projects : properties
  const index = kind === 'projects' ? projectIndex : propertyIndex
  // Hide records the user has just unsaved while the list refreshes.
  const records: (SavedProject | SavedProperty)[] = kind === 'projects' ? (projects.data?.pages.flatMap((page) => page.results) ?? []) : (properties.data?.pages.flatMap((page) => page.results) ?? [])
  const items = records.filter((record) => {
    const itemId = 'project' in record ? record.project : record.property
    return !index.data || index.data[itemId] !== undefined
  })

  const onRefresh = async () => {
    setRefreshing(true)
    await Promise.all([projects.refetch(), properties.refetch(), projectIndex.refetch(), propertyIndex.refetch()])
    setRefreshing(false)
  }

  return (
    <FlatList<SavedProject | SavedProperty>
      data={items}
      keyExtractor={(record) => `${kind}-${record.id}`}
      contentContainerStyle={styles.list}
      stickyHeaderIndices={[0]}
      ListHeaderComponent={
        <View style={styles.header}>
          {header}
          <Segmented
            options={[
              { value: 'projects', label: 'Projects', count: projects.data?.pages[0]?.count },
              { value: 'properties', label: 'Properties', count: properties.data?.pages[0]?.count },
            ]}
            value={kind}
            onChange={setKind}
            accessibilityLabel="Saved items"
          />
        </View>
      }
      renderItem={({ item }) => (
        <View style={styles.inset}>
          {'project_summary' in item ? (
            <SavedRow
              kind="projects"
              itemId={item.project}
              slug={item.project_summary.slug}
              title={item.project_summary.title}
              meta={`Project · ${item.project_summary.category}`}
              detail=""
              cover={item.project_summary.cover_image}
              status={<ProjectStatusLabel project={item.project_summary} />}
            />
          ) : (
            <SavedRow
              kind="properties"
              itemId={item.property}
              slug={item.property_summary.slug}
              title={item.property_summary.title}
              meta={[propertyEyebrow(item.property_summary), item.property_summary.location || null].filter(Boolean).join(' · ')}
              detail={cardPrice(item.property_summary)}
              cover={item.property_summary.cover_image}
              status={<PropertyAvailability property={item.property_summary} />}
            />
          )}
        </View>
      )}
      onEndReached={() => query.hasNextPage && !query.isFetchingNextPage && query.fetchNextPage()}
      onEndReachedThreshold={0.6}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} colors={[colors.accent]} />}
      ListEmptyComponent={
        query.isPending ? (
          <LoadingBlock label={`Loading saved ${kind}`} style={styles.inset}>
            <SavedRowSkeleton />
            <SavedRowSkeleton />
          </LoadingBlock>
        ) : query.isError ? (
          <ErrorState error={query.error} onRetry={() => query.refetch()} style={styles.state} />
        ) : (
          <EmptyState
            title={empty[kind].title}
            message={empty[kind].message}
            action={<Button label={empty[kind].action} size="compact" onPress={() => router.navigate({ pathname: '/explore', params: { section: empty[kind].section } })} />}
            style={styles.state}
          />
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
    header: { backgroundColor: c.background, paddingBottom: space.md },
    state: { marginHorizontal: layout.gutter, marginTop: space.xl },
    footer: { marginVertical: space.xl },
  }),
)
