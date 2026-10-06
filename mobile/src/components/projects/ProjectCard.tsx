import { router } from 'expo-router'
import { MapPin } from 'lucide-react-native'
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native'

import type { Project, ProjectImage, ProjectStatus, ProjectSummary } from '../../api/types'
import { colors, space } from '../../theme'
import { DemoBadge, ProjectStatusBadge } from '../ui/Badges'
import { Skeleton } from '../ui/States'
import { Text } from '../ui/Text'
import { ProjectMedia } from './ProjectMedia'
import { SaveButton } from './SaveButton'

/** The fields a card needs, from either a full project or an embedded project summary. */
export type CardProject = {
  id: number
  slug: string
  title: string
  category: string
  status: ProjectStatus
  is_demo: boolean
  location: string
  summary: string
  cover: ProjectImage | null
}

export function coverImage(images: ProjectImage[]): ProjectImage | null {
  return images.find((image) => image.is_cover) ?? images[0] ?? null
}

export const fromProject = (project: Project): CardProject => ({
  id: project.id,
  slug: project.slug,
  title: project.title,
  category: project.category.name,
  status: project.status,
  is_demo: project.is_demo,
  location: project.location,
  summary: project.summary,
  cover: coverImage(project.images),
})

export const fromSummary = (project: ProjectSummary): CardProject => ({
  id: project.id,
  slug: project.slug,
  title: project.title,
  category: project.category,
  status: project.status,
  is_demo: project.is_demo,
  location: '',
  summary: '',
  cover: project.cover_image,
})

type Props = { project: CardProject; variant?: 'list' | 'feature'; style?: StyleProp<ViewStyle> }

export function ProjectCard({ project, variant = 'list', style }: Props) {
  const feature = variant === 'feature'
  const statusLabel = project.status === 'ongoing' ? 'Ongoing' : 'Completed'
  const a11yLabel = [project.title, project.is_demo ? 'Demo content' : null, project.category, statusLabel, project.location || null].filter(Boolean).join(', ')
  return (
    <View style={style}>
      <Pressable onPress={() => router.push(`/projects/${project.slug}`)} accessibilityRole="link" accessibilityLabel={a11yLabel} accessibilityHint="Opens project details" style={({ pressed }) => pressed && styles.pressed}>
        <ProjectMedia image={project.cover} seed={project.id} title={project.title} style={feature ? styles.featureMedia : styles.listMedia} />
        <View style={styles.body}>
          <View style={styles.meta}>
            <Text variant="eyebrow" numberOfLines={1} style={styles.category}>
              {project.category}
            </Text>
            <ProjectStatusBadge status={project.status} />
          </View>
          <Text variant={feature ? 'heading' : 'title'} numberOfLines={2}>
            {project.title}
          </Text>
          {project.location ? (
            <View style={styles.location}>
              <MapPin size={14} color={colors.stone500} strokeWidth={1.6} />
              <Text variant="small" numberOfLines={1}>
                {project.location}
              </Text>
            </View>
          ) : null}
          {!feature && project.summary ? (
            <Text variant="body" numberOfLines={2}>
              {project.summary}
            </Text>
          ) : null}
        </View>
      </Pressable>
      {project.is_demo ? (
        <View style={styles.demo}>
          <DemoBadge />
        </View>
      ) : null}
      <View style={styles.save}>
        <SaveButton projectId={project.id} title={project.title} />
      </View>
    </View>
  )
}

export function ProjectCardSkeleton({ variant = 'list', style }: { variant?: 'list' | 'feature'; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={style}>
      <View style={variant === 'feature' ? styles.featureMedia : styles.listMedia}>
        <Skeleton height="100%" />
      </View>
      <View style={styles.body}>
        <Skeleton width="40%" height={12} />
        <Skeleton width="80%" height={24} />
        {variant === 'list' ? <Skeleton width="95%" height={14} /> : null}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.85 },
  listMedia: { aspectRatio: 4 / 3, width: '100%' },
  featureMedia: { aspectRatio: 4 / 5, width: '100%' },
  body: { paddingTop: space.lg, gap: space.sm },
  meta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.md },
  category: { flexShrink: 1 },
  location: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  demo: { position: 'absolute', top: space.md, left: space.md, pointerEvents: 'none' },
  save: { position: 'absolute', top: space.sm, right: space.sm },
})
