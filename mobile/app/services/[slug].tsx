import { router, useLocalSearchParams } from 'expo-router'
import { CalendarClock, MessageSquareText } from 'lucide-react-native'
import { useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useService, useServices } from '../../src/api/content'
import { isNotFound } from '../../src/api/errors'
import { EditorialPhoto, Reveal, Scrim } from '../../src/components/media/Media'
import { Button } from '../../src/components/ui/Button'
import { Eyebrow, TextLink } from '../../src/components/ui/Editorial'
import { CondensedBar, FloatingBack } from '../../src/components/ui/ScreenChrome'
import { EmptyState, ErrorState, LoadingBlock, Skeleton } from '../../src/components/ui/States'
import { Text } from '../../src/components/ui/Text'
import { editorial } from '../../src/content/media'
import { padIndex } from '../../src/lib/format'
import { useLightStatusBar } from '../../src/lib/useStatusBar'
import { fonts, layout, makeStyles, onImage, space } from '../../src/theme'

const fallback = { pathname: '/explore', params: { section: 'services' } } as const

export default function ServiceDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>()
  const insets = useSafeAreaInsets()
  const styles = useStyles()
  const service = useService(slug)
  const services = useServices()
  const [condensed, setCondensed] = useState(false)
  useLightStatusBar(Boolean(service.data) && !condensed)

  if (!service.data) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top + 72 }]}>
        <FloatingBack fallback={fallback} solid />
        {service.isError ? (
          isNotFound(service.error) ? (
            <EmptyState title="Service not found" message="This service may have been renamed or is no longer offered in the app." action={<Button label="View all services" size="compact" onPress={() => router.replace(fallback)} />} style={styles.inset} />
          ) : (
            <ErrorState error={service.error} onRetry={() => service.refetch()} style={styles.inset} />
          )
        ) : (
          <LoadingBlock label="Loading service" style={styles.inset}>
            <Skeleton width="30%" height={12} />
            <Skeleton width="80%" height={36} style={styles.gap} />
            <Skeleton height={14} style={styles.gap} />
          </LoadingBlock>
        )}
      </View>
    )
  }

  const data = service.data
  const position = services.data?.findIndex((item) => item.id === data.id) ?? -1
  const next = position >= 0 ? services.data?.[position + 1] : undefined

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + space.xxxl }} scrollEventThrottle={32} onScroll={(event) => setCondensed(event.nativeEvent.contentOffset.y > 380 - insets.top - 60)}>
        <EditorialPhoto source={editorial.blueprints.source} alt={editorial.blueprints.alt} style={{ minHeight: 380 }}>
          <Scrim from={0.55} to={0.92} />
          <Reveal style={[styles.heroCopy, { paddingTop: insets.top + 80 }]}>
            {position >= 0 ? <Text style={styles.number}>{padIndex(position)}</Text> : null}
            <Eyebrow label="Service" color={onImage.accent} ruleColor={onImage.accent} />
            <Text variant="display" color={onImage.text}>
              {data.name}
            </Text>
            <Text variant="lead" color={onImage.textMuted}>
              {data.short_description}
            </Text>
          </Reveal>
        </EditorialPhoto>
        <View style={styles.body}>
          <Text variant="lead" style={styles.description}>
            {data.description}
          </Text>
          <View style={styles.actions}>
            <Eyebrow label="Next step" />
            <Text variant="title">Discuss {data.name.toLowerCase()} with our team.</Text>
            <Button label="Send an enquiry" icon={MessageSquareText} onPress={() => router.push({ pathname: '/enquire', params: { service: data.slug } })} fullWidth />
            <Button label="Request a consultation" icon={CalendarClock} variant="secondary" onPress={() => router.push({ pathname: '/consultation', params: { service: data.slug } })} fullWidth />
          </View>
          {next ? (
            <View style={styles.next}>
              <Text variant="eyebrow">Next service · {padIndex(position + 1)}</Text>
              <TextLink label={next.name} onPress={() => router.replace(`/services/${next.slug}`)} />
            </View>
          ) : null}
        </View>
      </ScrollView>
      <CondensedBar title={data.name} visible={condensed} />
      <FloatingBack fallback={fallback} solid={condensed} />
    </View>
  )
}

const useStyles = makeStyles((c) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.background },
    inset: { marginHorizontal: layout.gutter },
    gap: { marginTop: space.lg },
    heroCopy: { flex: 1, justifyContent: 'flex-end', paddingHorizontal: layout.gutter, paddingBottom: space.xxl, gap: space.md },
    number: { fontFamily: fonts.displayItalic, fontSize: 56, lineHeight: 58, color: onImage.accent },
    body: { paddingHorizontal: layout.gutter, paddingTop: space.xxl, gap: space.xxl },
    description: { color: c.text },
    actions: { gap: space.md, borderTopWidth: 1, borderTopColor: c.borderStrong, paddingTop: space.xl },
    next: { gap: space.xs, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.border, paddingTop: space.lg },
  }),
)
