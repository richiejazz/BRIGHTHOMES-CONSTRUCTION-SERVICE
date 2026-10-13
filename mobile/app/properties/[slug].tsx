import { router, useLocalSearchParams } from 'expo-router'
import { Bath, BedDouble, Check, LandPlot, MessageSquareText, Ruler } from 'lucide-react-native'
import { ScrollView, StyleSheet, View } from 'react-native'

import { useProperty } from '../../src/api/content'
import type { Property } from '../../src/api/types'
import { DetailScaffold, DetailSection, IllustrativeNotice } from '../../src/components/content/DetailScaffold'
import { PropertyAvailability, propertyEyebrow } from '../../src/components/content/PropertyCard'
import { SaveButton } from '../../src/components/content/SaveButton'
import { Button } from '../../src/components/ui/Button'
import { FactRow } from '../../src/components/ui/Editorial'
import { ExpandableText } from '../../src/components/ui/ExpandableText'
import { Text } from '../../src/components/ui/Text'
import { formatPrice, listingTypeLabels, propertyStatusLabels } from '../../src/lib/property'
import { layout, makeStyles, space, useTheme } from '../../src/theme'

export default function PropertyDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>()
  const query = useProperty(slug)
  const enquire = (data: Property) => router.push({ pathname: '/enquire', params: { property: data.slug } })
  return (
    <DetailScaffold
      query={query}
      noun="Property"
      fallback={{ pathname: '/explore', params: { section: 'properties' } }}
      browseLabel="Browse properties"
      seed={(data) => data.id + 1}
      title={(data) => data.title}
      images={(data) => data.images}
      actions={(data) => <SaveButton kind="properties" itemId={data.id} title={data.title} />}
      footer={(data) => (
        <>
          <SaveButton kind="properties" itemId={data.id} title={data.title} variant="button" />
          <Button label="Enquire" accessibilityLabel="Enquire about this property" icon={MessageSquareText} onPress={() => enquire(data)} style={styles.grow} />
        </>
      )}
    >
      {(data) => <PropertyPresentation property={data} onEnquire={() => enquire(data)} />}
    </DetailScaffold>
  )
}

function PropertyPresentation({ property, onEnquire }: { property: Property; onEnquire: () => void }) {
  const themed = useStyles()
  const { colors } = useTheme()
  const card = { category: property.category.name, listing_type: property.listing_type, is_demo: property.is_demo, status: property.status }
  const specs = [
    property.bedrooms != null ? { icon: BedDouble, label: 'Bedrooms', value: String(property.bedrooms) } : null,
    property.bathrooms != null ? { icon: Bath, label: 'Bathrooms', value: String(property.bathrooms) } : null,
    property.building_size ? { icon: Ruler, label: 'Building', value: property.building_size } : null,
    property.land_size ? { icon: LandPlot, label: 'Land', value: property.land_size } : null,
  ].filter((spec) => spec !== null)
  const information = [
    { label: 'Property type', value: property.category.name },
    property.is_demo ? null : { label: 'Listing', value: listingTypeLabels[property.listing_type] },
    property.is_demo ? null : { label: 'Availability', value: propertyStatusLabels[property.status] },
    property.address ? { label: 'Address', value: property.address } : null,
  ].filter((row): row is { label: string; value: string } => row !== null)

  return (
    <>
      <View style={themed.meta}>
        <Text variant="caption" color={colors.textSubtle} style={themed.grow} numberOfLines={1}>
          {[propertyEyebrow(card), property.location || null].filter(Boolean).join(' · ')}
        </Text>
        {/* Illustrative records get the full notice below instead of a status tag. */}
        {property.is_demo ? null : <PropertyAvailability property={card} />}
      </View>
      <Text variant="title">{property.title}</Text>
      {property.is_demo ? null : (
        <Text variant="heading" accessibilityLabel={`${property.price_display === 'from' ? 'Guide price' : 'Price'}: ${formatPrice(property)}`}>
          {formatPrice(property)}
        </Text>
      )}

      {specs.length ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={themed.specs} style={themed.bleed} accessibilityLabel="Key specifications">
          {specs.map((spec) => (
            <View key={spec.label} style={themed.spec} accessible accessibilityLabel={`${spec.label}: ${spec.value}`}>
              <spec.icon size={20} color={colors.accent} strokeWidth={1.4} />
              <Text variant="label" numberOfLines={1}>
                {spec.value}
              </Text>
              <Text variant="caption" color={colors.textSubtle}>
                {spec.label}
              </Text>
            </View>
          ))}
        </ScrollView>
      ) : null}

      {property.is_demo ? <IllustrativeNotice noun="listing" /> : null}

      <DetailSection title="About this property">
        <Text variant="label">{property.summary}</Text>
        <ExpandableText>{property.description}</ExpandableText>
      </DetailSection>

      {property.features.length ? (
        <DetailSection title="Features">
          <View style={themed.features}>
            {property.features.map((feature) => (
              <View key={feature} style={themed.feature}>
                <Check size={14} color={colors.accent} strokeWidth={2} />
                <Text variant="small" color={colors.text}>
                  {feature}
                </Text>
              </View>
            ))}
          </View>
        </DetailSection>
      ) : null}

      <DetailSection title="Details">
        <View style={themed.facts}>
          {information.map((row, index) => (
            <FactRow key={row.label} label={row.label} value={row.value} last={index === information.length - 1} />
          ))}
        </View>
      </DetailSection>

      <View style={themed.interest}>
        <Text variant="heading">Interested in this property?</Text>
        <Text variant="small">Ask a question, arrange a viewing, or book time with our real estate team.</Text>
        <Button label="Enquire about property" icon={MessageSquareText} onPress={onEnquire} fullWidth />
        <Button label="Request a consultation" variant="secondary" onPress={() => router.push({ pathname: '/consultation', params: { property: property.slug } })} fullWidth />
      </View>
    </>
  )
}

const styles = StyleSheet.create({ grow: { flex: 1 } })

const useStyles = makeStyles((c) =>
  StyleSheet.create({
    grow: { flex: 1 },
    meta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.md },
    bleed: { marginHorizontal: -layout.gutter, marginTop: space.sm },
    specs: { paddingHorizontal: layout.gutter, gap: space.sm },
    spec: { width: 104, padding: space.md, gap: 4, backgroundColor: c.surface },
    facts: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.border },
    features: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
    feature: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: space.md, minHeight: 34, backgroundColor: c.surface },
    interest: { marginTop: space.xxl, gap: space.md, padding: space.lg, backgroundColor: c.surface },
  }),
)
