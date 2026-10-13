import { router } from 'expo-router'
import { Bath, BedDouble, Ruler } from 'lucide-react-native'
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native'

import type { GalleryImage, ListingType, PriceDisplay, Property, PropertyStatus, PropertySummary } from '../../api/types'
import { formatPrice, listingTypeLabels, propertyStatusLabels } from '../../lib/property'
import { useContentWidth } from '../../lib/useContentWidth'
import { layout, space, useTheme } from '../../theme'
import { IllustrativeTag, StatusLabel, type Tone } from '../ui/Badges'
import { Skeleton } from '../ui/States'
import { Text } from '../ui/Text'
import { SwipePhotos } from '../media/SwipePhotos'
import { SaveButton } from './SaveButton'

/** The fields a card needs, from either a full property or an embedded summary. */
export type CardProperty = {
  id: number
  slug: string
  title: string
  category: string
  listing_type: ListingType
  status: PropertyStatus
  price: string | null
  price_display: PriceDisplay
  location: string
  bedrooms: number | null
  bathrooms: number | null
  size: string
  is_demo: boolean
  images: GalleryImage[]
}

export const fromProperty = (property: Property): CardProperty => ({
  id: property.id,
  slug: property.slug,
  title: property.title,
  category: property.category.name,
  listing_type: property.listing_type,
  status: property.status,
  price: property.price,
  price_display: property.price_display,
  location: property.location,
  bedrooms: property.bedrooms,
  bathrooms: property.bathrooms,
  size: property.building_size || property.land_size,
  is_demo: property.is_demo,
  images: property.images,
})

export const fromPropertySummary = (property: PropertySummary): CardProperty => ({
  id: property.id,
  slug: property.slug,
  title: property.title,
  category: property.category,
  listing_type: property.listing_type,
  status: property.status,
  price: property.price,
  price_display: property.price_display,
  location: property.location,
  bedrooms: null,
  bathrooms: null,
  size: '',
  is_demo: property.is_demo,
  images: property.cover_image ? [property.cover_image] : [],
})

const statusTones: Record<PropertyStatus, Tone> = {
  available: 'success',
  reserved: 'accent',
  sold: 'neutral',
  rented: 'neutral',
  coming_soon: 'accent',
  unavailable: 'neutral',
}

/** Availability as shown to clients. Illustrative records make no availability claim. */
export function PropertyAvailability({ property }: { property: Pick<CardProperty, 'status' | 'is_demo'> }) {
  if (property.is_demo) return <IllustrativeTag />
  const label = propertyStatusLabels[property.status]
  return <StatusLabel label={label} tone={statusTones[property.status]} accessibilityLabel={`Availability: ${label}`} />
}

/** "House · For sale"; illustrative records omit the listing type, since nothing is listed. */
export const propertyEyebrow = (property: Pick<CardProperty, 'category' | 'listing_type' | 'is_demo'>) =>
  property.is_demo ? property.category : `${property.category} · ${listingTypeLabels[property.listing_type]}`

/** Illustrative records carry no price at all, not even "on request". */
export const cardPrice = (property: Pick<CardProperty, 'is_demo' | 'price' | 'price_display'>) => (property.is_demo ? 'Example listing' : formatPrice(property))

/** Bed, bath and size as a compact icon row; renders nothing when no specification is recorded. */
export function SpecIcons({ property }: { property: Pick<CardProperty, 'bedrooms' | 'bathrooms' | 'size'> }) {
  const { colors } = useTheme()
  const items = [
    property.bedrooms != null ? { icon: BedDouble, label: `${property.bedrooms}`, a11y: `${property.bedrooms} bedrooms` } : null,
    property.bathrooms != null ? { icon: Bath, label: `${property.bathrooms}`, a11y: `${property.bathrooms} bathrooms` } : null,
    property.size ? { icon: Ruler, label: property.size, a11y: property.size } : null,
  ].filter((item) => item !== null)
  if (!items.length) return null
  return (
    <View style={styles.specs} accessible accessibilityLabel={items.map((item) => item.a11y).join(', ')}>
      {items.map((item) => (
        <View key={item.a11y} style={styles.spec}>
          <item.icon size={15} color={colors.textMuted} strokeWidth={1.4} />
          <Text variant="caption" color={colors.textMuted}>
            {item.label}
          </Text>
        </View>
      ))}
    </View>
  )
}

type Props = {
  property: CardProperty
  /** list: swipeable photos, full width. feature: carousel card with the cover only. */
  variant?: 'list' | 'feature'
  /** Card width; defaults to the full content column. */
  width?: number
  style?: StyleProp<ViewStyle>
}

export function PropertyCard({ property, variant = 'list', width, style }: Props) {
  const { width: contentWidth } = useContentWidth()
  const { colors } = useTheme()
  const feature = variant === 'feature'
  const open = () => router.push(`/properties/${property.slug}`)
  const price = cardPrice(property)
  const a11yLabel = [property.title, property.is_demo ? 'Illustrative listing' : propertyStatusLabels[property.status], propertyEyebrow(property), property.location || null, price].filter(Boolean).join(', ')
  const photoWidth = width ?? contentWidth - layout.gutter * 2

  return (
    <View style={[{ width: photoWidth }, style]}>
      {feature ? (
        <Pressable onPress={open} accessibilityRole="link" accessibilityLabel={a11yLabel} style={({ pressed }) => pressed && styles.pressed}>
          <SwipePhotos images={property.images.slice(0, 1)} width={photoWidth} height={photoWidth * 0.8} title={property.title} seed={property.id + 1}>
            {property.is_demo ? (
              <View style={styles.tag}>
                <IllustrativeTag overImage />
              </View>
            ) : null}
          </SwipePhotos>
        </Pressable>
      ) : (
        <SwipePhotos images={property.images} width={photoWidth} height={photoWidth * 0.72} title={property.title} seed={property.id + 1} onPress={open} accessibilityHint="Opens the property">
          {property.is_demo ? (
            <View style={styles.tag} pointerEvents="none">
              <IllustrativeTag overImage />
            </View>
          ) : null}
        </SwipePhotos>
      )}
      <Pressable onPress={open} accessibilityRole="link" accessibilityLabel={a11yLabel} accessibilityHint="Opens the property" style={({ pressed }) => [styles.body, pressed && styles.pressed]}>
        <View style={styles.titleRow}>
          <Text variant="subheading" numberOfLines={1} style={styles.shrink}>
            {property.title}
          </Text>
          {feature ? null : <PropertyAvailability property={property} />}
        </View>
        <Text variant="caption" color={colors.textSubtle} numberOfLines={1}>
          {[propertyEyebrow(property), property.location || null].filter(Boolean).join(' · ')}
        </Text>
        <View style={styles.priceRow}>
          <Text variant="label" style={styles.shrink}>
            {price}
          </Text>
          {feature ? null : <SpecIcons property={property} />}
        </View>
      </Pressable>
      <View style={styles.save}>
        <SaveButton kind="properties" itemId={property.id} title={property.title} />
      </View>
    </View>
  )
}

export function PropertyCardSkeleton({ variant = 'list', style }: { variant?: 'list' | 'feature'; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={style}>
      <Skeleton height="auto" style={{ aspectRatio: variant === 'feature' ? 5 / 4 : 1 / 0.72 }} />
      <View style={styles.body}>
        <Skeleton width="65%" height={20} />
        <Skeleton width="45%" height={12} />
        <Skeleton width="35%" height={14} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.85 },
  body: { paddingTop: space.md, gap: 4 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.md },
  shrink: { flexShrink: 1 },
  priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.md, marginTop: 2 },
  specs: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  spec: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  tag: { position: 'absolute', top: space.md, left: space.md },
  save: { position: 'absolute', top: space.sm, right: space.sm },
})
