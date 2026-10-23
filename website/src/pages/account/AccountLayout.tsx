import { LogOut } from 'lucide-react'
import { NavLink, Navigate, Outlet, useLocation } from 'react-router-dom'

import { useMyAppointments, useMyEnquiries, useSavedProjects, useSavedProperties } from '../../api/account'
import { Avatar } from '../../components/account/Avatar'
import { ButtonLink } from '../../components/ui/Button'
import { BAR_OFFSET } from '../../components/ui/Layout'
import { ErrorState, LoadingAnnouncement, Skeleton } from '../../components/ui/States'
import { useToast } from '../../components/ui/toast-context'
import { useAuth } from '../../context/useAuth'
import { routes } from '../../lib/routes'

function AccountNav() {
  const { logout } = useAuth()
  const notify = useToast()
  const savedProjects = useSavedProjects(1)
  const savedProperties = useSavedProperties(1)
  const enquiries = useMyEnquiries(1)
  const consultations = useMyAppointments(1)
  const items = [
    { to: routes.account.overview, label: 'Overview', end: true },
    { to: routes.account.savedProjects, label: 'Saved projects', count: savedProjects.data?.count },
    { to: routes.account.savedProperties, label: 'Saved properties', count: savedProperties.data?.count },
    { to: routes.account.enquiries, label: 'Enquiries', count: enquiries.data?.count },
    { to: routes.account.consultations, label: 'Consultations', count: consultations.data?.count },
    { to: routes.account.profile, label: 'Profile' },
  ]
  const link = 'flex min-h-11 items-center justify-between gap-4 whitespace-nowrap text-[13px] transition-colors'
  return (
    <nav aria-label="Account" className="-mx-[var(--gutter)] overflow-x-auto px-[var(--gutter)] desk:mx-0 desk:overflow-visible desk:px-0">
      <ul className="flex gap-6 border-b border-line desk:block desk:border-b-0">
        {items.map((item) => (
          <li key={item.to} className="desk:border-b desk:border-line">
            <NavLink to={item.to} end={item.end} className={({ isActive }) => `${link} -mb-px border-b-2 desk:mb-0 desk:border-b-0 ${isActive ? 'border-ink font-semibold text-ink' : 'border-transparent text-ink2 hover:text-ink'}`}>
              {({ isActive }) => (
                <>
                  {item.label}
                  <span className="hidden text-[12px] text-ink2 tabular-nums desk:inline">{item.count ?? (isActive && item.end ? '•' : '')}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
        <li className="desk:border-b desk:border-line">
          <button
            type="button"
            onClick={() => {
              logout()
              notify({ tone: 'info', title: 'You’ve been signed out.' })
            }}
            className={`${link} text-ink2 hover:text-danger`}
          >
            <span className="inline-flex items-center gap-2">
              <LogOut aria-hidden="true" className="size-3.5" strokeWidth={1.5} /> Sign out
            </span>
          </button>
        </li>
      </ul>
    </nav>
  )
}

/** W-15 account shell: greeting header, side navigation (tabs below 980px), and the current page. */
export default function AccountLayout() {
  const { status, user, signedOut, retry } = useAuth()
  const location = useLocation()

  // A deliberate sign-out leaves for the home page; anyone else signs in and comes straight back.
  if (status === 'anonymous') return signedOut ? <Navigate to={routes.home} replace /> : <Navigate to={routes.login} replace state={{ from: location }} />

  return (
    <div className={`container-page ${BAR_OFFSET} pb-section`}>
      <title>My account — BRIGHTHOMES Construction Service</title>
      {status === 'loading' ? (
        <div aria-busy="true">
          <LoadingAnnouncement label="Loading your account" />
          <div className="flex items-center gap-4">
            <Skeleton className="size-12 rounded-full" />
            <Skeleton className="h-10 w-72" />
          </div>
          <Skeleton className="mt-12 h-48 w-full" />
        </div>
      ) : status === 'unavailable' || !user ? (
        <ErrorState title="We couldn’t load your account." error={new Error('unavailable')} onRetry={retry} />
      ) : (
        <>
          <header className="flex flex-col gap-6 border-b border-ink pb-8 phone:flex-row phone:items-end phone:justify-between">
            <div className="flex items-center gap-4">
              <Avatar user={user} size={52} />
              <div>
                <p className="label text-[10px] text-mute">Client account</p>
                <h1 className="mt-1 font-display text-[clamp(32px,3.6vw,48px)] leading-[1.05] font-medium">Welcome back{user.first_name ? `, ${user.first_name}` : ''}</h1>
              </div>
            </div>
            <ButtonLink to={routes.consultation()} size="compact">
              New consultation request
            </ButtonLink>
          </header>
          <div className="grid-editorial mt-8 gap-y-8 desk:mt-12">
            <div className="desk:col-span-3">
              <AccountNav />
            </div>
            <div className="min-w-0 desk:col-span-9">
              <Outlet />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
