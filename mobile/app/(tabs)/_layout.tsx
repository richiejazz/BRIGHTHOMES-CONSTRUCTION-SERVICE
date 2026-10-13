import { Tabs } from 'expo-router'
import { Bookmark, Compass, House, Inbox, UserRound, type LucideIcon } from 'lucide-react-native'
import { StyleSheet, View, type ColorValue } from 'react-native'

import { useReducedMotion } from '../../src/lib/useReducedMotion'
import { fonts, useTheme } from '../../src/theme'

function TabIcon({ Icon, color, focused, accent }: { Icon: LucideIcon; color: ColorValue; focused: boolean; accent: string }) {
  return (
    <View style={styles.iconWrap}>
      {/* A short bronze rule marks the active tab, echoing the drawing-line motif. */}
      <View style={[styles.indicator, { backgroundColor: focused ? accent : 'transparent' }]} />
      <Icon size={21} color={String(color)} strokeWidth={focused ? 1.7 : 1.3} />
    </View>
  )
}

export default function TabsLayout() {
  const { colors } = useTheme()
  const reduced = useReducedMotion()
  const tab = (title: string, Icon: LucideIcon) => ({
    title,
    tabBarAccessibilityLabel: title,
    tabBarIcon: ({ color, focused }: { color: ColorValue; focused: boolean }) => <TabIcon Icon={Icon} color={color} focused={focused} accent={colors.accent} />,
  })
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.textSubtle,
        tabBarStyle: [styles.bar, { backgroundColor: colors.navigation, borderTopColor: colors.border }],
        tabBarLabelStyle: styles.label,
        tabBarHideOnKeyboard: true,
        sceneStyle: { backgroundColor: colors.background },
        animation: reduced ? 'none' : 'fade',
      }}
    >
      <Tabs.Screen name="index" options={tab('Home', House)} />
      <Tabs.Screen name="explore" options={tab('Explore', Compass)} />
      <Tabs.Screen name="saved" options={tab('Saved', Bookmark)} />
      <Tabs.Screen name="activity" options={tab('Activity', Inbox)} />
      <Tabs.Screen name="profile" options={tab('Profile', UserRound)} />
    </Tabs>
  )
}

const styles = StyleSheet.create({
  bar: { borderTopWidth: StyleSheet.hairlineWidth, elevation: 0, boxShadow: [] },
  label: { fontFamily: fonts.semibold, fontSize: 9.5, letterSpacing: 0.6, textTransform: 'uppercase' },
  iconWrap: { alignItems: 'center' },
  indicator: { position: 'absolute', top: -7, width: 18, height: 2 },
})
