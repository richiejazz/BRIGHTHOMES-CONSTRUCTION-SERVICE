import { router } from 'expo-router'
import { useState } from 'react'
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useSavedIndex, useSavedProjects } from '../../src/api/account'
import { useAuth } from '../../src/auth/AuthProvider'
import { SignInRequired } from '../../src/auth/SignInRequired'
import { ProjectCard, ProjectCardSkeleton, fromSummary } from '../../src/components/projects/ProjectCard'
import { Button } from '../../src/components/ui/Button'
import { PageHeader } from '../../src/components/ui/PageHeader'
import { EmptyState, ErrorState, LoadingBlock } from '../../src/components/ui/States'
import { colors, layout, space } from '../../src/theme'

export default function SavedScreen() {
  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <SignInRequired
        title="Sign in to save projects"
        message="Create a free client account or sign in to keep a shortlist of projects you’re interested in."
        header={<PageHeader eyebrow="Your shortlist" title="Saved projects" />}
      >
        <SavedList />
      </SignInRequired>
    </SafeAreaView>
  )
}

function SavedList() {
  const { status } = useAuth()
  const signedIn = status === 'authenticated'
  const saved = useSavedProjects(signedIn)
  const index = useSavedIndex(signedIn)
  const [refreshing, setRefreshing] = useState(false)

  // Hide records the user has just unsaved while the list refreshes.
  const items = (saved.data?.pages.flatMap((page) => page.results) ?? []).filter((record) => !index.data || index.data[record.project] !== undefined)
  const total = saved.data?.pages[0]?.count ?? 0

  const onRefresh = async () => {
    setRefreshing(true)
    await Promise.all([saved.refetch(), index.refetch()])
    setRefreshing(false)
  }

  return (
    <FlatList
      data={items}
      keyExtractor={(record) => String(record.id)}
      contentContainerStyle={styles.list}
      ListHeaderComponent={<PageHeader eyebrow="Your shortlist" title="Saved projects" intro={total ? `${total} saved ${total === 1 ? 'project' : 'projects'}` : undefined} />}
      renderItem={({ item }) => <ProjectCard project={fromSummary(item.project_summary)} style={styles.card} />}
      onEndReached={() => saved.hasNextPage && !saved.isFetchingNextPage && saved.fetchNextPage()}
      onEndReachedThreshold={0.6}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.bronzeDark} colors={[colors.bronzeDark]} />}
      ListEmptyComponent={
        saved.isPending ? (
          <LoadingBlock label="Loading saved projects">
            <ProjectCardSkeleton style={styles.card} />
          </LoadingBlock>
        ) : saved.isError ? (
          <ErrorState error={saved.error} onRetry={() => saved.refetch()} style={styles.state} />
        ) : (
          <EmptyState
            title="No saved projects yet."
            message="Save projects you're interested in and they'll appear here."
            action={<Button label="Explore projects" onPress={() => router.push('/projects')} />}
            style={styles.state}
          />
        )
      }
      ListFooterComponent={
        saved.isFetchingNextPage ? (
          <ActivityIndicator color={colors.bronzeDark} style={styles.footer} />
        ) : saved.isFetchNextPageError ? (
          <ErrorState title="Couldn’t load more" error={saved.error} onRetry={() => saved.fetchNextPage()} style={styles.state} />
        ) : null
      }
    />
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  list: { paddingBottom: space.xxxl },
  card: { marginHorizontal: layout.gutter, marginTop: space.xl },
  state: { marginHorizontal: layout.gutter, marginTop: space.md },
  footer: { marginVertical: space.xl },
})
