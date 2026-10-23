import { Heart, Upload } from 'lucide-react'
import { useRef, useState, type ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'

import { useMyAppointments, useMyEnquiries, useRemoveAvatar, useRemoveSavedProject, useRemoveSavedProperty, useSavedProjects, useSavedProperties, useUpdateProfile, useUploadAvatar } from '../../api/account'
import { toApiError } from '../../api/errors'
import type { Appointment, Enquiry, SavedProject, SavedProperty } from '../../api/types'
import { Avatar } from '../../components/account/Avatar'
import { contactRules } from '../../lib/forms'
import { Media } from '../../components/media/Media'
import { ConsultationPill, EnquiryPill, ListingTag } from '../../components/ui/Badges'
import { Button, ButtonLink } from '../../components/ui/Button'
import { Segmented } from '../../components/ui/Controls'
import { FormAlert, TextField } from '../../components/ui/FormField'
import { Pagination } from '../../components/ui/Pagination'
import { EmptyState, ErrorState, LoadingAnnouncement, Skeleton } from '../../components/ui/States'
import { useToast } from '../../components/ui/toast-context'
import { useAuth } from '../../context/useAuth'
import { useTheme } from '../../context/useTheme'
import type { Theme } from '../../context/theme-context'
import { formatDate } from '../../lib/format'
import { consultationModeLabels, formatPrice, isClosed, projectStatusLabels } from '../../lib/labels'
import { routes } from '../../lib/routes'

function Title({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <h2 className="font-display text-[clamp(30px,3vw,40px)] leading-[1.05] font-medium">{children}</h2>
      {action}
    </div>
  )
}

function ListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div aria-busy="true" className="border-t border-line">
      <LoadingAnnouncement />
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="flex items-center justify-between gap-6 border-b border-line py-5">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-1/4" />
          </div>
          <Skeleton className="h-6 w-24" />
        </div>
      ))}
    </div>
  )
}

function regarding(record: Enquiry | Appointment) {
  if (record.property_summary) return { title: record.property_summary.title, kind: 'Property enquiry', to: record.property_summary.is_published ? routes.property(record.property_summary.slug) : undefined }
  if (record.project_summary) return { title: record.project_summary.title, kind: 'Project enquiry', to: record.project_summary.is_published ? routes.project(record.project_summary.slug) : undefined }
  if (record.service_summary) return { title: record.service_summary.name, kind: 'Service enquiry', to: routes.service(record.service_summary.slug) }
  return { title: 'General enquiry', kind: 'Message', to: undefined }
}

function consultationTitle(record: Appointment) {
  const names = record.services_summary.length ? record.services_summary.map((service) => service.name) : record.service_summary ? [record.service_summary.name] : []
  if (record.services_not_sure) names.push('Not sure yet')
  return names.join(', ') || 'Consultation'
}

function consultationWhen(record: Appointment) {
  const when = [record.preferred_date && formatDate(record.preferred_date), record.time_window].filter(Boolean).join(' · ')
  return record.status === 'confirmed' ? `Confirmed for ${when}` : `Preferred ${when}`
}

// --- W-15 Overview -----------------------------------------------------------------------------

export function OverviewPage() {
  const savedProjects = useSavedProjects(1)
  const savedProperties = useSavedProperties(1)
  const enquiries = useMyEnquiries(1)
  const consultations = useMyAppointments(1)
  const figures = [
    { label: 'Saved projects', value: savedProjects.data?.count, to: routes.account.savedProjects },
    { label: 'Saved properties', value: savedProperties.data?.count, to: routes.account.savedProperties },
    { label: 'Enquiries', value: enquiries.data?.count, to: routes.account.enquiries },
    { label: 'Consultations', value: consultations.data?.count, to: routes.account.consultations },
  ]
  const recent = [
    ...(enquiries.data?.results ?? []).map((record) => ({ kind: 'enquiry' as const, record })),
    ...(consultations.data?.results ?? []).map((record) => ({ kind: 'consultation' as const, record })),
  ]
    .sort((a, b) => b.record.created_at.localeCompare(a.record.created_at))
    .slice(0, 6)
  const loading = enquiries.isPending || consultations.isPending

  return (
    <section>
      <title>Account overview — BRIGHTHOMES Construction Service</title>
      <h2 className="sr-only">Overview</h2>
      <dl className="grid grid-cols-2 border-y border-line phone:grid-cols-4">
        {figures.map((figure, index) => (
          <div key={figure.label} className={`border-line py-5 pr-3 ${index % 2 ? 'border-l pl-4' : ''} ${index === 2 ? 'border-t phone:border-t-0 phone:border-l phone:pl-4' : ''} ${index === 3 ? 'border-t phone:border-t-0' : ''}`}>
            <dd className="font-display text-[44px] leading-none [font-variant-numeric:lining-nums]">{figure.value === undefined ? '—' : String(figure.value).padStart(2, '0')}</dd>
            <dt className="mt-2 text-[12px]">
              <Link to={figure.to} className="text-ink2 hover:text-bronze">
                {figure.label}
              </Link>
            </dt>
          </div>
        ))}
      </dl>
      <h3 className="label mt-12 text-bronze">Recent activity</h3>
      {loading ? (
        <div className="mt-4">
          <ListSkeleton />
        </div>
      ) : enquiries.isError || consultations.isError ? (
        <ErrorState className="mt-4" title="We couldn’t load your activity." error={enquiries.error ?? consultations.error} onRetry={() => void Promise.all([enquiries.refetch(), consultations.refetch()])} />
      ) : recent.length === 0 ? (
        <EmptyState className="mt-4" title="No activity yet." action={<ButtonLink to={routes.consultation()} size="compact">Request a consultation</ButtonLink>}>
          Enquiries and consultation requests you send while signed in appear here, with their status.
        </EmptyState>
      ) : (
        <ul className="mt-4 border-t border-line">
          {recent.map(({ kind, record }) => {
            const title = kind === 'consultation' ? consultationTitle(record as Appointment) : regarding(record).title
            return (
              <li key={`${kind}-${record.id}`} className="grid gap-2 border-b border-line py-5 phone:grid-cols-[1fr_auto_auto] phone:items-center phone:gap-6">
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-semibold">{title}</p>
                  <p className="mt-1 text-[12px] text-ink2">
                    {kind === 'consultation' ? 'Consultation' : regarding(record).kind} · {record.reference}
                  </p>
                </div>
                <p className="text-[12px] text-ink2">{kind === 'consultation' ? consultationWhen(record as Appointment) : formatDate(record.created_at)}</p>
                <div>{kind === 'consultation' ? <ConsultationPill status={(record as Appointment).status} /> : <EnquiryPill status={(record as Enquiry).status} />}</div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

// --- W-16 / W-17 Saved ------------------------------------------------------------------------

function SavedTile({ image, overline, title, to, price, closed, onRemove, removing, tag }: { image?: string | null; overline: string; title: string; to?: string; price?: string; closed?: boolean; onRemove: () => void; removing: boolean; tag?: ReactNode }) {
  return (
    <article className="group relative">
      <div className="relative">
        {to ? (
          <Link to={to} aria-label={title}>
            <Media src={image} alt="" aspect="aspect-[4/3]" greyscale={closed} zoom />
          </Link>
        ) : (
          <Media src={image} alt="" aspect="aspect-[4/3]" greyscale />
        )}
        {tag}
        <button type="button" onClick={onRemove} disabled={removing} aria-label={`Remove ${title} from Saved`} aria-pressed className="absolute top-3 right-3 inline-flex size-11 items-center justify-center bg-bg text-bronze disabled:opacity-60">
          <Heart aria-hidden="true" className="size-[18px] fill-bronze" strokeWidth={1.5} />
        </button>
      </div>
      <div className="mt-3 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="label text-[10px] text-mute">{overline}</p>
          <h3 className="mt-1 font-display text-[22px] leading-[1.1] font-medium">{to ? <Link to={to} className="hover:text-bronze">{title}</Link> : title}</h3>
          {!to && <p className="mt-1 text-[12px] text-ink2">No longer published</p>}
        </div>
        {price && <p className={`shrink-0 pt-4 text-[14px] font-semibold ${closed ? 'text-mute line-through' : ''}`}>{price}</p>}
      </div>
    </article>
  )
}

function SavedList<T extends { id: number }>({
  query,
  page,
  setPage,
  empty,
  render,
  label,
}: {
  query: { isPending: boolean; isError: boolean; error: unknown; refetch: () => unknown; data?: { count: number; results: T[] } }
  page: number
  setPage: (page: number) => void
  empty: ReactNode
  render: (item: T) => ReactNode
  label: string
}) {
  if (query.isPending)
    return (
      <div className="grid gap-x-6 gap-y-10 phone:grid-cols-2" aria-busy="true">
        <LoadingAnnouncement />
        {[0, 1].map((index) => (
          <Skeleton key={index} className="aspect-[4/3]" />
        ))}
      </div>
    )
  if (query.isError || !query.data) return <ErrorState error={query.error} onRetry={() => void query.refetch()} />
  if (query.data.results.length === 0) return page > 1 ? <EmptyState title="Nothing on this page." action={<Button size="compact" onClick={() => setPage(1)}>First page</Button>} /> : <>{empty}</>
  return (
    <>
      <div className="grid gap-x-6 gap-y-12 phone:grid-cols-2">{query.data.results.map(render)}</div>
      <div className="mt-10">
        <Pagination page={page} count={query.data.count} onChange={setPage} label={label} />
      </div>
    </>
  )
}

function SavedProjectTile({ saved }: { saved: SavedProject }) {
  const remove = useRemoveSavedProject()
  const notify = useToast()
  const project = saved.project_summary
  return (
    <SavedTile
      image={project.cover_image?.image}
      overline={`${project.category} · ${projectStatusLabels[project.status]}${project.is_demo ? ' · Illustrative' : ''}`}
      title={project.title}
      to={project.is_published ? routes.project(project.slug) : undefined}
      removing={remove.isPending}
      onRemove={() => remove.mutate(saved.id, { onSuccess: () => notify({ tone: 'info', title: 'Removed from Saved' }), onError: (error) => notify({ tone: 'error', title: 'We couldn’t remove this project', description: toApiError(error).message }) })}
    />
  )
}

export function SavedProjectsPage() {
  const [page, setPage] = useState(1)
  const saved = useSavedProjects(page)
  return (
    <section>
      <title>Saved projects — BRIGHTHOMES Construction Service</title>
      <Title>Saved projects</Title>
      <SavedList<SavedProject>
        query={saved}
        page={page}
        setPage={setPage}
        label="Saved project pages"
        render={(item) => <SavedProjectTile key={item.id} saved={item} />}
        empty={
          <EmptyState title="No saved projects yet." action={<ButtonLink to={routes.construction} size="compact">View projects</ButtonLink>}>
            Save case studies you’d like to reference for your own build.
          </EmptyState>
        }
      />
    </section>
  )
}

function SavedPropertyTile({ saved }: { saved: SavedProperty }) {
  const remove = useRemoveSavedProperty()
  const notify = useToast()
  const property = saved.property_summary
  const closed = isClosed(property.status) && !property.is_demo
  return (
    <SavedTile
      image={property.cover_image?.image}
      overline={`${property.category}${property.is_demo ? ' · Sample listing' : ''}`}
      title={property.title}
      to={property.is_published ? routes.property(property.slug) : undefined}
      price={formatPrice(property).amount}
      closed={closed}
      tag={<ListingTag listing={property.listing_type} className="absolute top-3 left-3" />}
      removing={remove.isPending}
      onRemove={() => remove.mutate(saved.id, { onSuccess: () => notify({ tone: 'info', title: 'Removed from Saved' }), onError: (error) => notify({ tone: 'error', title: 'We couldn’t remove this property', description: toApiError(error).message }) })}
    />
  )
}

export function SavedPropertiesPage() {
  const [page, setPage] = useState(1)
  const saved = useSavedProperties(page)
  return (
    <section>
      <title>Saved properties — BRIGHTHOMES Construction Service</title>
      <Title>Saved properties</Title>
      <SavedList<SavedProperty>
        query={saved}
        page={page}
        setPage={setPage}
        label="Saved property pages"
        render={(item) => <SavedPropertyTile key={item.id} saved={item} />}
        empty={
          <EmptyState title="No saved properties yet." action={<ButtonLink to={routes.realEstate} size="compact">Explore properties</ButtonLink>}>
            Tap the heart on any listing to keep a shortlist here. Sold properties stay, greyed, for reference.
          </EmptyState>
        }
      />
    </section>
  )
}

// --- W-18 Enquiries ---------------------------------------------------------------------------

export function EnquiriesPage() {
  const [page, setPage] = useState(1)
  const enquiries = useMyEnquiries(page)
  return (
    <section>
      <title>My enquiries — BRIGHTHOMES Construction Service</title>
      <Title action={<ButtonLink to={routes.contact} variant="text">New enquiry</ButtonLink>}>Enquiries</Title>
      {enquiries.isPending ? (
        <ListSkeleton />
      ) : enquiries.isError ? (
        <ErrorState error={enquiries.error} onRetry={() => void enquiries.refetch()} />
      ) : enquiries.data.results.length === 0 ? (
        <EmptyState title="No enquiries yet." action={<ButtonLink to={routes.contact} size="compact">Send an enquiry</ButtonLink>}>
          Enquiries you send while signed in appear here, with where each one stands.
        </EmptyState>
      ) : (
        <>
          <div className="hidden grid-cols-[1fr_7rem_8rem_7rem] gap-4 border-b border-ink pb-3 phone:grid">
            {['Subject', 'Reference', 'Sent', 'Status'].map((heading) => (
              <p key={heading} className={`label text-[10px] text-mute ${heading === 'Status' ? 'text-right' : ''}`}>
                {heading}
              </p>
            ))}
          </div>
          <ul>
            {enquiries.data.results.map((record) => {
              const subject = regarding(record)
              return (
                <li key={record.id} className="border-b border-line">
                  {/* PRD: selecting a row reveals the original message. */}
                  <details className="group">
                    <summary className="grid cursor-pointer list-none gap-1 py-5 phone:grid-cols-[1fr_7rem_8rem_7rem] phone:items-center phone:gap-4 [&::-webkit-details-marker]:hidden">
                      <span className="min-w-0">
                        <span className="block truncate text-[14px] font-semibold group-hover:text-bronze">{subject.title}</span>
                        <span className="block text-[12px] text-ink2">{subject.kind}</span>
                      </span>
                      <span className="text-[12px] text-ink2 tabular-nums">{record.reference}</span>
                      <span className="text-[12px] text-ink2">{formatDate(record.created_at)}</span>
                      <span className="phone:text-right">
                        <EnquiryPill status={record.status} />
                      </span>
                    </summary>
                    <div className="pb-6">
                      <p className="max-w-2xl text-[14px] leading-[1.6] whitespace-pre-line text-ink2">{record.message}</p>
                      {subject.to && (
                        <Link to={subject.to} className="text-link mt-3">
                          View {subject.kind.split(' ')[0].toLowerCase()}
                        </Link>
                      )}
                    </div>
                  </details>
                </li>
              )
            })}
          </ul>
          <div className="mt-10">
            <Pagination page={page} count={enquiries.data.count} onChange={setPage} label="Enquiry pages" />
          </div>
        </>
      )}
    </section>
  )
}

// --- W-19 Consultations -----------------------------------------------------------------------

export function ConsultationsPage() {
  const [page, setPage] = useState(1)
  const consultations = useMyAppointments(page)
  return (
    <section>
      <title>My consultations — BRIGHTHOMES Construction Service</title>
      <Title action={<ButtonLink to={routes.consultation()} variant="text">New request</ButtonLink>}>Consultations</Title>
      {consultations.isPending ? (
        <ListSkeleton />
      ) : consultations.isError ? (
        <ErrorState error={consultations.error} onRetry={() => void consultations.refetch()} />
      ) : consultations.data.results.length === 0 ? (
        <EmptyState title="No consultation requests yet." action={<ButtonLink to={routes.consultation()} size="compact">Request a consultation</ButtonLink>}>
          Tell us about your land, drawings or property search and we’ll arrange a time.
        </EmptyState>
      ) : (
        <>
          <ul className="space-y-4">
            {consultations.data.results.map((record) => (
              <li key={record.id} className="border border-line2 p-5 phone:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="label text-[10px] text-mute">{record.reference}</p>
                    <p className="mt-2 font-display text-[24px] leading-[1.15] font-medium">{consultationTitle(record)}</p>
                    <p className="mt-2 text-[12px] text-ink2">
                      {consultationWhen(record)}
                      {record.mode && ` · ${consultationModeLabels[record.mode]}`}
                    </p>
                  </div>
                  <ConsultationPill status={record.status} long />
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-[12px] text-ink2">Requests stay marked as requested until BRIGHTHOMES confirms a date with you.</p>
          <div className="mt-10">
            <Pagination page={page} count={consultations.data.count} onChange={setPage} label="Consultation pages" />
          </div>
        </>
      )}
    </section>
  )
}

// --- W-20 Profile -----------------------------------------------------------------------------

type ProfileValues = { first_name: string; last_name: string; phone: string }

function PhotoControl() {
  const { user } = useAuth()
  const upload = useUploadAvatar()
  const remove = useRemoveAvatar()
  const notify = useToast()
  const input = useRef<HTMLInputElement>(null)
  if (!user) return null
  const busy = upload.isPending || remove.isPending

  const onFile = (file: File | undefined) => {
    if (!file) return
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
      notify({ tone: 'error', title: 'Please choose a JPEG, PNG or WebP image.' })
      return
    }
    if (file.size > 8 * 1024 * 1024) {
      notify({ tone: 'error', title: 'Please choose an image smaller than 8 MB.' })
      return
    }
    upload.mutate(file, {
      onSuccess: () => notify({ tone: 'success', title: 'Profile photo updated' }),
      onError: (error) => notify({ tone: 'error', title: 'We couldn’t upload that photo', description: toApiError(error).fieldErrors.avatar ?? toApiError(error).message }),
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-5">
      <Avatar user={user} size={72} busy={upload.isPending} />
      <div>
        <div className="flex flex-wrap gap-3">
          <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" tabIndex={-1} aria-hidden="true" onChange={(event) => onFile(event.target.files?.[0] ?? undefined)} onClick={(event) => ((event.target as HTMLInputElement).value = '')} />
          <Button variant="secondary" size="compact" onClick={() => input.current?.click()} disabled={busy} aria-busy={upload.isPending || undefined}>
            <Upload aria-hidden="true" className="size-4" strokeWidth={1.5} />
            {upload.isPending ? 'Uploading…' : user.avatar ? 'Change photo' : 'Upload photo'}
          </Button>
          {user.avatar && (
            <Button
              variant="text"
              disabled={busy}
              onClick={() => remove.mutate(undefined, { onSuccess: () => notify({ tone: 'info', title: 'Profile photo removed' }), onError: (error) => notify({ tone: 'error', title: 'We couldn’t remove the photo', description: toApiError(error).message }) })}
            >
              Remove
            </Button>
          )}
        </div>
        <p className="mt-2 text-[12px] text-ink2">JPEG, PNG or WebP up to 8 MB. Square photos work best; we crop to a square.</p>
      </div>
    </div>
  )
}

export function ProfilePage() {
  const { user } = useAuth()
  const { theme, setTheme } = useTheme()
  const update = useUpdateProfile()
  const notify = useToast()
  const [formError, setFormError] = useState<string>()
  const { register, handleSubmit, formState, setError } = useForm<ProfileValues>({ values: { first_name: user?.first_name ?? '', last_name: user?.last_name ?? '', phone: user?.phone ?? '' } })
  if (!user) return null
  const admin = user.role !== 'client' ? `${import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/v1\/?$/, '')}/admin/` : null

  const onSubmit = handleSubmit((values) => {
    setFormError(undefined)
    update.mutate(
      { first_name: values.first_name.trim(), last_name: values.last_name.trim(), phone: values.phone.trim() },
      {
        onSuccess: () => notify({ tone: 'success', title: 'Profile saved' }),
        onError: (error) => {
          const apiError = toApiError(error)
          let matched = false
          for (const field of ['first_name', 'last_name', 'phone'] as const) {
            if (apiError.fieldErrors[field]) {
              setError(field, { type: 'server', message: apiError.fieldErrors[field] })
              matched = true
            }
          }
          setFormError(matched ? undefined : apiError.message)
        },
      },
    )
  })

  return (
    <section>
      <title>Profile — BRIGHTHOMES Construction Service</title>
      <Title>Profile</Title>
      <PhotoControl />
      <form noValidate onSubmit={onSubmit} className="mt-10 space-y-7 border-t border-line pt-8" aria-label="Profile details">
        <div className="grid gap-7 phone:grid-cols-2">
          <TextField label="First name" autoComplete="given-name" error={formState.errors.first_name?.message} registration={register('first_name', { required: 'Enter your first name.' })} />
          <TextField label="Last name" autoComplete="family-name" error={formState.errors.last_name?.message} registration={register('last_name', { required: 'Enter your last name.' })} />
          <div>
            <p className="label text-mute">Email</p>
            <p className="mt-1 flex h-[50px] items-center border-b border-line text-[16px] text-ink2">{user.email}</p>
            <p className="mt-2 text-[12px] text-ink2">To change your email address, please contact BRIGHTHOMES.</p>
          </div>
          <TextField label="Phone" type="tel" autoComplete="tel" placeholder="+234 or international" optional error={formState.errors.phone?.message} registration={register('phone', contactRules.phone)} />
        </div>
        <FormAlert message={formError} />
        <Button type="submit" loading={update.isPending} disabled={!formState.isDirty}>
          {update.isPending ? 'Saving…' : 'Save changes'}
        </Button>
      </form>

      <div className="mt-12 border-t border-line pt-8">
        <p className="label text-mute">Appearance</p>
        <Segmented<Theme>
          className="mt-3"
          label="Appearance"
          value={theme}
          onChange={setTheme}
          options={[
            { value: 'light', label: 'Light' },
            { value: 'dark', label: 'Dark' },
          ]}
        />
      </div>

      {admin && (
        <p className="mt-12 border-t border-line pt-8 text-[13px] text-ink2">
          Staff account ·{' '}
          <a href={admin} className="underline decoration-control-line underline-offset-4 hover:text-bronze">
            Open content admin
          </a>
        </p>
      )}
    </section>
  )
}
