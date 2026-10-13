import { router } from 'expo-router'
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native'

import type { GalleryImage, Project, ProjectStatus, ProjectSummary } from '../../api/types'
import { onImage, space } from '../../theme'
import { IllustrativeTag, StatusLabel } from '../ui/Badges'
import { Skeleton } from '../ui/States'
import { Text } from '../ui/Text'
import { Photo, Scrim } from '../media/Media'
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
  cover: GalleryImage | null
}

export function coverImage(images: GalleryImage[]): GalleryImage | null {
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

export const projectStatusLabel = (status: ProjectStatus) => (status === 'ongoing' ? 'Ongoing' : 'Completed')

/** Status as shown to clients. Illustrative records make no claim about completion. */
export function ProjectStatusLabel({ project }: { project: Pick<CardProject, 'status' | 'is_demo'> }) {
  if (project.is_demo) return <IllustrativeTag />
  const label = projectStatusLabel(project.status)
  return <StatusLabel label={label} tone={project.status === 'ongoing' ? 'accent' : 'neutral'} accessibilityLabel={`Project status: ${label}`} />
}

type Variant = 'list' | 'feature' | 'overlay'
type Props = { project: CardProject; variant?: Variant; aspectRatio?: number; compact?: boolean; style?: StyleProp<ViewStyle> }

function a11yLabel(project: CardProject) {
  return [project.title, project.is_demo ? 'Illustrative content' : projectStatusLabel(project.status), project.category, project.location || null].filter(Boolean).join(', ')
}

/**
 * - list: full-width photograph with the case-study details set beneath
 * - feature: tall photograph for carousels
 * - overlay: photograph with the title set over a scrim, for editorial layouts
 */
export function ProjectCard({ project, variant = 'list', aspectRatio, compact = false, style }: Props) {
  const open = () => router.push(`/projects/${project.slug}`)
  const overlay = variant === 'overlay'
  const ratio = aspectRatio ?? (variant === 'feature' ? 4 / 5 : 4 / 3)
  return (
    <View style={style}>
      <Pressable onPress={open} accessibilityRole="link" accessibilityLabel={a11yLabel(project)} accessibilityHint="Opens the project" style={({ pressed }) => pressed && styles.pressed}>
        <Photo image={project.cover} seed={project.id} title={project.title} style={{ aspectRatio: ratio, width: '100%' }}>
          {overlay ? (
            <>
              <Scrim from={0} mid={0.1} to={0.8} />
              <View style={styles.overlayCopy}>
                <Text variant="eyebrow" color={onImage.accent}>
                  {project.category}
                </Text>
                <Text variant={compact ? 'subheading' : 'heading'} color={onImage.text} numberOfLines={3}>
                  {project.title}
                </Text>
              </View>
            </>
          ) : null}
        </Photo>
        {overlay ? null : (
          <View style={styles.body}>
            <View style={styles.meta}>
              <Text variant="subheading" numberOfLines={1} style={styles.shrink}>
                {project.title}
              </Text>
              <ProjectStatusLabel project={project} />
            </View>
            <Text variant="caption" style={styles.caption} numberOfLines={1}>
              {[project.category, project.location || null].filter(Boolean).join(' · ')}
            </Text>
          </View>
        )}
      </Pressable>
      {overlay && project.is_demo ? (
        <View style={styles.tag} pointerEvents="none">
          <IllustrativeTag overImage />
        </View>
      ) : null}
      <View style={styles.save}>
        <SaveButton kind="projects" itemId={project.id} title={project.title} />
      </View>
    </View>
  )
}

export function ProjectCardSkeleton({ variant = 'list', style }: { variant?: Variant; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={style}>
      <Skeleton height="auto" style={{ aspectRatio: variant === 'feature' ? 4 / 5 : 4 / 3 }} />
      {variant === 'overlay' ? null : (
        <View style={styles.body}>
          <Skeleton width="35%" height={11} />
          <Skeleton width="75%" height={24} />
          {variant === 'list' ? <Skeleton width="95%" height={14} /> : null}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.88 },
  body: { paddingTop: space.md, gap: 4 },
  caption: { opacity: 0.8 },
  meta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.md },
  shrink: { flexShrink: 1 },
  overlayCopy: { position: 'absolute', left: space.md, right: space.md, bottom: space.md, gap: space.xs },
  tag: { position: 'absolute', top: space.md, left: space.md },
  save: { position: 'absolute', top: space.sm, right: space.sm },
})
