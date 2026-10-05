import { CalendarDays, Clock, LogOut } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'

import { useMyAppointments, useMyEnquiries, useRemoveSavedProject, useSavedProjects, useUpdateProfile } from '../../api/account'
import { toApiError } from '../../api/errors'
import type { Appointment, Enquiry, ProjectSummary, SavedProject, ServiceSummary } from '../../api/types'
import { ProjectMedia } from '../../components/projects/ProjectMedia'
import { DemoBadge, ProjectStatusBadge, RequestStatusBadge } from '../../components/ui/Badges'
import { Button, ButtonLink } from '../../components/ui/Button'
import { FormAlert, TextField } from '../../components/ui/FormField'
import { Pagination } from '../../components/ui/Pagination'
import { EmptyState, ErrorState, LoadingAnnouncement, Skeleton } from '../../components/ui/States'
import { useToast } from '../../components/ui/toast-context'
import { useAuth } from '../../context/useAuth'
import { formatDate, formatTime } from '../../lib/format'

function SectionTitle({ title, intro, action }: { title: string; intro: string; action?: ReactNode }) {
  return (
    <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
      <div>
        <h2 className="font-display text-4xl leading-none sm:text-5xl">{title}</h2>
        <p className="mt-3 text-stone-600">{intro}</p>
      </div>
      {action}
    </div>
  )
}

function ListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="border-t border-stone-300">
      <LoadingAnnouncement />
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="flex gap-6 border-b border-stone-300 py-6">
          <Skeleton className="h-20 w-28 shrink-0" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-6 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}

function ProjectReference({ project }: { project: ProjectSummary }) {
  return project.is_published ? (
    <Link to={`/projects/${project.slug}`} className="underline decoration-stone-300 underline-offset-4 hover:decoration-bronze">
      {project.title}
    </Link>
  ) : (
    <span>{project.title}</span>
  )
}

function Regarding({ project, service }: { project: ProjectSummary | null; service: ServiceSummary | null }) {
  if (!project && !service) return <span className="text-stone-500">General enquiry</span>
  return (
    <span className="flex flex-wrap gap-x-2">
      {service && <span>{service.name}</span>}
      {service && project && <span aria-hidden="true">·</span>}
      {project && <ProjectReference project={project} />}
    </span>
  )
}

// --- Saved projects ------------------------------------------------------------------------

function SavedRow({ saved }: { saved: SavedProject }) {
  const remove = useRemoveSavedProject()
  const notify = useToast()
  const project = saved.project_summary
  return (
    <li className="grid grid-cols-[6.5rem_1fr] gap-5 border-b border-stone-300 py-6 sm:grid-cols-[10rem_1fr_auto] sm:items-center sm:gap-8">
      <ProjectMedia image={project.cover_image} seed={project.id} sizes="10rem" className="aspect-[4/3]" />
      <div className="min-w-0">
        <p className="eyebrow text-stone-500">{project.category}</p>
        <h3 className="mt-2 font-display text-3xl leading-tight">
          <ProjectReference project={project} />
        </h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {project.is_demo && <DemoBadge />}
          <ProjectStatusBadge status={project.status} />
          {!project.is_published && <span className="text-sm text-stone-500">No longer published</span>}
        </div>
      </div>
      <Button
        variant="text"
        className="col-start-2 justify-self-start sm:col-start-auto"
        loading={remove.isPending}
        onClick={() =>
          remove.mutate(saved.id, {
            onSuccess: () => notify({ tone: 'info', title: `Removed “${project.title}” from saved projects` }),
            onError: (error) => notify({ tone: 'error', title: 'We couldn’t remove this project', description: toApiError(error).message }),
          })
        }
      >
        Remove<span className="sr-only"> {project.title}</span>
      </Button>
    </li>
  )
}

export function SavedProjectsPage() {
  const [page, setPage] = useState(1)
  const saved = useSavedProjects(page)
  return (
    <section>
      <title>Saved projects — BRIGHTHOMES Construction Service</title>
      <SectionTitle title="Saved projects" intro="Projects you’ve bookmarked for reference." />
      {saved.isPending ? (
        <ListSkeleton />
      ) : saved.isError ? (
        <ErrorState error={saved.error} onRetry={() => void saved.refetch()} />
      ) : saved.data.results.length === 0 ? (
        page > 1 ? (
          <EmptyState title="No more saved projects on this page." action={<Button onClick={() => setPage(1)}>Back to the first page</Button>} />
        ) : (
          <EmptyState title="You haven’t saved any projects yet." action={<ButtonLink to="/projects" arrow>Explore projects</ButtonLink>}>
            Use “Save project” on any project page to keep it here.
          </EmptyState>
        )
      ) : (
        <>
          <ul className="border-t border-stone-300">
            {saved.data.results.map((item) => (
              <SavedRow key={item.id} saved={item} />
            ))}
          </ul>
          <div className="mt-10">
            <Pagination page={page} count={saved.data.count} onChange={setPage} label="Saved project pages" />
          </div>
        </>
      )}
    </section>
  )
}

// --- Enquiries and appointments -------------------------------------------------------------

function RequestRow({ record, children }: { record: Enquiry | Appointment; children?: ReactNode }) {
  return (
    <li className="grid gap-4 border-b border-stone-300 py-7 sm:grid-cols-[1fr_auto] sm:gap-8">
      <div className="min-w-0">
        <p className="text-sm text-stone-500">Sent {formatDate(record.created_at)}</p>
        <p className="mt-2 font-display text-2xl leading-snug sm:text-3xl">
          <Regarding project={record.project_summary} service={record.service_summary} />
        </p>
        {children}
        {record.message && <p className="mt-3 line-clamp-3 max-w-2xl whitespace-pre-line leading-relaxed text-stone-600">{record.message}</p>}
      </div>
      <div className="sm:text-right">
        <RequestStatusBadge status={record.status} />
      </div>
    </li>
  )
}

function RequestList<T extends Enquiry | Appointment>({
  query,
  page,
  setPage,
  empty,
  renderRow,
  label,
}: {
  query: ReturnType<typeof useMyEnquiries> | ReturnType<typeof useMyAppointments>
  page: number
  setPage: (page: number) => void
  empty: ReactNode
  renderRow: (record: T) => ReactNode
  label: string
}) {
  if (query.isPending) return <ListSkeleton />
  if (query.isError) return <ErrorState error={query.error} onRetry={() => void query.refetch()} />
  const results = query.data.results as T[]
  if (results.length === 0) return page > 1 ? <EmptyState title="Nothing on this page." action={<Button onClick={() => setPage(1)}>Back to the first page</Button>} /> : <>{empty}</>
  return (
    <>
      <ul className="border-t border-stone-300">{results.map(renderRow)}</ul>
      <div className="mt-10">
        <Pagination page={page} count={query.data.count} onChange={setPage} label={label} />
      </div>
    </>
  )
}

export function EnquiriesPage() {
  const [page, setPage] = useState(1)
  const enquiries = useMyEnquiries(page)
  return (
    <section>
      <title>My enquiries — BRIGHTHOMES Construction Service</title>
      <SectionTitle title="Enquiries" intro="Enquiries you’ve sent while signed in, and where each one stands." action={<ButtonLink to="/contact" variant="secondary" arrow>New enquiry</ButtonLink>} />
      <RequestList<Enquiry>
        query={enquiries}
        page={page}
        setPage={setPage}
        label="Enquiry pages"
        empty={
          <EmptyState title="No enquiries yet." action={<ButtonLink to="/contact" arrow>Send an enquiry</ButtonLink>}>
            Enquiries you send while signed in will appear here.
          </EmptyState>
        }
        renderRow={(record) => <RequestRow key={record.id} record={record} />}
      />
    </section>
  )
}

export function AppointmentsPage() {
  const [page, setPage] = useState(1)
  const appointments = useMyAppointments(page)
  return (
    <section>
      <title>My consultations — BRIGHTHOMES Construction Service</title>
      <SectionTitle title="Consultations" intro="Consultation requests you’ve made and their status." action={<ButtonLink to="/contact?type=consultation" variant="secondary" arrow>Request a consultation</ButtonLink>} />
      <RequestList<Appointment>
        query={appointments}
        page={page}
        setPage={setPage}
        label="Consultation pages"
        empty={
          <EmptyState title="No consultation requests yet." action={<ButtonLink to="/contact?type=consultation" arrow>Request a consultation</ButtonLink>}>
            Requests you make while signed in will appear here.
          </EmptyState>
        }
        renderRow={(record) => (
          <RequestRow key={record.id} record={record}>
            <p className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm font-medium text-graphite">
              <span className="inline-flex items-center gap-2">
                <CalendarDays aria-hidden="true" className="size-4 text-bronze-dark" />
                Preferred: {formatDate(record.preferred_date)}
              </span>
              {(record.preferred_time || record.time_window) && (
                <span className="inline-flex items-center gap-2">
                  <Clock aria-hidden="true" className="size-4 text-bronze-dark" />
                  {[record.preferred_time && formatTime(record.preferred_time), record.time_window].filter(Boolean).join(' · ')}
                </span>
              )}
            </p>
          </RequestRow>
        )}
      />
    </section>
  )
}

// --- Profile ---------------------------------------------------------------------------------

const roleLabels = { client: 'Client', staff: 'Staff', admin: 'Administrator' } as const

function adminUrl() {
  try {
    return new URL('/admin/', import.meta.env.VITE_API_BASE_URL).toString()
  } catch {
    return null
  }
}

export function ProfilePage() {
  const { user, logout } = useAuth()
  const notify = useToast()
  const update = useUpdateProfile()
  const [formError, setFormError] = useState<string>()
  const { register, handleSubmit, formState, reset } = useForm({ values: { first_name: user?.first_name ?? '', last_name: user?.last_name ?? '' } })

  if (!user) return null
  const admin = user.role !== 'client' ? adminUrl() : null

  const onSubmit = handleSubmit((values) => {
    setFormError(undefined)
    update.mutate(
      { first_name: values.first_name.trim(), last_name: values.last_name.trim() },
      {
        onSuccess: (updated) => {
          reset({ first_name: updated.first_name, last_name: updated.last_name })
          notify({ tone: 'success', title: 'Profile updated' })
        },
        onError: (error) => setFormError(toApiError(error).message),
      },
    )
  })

  return (
    <section className="grid gap-16 lg:grid-cols-12">
      <title>Profile — BRIGHTHOMES Construction Service</title>
      <div className="lg:col-span-6">
        <SectionTitle title="Profile" intro="Your account details." />
        <form noValidate onSubmit={onSubmit} className="space-y-8" aria-label="Edit profile">
          <div className="grid gap-8 sm:grid-cols-2">
            <TextField label="First name" autoComplete="given-name" error={formState.errors.first_name?.message} registration={register('first_name', { required: 'Please enter your first name.', maxLength: { value: 150, message: 'Please use 150 characters or fewer.' } })} />
            <TextField label="Last name" autoComplete="family-name" error={formState.errors.last_name?.message} registration={register('last_name', { required: 'Please enter your last name.', maxLength: { value: 150, message: 'Please use 150 characters or fewer.' } })} />
          </div>
          <FormAlert message={formError} />
          <Button type="submit" loading={update.isPending} disabled={!formState.isDirty}>
            Save changes
          </Button>
        </form>
      </div>
      <aside className="lg:col-span-5 lg:col-start-8" aria-label="Account summary">
        <dl className="border-t border-stone-300">
          {[
            { label: 'Email', value: user.email },
            { label: 'Account type', value: roleLabels[user.role] },
            { label: 'Member since', value: formatDate(user.date_joined) },
          ].map((item) => (
            <div key={item.label} className="flex flex-wrap justify-between gap-4 border-b border-stone-300 py-5">
              <dt className="eyebrow text-stone-500">{item.label}</dt>
              <dd className="break-all font-medium">{item.value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-sm text-stone-500">To change your email address, please contact BRIGHTHOMES.</p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Button
            variant="secondary"
            onClick={() => {
              // AccountLayout sends a signed-out visitor to the home page.
              logout()
              notify({ tone: 'info', title: 'You’ve been signed out.' })
            }}
          >
            <LogOut aria-hidden="true" className="-ml-1 size-4" />
            Sign out
          </Button>
          {admin && (
            <a href={admin} className="inline-flex min-h-11 items-center text-sm font-semibold underline decoration-bronze underline-offset-8">
              Open content admin
            </a>
          )}
        </div>
      </aside>
    </section>
  )
}
