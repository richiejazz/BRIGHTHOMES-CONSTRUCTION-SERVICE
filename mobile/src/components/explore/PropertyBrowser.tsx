import { SlidersHorizontal } from 'lucide-react-native'
import { useMemo, useState } from 'react'
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, View } from 'react-native'

import { usePropertyList, usePropertyTypes, type PropertyListParams } from '../../api/content'
import type { ListingType, PropertyStatus } from '../../api/types'
import { listingTypeLabels, propertyStatusLabels } from '../../lib/property'
import { useDebouncedValue } from '../../lib/useDebouncedValue'
import { fonts, space, useTheme } from '../../theme'
import { PropertyCard, PropertyCardSkeleton, fromProperty } from '../content/PropertyCard'
import { BottomSheet } from '../ui/BottomSheet'
import { Button } from '../ui/Button'
import { Chip } from '../ui/Chip'
import { SearchField } from '../ui/SearchField'
import { EmptyState, ErrorState, LoadingBlock } from '../ui/States'
import { Text } from '../ui/Text'
import { TextField } from '../ui/TextField'
import { ChipRow, ResultCount, useBrowserStyles } from './BrowserParts'

type SheetFilters = { location: string; minPrice: string; maxPrice: string; minBedrooms?: number; status?: PropertyStatus }

const emptySheet: SheetFilters = { location: '', minPrice: '', maxPrice: '' }
const listingTypes = Object.keys(listingTypeLabels) as ListingType[]
const statuses: PropertyStatus[] = ['available', 'reserved', 'coming_soon']
const bedroomOptions = [1, 2, 3, 4, 5]

const toAmount = (value: string) => {
  const digits = value.replace(/[^\d]/g, '')
  return digits ? Number(digits) : undefined
}

/** Real-estate listings with search, quick filters and a full filter sheet. */
export function PropertyBrowser({ autoFocus = false }: { autoFocus?: boolean }) {
  const styles = useBrowserStyles()
  const { colors } = useTheme()
  const [search, setSearch] = useState('')
  const [listingType, setListingType] = useState<ListingType>()
  const [category, setCategory] = useState<number>()
  const [applied, setApplied] = useState<SheetFilters>(emptySheet)
  const [draft, setDraft] = useState<SheetFilters>(emptySheet)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const debouncedSearch = useDebouncedValue(search.trim())

  const params = useMemo<PropertyListParams>(
    () => ({
      search: debouncedSearch || undefined,
      listing_type: listingType,
      category,
      location: applied.location.trim() || undefined,
      min_price: toAmount(applied.minPrice),
      max_price: toAmount(applied.maxPrice),
      min_bedrooms: applied.minBedrooms,
      status: applied.status,
    }),
    [debouncedSearch, listingType, category, applied],
  )
  const properties = usePropertyList(params)
  const types = usePropertyTypes()

  const items = properties.data?.pages.flatMap((page) => page.results) ?? []
  const total = properties.data?.pages[0]?.count
  const sheetCount = [applied.location.trim(), applied.minPrice, applied.maxPrice, applied.minBedrooms, applied.status].filter(Boolean).length
  const filtered = Boolean(params.search || listingType || category || sheetCount)

  const clearAll = () => {
    setSearch('')
    setListingType(undefined)
    setCategory(undefined)
    setApplied(emptySheet)
    setDraft(emptySheet)
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await Promise.all([properties.refetch(), types.refetch()])
    setRefreshing(false)
  }

  const listHeader = (
    <View>
      <View style={styles.filters}>
        <SearchField value={search} onChangeText={setSearch} placeholder="Search properties" autoFocus={autoFocus} />
        <ChipRow label="Filter by listing type">
          <Chip label="All" selected={listingType === undefined} onPress={() => setListingType(undefined)} accessibilityLabel="All listing types" />
          {listingTypes.map((value) => (
            <Chip key={value} label={listingTypeLabels[value]} selected={listingType === value} onPress={() => setListingType(value)} />
          ))}
        </ChipRow>
        {types.data?.length ? (
          <ChipRow label="Filter by property type">
            <Chip label="All types" selected={category === undefined} onPress={() => setCategory(undefined)} />
            {types.data.map((type) => (
              <Chip key={type.id} label={type.name} selected={category === type.id} onPress={() => setCategory(type.id)} accessibilityLabel={`Property type: ${type.name}`} />
            ))}
          </ChipRow>
        ) : null}
      </View>
      <ResultCount
        total={total}
        noun="property"
        plural="properties"
        fetching={properties.isFetching && !properties.isFetchingNextPage && !refreshing && !properties.isPending}
        actions={
          <Pressable
            onPress={() => {
              setDraft(applied)
              setSheetOpen(true)
            }}
            accessibilityRole="button"
            accessibilityLabel={`More filters${sheetCount ? `, ${sheetCount} applied` : ''}`}
            hitSlop={6}
            style={localStyles.filterButton}
          >
            <SlidersHorizontal size={16} color={colors.text} strokeWidth={1.5} />
            <Text style={[localStyles.filterText, { color: colors.text }]}>{sheetCount ? `Filters · ${sheetCount}` : 'Filters'}</Text>
          </Pressable>
        }
      />
    </View>
  )

  return (
    <>
      <FlatList
        data={items}
        keyExtractor={(property) => String(property.id)}
        ListHeaderComponent={listHeader}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={styles.list}
        renderItem={({ item }) => <PropertyCard property={fromProperty(item)} style={styles.card} />}
        onEndReached={() => properties.hasNextPage && !properties.isFetchingNextPage && properties.fetchNextPage()}
        onEndReachedThreshold={0.6}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} colors={[colors.accent]} />}
        ListEmptyComponent={
          properties.isPending ? (
            <LoadingBlock label="Loading properties">
              <PropertyCardSkeleton style={styles.card} />
              <PropertyCardSkeleton style={styles.card} />
            </LoadingBlock>
          ) : properties.isError ? (
            <ErrorState error={properties.error} onRetry={() => properties.refetch()} style={styles.state} />
          ) : filtered ? (
            <EmptyState title="No matching properties" message="Try a different search, or clear the filters to see every listing." action={<Button label="Clear filters" size="compact" variant="secondary" onPress={clearAll} />} style={styles.state} />
          ) : (
            <EmptyState title="Listings are being prepared" message="Properties will appear here as soon as they are published. Speak to our team about your requirements in the meantime." style={styles.state} />
          )
        }
        ListFooterComponent={
          properties.isFetchingNextPage ? (
            <ActivityIndicator color={colors.accent} style={styles.footer} accessibilityLabel="Loading more properties" />
          ) : properties.isFetchNextPageError ? (
            <ErrorState title="Couldn’t load more properties" error={properties.error} onRetry={() => properties.fetchNextPage()} style={styles.state} />
          ) : null
        }
      />

      <BottomSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        eyebrow="Real estate"
        title="Filter properties"
        footer={
          <View style={localStyles.sheetActions}>
            <Button label="Reset" variant="secondary" size="compact" onPress={() => setDraft(emptySheet)} />
            <Button
              label="Show results"
              size="compact"
              style={localStyles.grow}
              onPress={() => {
                setApplied(draft)
                setSheetOpen(false)
              }}
            />
          </View>
        }
      >
        <TextField label="Location" optional value={draft.location} onChangeText={(location) => setDraft((current) => ({ ...current, location }))} placeholder="For example, Lekki" autoCorrect={false} />
        <View style={localStyles.priceRow}>
          <View style={localStyles.grow}>
            <TextField label="Min price (₦)" optional value={draft.minPrice} onChangeText={(minPrice) => setDraft((current) => ({ ...current, minPrice }))} keyboardType="number-pad" placeholder="Any" />
          </View>
          <View style={localStyles.grow}>
            <TextField label="Max price (₦)" optional value={draft.maxPrice} onChangeText={(maxPrice) => setDraft((current) => ({ ...current, maxPrice }))} keyboardType="number-pad" placeholder="Any" />
          </View>
        </View>
        <Text variant="caption" color={colors.textSubtle}>
          Listings with the price on request aren’t included when you filter by price.
        </Text>
        <View style={localStyles.group}>
          <Text variant="eyebrow" color={colors.text}>
            Bedrooms
          </Text>
          <View style={localStyles.wrapRow}>
            <Chip label="Any" selected={draft.minBedrooms === undefined} onPress={() => setDraft((current) => ({ ...current, minBedrooms: undefined }))} accessibilityLabel="Any number of bedrooms" />
            {bedroomOptions.map((count) => (
              <Chip key={count} label={`${count}+`} selected={draft.minBedrooms === count} onPress={() => setDraft((current) => ({ ...current, minBedrooms: count }))} accessibilityLabel={`${count} or more bedrooms`} />
            ))}
          </View>
        </View>
        <View style={localStyles.group}>
          <Text variant="eyebrow" color={colors.text}>
            Availability
          </Text>
          <View style={localStyles.wrapRow}>
            <Chip label="Any" selected={draft.status === undefined} onPress={() => setDraft((current) => ({ ...current, status: undefined }))} accessibilityLabel="Any availability" />
            {statuses.map((value) => (
              <Chip key={value} label={propertyStatusLabels[value]} selected={draft.status === value} onPress={() => setDraft((current) => ({ ...current, status: value }))} />
            ))}
          </View>
        </View>
      </BottomSheet>
    </>
  )
}

const localStyles = StyleSheet.create({
  filterButton: { flexDirection: 'row', alignItems: 'center', gap: space.sm, minHeight: 44 },
  filterText: { fontFamily: fonts.semibold, fontSize: 11, letterSpacing: 1.6, textTransform: 'uppercase' },
  priceRow: { flexDirection: 'row', gap: space.md },
  grow: { flex: 1 },
  group: { gap: space.md },
  wrapRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  sheetActions: { flexDirection: 'row', gap: space.md },
})
