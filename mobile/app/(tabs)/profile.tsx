import { router, type Href } from 'expo-router'
import { Bookmark, Building2, CalendarClock, ChevronRight, Info, LayoutGrid, LogOut, MessageSquareText, Phone, UserRound, type LucideIcon } from 'lucide-react-native'
import { useState } from 'react'
import { Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useMyAppointments, useMyEnquiries, useSavedList } from '../../src/api/account'
import { useAuth } from '../../src/auth/AuthProvider'
import { AvatarEditor } from '../../src/components/account/AvatarEditor'
import { ConfirmSheet } from '../../src/components/ui/BottomSheet'
import { Button } from '../../src/components/ui/Button'
import { Segmented } from '../../src/components/ui/Chip'
import { ScreenHeader } from '../../src/components/ui/Editorial'
import { ErrorState } from '../../src/components/ui/States'
import { Text } from '../../src/components/ui/Text'
import { useToast } from '../../src/components/ui/Toast'
import { formatMonthYear } from '../../src/lib/format'
import { layout, makeStyles, space, useTheme, type ThemePreference } from '../../src/theme'

type Item = { label: string; icon: LucideIcon; href?: Href; onPress?: () => void; detail?: string; destructive?: boolean }

/** A titled group of settings-style rows: icon, label, optional value, chevron. */
function Group({ title, items }: { title: string; items: Item[] }) {
  const styles = useStyles()
  const { colors } = useTheme()
  return (
    <View style={styles.group}>
      <Text variant="caption" color={colors.textSubtle} style={styles.groupTitle}>
        {title}
      </Text>
      <View style={styles.groupBody}>
        {items.map((item, index) => (
          <Pressable
            key={item.label}
            onPress={item.onPress ?? (() => item.href && router.navigate(item.href))}
            accessibilityRole={item.href ? 'link' : 'button'}
            accessibilityLabel={item.detail ? `${item.label}, ${item.detail}` : item.label}
            style={({ pressed }) => [styles.row, index > 0 && styles.rowDivider, pressed && styles.pressed]}
          >
            <item.icon size={20} color={item.destructive ? colors.danger : colors.textMuted} strokeWidth={1.5} />
            <Text variant="label" color={item.destructive ? colors.danger : undefined} style={styles.rowLabel}>
              {item.label}
            </Text>
            {item.detail ? (
              <Text variant="small" color={colors.textSubtle}>
                {item.detail}
              </Text>
            ) : null}
            {item.destructive ? null : <ChevronRight size={18} color={colors.textSubtle} strokeWidth={1.5} />}
          </Pressable>
        ))}
      </View>
    </View>
  )
}

const companyItems: Item[] = [
  { label: 'Services', icon: LayoutGrid, href: { pathname: '/explore', params: { section: 'services' } } },
  { label: 'About BRIGHTHOMES', icon: Info, href: '/about' },
  { label: 'Contact us', icon: Phone, href: '/contact' },
]

const themeOptions: { value: ThemePreference; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
]

function Appearance() {
  const styles = useStyles()
  const { colors, preference, setPreference } = useTheme()
  return (
    <View style={styles.group}>
      <Text variant="caption" color={colors.textSubtle} style={styles.groupTitle}>
        Appearance
      </Text>
      <Segmented options={themeOptions} value={preference} onChange={setPreference} accessibilityLabel="Colour theme" role="radio" />
      <Text variant="caption" color={colors.textSubtle} style={styles.groupNote}>
        {preference === 'system' ? 'Follows your device’s light or dark setting.' : `Always ${preference}, whatever your device setting. Saved on this device.`}
      </Text>
    </View>
  )
}

export default function ProfileScreen() {
  const { status } = useAuth()
  const styles = useStyles()
  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      {status === 'authenticated' ? <AccountProfile /> : <GuestProfile />}
    </SafeAreaView>
  )
}

function GuestProfile() {
  const styles = useStyles()
  const { colors } = useTheme()
  const { status, retry } = useAuth()
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <ScreenHeader title="Account" />
      <View style={styles.guestCard}>
        <View style={styles.guestIcon}>
          <UserRound size={26} color={colors.textMuted} strokeWidth={1.3} />
        </View>
        <Text variant="heading">Your BRIGHTHOMES account</Text>
        <Text variant="small">Save projects and properties, and follow your enquiries and consultation requests.</Text>
        {status === 'unavailable' ? (
          <ErrorState title="We couldn’t reach your account" message="Check your connection and try again." onRetry={retry} />
        ) : (
          <View style={styles.guestActions}>
            <Button label="Sign in" onPress={() => router.push('/login')} fullWidth disabled={status === 'loading'} />
            <Button label="Create an account" variant="secondary" onPress={() => router.push('/register')} fullWidth />
          </View>
        )}
      </View>
      <Appearance />
      <Group title="BRIGHTHOMES" items={companyItems} />
    </ScrollView>
  )
}

const count = (value: number | undefined) => (value === undefined ? undefined : String(value))

function AccountProfile() {
  const styles = useStyles()
  const { colors } = useTheme()
  const { user, logout } = useAuth()
  const toast = useToast()
  const [confirming, setConfirming] = useState(false)
  const savedProjects = useSavedList('projects', true)
  const savedProperties = useSavedList('properties', true)
  const enquiries = useMyEnquiries(true)
  const appointments = useMyAppointments(true)
  if (!user) return null
  const name = `${user.first_name} ${user.last_name}`.trim() || user.email
  const role = user.role === 'client' ? 'Client account' : user.role === 'staff' ? 'Staff account' : 'Administrator'

  const activityItems: Item[] = [
    { label: 'Saved properties', icon: Bookmark, href: { pathname: '/saved', params: { tab: 'properties' } }, detail: count(savedProperties.data?.pages[0]?.count) },
    { label: 'Saved projects', icon: Building2, href: { pathname: '/saved', params: { tab: 'projects' } }, detail: count(savedProjects.data?.pages[0]?.count) },
    { label: 'Enquiries', icon: MessageSquareText, href: { pathname: '/activity', params: { tab: 'enquiries' } }, detail: count(enquiries.data?.pages[0]?.count) },
    { label: 'Consultations', icon: CalendarClock, href: { pathname: '/activity', params: { tab: 'appointments' } }, detail: count(appointments.data?.pages[0]?.count) },
  ]

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <ScreenHeader title="Account" />
      {/* The photo and the edit link are separate controls, side by side. */}
      <View style={styles.identity}>
        <AvatarEditor user={user} size={72} />
        <Pressable onPress={() => router.push('/profile/edit')} accessibilityRole="button" accessibilityLabel={`${name}. Edit profile`} style={({ pressed }) => [styles.identityLink, pressed && styles.pressedText]}>
          <View style={styles.identityCopy}>
          <Text variant="heading" numberOfLines={1}>
            {name}
          </Text>
          <Text variant="small" numberOfLines={1}>
            {user.email}
          </Text>
          <Text variant="caption" color={colors.textSubtle}>
            {role} · since {formatMonthYear(user.date_joined)}
            </Text>
          </View>
          <ChevronRight size={18} color={colors.textSubtle} strokeWidth={1.5} />
        </Pressable>
      </View>

      <Group title="Your activity" items={activityItems} />
      <Appearance />
      <Group title="BRIGHTHOMES" items={companyItems} />
      <Group title="Session" items={[{ label: 'Sign out', icon: LogOut, onPress: () => setConfirming(true), destructive: true }]} />

      <ConfirmSheet
        visible={confirming}
        title="Sign out?"
        message="You’ll need to sign in again to see your saved items and activity on this device."
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

const useStyles = makeStyles((c) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.background },
    content: { paddingBottom: space.xxxl, gap: space.xl },
    pressed: { backgroundColor: c.surface },
    identity: { flexDirection: 'row', alignItems: 'center', gap: space.lg, marginHorizontal: layout.gutter, padding: space.lg, backgroundColor: c.surface },
    identityLink: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: 72 },
    identityCopy: { flex: 1, gap: 2 },
    pressedText: { opacity: 0.6 },
    guestCard: { marginHorizontal: layout.gutter, padding: space.xl, gap: space.md, backgroundColor: c.surface },
    guestIcon: { width: 56, height: 56, alignItems: 'center', justifyContent: 'center', borderWidth: StyleSheet.hairlineWidth * 2, borderColor: c.border, backgroundColor: c.background },
    guestActions: { gap: space.md, marginTop: space.sm },
    group: { gap: space.sm },
    groupTitle: { marginHorizontal: layout.gutter, textTransform: 'uppercase', letterSpacing: 1.4 },
    groupNote: { marginHorizontal: layout.gutter },
    groupBody: { marginHorizontal: layout.gutter, backgroundColor: c.surface },
    row: { flexDirection: 'row', alignItems: 'center', gap: space.lg, minHeight: 56, paddingHorizontal: space.lg },
    rowDivider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.border },
    rowLabel: { flex: 1 },
  }),
)
