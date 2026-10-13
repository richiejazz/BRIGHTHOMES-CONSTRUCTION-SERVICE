import { router } from 'expo-router'
import { StyleSheet, View } from 'react-native'

import { ElevationPlaceholder } from '../src/components/brand/Elevation'
import { Button } from '../src/components/ui/Button'
import { Eyebrow } from '../src/components/ui/Editorial'
import { Text } from '../src/components/ui/Text'
import { layout, makeStyles, space } from '../src/theme'

export default function NotFoundScreen() {
  const styles = useStyles()
  return (
    <View style={styles.screen}>
      <View style={styles.art}>
        <ElevationPlaceholder seed={2} />
      </View>
      <View style={styles.copy}>
        <Eyebrow label="Page not found" />
        <Text variant="display">This page isn’t on the plans.</Text>
        <Text variant="body">The link may be out of date, or the page may have moved.</Text>
      </View>
      <View style={styles.actions}>
        <Button label="Go to Home" onPress={() => router.replace('/')} fullWidth />
        <Button label="Explore" variant="secondary" onPress={() => router.replace('/explore')} fullWidth />
      </View>
    </View>
  )
}

const useStyles = makeStyles((c) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.background, paddingHorizontal: layout.gutter, paddingTop: space.xl, gap: space.xl },
    art: { aspectRatio: 4 / 3, overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth, borderColor: c.border },
    copy: { gap: space.md },
    actions: { gap: space.md },
  }),
)
