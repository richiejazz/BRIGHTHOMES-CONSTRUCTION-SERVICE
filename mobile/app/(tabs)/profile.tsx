import { router } from 'expo-router'
import { Bookmark, Building2, CalendarClock, ChevronRight, Info, LayoutGrid, LogOut, MessageSquareText, Pencil, Phone, type LucideIcon } from 'lucide-react-native'
import { useState } from 'react'
import { Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useAuth } from '../../src/auth/AuthProvider'
import { SignInRequired } from '../../src/auth/SignInRequired'
import { ConfirmSheet } from '../../src/components/ui/BottomSheet'
import { Button } from '../../src/components/ui/Button'
import { PageHeader } from '../../src/components/ui/PageHeader'
import { Text } from '../../src/components/ui/Text'
import { useToast } from '../../src/components/ui/Toast'
import { formatMonthYear } from '../../src/lib/format'
import { colors, fonts, layout, space } from '../../src/theme'

type Item = { label: string; icon: LucideIcon; href: string }

const activityItems: Item[] = [
  { label: 'Saved projects', icon: Bookmark, href: '/saved' },
  { label: 'Enquiries', icon: MessageSquareText, href: '/activity?tab=enquiries' },
  { label: 'Consultation requests', icon: CalendarClock, href: '/activity?tab=appointments' },
]

const companyItems: Item[] = [
  { label: 'Services', icon: LayoutGrid, href: '/services' },
  { label: 'Projects', icon: Building2, href: '/projects' },
  { label: 'About BRIGHTHOMES', icon: Info, href: '/about' },
  { label: 'Contact us', icon: Phone, href: '/contact' },
]

function Menu({ title, items }: { title: string; items: Item[] }) {
  return (
    <View style={styles.menu}>
      <Text variant="eyebrow" color={colors.stone500} style={styles.menuTitle}>
        {title}
      </Text>
      {items.map((item) => (
        <Pressable key={item.label} onPress={() => router.navigate(item.href)} accessibilityRole="link" accessibilityLabel={item.label} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
          <item.icon size={20} color={colors.bronzeDark} strokeWidth={1.5} />
          <Text variant="label" style={styles.rowLabel}>
            {item.label}
          </Text>
          <ChevronRight size={18} color={colors.stone500} strokeWidth={1.5} />
        </Pressable>
      ))}
    </View>
  )
}

export default function ProfileScreen() {
  const { status } = useAuth()
  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      {status === 'authenticated' ? (
        <AccountProfile />
      ) : (
        <SignInRequired
          title="Your BRIGHTHOMES account"
          message="Sign in or create a free client account to save projects and follow your enquiries and consultation requests."
          header={<PageHeader eyebrow="Client account" title="Profile" />}
          footer={<Menu title="BRIGHTHOMES" items={companyItems} />}
        >
          {null}
        </SignInRequired>
      )}
    </SafeAreaView>
  )
}

function AccountProfile() {
  const { user, logout } = useAuth()
  const toast = useToast()
  const [confirming, setConfirming] = useState(false)
  if (!user) return null
  const name = `${user.first_name} ${user.last_name}`.trim() || user.email
  const initials = `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase() || user.email.charAt(0).toUpperCase()

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <PageHeader eyebrow="Client account" title="Profile" />
      <View style={styles.identity}>
        <View style={styles.avatar} aria-hidden>
          <Text style={styles.initials}>{initials}</Text>
        </View>
        <View style={styles.identityCopy}>
          <Text variant="heading">{name}</Text>
          <Text variant="small" selectable>
            {user.email}
          </Text>
          <Text variant="small" color={colors.stone500}>
            Member since {formatMonthYear(user.date_joined)}
          </Text>
        </View>
      </View>
      <View style={styles.inset}>
        <Button label="Edit profile" variant="secondary" icon={Pencil} onPress={() => router.push('/profile/edit')} fullWidth />
      </View>

      <Menu title="Your activity" items={activityItems} />
      <Menu title="BRIGHTHOMES" items={companyItems} />

      <View style={styles.inset}>
        <Button label="Sign out" variant="secondary" icon={LogOut} onPress={() => setConfirming(true)} fullWidth />
      </View>

      <ConfirmSheet
        visible={confirming}
        title="Sign out?"
        message="You’ll need to sign in again to see your saved projects and activity on this device."
        confirmLabel="Sign out"
        onCancel={() => setConfirming(false)}
        onConfirm={() => {
          setConfirming(false)
          logout()
          toast.show({ tone: 'info', title: 'You’ve signed out.' })
        }}
      />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  content: { paddingBottom: space.xxxl, gap: space.xl },
  inset: { marginHorizontal: layout.gutter },
  identity: { flexDirection: 'row', alignItems: 'center', gap: space.lg, marginHorizontal: layout.gutter, paddingVertical: space.lg, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.stone300 },
  avatar: { width: 64, height: 64, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
  initials: { fontFamily: fonts.display, fontSize: 28, color: colors.bronzeLight },
  identityCopy: { flex: 1, gap: 2 },
  menu: { marginHorizontal: layout.gutter },
  menuTitle: { marginBottom: space.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.lg, minHeight: 56, borderBottomWidth: 1, borderBottomColor: colors.stone200 },
  rowLabel: { flex: 1 },
  pressed: { backgroundColor: colors.bone },
})
