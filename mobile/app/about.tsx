import { router } from 'expo-router'
import { useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useAchievements } from '../src/api/content'
import { BlueprintGrid } from '../src/components/brand/Elevation'
import { Wordmark } from '../src/components/brand/Logo'
import { EditorialPhoto, Reveal, Scrim } from '../src/components/media/Media'
import { Button } from '../src/components/ui/Button'
import { Eyebrow, SectionHeader, TextLink } from '../src/components/ui/Editorial'
import { CondensedBar, FloatingBack } from '../src/components/ui/ScreenChrome'
import { ErrorState, LoadingBlock, Skeleton } from '../src/components/ui/States'
import { Text } from '../src/components/ui/Text'
import { company, objectives, trustPillars } from '../src/content/company'
import { editorial } from '../src/content/media'
import { padIndex } from '../src/lib/format'
import { useContentWidth } from '../src/lib/useContentWidth'
import { useLightStatusBar } from '../src/lib/useStatusBar'
import { fonts, layout, makeStyles, onImage, space, useTheme } from '../src/theme'

export default function AboutScreen() {
  const insets = useSafeAreaInsets()
  const { height } = useContentWidth()
  const styles = useStyles()
  const { colors } = useTheme()
  const achievements = useAchievements()
  const [firstLine, secondLine] = company.tagline.split(', ')
  const heroHeight = Math.min(Math.max(380, height * 0.5), 460)
  const [condensed, setCondensed] = useState(false)
  useLightStatusBar(!condensed)

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + space.xxxl }} scrollEventThrottle={32} onScroll={(event) => setCondensed(event.nativeEvent.contentOffset.y > heroHeight - insets.top - 60)}>
        <EditorialPhoto source={editorial.cranes.source} alt={editorial.cranes.alt} priority="high" style={{ height: heroHeight }}>
          <Scrim from={0.55} mid={0.15} to={0.9} />
          <Reveal style={[styles.heroCopy, { paddingTop: insets.top + 72 }]}>
            <Wordmark tone="light" />
            <View style={styles.heroText}>
              <Eyebrow label="About" color={onImage.accent} ruleColor={onImage.accent} />
              <View accessible accessibilityRole="header" accessibilityLabel={company.tagline}>
                <Text variant="display" color={onImage.text} accessibilityRole="none">
                  {firstLine},
                </Text>
                <Text variant="display" color={onImage.accent} accessibilityRole="none" style={styles.italic}>
                  {secondLine}
                </Text>
              </View>
            </View>
          </Reveal>
        </EditorialPhoto>

        <View style={[styles.inset, styles.section]}>
          <Text variant="heading" style={styles.statement}>
            {company.description}
          </Text>
        </View>

        <View style={[styles.inset, styles.section]}>
          <SectionHeader eyebrow="Two disciplines" title="Construction and real estate, under one roof." />
          <View style={styles.split}>
            <View style={styles.splitItem}>
              <Text style={styles.index}>01</Text>
              <Text variant="heading">Construction services</Text>
              <Text variant="body">Architectural and structural drawing, survey plans, building approval, site supervision, construction management and renovation.</Text>
            </View>
            <View style={styles.splitItem}>
              <Text style={styles.index}>02</Text>
              <Text variant="heading">Real estate</Text>
              <Text variant="body">Real estate services across residential and commercial property.</Text>
            </View>
            <TextLink label="Explore our services" onPress={() => router.navigate({ pathname: '/explore', params: { section: 'services' } })} />
          </View>
        </View>

        <View style={[styles.inset, styles.section]}>
          <SectionHeader eyebrow="Our objectives" title="What guides our work." />
          <View style={styles.list}>
            {objectives.map((objective, index) => (
              <View key={objective.title} style={[styles.objective, index === 0 && styles.objectiveFirst]}>
                <Text style={styles.index}>{padIndex(index)}</Text>
                <View style={styles.objectiveCopy}>
                  <Text variant="subheading">{objective.title}</Text>
                  <Text variant="body">{objective.body}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.band, styles.section]}>
          <BlueprintGrid />
          <SectionHeader eyebrow="Track record" title="Why clients trust BRIGHTHOMES." tone="inverse" style={styles.inset} />
          <View style={[styles.inset, styles.stats]}>
            {achievements.isPending ? (
              <LoadingBlock label="Loading achievements">
                {[0, 1, 2].map((key) => (
                  <Skeleton key={key} height={56} style={styles.statSkeleton} />
                ))}
              </LoadingBlock>
            ) : achievements.isError ? (
              <ErrorState error={achievements.error} onRetry={() => achievements.refetch()} tone="inverse" />
            ) : (
              achievements.data.map((achievement) => (
                <View key={achievement.id} style={styles.stat} accessible accessibilityLabel={`${achievement.value} ${achievement.label}`}>
                  <Text variant="numeral" color={colors.inverse.accent} style={styles.statValue}>
                    {achievement.value}
                  </Text>
                  <Text variant="label" color={colors.inverse.text} style={styles.grow}>
                    {achievement.label}
                  </Text>
                </View>
              ))
            )}
          </View>
          <View style={[styles.inset, styles.pillars]}>
            {trustPillars.map((pillar) => (
              <View key={pillar.title} style={styles.pillar}>
                <Text variant="subheading" color={colors.inverse.text}>
                  {pillar.title}
                </Text>
                <Text variant="body" color={colors.inverse.textMuted}>
                  {pillar.body}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.inset, styles.section, styles.cta]}>
          <Eyebrow label="Visit or call" />
          <Text variant="title">Talk to our team.</Text>
          <Text variant="body">{company.address.text}</Text>
          <Button label="Contact BRIGHTHOMES" onPress={() => router.push('/contact')} fullWidth />
          <Button label="Request a consultation" variant="secondary" onPress={() => router.push('/consultation')} fullWidth />
          <Text variant="caption" color={colors.textSubtle}>
            Editorial photography, and anything marked Illustrative, is shown for inspiration and does not depict BRIGHTHOMES projects or listings.
          </Text>
        </View>
      </ScrollView>
      <CondensedBar title="About BRIGHTHOMES" visible={condensed} />
      <FloatingBack fallback="/" solid={condensed} />
    </View>
  )
}

const useStyles = makeStyles((c) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.background },
    inset: { marginHorizontal: layout.gutter },
    grow: { flex: 1 },
    heroCopy: { flex: 1, justifyContent: 'space-between', paddingHorizontal: layout.gutter, paddingBottom: space.xxl },
    heroText: { gap: space.lg },
    italic: { fontFamily: fonts.displayItalic },
    section: { marginTop: space.section },
    statement: { fontFamily: fonts.displayRegular },
    split: { marginTop: space.xl, gap: space.xl },
    splitItem: { gap: space.sm, borderTopWidth: 1, borderTopColor: c.borderStrong, paddingTop: space.lg },
    index: { fontFamily: fonts.displayItalic, fontSize: 24, lineHeight: 28, color: c.accentText, width: 36 },
    list: { marginTop: space.xl },
    objective: { flexDirection: 'row', gap: space.lg, paddingVertical: space.lg, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.border },
    objectiveFirst: { borderTopWidth: 1, borderTopColor: c.borderStrong },
    objectiveCopy: { flex: 1, gap: space.xs },
    band: { backgroundColor: c.inverse.background, paddingVertical: space.section, overflow: 'hidden' },
    stats: { marginTop: space.xl, borderTopWidth: 1, borderTopColor: c.inverse.border },
    stat: { flexDirection: 'row', alignItems: 'center', gap: space.lg, paddingVertical: space.lg, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.inverse.border },
    statValue: { width: 112 },
    statSkeleton: { marginTop: space.lg, opacity: 0.25 },
    pillars: { marginTop: space.xxl, gap: space.xl },
    pillar: { gap: space.sm, borderLeftWidth: 1, borderLeftColor: c.inverse.accent, paddingLeft: space.lg },
    cta: { gap: space.md, borderTopWidth: 1, borderTopColor: c.borderStrong, paddingTop: space.xl },
  }),
)
