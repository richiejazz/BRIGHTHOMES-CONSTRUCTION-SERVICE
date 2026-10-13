import { useLocalSearchParams } from 'expo-router'
import { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { ProjectBrowser } from '../../src/components/explore/ProjectBrowser'
import { PropertyBrowser } from '../../src/components/explore/PropertyBrowser'
import { ServiceBrowser } from '../../src/components/explore/ServiceBrowser'
import { Segmented, type SegmentOption } from '../../src/components/ui/Chip'
import { ScreenHeader } from '../../src/components/ui/Editorial'
import { makeStyles, space } from '../../src/theme'

type Section = 'projects' | 'properties' | 'services'

const sections: SegmentOption<Section>[] = [
  { value: 'properties', label: 'Properties' },
  { value: 'projects', label: 'Projects' },
  { value: 'services', label: 'Services' },
]

const isSection = (value: unknown): value is Section => sections.some((section) => section.value === value)

export default function ExploreScreen() {
  const styles = useStyles()
  const params = useLocalSearchParams<{ section?: string; focus?: string }>()
  const [section, setSection] = useState<Section>(isSection(params.section) ? params.section : 'properties')

  // Follow links such as Home → Real Estate while this tab is already mounted.
  useEffect(() => {
    if (isSection(params.section)) setSection(params.section)
  }, [params.section])

  const focus = params.focus === '1'
  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      {/* Pinned: the title and section switch stay put while results scroll beneath. */}
      <View style={styles.bar}>
        <ScreenHeader title="Explore" />
        <Segmented options={sections} value={section} onChange={setSection} accessibilityLabel="Explore sections" />
      </View>
      <View style={styles.flex}>{section === 'projects' ? <ProjectBrowser autoFocus={focus} /> : section === 'properties' ? <PropertyBrowser autoFocus={focus} /> : <ServiceBrowser />}</View>
    </SafeAreaView>
  )
}

const useStyles = makeStyles((c) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.background },
    flex: { flex: 1 },
    bar: { paddingBottom: space.sm, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.border, backgroundColor: c.background },
  }),
)
