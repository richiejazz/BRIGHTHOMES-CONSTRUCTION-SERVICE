import { useMemo, useState } from 'react'
import { ActivityIndicator, FlatList, RefreshControl, View } from 'react-native'

import { useCategories, useProjectList } from '../../api/content'
import type { ProjectStatus } from '../../api/types'
import { useDebouncedValue } from '../../lib/useDebouncedValue'
import { useTheme } from '../../theme'
import { ProjectCard, ProjectCardSkeleton, fromProject } from '../content/ProjectCard'
import { Button } from '../ui/Button'
import { Chip } from '../ui/Chip'
import { SearchField } from '../ui/SearchField'
import { EmptyState, ErrorState, LoadingBlock } from '../ui/States'
import { ChipRow, ResultCount, useBrowserStyles } from './BrowserParts'

const statuses: { value: ProjectStatus | undefined; label: string }[] = [
  { value: undefined, label: 'All' },
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'completed', label: 'Completed' },
]

/** The construction portfolio, presented as case studies. */
export function ProjectBrowser({ autoFocus = false }: { autoFocus?: boolean }) {
  const styles = useBrowserStyles()
  const { colors } = useTheme()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<ProjectStatus | undefined>()
  const [category, setCategory] = useState<number | undefined>()
  const [refreshing, setRefreshing] = useState(false)
  const debouncedSearch = useDebouncedValue(search.trim())
  const params = useMemo(() => ({ search: debouncedSearch || undefined, status, category }), [debouncedSearch, status, category])
  const projects = useProjectList(params)
  const categories = useCategories()

  const items = projects.data?.pages.flatMap((page) => page.results) ?? []
  const total = projects.data?.pages[0]?.count
  const filtered = Boolean(params.search || status || category)

  const onRefresh = async () => {
    setRefreshing(true)
    await Promise.all([projects.refetch(), categories.refetch()])
    setRefreshing(false)
  }

  const clearFilters = () => {
    setSearch('')
    setStatus(undefined)
    setCategory(undefined)
  }

  const listHeader = (
    <View>
      <View style={styles.filters}>
        <SearchField value={search} onChangeText={setSearch} placeholder="Search projects" autoFocus={autoFocus} />
        {categories.data?.length ? (
          <ChipRow label="Filter by category">
            <Chip label="All categories" selected={category === undefined} onPress={() => setCategory(undefined)} />
            {categories.data.map((item) => (
              <Chip key={item.id} label={item.name} selected={category === item.id} onPress={() => setCategory(item.id)} accessibilityLabel={`Category: ${item.name}`} />
            ))}
          </ChipRow>
        ) : null}
        <ChipRow label="Filter by status">
          {statuses.map((option) => (
            <Chip key={option.label} label={option.label} selected={status === option.value} onPress={() => setStatus(option.value)} accessibilityLabel={`Status: ${option.label}`} />
          ))}
        </ChipRow>
      </View>
      <ResultCount total={total} noun="project" plural="projects" fetching={projects.isFetching && !projects.isFetchingNextPage && !refreshing && !projects.isPending} />
    </View>
  )

  return (
    <FlatList
      data={items}
      keyExtractor={(project) => String(project.id)}
      ListHeaderComponent={listHeader}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      contentContainerStyle={styles.list}
      renderItem={({ item }) => <ProjectCard project={fromProject(item)} style={styles.card} />}
      onEndReached={() => projects.hasNextPage && !projects.isFetchingNextPage && projects.fetchNextPage()}
      onEndReachedThreshold={0.6}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} colors={[colors.accent]} />}
      ListEmptyComponent={
        projects.isPending ? (
          <LoadingBlock label="Loading projects">
            <ProjectCardSkeleton style={styles.card} />
            <ProjectCardSkeleton style={styles.card} />
          </LoadingBlock>
        ) : projects.isError ? (
          <ErrorState error={projects.error} onRetry={() => projects.refetch()} style={styles.state} />
        ) : filtered ? (
          <EmptyState title="No matching projects" message="Try a different search or clear the filters." action={<Button label="Clear filters" size="compact" variant="secondary" onPress={clearFilters} />} style={styles.state} />
        ) : (
          <EmptyState title="Projects are being prepared" message="Our portfolio will appear here as projects are published." style={styles.state} />
        )
      }
      ListFooterComponent={
        projects.isFetchingNextPage ? (
          <ActivityIndicator color={colors.accent} style={styles.footer} accessibilityLabel="Loading more projects" />
        ) : projects.isFetchNextPageError ? (
          <ErrorState title="Couldn’t load more projects" error={projects.error} onRetry={() => projects.fetchNextPage()} style={styles.state} />
        ) : null
      }
    />
  )
}
