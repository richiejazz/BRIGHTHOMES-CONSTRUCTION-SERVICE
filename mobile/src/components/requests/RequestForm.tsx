import { router, useLocalSearchParams } from 'expo-router'
import { CheckCircle2, X } from 'lucide-react-native'
import { useEffect, useRef, useState } from 'react'
import { Pressable, StyleSheet, View, type ScrollView, type TextInput } from 'react-native'

import { useSubmitAppointment, useSubmitEnquiry } from '../../api/account'
import { useProject, useServices } from '../../api/content'
import { toApiError } from '../../api/errors'
import type { Appointment, Enquiry, User } from '../../api/types'
import { useAuth } from '../../auth/AuthProvider'
import { formatWeekdayDate, localDate, todayIso } from '../../lib/format'
import { compact, validateEmail, validateMessage, validateName, validatePhone, type FieldErrors } from '../../lib/validation'
import { colors, space } from '../../theme'
import { preferredSlot } from '../activity/RequestRows'
import { DemoBadge } from '../ui/Badges'
import { Button } from '../ui/Button'
import { DateTimeField } from '../ui/DateTimeField'
import { FormAlert, FormScreen } from '../ui/FormScreen'
import { SelectField } from '../ui/SelectField'
import { Text } from '../ui/Text'
import { TextField } from '../ui/TextField'

type Kind = 'enquiry' | 'appointment'
type Values = { name: string; email: string; phone: string; service: string; message: string; preferred_date: string; preferred_time: string; time_window: string }
type Field = keyof Values

const TIME_WINDOWS = [
  { value: '', label: 'No preference' },
  { value: 'Morning', label: 'Morning' },
  { value: 'Afternoon', label: 'Afternoon' },
]

const fullName = (user: User | null) => (user ? `${user.first_name} ${user.last_name}`.trim() : '')

/**
 * Enquiry or consultation request. Works signed out (the API accepts anonymous requests);
 * signed-in clients get their details prefilled and can follow the request in Activity.
 * Opened with optional `project` and `service` slug params for context.
 */
export function RequestForm({ kind }: { kind: Kind }) {
  const params = useLocalSearchParams<{ project?: string; service?: string }>()
  const { user, status } = useAuth()
  const project = useProject(params.project)
  const services = useServices()
  const enquiry = useSubmitEnquiry()
  const appointment = useSubmitAppointment()
  const mutation = kind === 'enquiry' ? enquiry : appointment

  const [includeProject, setIncludeProject] = useState(Boolean(params.project))
  const [values, setValues] = useState<Values>(() => ({ name: fullName(user), email: user?.email ?? '', phone: '', service: params.service ?? '', message: '', preferred_date: '', preferred_time: '', time_window: '' }))
  const [errors, setErrors] = useState<FieldErrors<Field>>({})
  const [formError, setFormError] = useState<string>()
  const scroll = useRef<ScrollView>(null)
  const emailRef = useRef<TextInput>(null)
  const phoneRef = useRef<TextInput>(null)

  // Prefill from the account once it loads, without overwriting anything already typed.
  useEffect(() => {
    if (user) setValues((current) => ({ ...current, name: current.name || fullName(user), email: current.email || user.email }))
  }, [user])

  const set = (field: Field) => (value: string) => {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => (current[field] ? { ...current, [field]: undefined } : current))
  }

  if (mutation.isSuccess) return <Success kind={kind} record={mutation.data} signedIn={status === 'authenticated'} />

  const linkedProject = includeProject ? project.data : undefined
  const waitingForProject = includeProject && project.isPending && Boolean(params.project)
  const today = todayIso()

  const validate = () =>
    compact<Field>({
      name: validateName(values.name, 'your name', 160),
      email: validateEmail(values.email),
      phone: validatePhone(values.phone),
      message: validateMessage(values.message, kind === 'enquiry'),
      preferred_date: kind === 'appointment' ? (!values.preferred_date ? 'Please choose a preferred date.' : values.preferred_date < today ? 'Please choose a date from today onwards.' : undefined) : undefined,
    })

  const onSubmit = () => {
    setFormError(undefined)
    const found = validate()
    setErrors(found)
    if (Object.keys(found).length) {
      setFormError('Please review the highlighted fields.')
      scroll.current?.scrollTo({ y: 0, animated: true })
      return
    }
    const base = {
      name: values.name.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
      message: values.message.trim(),
      service: services.data?.find((service) => service.slug === values.service)?.id ?? null,
      project: linkedProject?.id ?? null,
    }
    const onError = (error: unknown) => {
      const apiError = toApiError(error)
      const fieldErrors: FieldErrors<Field> = {}
      const other: string[] = []
      for (const [field, message] of Object.entries(apiError.fieldErrors)) {
        if (field in values && field !== 'service') fieldErrors[field as Field] = message
        else other.push(message)
      }
      setErrors(fieldErrors)
      setFormError(other[0] ?? (Object.keys(fieldErrors).length ? 'Please review the highlighted fields.' : apiError.message))
      scroll.current?.scrollTo({ y: 0, animated: true })
    }
    if (kind === 'enquiry') enquiry.mutate(base, { onError })
    else appointment.mutate({ ...base, preferred_date: values.preferred_date, preferred_time: values.preferred_time || null, time_window: values.time_window }, { onError })
  }

  const serviceOptions = [{ value: '', label: 'Not sure yet' }, ...(services.data ?? []).map((service) => ({ value: service.slug, label: service.name }))]

  return (
    <FormScreen ref={scroll}>
      <View style={styles.intro}>
        <Text variant="title">{kind === 'enquiry' ? 'How can we help?' : 'Meet the BRIGHTHOMES team'}</Text>
        <Text variant="body">
          {kind === 'enquiry'
            ? 'Tell us about your plans or ask about a project. We’ll reply using the details you provide.'
            : 'Choose a preferred date and time. This is a request, not a confirmed booking — our team will contact you to confirm.'}
        </Text>
      </View>

      {status === 'anonymous' ? (
        <View style={styles.notice}>
          <Text variant="small" color={colors.graphite}>
            You can send this without an account. Sign in first if you’d like to follow it in Activity.
          </Text>
          <Button label="Sign in" variant="link" onPress={() => router.push('/login')} />
        </View>
      ) : null}

      {linkedProject ? (
        <View style={styles.context} accessible accessibilityLabel={`Regarding project: ${linkedProject.title}${linkedProject.is_demo ? ', demo content' : ''}`}>
          <View style={styles.contextCopy}>
            <Text variant="eyebrow" color={colors.stone500}>
              Regarding project
            </Text>
            <Text variant="label">{linkedProject.title}</Text>
            {linkedProject.is_demo ? <DemoBadge /> : null}
          </View>
          <Pressable onPress={() => setIncludeProject(false)} accessibilityRole="button" accessibilityLabel="Remove project from this request" hitSlop={6} style={styles.remove}>
            <X size={18} color={colors.stone600} strokeWidth={1.6} />
          </Pressable>
        </View>
      ) : null}

      <FormAlert message={formError} />

      <TextField label="Full name" value={values.name} onChangeText={set('name')} error={errors.name} autoComplete="name" textContentType="name" returnKeyType="next" onSubmitEditing={() => emailRef.current?.focus()} submitBehavior="submit" />
      <TextField ref={emailRef} label="Email address" value={values.email} onChangeText={set('email')} error={errors.email} keyboardType="email-address" autoCapitalize="none" autoComplete="email" textContentType="emailAddress" returnKeyType="next" onSubmitEditing={() => phoneRef.current?.focus()} submitBehavior="submit" />
      <TextField ref={phoneRef} label="Phone number" optional value={values.phone} onChangeText={set('phone')} error={errors.phone} keyboardType="phone-pad" autoComplete="tel" textContentType="telephoneNumber" />
      <SelectField
        label="Service of interest"
        optional
        value={values.service}
        onChange={set('service')}
        options={serviceOptions}
        placeholder={services.isPending ? 'Loading services…' : 'Not sure yet'}
        disabled={services.isPending}
        hint={services.isError ? 'Services couldn’t be loaded; you can still describe your needs below.' : undefined}
      />

      {kind === 'appointment' ? (
        <>
          <DateTimeField label="Preferred date" mode="date" value={values.preferred_date} onChange={set('preferred_date')} placeholder="Choose a date" minimumDate={localDate(today)} error={errors.preferred_date} />
          <DateTimeField label="Preferred time" mode="time" optional value={values.preferred_time} onChange={set('preferred_time')} placeholder="Choose a time" error={errors.preferred_time} />
          <SelectField label="Or a time of day" optional value={values.time_window} onChange={set('time_window')} options={TIME_WINDOWS} placeholder="No preference" error={errors.time_window} />
        </>
      ) : null}

      <TextField
        label={kind === 'enquiry' ? 'Your message' : 'Anything we should know?'}
        optional={kind === 'appointment'}
        value={values.message}
        onChangeText={set('message')}
        error={errors.message}
        multiline
        maxLength={4000}
        placeholder={kind === 'enquiry' ? 'Tell us about your project, site or timeline' : 'Site location, project stage or questions'}
      />

      <Button
        label={mutation.isPending ? 'Sending…' : kind === 'enquiry' ? 'Send enquiry' : 'Request consultation'}
        loading={mutation.isPending}
        disabled={waitingForProject}
        onPress={onSubmit}
        fullWidth
      />
    </FormScreen>
  )
}

function Success({ kind, record, signedIn }: { kind: Kind; record: Enquiry | Appointment; signedIn: boolean }) {
  const appointment = kind === 'appointment' ? (record as Appointment) : null
  const done = () => (router.canGoBack() ? router.back() : router.replace('/'))
  return (
    <FormScreen>
      <View style={styles.success} accessibilityRole="alert">
        <CheckCircle2 size={36} color={colors.bronzeDark} strokeWidth={1.4} />
        <Text variant="display">{appointment ? 'Your consultation request is in.' : 'Thank you — we’ve received your enquiry.'}</Text>
        <Text variant="body">
          {appointment
            ? 'We’ll contact you to confirm a suitable date and time. Your preferred slot is a request, not yet a confirmed booking.'
            : 'A member of the BRIGHTHOMES team will be in touch using the details you provided.'}
        </Text>
        {appointment ? (
          <View style={styles.summary}>
            <Text variant="eyebrow" color={colors.stone500}>
              Status: Requested
            </Text>
            <Text variant="label">
              Preferred: {formatWeekdayDate(appointment.preferred_date)} · {preferredSlot(appointment)}
            </Text>
          </View>
        ) : null}
      </View>
      <View style={styles.actions}>
        {signedIn ? (
          <Button label="View in Activity" onPress={() => router.dismissTo(`/activity?tab=${kind === 'enquiry' ? 'enquiries' : 'appointments'}`)} fullWidth />
        ) : (
          <>
            <Text variant="small" color={colors.stone600}>
              This was sent without an account, so it won’t appear in Activity. Create an account to follow future requests.
            </Text>
            <Button label="Create Account" variant="secondary" onPress={() => router.replace('/register')} fullWidth />
          </>
        )}
        <Button label="Done" variant={signedIn ? 'secondary' : 'primary'} onPress={done} fullWidth />
      </View>
    </FormScreen>
  )
}

const styles = StyleSheet.create({
  intro: { gap: space.sm },
  notice: { gap: 0, padding: space.md, paddingBottom: 0, borderWidth: 1, borderColor: colors.stone300 },
  context: { flexDirection: 'row', alignItems: 'flex-start', gap: space.md, padding: space.lg, backgroundColor: colors.bone, borderLeftWidth: 2, borderLeftColor: colors.bronze },
  contextCopy: { flex: 1, gap: space.xs },
  remove: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', marginTop: -10, marginRight: -10 },
  success: { gap: space.lg, borderLeftWidth: 2, borderLeftColor: colors.bronze, paddingLeft: space.xl, paddingVertical: space.lg },
  summary: { gap: space.xs, borderTopWidth: 1, borderTopColor: colors.stone300, paddingTop: space.md },
  actions: { gap: space.md },
})
