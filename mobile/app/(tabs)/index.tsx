import { router } from 'expo-router'
import { Bookmark, CalendarClock, ChevronRight, MessageSquareText, Phone, Search, type LucideIcon } from 'lucide-react-native'
import { useState } from 'react'
import { FlatList, Linking, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useMyAppointments, useMyEnquiries } from '../../src/api/account'
import { useAchievements, useFeaturedProjects, useFeaturedProperties, useServices } from '../../src/api/content'
import type { Appointment, Enquiry } from '../../src/api/types'
import { useAuth } from '../../src/auth/AuthProvider'
import { requestSubject } from '../../src/components/activity/RequestRows'
import { LogoMark, pageLogoTone } from '../../src/components/brand/Logo'
import { ProjectCard, ProjectCardSkeleton, fromProject } from '../../src/components/content/ProjectCard'
import { PropertyCard, PropertyCardSkeleton, fromProperty } from '../../src/components/content/PropertyCard'
import { EditorialPhoto, Reveal, Scrim } from '../../src/components/media/Media'
import { Avatar } from '../../src/components/ui/Avatar'
import { RequestStatusBadge } from '../../src/components/ui/Badges'
import { Button } from '../../src/components/ui/Button'
import { RowHeader } from '../../src/components/ui/Editorial'
import { EmptyState, ErrorState, LoadingBlock, Skeleton } from '../../src/components/ui/States'
import { Text } from '../../src/components/ui/Text'
import { company } from '../../src/content/company'
import { editorial, type EditorialImage } from '../../src/content/media'
import { greeting, padIndex } from '../../src/lib/format'
import { useContentWidth } from '../../src/lib/useContentWidth'
import { fonts, layout, makeStyles, onImage, space, useTheme } from '../../src/theme'

const explore = (section: 'projects' | 'properties' | 'services', focus = false) => router.navigate({ pathname: '/explore', params: focus ? { section, focus: '1' } : { section } })

export default function HomeScreen() {
  const { width } = useContentWidth()
  const { colors, scheme } = useTheme()
  const styles = useStyles()
  const { user, status } = useAuth()
  const properties = useFeaturedProperties()
  const projects = useFeaturedProjects()
  const services = useServices()
  const achievements = useAchievements()
  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = async () => {
    setRefreshing(true)
    await Promise.all([properties.refetch(), projects.refetch(), services.refetch(), achievements.refetch()])
    setRefreshing(false)
  }

  const propertyWidth = Math.min(300, width * 0.76)
  const projectWidth = Math.min(240, width * 0.6)
  const tileWidth = (width - layout.gutter * 2 - space.md) / 2

  const quickActions: { label: string; icon: LucideIcon; onPress: () => void }[] = [
    { label: 'Consult', icon: CalendarClock, onPress: () => router.push('/consultation') },
    { label: 'Enquire', icon: MessageSquareText, onPress: () => router.push('/enquire') },
    { label: 'Saved', icon: Bookmark, onPress: () => router.navigate('/saved') },
    { label: 'Call us', icon: Phone, onPress: () => void Linking.openURL(company.phones[0].href) },
  ]

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} colors={[colors.accent]} />}>
        {/* App bar: brand, then the account control */}
        <View style={styles.appBar}>
          <View style={styles.brand} accessible accessibilityRole="header" accessibilityLabel="BRIGHTHOMES">
            <LogoMark size={28} tone={pageLogoTone(scheme)} />
            <Text style={styles.brandName}>BRIGHTHOMES</Text>
          </View>
          {user ? (
            <Pressable onPress={() => router.navigate('/profile')} accessibilityRole="button" accessibilityLabel="Your profile" hitSlop={6}>
              <Avatar user={user} size={38} />
            </Pressable>
          ) : (
            <Button label="Sign in" size="compact" variant="secondary" onPress={() => router.push('/login')} style={styles.signIn} />
          )}
        </View>

        <View style={styles.greeting}>
          <Text variant="caption" color={colors.textSubtle}>
            {user ? greeting() : 'Construction · Real Estate'}
          </Text>
          <Text variant="title">{user ? user.first_name || 'Welcome back' : 'What are you planning?'}</Text>
        </View>

        {/* Search entry: opens Explore with the search field focused */}
        <Pressable onPress={() => explore('properties', true)} accessibilityRole="search" accessibilityLabel="Search properties and projects" style={({ pressed }) => [styles.search, pressed && styles.pressed]}>
          <Search size={18} color={colors.textMuted} strokeWidth={1.5} />
          <Text variant="body" color={colors.textSubtle} numberOfLines={1} style={styles.grow}>
            Search properties & projects
          </Text>
        </Pressable>

        {/* Brand moment, sized as a card rather than a page hero */}
        <Reveal style={styles.inset}>
          <EditorialPhoto source={editorial.hero.source} alt={editorial.hero.alt} priority="high" style={styles.feature}>
            <Scrim from={0.15} to={0.88} />
            <View style={styles.featureCopy}>
              <Text variant="eyebrow" color={onImage.accent}>
                {company.shortName}
              </Text>
              <Text variant="heading" color={onImage.text}>
                {company.tagline}
              </Text>
              <Button label="Request a consultation" variant="accent" size="compact" onPress={() => router.push('/consultation')} style={styles.featureButton} />
            </View>
          </EditorialPhoto>
        </Reveal>

        {/* Quick actions */}
        <View style={styles.quick} accessibilityLabel="Quick actions">
          {quickActions.map((action) => (
            <Pressable key={action.label} onPress={action.onPress} accessibilityRole="button" accessibilityLabel={action.label} style={({ pressed }) => [styles.quickItem, pressed && styles.pressed]}>
              <View style={styles.quickIcon}>
                <action.icon size={20} color={colors.text} strokeWidth={1.4} />
              </View>
              <Text variant="caption" color={colors.textMuted}>
                {action.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* The two sides of the business */}
        <View style={styles.tiles}>
          <DisciplineTile title="Construction" caption="Projects & case studies" image={editorial.construction} width={tileWidth} onPress={() => explore('projects')} />
          <DisciplineTile title="Real Estate" caption="Homes, land & commercial" image={editorial.realEstate} width={tileWidth} onPress={() => explore('properties')} />
        </View>

        {status === 'authenticated' ? <LatestRequest /> : <AccountPrompt />}

        {/* Featured properties carousel */}
        <View style={styles.section}>
          <RowHeader title="Featured properties" onAction={() => explore('properties')} />
          {properties.isPending ? (
            <LoadingBlock label="Loading properties" style={styles.carousel}>
              <PropertyCardSkeleton variant="feature" style={{ width: propertyWidth }} />
              <PropertyCardSkeleton variant="feature" style={{ width: propertyWidth }} />
            </LoadingBlock>
          ) : properties.isError ? (
            <ErrorState error={properties.error} onRetry={() => properties.refetch()} style={styles.inset} />
          ) : properties.data.length === 0 ? (
            <EmptyState title="Listings are being prepared" message="Speak to our team about buying, renting or developing property." style={styles.inset} />
          ) : (
            <FlatList
              data={properties.data}
              horizontal
              keyExtractor={(item) => String(item.id)}
              showsHorizontalScrollIndicator={false}
              snapToInterval={propertyWidth + space.md}
              decelerationRate="fast"
              contentContainerStyle={styles.carousel}
              renderItem={({ item }) => <PropertyCard property={fromProperty(item)} variant="feature" width={propertyWidth} />}
            />
          )}
        </View>

        {/* Construction work carousel */}
        <View style={styles.section}>
          <RowHeader title="Construction work" onAction={() => explore('projects')} />
          {projects.isPending ? (
            <LoadingBlock label="Loading projects" style={styles.carousel}>
              <ProjectCardSkeleton variant="overlay" style={{ width: projectWidth }} />
              <ProjectCardSkeleton variant="overlay" style={{ width: projectWidth }} />
            </LoadingBlock>
          ) : projects.isError ? (
            <ErrorState error={projects.error} onRetry={() => projects.refetch()} style={styles.inset} />
          ) : projects.data.length === 0 ? (
            <EmptyState title="Projects are being prepared" message="Our portfolio will appear here as projects are published." style={styles.inset} />
          ) : (
            <FlatList
              data={projects.data}
              horizontal
              keyExtractor={(item) => String(item.id)}
              showsHorizontalScrollIndicator={false}
              snapToInterval={projectWidth + space.md}
              decelerationRate="fast"
              contentContainerStyle={styles.carousel}
              renderItem={({ item }) => <ProjectCard project={fromProject(item)} variant="overlay" aspectRatio={3 / 4} compact style={{ width: projectWidth }} />}
            />
          )}
        </View>

        {/* Services as a swipeable index */}
        <View style={styles.section}>
          <RowHeader title="Services" onAction={() => explore('services')} />
          {services.isPending ? (
            <LoadingBlock label="Loading services" style={styles.carousel}>
              {[0, 1, 2].map((key) => (
                <Skeleton key={key} width={150} height={112} />
              ))}
            </LoadingBlock>
          ) : services.isError ? (
            <ErrorState error={services.error} onRetry={() => services.refetch()} style={styles.inset} />
          ) : (
            <FlatList
              data={services.data}
              horizontal
              keyExtractor={(item) => String(item.id)}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.carousel}
              renderItem={({ item, index }) => (
                <Pressable onPress={() => router.push(`/services/${item.slug}`)} accessibilityRole="link" accessibilityLabel={`${item.name}. ${item.short_description}`} style={({ pressed }) => [styles.serviceTile, pressed && styles.pressed]}>
                  <Text style={styles.serviceIndex}>{padIndex(index)}</Text>
                  <Text style={styles.serviceName} numberOfLines={2}>
                    {item.name}
                  </Text>
                </Pressable>
              )}
            />
          )}
        </View>

        {/* Track record strip */}
        {achievements.data?.length ? (
          <Pressable
            onPress={() => router.push('/about')}
            accessibilityRole="link"
            accessibilityLabel={`Track record: ${achievements.data.map((item) => `${item.value} ${item.label}`).join(', ')}. About BRIGHTHOMES`}
            style={({ pressed }) => [styles.stats, pressed && styles.pressed]}
          >
            {achievements.data.slice(0, 3).map((achievement, index) => (
              <View key={achievement.id} style={[styles.stat, index > 0 && styles.statDivider]}>
                <Text variant="heading" color={colors.inverse.accent} style={styles.statValue}>
                  {achievement.value}
                </Text>
                <Text variant="caption" color={colors.inverse.textMuted}>
                  {achievement.label}
                </Text>
              </View>
            ))}
          </Pressable>
        ) : null}

        <Pressable onPress={() => router.push('/about')} accessibilityRole="link" style={({ pressed }) => [styles.aboutRow, pressed && styles.pressed]}>
          <View style={styles.grow}>
            <Text variant="label">About BRIGHTHOMES</Text>
            <Text variant="caption" color={colors.textSubtle}>
              Our objectives, track record and how we work
            </Text>
          </View>
          <ChevronRight size={18} color={colors.textSubtle} strokeWidth={1.5} />
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  )
}

function DisciplineTile({ title, caption, image, width, onPress }: { title: string; caption: string; image: EditorialImage; width: number; onPress: () => void }) {
  const styles = useStyles()
  return (
    <Pressable onPress={onPress} accessibilityRole="link" accessibilityLabel={`${title}. ${caption}`} style={({ pressed }) => pressed && styles.pressed}>
      <EditorialPhoto source={image.source} alt={image.alt} style={{ width, height: width * 0.82 }}>
        <Scrim from={0} to={0.8} />
        <View style={styles.tileCopy}>
          <Text variant="subheading" color={onImage.text}>
            {title}
          </Text>
          <Text variant="caption" color={onImage.textMuted}>
            {caption}
          </Text>
        </View>
      </EditorialPhoto>
    </Pressable>
  )
}

/** The signed-in client's most recent request, so its status is one glance away. */
function LatestRequest() {
  const styles = useStyles()
  const { colors } = useTheme()
  const enquiries = useMyEnquiries(true)
  const appointments = useMyAppointments(true)
  if (enquiries.isPending || appointments.isPending) return null
  const latest: Enquiry | Appointment | undefined = [...(enquiries.data?.pages[0]?.results ?? []), ...(appointments.data?.pages[0]?.results ?? [])].sort((a, b) => b.created_at.localeCompare(a.created_at))[0]
  if (!latest) {
    return (
      <Pressable onPress={() => router.push('/enquire')} accessibilityRole="button" style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
        <View style={styles.grow}>
          <Text variant="label">No requests yet</Text>
          <Text variant="caption" color={colors.textSubtle}>
            Send an enquiry and follow its status here.
          </Text>
        </View>
        <ChevronRight size={18} color={colors.textSubtle} strokeWidth={1.5} />
      </Pressable>
    )
  }
  const isAppointment = 'preferred_date' in latest
  const subject = requestSubject(latest, isAppointment ? 'General consultation' : 'General enquiry')
  return (
    <Pressable
      onPress={() => router.push(isAppointment ? `/appointments/${latest.id}` : `/enquiries/${latest.id}`)}
      accessibilityRole="link"
      accessibilityLabel={`Latest ${isAppointment ? 'consultation request' : 'enquiry'}: ${subject.title}`}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.grow}>
        <Text variant="caption" color={colors.textSubtle}>
          {isAppointment ? 'Latest consultation request' : 'Latest enquiry'}
        </Text>
        <Text variant="label" numberOfLines={1}>
          {subject.title}
        </Text>
        <RequestStatusBadge status={latest.status} />
      </View>
      <ChevronRight size={18} color={colors.textSubtle} strokeWidth={1.5} />
    </Pressable>
  )
}

function AccountPrompt() {
  const styles = useStyles()
  const { colors } = useTheme()
  return (
    <View style={styles.card}>
      <View style={styles.grow}>
        <Text variant="label">Save and follow up</Text>
        <Text variant="caption" color={colors.textSubtle}>
          Sign in to keep a shortlist and track your requests.
        </Text>
      </View>
      <Button label="Sign in" size="compact" onPress={() => router.push('/login')} />
    </View>
  )
}

const useStyles = makeStyles((c) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.background },
    content: { paddingBottom: space.xxl },
    inset: { marginHorizontal: layout.gutter },
    grow: { flex: 1, gap: 3 },
    pressed: { opacity: 0.7 },
    appBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: layout.gutter, minHeight: 56 },
    brand: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
    brandName: { fontFamily: fonts.semibold, fontSize: 13, letterSpacing: 3, color: c.text },
    signIn: { minHeight: 38, paddingHorizontal: 14 },
    greeting: { paddingHorizontal: layout.gutter, paddingTop: space.sm, gap: 2 },
    search: { flexDirection: 'row', alignItems: 'center', gap: space.md, marginHorizontal: layout.gutter, marginTop: space.lg, minHeight: 50, paddingHorizontal: space.lg, backgroundColor: c.surface },
    feature: { height: 220, marginTop: space.lg },
    featureCopy: { position: 'absolute', left: space.lg, right: space.lg, bottom: space.lg, gap: space.sm },
    featureButton: { alignSelf: 'flex-start', marginTop: space.xs },
    quick: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: layout.gutter, marginTop: space.xl },
    quickItem: { alignItems: 'center', gap: space.sm, minWidth: 64 },
    quickIcon: { width: 56, height: 56, alignItems: 'center', justifyContent: 'center', borderWidth: StyleSheet.hairlineWidth * 2, borderColor: c.border },
    tiles: { flexDirection: 'row', gap: space.md, paddingHorizontal: layout.gutter, marginTop: space.xl },
    tileCopy: { position: 'absolute', left: space.md, right: space.md, bottom: space.md, gap: 2 },
    card: { flexDirection: 'row', alignItems: 'center', gap: space.md, marginHorizontal: layout.gutter, marginTop: space.lg, padding: space.lg, backgroundColor: c.surface },
    section: { marginTop: space.xxl, gap: space.md },
    carousel: { flexDirection: 'row', paddingHorizontal: layout.gutter, gap: space.md },
    serviceTile: { width: 150, height: 112, padding: space.md, justifyContent: 'space-between', borderWidth: StyleSheet.hairlineWidth * 2, borderColor: c.border },
    serviceIndex: { fontFamily: fonts.displayItalic, fontSize: 22, color: c.accentText },
    serviceName: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 19, color: c.text },
    stats: { flexDirection: 'row', marginHorizontal: layout.gutter, marginTop: space.xxl, paddingVertical: space.lg, backgroundColor: c.inverse.background },
    stat: { flex: 1, paddingHorizontal: space.md, gap: 2 },
    statDivider: { borderLeftWidth: StyleSheet.hairlineWidth, borderLeftColor: c.inverse.border },
    statValue: { fontVariant: ['lining-nums'] },
    aboutRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, marginHorizontal: layout.gutter, marginTop: space.lg, paddingVertical: space.lg, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.border },
  }),
)
