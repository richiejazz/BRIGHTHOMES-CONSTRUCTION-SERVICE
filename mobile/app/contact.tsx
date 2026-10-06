import { router } from 'expo-router'
import { Mail, MapPin, Phone, type LucideIcon } from 'lucide-react-native'
import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { Button } from '../src/components/ui/Button'
import { PageHeader } from '../src/components/ui/PageHeader'
import { Text } from '../src/components/ui/Text'
import { useToast } from '../src/components/ui/Toast'
import { company } from '../src/content/company'
import { colors, layout, space } from '../src/theme'

type Channel = { icon: LucideIcon; label: string; value: string; url: string; hint: string; a11yValue?: string }

const channels: Channel[] = [
  ...company.phones.map((phone) => ({ icon: Phone, label: 'Call', value: phone.display, url: phone.href, hint: 'Starts a phone call', a11yValue: phone.spoken })),
  { icon: Mail, label: 'Email', value: company.email, url: `mailto:${company.email}`, hint: 'Opens your email app' },
  { icon: MapPin, label: 'Office', value: company.address.lines.join('\n'), url: company.address.mapUrl, hint: 'Opens the address in maps' },
]

export default function ContactScreen() {
  const insets = useSafeAreaInsets()
  const toast = useToast()

  const open = async (channel: Channel) => {
    try {
      await Linking.openURL(channel.url)
    } catch {
      toast.show({ tone: 'error', title: 'Couldn’t open this on your device', message: channel.value.replace('\n', ', ') })
    }
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: insets.bottom + space.xxxl }}>
      <PageHeader eyebrow="Get in touch" title="Contact BRIGHTHOMES" intro="Speak to our team about construction services, real estate or a project you’ve seen." />
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
            <channel.icon size={20} color={colors.bronzeDark} strokeWidth={1.5} />
            <View style={styles.copy}>
              <Text variant="eyebrow" color={colors.stone500}>
                {channel.label}
              </Text>
              <Text variant="label">{channel.value}</Text>
            </View>
          </Pressable>
        ))}
      </View>
      <View style={styles.actions}>
        <Text variant="heading">Prefer to write?</Text>
        <Text variant="body">Send an enquiry from the app and, with an account, follow its status in Activity.</Text>
        <Button label="Send an Enquiry" onPress={() => router.push('/enquire')} fullWidth />
        <Button label="Request a consultation" variant="secondary" onPress={() => router.push('/consultation')} fullWidth />
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  list: { marginHorizontal: layout.gutter, borderTopWidth: 1, borderTopColor: colors.ink },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: space.lg, paddingVertical: space.lg, minHeight: 64, borderBottomWidth: 1, borderBottomColor: colors.stone200 },
  pressed: { backgroundColor: colors.bone },
  copy: { flex: 1, gap: 4 },
  actions: { marginHorizontal: layout.gutter, marginTop: space.xxxl, gap: space.md },
})
