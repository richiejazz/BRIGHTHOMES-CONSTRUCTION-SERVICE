import { Tabs } from 'expo-router'
import { Bookmark, Building2, ClipboardList, House, UserRound, type LucideIcon } from 'lucide-react-native'
import { StyleSheet, View, type ColorValue } from 'react-native'

import { colors, fonts } from '../../src/theme'

function TabIcon({ Icon, color, focused }: { Icon: LucideIcon; color: ColorValue; focused: boolean }) {
  return (
    <View style={styles.iconWrap}>
      {/* A short bronze rule marks the active tab, echoing the drawing-line motif. */}
      <View style={[styles.indicator, focused && styles.indicatorActive]} />
      <Icon size={22} color={String(color)} strokeWidth={focused ? 1.9 : 1.5} />
    </View>
  )
}

const tab = (title: string, Icon: LucideIcon) => ({
  title,
  tabBarAccessibilityLabel: title,
  tabBarIcon: ({ color, focused }: { color: ColorValue; focused: boolean }) => <TabIcon Icon={Icon} color={color} focused={focused} />,
})

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.ink,
        tabBarInactiveTintColor: colors.stone500,
        tabBarStyle: styles.bar,
        tabBarLabelStyle: styles.label,
        tabBarHideOnKeyboard: true,
        sceneStyle: { backgroundColor: colors.paper },
      }}
    >
      <Tabs.Screen name="index" options={tab('Home', House)} />
      <Tabs.Screen name="projects" options={tab('Projects', Building2)} />
      <Tabs.Screen name="saved" options={tab('Saved', Bookmark)} />
      <Tabs.Screen name="activity" options={tab('Activity', ClipboardList)} />
      <Tabs.Screen name="profile" options={tab('Profile', UserRound)} />
    </Tabs>
  )
}

const styles = StyleSheet.create({
  bar: { backgroundColor: colors.paper, borderTopColor: colors.stone300, borderTopWidth: StyleSheet.hairlineWidth, elevation: 0, boxShadow: [] },
  label: { fontFamily: fonts.semibold, fontSize: 11, letterSpacing: 0.3 },
  iconWrap: { alignItems: 'center' },
  indicator: { position: 'absolute', top: -7, width: 18, height: 2, backgroundColor: 'transparent' },
  indicatorActive: { backgroundColor: colors.bronze },
})
