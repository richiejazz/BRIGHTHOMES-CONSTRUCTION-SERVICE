import { router } from 'expo-router'
import { ArrowRight } from 'lucide-react-native'
import { ScrollView, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useAchievements } from '../src/api/content'
import { BlueprintGrid } from '../src/components/brand/Elevation'
import { Wordmark } from '../src/components/brand/Logo'
import { Button } from '../src/components/ui/Button'
import { SectionHeader } from '../src/components/ui/SectionHeader'
import { ErrorState, LoadingBlock, Skeleton } from '../src/components/ui/States'
import { Text } from '../src/components/ui/Text'
import { company, objectives, trustPillars } from '../src/content/company'
import { padIndex } from '../src/lib/format'
import { colors, fonts, layout, space } from '../src/theme'

export default function AboutScreen() {
  const insets = useSafeAreaInsets()
  const achievements = useAchievements()

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: insets.bottom + space.xxxl }}>
      <View style={styles.hero}>
        <BlueprintGrid />
        <Wordmark />
        <Text variant="hero" color={colors.paper}>
          {company.tagline}
        </Text>
        <Text variant="body" color={colors.stone300}>
          {company.description}
        </Text>
      </View>

      <View style={styles.section}>
        <SectionHeader eyebrow="Two sides of one company" title="Construction and real estate" />
        <View style={[styles.inset, styles.split]}>
          <View style={styles.splitItem}>
            <Text variant="heading">Construction services</Text>
            <Text variant="body">Architectural and structural drawing, survey plans, building approval, site supervision, construction management and renovation.</Text>
          </View>
          <View style={styles.splitItem}>
            <Text variant="heading">Real estate</Text>
            <Text variant="body">Real estate services across residential and commercial property.</Text>
          </View>
          <Button label="Explore our services" variant="link" icon={ArrowRight} iconAfter onPress={() => router.push('/services')} />
        </View>
      </View>

      <View style={styles.section}>
        <SectionHeader eyebrow="Our objectives" title="What guides our work" />
        <View style={styles.inset}>
          {objectives.map((objective, index) => (
            <View key={objective.title} style={styles.objective}>
              <Text style={styles.number}>{padIndex(index)}</Text>
              <View style={styles.objectiveCopy}>
                <Text variant="heading">{objective.title}</Text>
                <Text variant="body">{objective.body}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.trust}>
        <BlueprintGrid />
        <SectionHeader eyebrow="Track record" title="Why clients trust BRIGHTHOMES" tone="dark" />
        {achievements.isPending ? (
          <LoadingBlock label="Loading achievements" style={styles.stats}>
            {[0, 1, 2].map((key) => (
              <Skeleton key={key} height={64} style={styles.statSkeleton} />
            ))}
          </LoadingBlock>
        ) : achievements.isError ? (
          <ErrorState error={achievements.error} onRetry={() => achievements.refetch()} tone="dark" style={styles.inset} />
        ) : (
          <View style={styles.stats}>
            {achievements.data.map((achievement) => (
              <View key={achievement.id} style={styles.stat} accessible accessibilityLabel={`${achievement.value} ${achievement.label}`}>
                <Text style={styles.statValue}>{achievement.value}</Text>
                <Text variant="small" color={colors.stone300}>
                  {achievement.label}
                </Text>
              </View>
            ))}
          </View>
        )}
        <View style={[styles.inset, styles.pillars]}>
          {trustPillars.map((pillar) => (
            <View key={pillar.title} style={styles.pillar}>
              <Text variant="heading" color={colors.paper}>
                {pillar.title}
              </Text>
              <Text variant="body" color={colors.stone300}>
                {pillar.body}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={[styles.inset, styles.cta]}>
        <Text variant="title">Talk to our team</Text>
        <Text variant="body">{company.address.text}</Text>
        <Button label="Contact BRIGHTHOMES" onPress={() => router.push('/contact')} fullWidth />
        <Button label="Request a consultation" variant="secondary" onPress={() => router.push('/consultation')} fullWidth />
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  inset: { marginHorizontal: layout.gutter },
  hero: { backgroundColor: colors.ink, paddingHorizontal: layout.gutter, paddingVertical: space.xxxl, gap: space.xl, overflow: 'hidden' },
  section: { marginTop: space.xxxl, gap: space.xl },
  split: { gap: space.xl },
  splitItem: { gap: space.sm, borderLeftWidth: 1, borderLeftColor: colors.bronze, paddingLeft: space.lg },
  objective: { flexDirection: 'row', gap: space.lg, paddingVertical: space.lg, borderTopWidth: 1, borderTopColor: colors.stone300 },
  number: { fontFamily: fonts.semibold, fontSize: 12, letterSpacing: 1.5, color: colors.bronzeDark, width: 22, marginTop: 6 },
  objectiveCopy: { flex: 1, gap: space.xs },
  trust: { marginTop: space.xxxl, backgroundColor: colors.ink, paddingVertical: space.xxxl, gap: space.xl, overflow: 'hidden' },
  stats: { flexDirection: 'row', marginHorizontal: layout.gutter, borderTopWidth: 1, borderTopColor: 'rgba(201,164,106,0.35)' },
  stat: { flex: 1, paddingTop: space.lg, paddingRight: space.sm, gap: space.xs },
  statSkeleton: { flex: 1, marginTop: space.lg, marginRight: space.sm, opacity: 0.2 },
  statValue: { fontFamily: fonts.display, fontSize: 40, lineHeight: 44, color: colors.bronzeLight },
  pillars: { gap: space.xl },
  pillar: { gap: space.sm, borderLeftWidth: 1, borderLeftColor: colors.bronze, paddingLeft: space.lg },
  cta: { marginTop: space.xxxl, gap: space.md },
})
