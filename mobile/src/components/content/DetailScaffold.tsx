import { router, type Href } from 'expo-router'
import { useState, type ReactNode } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { isNotFound } from '../../api/errors'
import type { GalleryImage } from '../../api/types'
import { useContentWidth } from '../../lib/useContentWidth'
import { useLightStatusBar } from '../../lib/useStatusBar'
import { layout, makeStyles, space } from '../../theme'
import { Scrim } from '../media/Media'
import { SwipePhotos } from '../media/SwipePhotos'
import { IllustrativeTag } from '../ui/Badges'
import { Button } from '../ui/Button'
import { Eyebrow } from '../ui/Editorial'
import { CondensedBar, FloatingActions, FloatingBack } from '../ui/ScreenChrome'
import { EmptyState, ErrorState, LoadingBlock, Skeleton } from '../ui/States'
import { Text } from '../ui/Text'

type Query<T> = { data?: T; isError: boolean; error: unknown; refetch: () => unknown }

type Props<T> = {
  query: Query<T>
  noun: 'Project' | 'Property'
  fallback: Href
  browseLabel: string
  seed: (data: T) => number
  title: (data: T) => string
  images: (data: T) => GalleryImage[]
  /** Controls pinned over the hero image (save). */
  actions: (data: T) => ReactNode
  /** The sticky action bar at the bottom of the screen. */
  footer: (data: T) => ReactNode
  children: (data: T) => ReactNode
}

/**
 * Shared frame for project and property presentations: a full-bleed hero photograph, floating
 * back and save controls, a title bar once the hero scrolls away, and a sticky action bar.
 */
export function DetailScaffold<T>({ query, noun, fallback, browseLabel, seed, title, images, actions, footer, children }: Props<T>) {
  const insets = useSafeAreaInsets()
  const { width, height } = useContentWidth()
  const styles = useStyles()
  const heroHeight = Math.min(Math.max(width * 0.95, 320), height * 0.55)
  const barHeight = insets.top + 60
  const [condensed, setCondensed] = useState(false)
  useLightStatusBar(!condensed)

  if (!query.data) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top + 72 }]}>
        <FloatingBack fallback={fallback} solid />
        {query.isError ? (
          isNotFound(query.error) ? (
            <EmptyState title={`${noun} not found`} message={`This ${noun.toLowerCase()} may have been removed or is no longer published.`} action={<Button label={browseLabel} size="compact" onPress={() => router.replace(fallback)} />} style={styles.inset} />
          ) : (
            <ErrorState error={query.error} onRetry={() => query.refetch()} style={styles.inset} />
          )
        ) : (
          <LoadingBlock label={`Loading ${noun.toLowerCase()}`} style={styles.inset}>
            <Skeleton height={heroHeight * 0.7} />
            <Skeleton width="40%" height={12} style={styles.gap} />
            <Skeleton width="85%" height={34} style={styles.gap} />
            <Skeleton height={14} style={styles.gap} />
          </LoadingBlock>
        )}
      </View>
    )
  }

  const data = query.data
  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={{ paddingBottom: 128 + insets.bottom }} scrollEventThrottle={32} onScroll={(event) => setCondensed(event.nativeEvent.contentOffset.y > heroHeight - barHeight)}>
        <SwipePhotos images={images(data)} width={width} height={heroHeight} title={title(data)} seed={seed(data)} indicator="counter">
          <Scrim from={0.4} mid={0} to={0} style={styles.topScrim} />
        </SwipePhotos>
        <View style={styles.body}>{children(data)}</View>
      </ScrollView>
      <CondensedBar title={title(data)} visible={condensed} />
      <FloatingBack fallback={fallback} solid={condensed} />
      {condensed ? null : <FloatingActions>{actions(data)}</FloatingActions>}
      <View style={[styles.footer, { paddingBottom: insets.bottom + space.md }]}>{footer(data)}</View>
    </View>
  )
}

/** Explains that a record is illustrative, wherever it is presented in full. */
export function IllustrativeNotice({ noun }: { noun: 'project' | 'listing' }) {
  const styles = useStyles()
  return (
    <View style={styles.notice} accessible accessibilityRole="text">
      <IllustrativeTag />
      <Text variant="small">
        {noun === 'listing'
          ? 'This is an illustrative listing shown while verified BRIGHTHOMES listings are prepared. The photographs are architectural inspiration and do not show a BRIGHTHOMES property. No price, location or specification is implied.'
          : 'This is illustrative content shown while BRIGHTHOMES project photography is prepared. The photographs are architectural inspiration and do not show a BRIGHTHOMES project.'}
      </Text>
    </View>
  )
}

/** A titled section within a detail presentation. */
export function DetailSection({ eyebrow, title, children, flush = false }: { eyebrow?: string; title: string; children: ReactNode; flush?: boolean }) {
  const styles = useStyles()
  return (
    <View style={styles.section}>
      <View style={flush ? styles.inset : undefined}>
        {eyebrow ? <Eyebrow label={eyebrow} /> : null}
        <Text variant="heading" style={eyebrow ? styles.sectionTitle : undefined}>
          {title}
        </Text>
      </View>
      {children}
    </View>
  )
}

const useStyles = makeStyles((c) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.background },
    inset: { marginHorizontal: layout.gutter },
    gap: { marginTop: space.xl },
    body: { paddingHorizontal: layout.gutter, paddingTop: space.lg, gap: space.md },
    topScrim: { bottom: 'auto', height: 120 },
    section: { marginTop: space.xl, gap: space.md },
    sectionTitle: { marginTop: space.sm },
    notice: { gap: space.sm, padding: space.lg, backgroundColor: c.surface, borderLeftWidth: 2, borderLeftColor: c.accent },
    footer: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', gap: space.md, paddingHorizontal: layout.gutter, paddingTop: space.md, backgroundColor: c.background, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.border },
  }),
)
