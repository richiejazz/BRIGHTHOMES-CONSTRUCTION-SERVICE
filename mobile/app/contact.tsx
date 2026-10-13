import { router } from 'expo-router'
import { ArrowUpRight, Mail, MapPin, Phone, type LucideIcon } from 'lucide-react-native'
import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { Button } from '../src/components/ui/Button'
import { Eyebrow, ScreenHeader } from '../src/components/ui/Editorial'
import { Text } from '../src/components/ui/Text'
import { useToast } from '../src/components/ui/Toast'
import { company } from '../src/content/company'
import { layout, makeStyles, space, useTheme } from '../src/theme'

type Channel = { icon: LucideIcon; label: string; value: string; url: string; hint: string; a11yValue?: string; display?: 'large' | 'compact' }

const channels: Channel[] = [
  ...company.phones.map((phone, index) => ({ icon: Phone, label: index === 0 ? 'Call' : 'Or call', value: phone.display, url: phone.href, hint: 'Starts a phone call', a11yValue: phone.spoken, display: 'large' as const })),
  // A zero-width space lets the long address wrap after the @ rather than mid-word.
  { icon: Mail, label: 'Email', value: company.email.replace('@', '@\u200B'), url: `mailto:${company.email}`, hint: 'Opens your email app', a11yValue: company.email, display: 'compact' },
  { icon: MapPin, label: 'Office', value: company.address.lines.join('\n'), url: company.address.mapUrl, hint: 'Opens the address in maps' },
]

export default function ContactScreen() {
  const insets = useSafeAreaInsets()
  const toast = useToast()
  const styles = useStyles()
  const { colors } = useTheme()

  const open = async (channel: Channel) => {
    try {
      await Linking.openURL(channel.url)
    } catch {
      toast.show({ tone: 'error', title: 'Couldn’t open this on your device', message: channel.value.replace('\n', ', ') })
    }
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: insets.bottom + space.xxxl }}>
      <ScreenHeader title="Get in touch" subtitle="Tap to call, email or get directions." />
      <View style={styles.list}>
        {channels.map((channel) => (
          <Pressable
            key={channel.url}
            onPress={() => open(channel)}
            accessibilityRole="link"
            accessibilityLabel={`${channel.label}: ${channel.a11yValue ?? channel.value.replace('\n', ', ')}`}
            accessibilityHint={channel.hint}
            style={({ pressed }) => [styles.row, pressed && styles.pressed]}
          >
            <channel.icon size={18} color={colors.accent} strokeWidth={1.4} style={styles.icon} />
            <View style={styles.copy}>
              <Text variant="eyebrow" color={colors.textSubtle}>
                {channel.label}
              </Text>
              <Text variant={channel.display === 'large' ? 'title' : channel.display === 'compact' ? 'small' : 'label'} color={colors.text}>
                {channel.value}
              </Text>
            </View>
            <ArrowUpRight size={18} color={colors.textMuted} strokeWidth={1.4} />
          </Pressable>
        ))}
      </View>
      <View style={styles.actions}>
        <Eyebrow label="Prefer to write?" />
        <Text variant="title">Send a message from the app.</Text>
        <Text variant="body">With an account, you can follow its status in Activity.</Text>
        <Button label="Send an enquiry" onPress={() => router.push('/enquire')} fullWidth />
        <Button label="Request a consultation" variant="secondary" onPress={() => router.push('/consultation')} fullWidth />
      </View>
    </ScrollView>
  )
}

const useStyles = makeStyles((c) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.background },
    list: { marginHorizontal: layout.gutter, borderTopWidth: 1, borderTopColor: c.borderStrong },
    row: { flexDirection: 'row', alignItems: 'center', gap: space.lg, paddingVertical: space.xl, minHeight: 72, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.border },
    icon: { alignSelf: 'flex-start', marginTop: 2 },
    pressed: { backgroundColor: c.surface },
    copy: { flex: 1, gap: space.sm },
    actions: { marginHorizontal: layout.gutter, marginTop: space.section, gap: space.md },
  }),
)
