import { router } from 'expo-router'
import { StyleSheet, View } from 'react-native'

import { ElevationPlaceholder } from '../src/components/brand/Elevation'
import { Button } from '../src/components/ui/Button'
import { Text } from '../src/components/ui/Text'
import { colors, layout, space } from '../src/theme'

export default function NotFoundScreen() {
  return (
    <View style={styles.screen}>
      <View style={styles.art}>
        <ElevationPlaceholder seed={2} tone="light" />
      </View>
      <View style={styles.copy}>
        <Text variant="eyebrow">Page not found</Text>
        <Text variant="display">This page isn’t on the plans.</Text>
        <Text variant="body">The link may be out of date, or the page may have moved.</Text>
      </View>
      <View style={styles.actions}>
        <Button label="Go to Home" onPress={() => router.replace('/')} fullWidth />
        <Button label="Browse projects" variant="secondary" onPress={() => router.replace('/projects')} fullWidth />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper, paddingHorizontal: layout.gutter, paddingTop: space.xl, gap: space.xl },
  art: { aspectRatio: 4 / 3, overflow: 'hidden', borderWidth: 1, borderColor: colors.stone300 },
  copy: { gap: space.md },
  actions: { gap: space.md },
})
