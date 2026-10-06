import { router } from 'expo-router'
import { ArrowRight, Building2, CalendarClock, LayoutGrid, MessageSquareText, type LucideIcon } from 'lucide-react-native'
import { useState } from 'react'
import { FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useAchievements, useFeaturedProjects, useServices } from '../../src/api/content'
import { useAuth } from '../../src/auth/AuthProvider'
import { BlueprintGrid } from '../../src/components/brand/Elevation'
import { Wordmark } from '../../src/components/brand/Logo'
import { ProjectCard, ProjectCardSkeleton, fromProject } from '../../src/components/projects/ProjectCard'
import { ServiceRow, ServiceRowSkeleton } from '../../src/components/services/ServiceRow'
import { Button } from '../../src/components/ui/Button'
import { SectionHeader } from '../../src/components/ui/SectionHeader'
import { EmptyState, ErrorState, LoadingBlock, Skeleton } from '../../src/components/ui/States'
import { Text } from '../../src/components/ui/Text'
import { company, trustPillars } from '../../src/content/company'
import { greeting } from '../../src/lib/format'
import { colors, fonts, layout, space } from '../../src/theme'

type QuickAction = { label: string; hint: string; icon: LucideIcon; href: string }

const quickActions: QuickAction[] = [
  { label: 'Explore Projects', hint: 'Browse our portfolio', icon: Building2, href: '/projects' },
  { label: 'Services', hint: 'What we do', icon: LayoutGrid, href: '/services' },
  { label: 'Make an Enquiry', hint: 'Ask us anything', icon: MessageSquareText, href: '/enquire' },
  { label: 'Request Consultation', hint: 'Meet our team', icon: CalendarClock, href: '/consultation' },
]

export default function HomeScreen() {
  const insets = useSafeAreaInsets()
  const { width } = useWindowDimensions()
  const { user } = useAuth()
  const featured = useFeaturedProjects()
  const services = useServices()
  const achievements = useAchievements()
  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = async () => {
    setRefreshing(true)
    await Promise.all([featured.refetch(), services.refetch(), achievements.refetch()])
    setRefreshing(false)
  }

  const cardWidth = Math.min(320, width * 0.74)
  const hasDemo = featured.data?.some((project) => project.is_demo)

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: space.xxxl }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.bronzeLight} colors={[colors.bronzeDark]} progressViewOffset={insets.top} />}>
      {/* Hero */}
      <View style={[styles.hero, { paddingTop: insets.top + space.lg }]}>
        <BlueprintGrid />
        <View style={styles.heroTop}>
          <Wordmark />
          {user ? null : (
            <Pressable onPress={() => router.push('/login')} accessibilityRole="button" accessibilityLabel="Sign in" hitSlop={8} style={styles.signIn}>
              <Text style={styles.signInText}>Sign in</Text>
            </Pressable>
          )}
        </View>
        <View style={styles.heroCopy}>
          <View style={styles.eyebrowRow}>
            <View style={styles.heroRule} />
            <Text variant="eyebrow" color={colors.bronzeLight}>
              {user ? 'Welcome back' : 'Construction · Real Estate'}
            </Text>
          </View>
          <Text variant="hero" color={colors.paper}>
            {user ? `${greeting()}, ${user.first_name}.` : company.tagline}
          </Text>
          <Text variant="body" color={colors.stone300}>
            {user ? company.tagline + ' ' + company.positioning : company.positioning}
          </Text>
        </View>
      </View>

      {/* Quick actions */}
      <View style={styles.grid} accessibilityLabel="Quick actions">
        {quickActions.map((action) => (
          <Pressable key={action.label} onPress={() => router.push(action.href)} accessibilityRole="button" accessibilityLabel={action.label} accessibilityHint={action.hint} style={({ pressed }) => [styles.tile, pressed && styles.tilePressed]}>
            <action.icon size={22} color={colors.bronzeDark} strokeWidth={1.5} />
            <View style={styles.tileCopy}>
              <Text variant="label">{action.label}</Text>
              <Text variant="small" color={colors.stone500}>
                {action.hint}
              </Text>
            </View>
          </Pressable>
        ))}
      </View>

      {/* Featured projects */}
      <View style={styles.section}>
        <SectionHeader eyebrow="Portfolio" title="Featured projects" actionLabel="View all" onAction={() => router.push('/projects')} />
        <View style={styles.sectionBody}>
          {featured.isPending ? (
            <LoadingBlock label="Loading projects" style={styles.featureRow}>
              <ProjectCardSkeleton variant="feature" style={{ width: cardWidth }} />
              <ProjectCardSkeleton variant="feature" style={{ width: cardWidth }} />
            </LoadingBlock>
          ) : featured.isError ? (
            <ErrorState error={featured.error} onRetry={() => featured.refetch()} style={styles.inset} />
          ) : featured.data.length === 0 ? (
            <EmptyState title="No projects published yet" message="Projects will appear here as soon as they are published." style={styles.inset} />
          ) : (
            <FlatList
              data={featured.data}
              horizontal
              keyExtractor={(project) => String(project.id)}
              showsHorizontalScrollIndicator={false}
              snapToInterval={cardWidth + space.lg}
              decelerationRate="fast"
              contentContainerStyle={styles.featureRow}
              renderItem={({ item }) => <ProjectCard project={fromProject(item)} variant="feature" style={{ width: cardWidth }} />}
            />
          )}
          {hasDemo ? (
            <Text variant="small" color={colors.stone500} style={styles.demoNote}>
              Projects marked Demo are illustrative placeholders, not completed BRIGHTHOMES work.
            </Text>
          ) : null}
        </View>
      </View>

      {/* Services */}
      <View style={styles.section}>
        <SectionHeader eyebrow="What we do" title="Construction services" actionLabel="All services" onAction={() => router.push('/services')} />
        <View style={[styles.sectionBody, styles.inset]}>
          {services.isPending ? (
            <LoadingBlock label="Loading services">
              {[0, 1, 2, 3].map((key) => (
                <ServiceRowSkeleton key={key} />
              ))}
            </LoadingBlock>
          ) : services.isError ? (
            <ErrorState error={services.error} onRetry={() => services.refetch()} />
          ) : services.data.length === 0 ? (
            <EmptyState title="Services coming soon" message="Contact us to discuss your project in the meantime." />
          ) : (
            services.data.slice(0, 4).map((service, index) => <ServiceRow key={service.id} service={service} index={index} />)
          )}
        </View>
      </View>

      {/* Trust */}
      <View style={styles.trust}>
        <BlueprintGrid />
        <SectionHeader eyebrow="Why BRIGHTHOMES" title="A partner you can build with" tone="dark" />
        {achievements.isPending ? (
          <LoadingBlock label="Loading achievements" style={styles.stats}>
            {[0, 1, 2].map((key) => (
              <Skeleton key={key} height={64} style={styles.statSkeleton} />
            ))}
          </LoadingBlock>
        ) : achievements.isError ? (
          <ErrorState error={achievements.error} onRetry={() => achievements.refetch()} tone="dark" style={styles.inset} />
        ) : achievements.data.length ? (
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
        ) : null}
        <View style={styles.pillars}>
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
        <Button label="About BRIGHTHOMES" variant="inverse" icon={ArrowRight} iconAfter onPress={() => router.push('/about')} style={styles.inset} />
      </View>

      {/* Consultation CTA */}
      <View style={[styles.cta, styles.inset]}>
        <Text variant="eyebrow">Start your project</Text>
        <Text variant="display">Plan your build with us.</Text>
        <Text variant="body">Request a consultation and our team will contact you to agree a date and time. Prefer to write first? Send an enquiry.</Text>
        <View style={styles.ctaActions}>
          <Button label="Request a consultation" icon={ArrowRight} iconAfter onPress={() => router.push('/consultation')} fullWidth />
          <Button label="Send an enquiry" variant="secondary" onPress={() => router.push('/enquire')} fullWidth />
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  hero: { backgroundColor: colors.ink, paddingHorizontal: layout.gutter, paddingBottom: space.xxxl, overflow: 'hidden' },
  heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  signIn: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 4 },
  signInText: { fontFamily: fonts.semibold, fontSize: 14, color: colors.paper, textDecorationLine: 'underline', textDecorationColor: colors.bronzeLight },
  heroCopy: { marginTop: space.xxxl, gap: space.lg },
  eyebrowRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  heroRule: { width: 24, height: 1, backgroundColor: colors.bronzeLight },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: layout.gutter, marginTop: -space.xl, backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.stone300 },
  tile: { width: '50%', minHeight: 116, padding: space.lg, gap: space.md, justifyContent: 'space-between', borderColor: colors.stone300, borderRightWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth },
  tilePressed: { backgroundColor: colors.bone },
  tileCopy: { gap: 2 },
  section: { marginTop: space.xxxl },
  sectionBody: { marginTop: space.xl },
  inset: { marginHorizontal: layout.gutter },
  featureRow: { flexDirection: 'row', paddingHorizontal: layout.gutter, gap: space.lg },
  demoNote: { marginHorizontal: layout.gutter, marginTop: space.lg },
  trust: { marginTop: space.xxxl, backgroundColor: colors.ink, paddingVertical: space.xxxl, gap: space.xl, overflow: 'hidden' },
  stats: { flexDirection: 'row', marginHorizontal: layout.gutter, borderTopWidth: 1, borderTopColor: 'rgba(201,164,106,0.35)' },
  stat: { flex: 1, paddingTop: space.lg, paddingRight: space.sm, gap: space.xs },
  statSkeleton: { flex: 1, marginTop: space.lg, marginRight: space.sm, opacity: 0.2 },
  statValue: { fontFamily: fonts.display, fontSize: 40, lineHeight: 44, color: colors.bronzeLight },
  pillars: { marginHorizontal: layout.gutter, gap: space.xl },
  pillar: { gap: space.sm, borderLeftWidth: 1, borderLeftColor: colors.bronze, paddingLeft: space.lg },
  cta: { marginTop: space.xxxl, gap: space.md, borderTopWidth: 1, borderTopColor: colors.ink, paddingTop: space.xl },
  ctaActions: { gap: space.md, marginTop: space.md },
})
