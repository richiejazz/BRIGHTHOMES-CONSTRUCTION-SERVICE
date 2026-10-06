import { Search, X } from 'lucide-react-native'
import { useMemo, useState } from 'react'
import { ActivityIndicator, FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useCategories, useProjectList } from '../../src/api/content'
import type { ProjectStatus } from '../../src/api/types'
import { ProjectCard, ProjectCardSkeleton, fromProject } from '../../src/components/projects/ProjectCard'
import { Button } from '../../src/components/ui/Button'
import { Chip } from '../../src/components/ui/Chip'
import { PageHeader } from '../../src/components/ui/PageHeader'
import { EmptyState, ErrorState, LoadingBlock } from '../../src/components/ui/States'
import { Text } from '../../src/components/ui/Text'
import { useDebouncedValue } from '../../src/lib/useDebouncedValue'
import { colors, fonts, layout, space } from '../../src/theme'

const statuses: { value: ProjectStatus | undefined; label: string }[] = [
  { value: undefined, label: 'All' },
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'completed', label: 'Completed' },
]

export default function ProjectsScreen() {
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

  const header = (
    <View>
      <PageHeader eyebrow="Portfolio" title="Projects" intro="Residential, commercial and real estate work by BRIGHTHOMES." />
      <View style={styles.searchWrap}>
        <Search size={18} color={colors.stone500} strokeWidth={1.6} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search projects"
          placeholderTextColor={colors.stone500}
          accessibilityLabel="Search projects"
          returnKeyType="search"
          autoCorrect={false}
          selectionColor={colors.bronze}
          style={styles.search}
        />
        {search ? (
          <Pressable onPress={() => setSearch('')} accessibilityRole="button" accessibilityLabel="Clear search" hitSlop={8} style={styles.clear}>
            <X size={18} color={colors.stone600} strokeWidth={1.6} />
          </Pressable>
        ) : null}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips} accessibilityLabel="Filter by status">
        {statuses.map((option) => (
          <Chip key={option.label} label={option.label} selected={status === option.value} onPress={() => setStatus(option.value)} accessibilityLabel={`Status: ${option.label}`} />
        ))}
      </ScrollView>
      {categories.data?.length ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips} accessibilityLabel="Filter by category">
          <Chip label="All categories" selected={category === undefined} onPress={() => setCategory(undefined)} />
          {categories.data.map((item) => (
            <Chip key={item.id} label={item.name} selected={category === item.id} onPress={() => setCategory(item.id)} accessibilityLabel={`Category: ${item.name}`} />
          ))}
        </ScrollView>
      ) : null}
      <View style={styles.countRow}>
        <Text variant="small" color={colors.stone500} accessibilityLiveRegion="polite">
          {total === undefined ? ' ' : `${total} ${total === 1 ? 'project' : 'projects'}`}
        </Text>
        {projects.isFetching && !projects.isFetchingNextPage && !refreshing && !projects.isPending ? <ActivityIndicator size="small" color={colors.bronzeDark} /> : null}
      </View>
    </View>
  )

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <FlatList
        data={items}
        keyExtractor={(project) => String(project.id)}
        ListHeaderComponent={header}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={styles.list}
        renderItem={({ item }) => <ProjectCard project={fromProject(item)} style={styles.card} />}
        onEndReached={() => projects.hasNextPage && !projects.isFetchingNextPage && projects.fetchNextPage()}
        onEndReachedThreshold={0.6}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.bronzeDark} colors={[colors.bronzeDark]} />}
        ListEmptyComponent={
          projects.isPending ? (
            <LoadingBlock label="Loading projects">
              <ProjectCardSkeleton style={styles.card} />
              <ProjectCardSkeleton style={styles.card} />
            </LoadingBlock>
          ) : projects.isError ? (
            <ErrorState error={projects.error} onRetry={() => projects.refetch()} style={styles.state} />
          ) : filtered ? (
            <EmptyState title="No matching projects" message="Try a different search or clear the filters." action={<Button label="Clear filters" variant="secondary" onPress={clearFilters} />} style={styles.state} />
          ) : (
            <EmptyState title="No projects published yet" message="Projects will appear here as soon as they are published." style={styles.state} />
          )
        }
        ListFooterComponent={
          projects.isFetchingNextPage ? (
            <ActivityIndicator color={colors.bronzeDark} style={styles.footer} accessibilityLabel="Loading more projects" />
          ) : projects.isFetchNextPageError ? (
            <ErrorState title="Couldn’t load more projects" error={projects.error} onRetry={() => projects.fetchNextPage()} style={styles.state} />
          ) : null
        }
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  list: { paddingBottom: space.xxxl },
  searchWrap: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginHorizontal: layout.gutter, paddingLeft: 14, minHeight: 50, borderWidth: 1, borderColor: colors.stone300, backgroundColor: colors.white, borderRadius: layout.radius },
  search: { flex: 1, minHeight: 48, fontFamily: fonts.regular, fontSize: 16, color: colors.ink },
  clear: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  chips: { paddingHorizontal: layout.gutter, gap: space.sm, paddingTop: space.md },
  countRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: layout.gutter, marginTop: space.lg, marginBottom: space.sm, minHeight: 22, borderBottomWidth: 1, borderBottomColor: colors.stone200, paddingBottom: space.sm },
  card: { marginHorizontal: layout.gutter, marginTop: space.xl },
  state: { marginHorizontal: layout.gutter, marginTop: space.lg },
  footer: { marginVertical: space.xl },
})
