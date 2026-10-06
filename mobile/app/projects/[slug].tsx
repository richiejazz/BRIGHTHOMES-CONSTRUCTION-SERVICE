import { router, useLocalSearchParams } from 'expo-router'
import { ArrowLeft, ArrowRight, CalendarClock, MessageSquareText } from 'lucide-react-native'
import { useState } from 'react'
import { Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useProject, useServices } from '../../src/api/content'
import { isNotFound } from '../../src/api/errors'
import { coverImage } from '../../src/components/projects/ProjectCard'
import { ProjectGallery } from '../../src/components/projects/ProjectGallery'
import { ProjectMedia } from '../../src/components/projects/ProjectMedia'
import { SaveButton } from '../../src/components/projects/SaveButton'
import { DemoBadge, ProjectStatusBadge } from '../../src/components/ui/Badges'
import { Button } from '../../src/components/ui/Button'
import { EmptyState, ErrorState, LoadingBlock, Skeleton } from '../../src/components/ui/States'
import { Text } from '../../src/components/ui/Text'
import { formatMonthYear } from '../../src/lib/format'
import { colors, fonts, layout, space } from '../../src/theme'

function goBack() {
  if (router.canGoBack()) router.back()
  else router.replace('/projects')
}

export default function ProjectDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>()
  const insets = useSafeAreaInsets()
  const { width } = useWindowDimensions()
  const project = useProject(slug)
  const services = useServices()
  const heroHeight = Math.min(width * 0.95, 520)
  const barHeight = insets.top + 60
  // Once the hero image scrolls away, a solid bar keeps the back button off the text.
  const [condensed, setCondensed] = useState(false)

  const backButton = (
    <Pressable onPress={goBack} accessibilityRole="button" accessibilityLabel="Back" hitSlop={4} style={[styles.floating, { top: insets.top + space.sm, left: layout.gutter - 4 }]}>
      <ArrowLeft size={22} color={colors.ink} strokeWidth={1.6} />
    </Pressable>
  )

  if (!project.data) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top + 72 }]}>
        {backButton}
        {project.isError ? (
          isNotFound(project.error) ? (
            <EmptyState title="Project not found" message="This project may have been removed or is no longer published." action={<Button label="Browse projects" onPress={() => router.replace('/projects')} />} style={styles.inset} />
          ) : (
            <ErrorState error={project.error} onRetry={() => project.refetch()} style={styles.inset} />
          )
        ) : (
          <LoadingBlock label="Loading project" style={styles.inset}>
            <Skeleton height={heroHeight * 0.7} />
            <Skeleton width="40%" height={12} style={styles.gap} />
            <Skeleton width="85%" height={34} style={styles.gap} />
            <Skeleton height={14} style={styles.gap} />
            <Skeleton width="70%" height={14} style={styles.gapSm} />
          </LoadingBlock>
        )}
      </View>
    )
  }

  const data = project.data
  const cover = coverImage(data.images)
  const involved = (services.data ?? []).filter((service) => data.services.includes(service.id))
  const facts = [
    { label: 'Category', value: data.category.name },
    data.location ? { label: 'Location', value: data.location } : null,
    data.start_date ? { label: 'Started', value: formatMonthYear(data.start_date) } : null,
    data.end_date ? { label: data.status === 'completed' ? 'Completed' : 'Expected completion', value: formatMonthYear(data.end_date) } : null,
  ].filter((fact): fact is { label: string; value: string } => fact !== null)

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 + insets.bottom }} scrollEventThrottle={32} onScroll={(event) => setCondensed(event.nativeEvent.contentOffset.y > heroHeight - barHeight)}>
        <ProjectMedia image={cover} seed={data.id} title={data.title} style={{ height: heroHeight }} />

        <View style={styles.content}>
          {data.is_demo ? (
            <View style={styles.demoNotice} accessible accessibilityRole="text">
              <DemoBadge />
              <Text variant="small" color={colors.graphite}>
                This is demonstration content used while real project photography is prepared. It is not a completed BRIGHTHOMES project.
              </Text>
            </View>
          ) : null}

          <View style={styles.metaRow}>
            <Text variant="eyebrow">{data.category.name}</Text>
            <ProjectStatusBadge status={data.status} />
          </View>
          <Text variant="display">{data.title}</Text>
          <Text variant="lead">{data.summary}</Text>

          <View style={styles.facts}>
            {facts.map((fact) => (
              <View key={fact.label} style={styles.fact} accessible accessibilityLabel={`${fact.label}: ${fact.value}`}>
                <Text variant="eyebrow" color={colors.stone500}>
                  {fact.label}
                </Text>
                <Text variant="label">{fact.value}</Text>
              </View>
            ))}
          </View>

          <View style={styles.block}>
            <Text variant="heading">About this project</Text>
            <Text variant="body">{data.description}</Text>
          </View>

          {involved.length ? (
            <View style={styles.block}>
              <Text variant="heading">Services involved</Text>
              <View style={styles.services}>
                {involved.map((service) => (
                  <Pressable key={service.id} onPress={() => router.push(`/services/${service.slug}`)} accessibilityRole="link" accessibilityLabel={`${service.name} service`} style={({ pressed }) => [styles.service, pressed && styles.pressed]}>
                    <Text style={styles.serviceText}>{service.name}</Text>
                    <ArrowRight size={14} color={colors.bronzeDark} strokeWidth={1.6} />
                  </Pressable>
                ))}
              </View>
            </View>
          ) : null}
        </View>

        {data.images.length > 1 ? (
          <View style={styles.gallery}>
            <Text variant="heading" style={styles.inset}>
              Gallery
            </Text>
            <ProjectGallery images={data.images} title={data.title} />
          </View>
        ) : null}

        <View style={[styles.inset, styles.consult]}>
          <Text variant="title">Interested in a project like this?</Text>
          <Text variant="body">Request a consultation and our team will contact you to agree a suitable date and time.</Text>
          <Button label="Request a consultation" variant="secondary" icon={CalendarClock} onPress={() => router.push({ pathname: '/consultation', params: { project: data.slug } })} fullWidth />
        </View>
      </ScrollView>

      {condensed ? (
        <View style={[styles.bar, { height: barHeight, paddingTop: insets.top }]}>
          <Text variant="label" numberOfLines={1} style={styles.barTitle}>
            {data.title}
          </Text>
        </View>
      ) : null}
      {backButton}

      <View style={[styles.footer, { paddingBottom: insets.bottom + space.md }]}>
        <View style={styles.footerSave}>
          <SaveButton projectId={data.id} title={data.title} variant="button" />
        </View>
        <Button label={width < 360 ? 'Enquire' : 'Make an enquiry'} accessibilityLabel="Make an enquiry" icon={MessageSquareText} onPress={() => router.push({ pathname: '/enquire', params: { project: data.slug } })} style={styles.footerMain} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  inset: { marginHorizontal: layout.gutter },
  gap: { marginTop: space.xl },
  gapSm: { marginTop: space.sm },
  floating: { position: 'absolute', width: 44, height: 44, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.paper, borderRadius: layout.radius },
  bar: { position: 'absolute', top: 0, left: 0, right: 0, justifyContent: 'center', paddingLeft: layout.gutter + 52, paddingRight: layout.gutter, backgroundColor: colors.paper, borderBottomWidth: 1, borderBottomColor: colors.stone300 },
  barTitle: { fontFamily: fonts.semibold },
  content: { paddingHorizontal: layout.gutter, paddingTop: space.xl, gap: space.lg },
  demoNotice: { gap: space.sm, padding: space.lg, backgroundColor: colors.bone, borderLeftWidth: 2, borderLeftColor: colors.bronze },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.md },
  facts: { borderTopWidth: 1, borderTopColor: colors.ink, marginTop: space.sm },
  fact: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: space.lg, paddingVertical: space.md, borderBottomWidth: 1, borderBottomColor: colors.stone200 },
  block: { gap: space.md, marginTop: space.lg },
  services: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  service: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 44, paddingHorizontal: 14, borderWidth: 1, borderColor: colors.stone300 },
  serviceText: { fontFamily: fonts.semibold, fontSize: 13, color: colors.ink },
  pressed: { backgroundColor: colors.bone },
  gallery: { marginTop: space.xxxl, gap: space.lg },
  consult: { marginTop: space.xxxl, gap: space.md, borderTopWidth: 1, borderTopColor: colors.ink, paddingTop: space.xl },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', gap: space.md, paddingHorizontal: layout.gutter, paddingTop: space.md, backgroundColor: colors.paper, borderTopWidth: 1, borderTopColor: colors.stone300 },
  footerSave: { flexShrink: 0 },
  footerMain: { flex: 1 },
})
