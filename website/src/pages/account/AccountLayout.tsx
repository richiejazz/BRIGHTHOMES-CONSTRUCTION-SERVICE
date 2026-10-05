import { NavLink, Navigate, Outlet, useLocation } from 'react-router-dom'

import { Container } from '../../components/ui/Layout'
import { ErrorState, LoadingAnnouncement, Skeleton } from '../../components/ui/States'
import { useAuth } from '../../context/useAuth'

const accountNav = [
  { to: '/account/saved', label: 'Saved projects' },
  { to: '/account/enquiries', label: 'Enquiries' },
  { to: '/account/appointments', label: 'Consultations' },
  { to: '/account/profile', label: 'Profile' },
] as const

function AccountHeader({ name }: { name?: string }) {
  return (
    <div className="blueprint-grid bg-ink pt-32 text-paper sm:pt-40">
      <Container>
        <p className="eyebrow flex items-center gap-3 text-bronze-light">
          <span aria-hidden="true" className="h-px w-8 bg-current" />
          My account
        </p>
        <h1 className="mt-5 font-display text-5xl leading-none sm:text-7xl">{name ? `Welcome, ${name}.` : 'Your account'}</h1>
        <nav aria-label="Account" className="-mx-5 mt-12 overflow-x-auto px-5 sm:mx-0 sm:px-0">
          <ul className="flex gap-8 border-b border-graphite">
            {accountNav.map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} className={({ isActive }) => `-mb-px inline-flex min-h-12 items-center whitespace-nowrap border-b-2 pb-1 text-sm font-semibold tracking-[0.04em] transition-colors ${isActive ? 'border-bronze-light text-paper' : 'border-transparent text-stone-400 hover:text-paper'}`}>
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </Container>
    </div>
  )
}

/** Guards the client area: waits for the session, sends anonymous visitors to sign in. */
export default function AccountLayout() {
  const { status, user, signedOut, retry } = useAuth()
  const location = useLocation()

  if (status === 'anonymous') return signedOut ? <Navigate to="/" replace /> : <Navigate to="/login" replace state={{ from: location }} />

  return (
    <>
      <title>My account — BRIGHTHOMES Construction Service</title>
      <AccountHeader name={user?.first_name} />
      <Container className="min-h-[50vh] py-14 sm:py-20">
        {status === 'loading' ? (
          <div>
            <LoadingAnnouncement label="Loading your account" />
            <Skeleton className="h-8 w-64" />
            <Skeleton className="mt-6 h-24 w-full" />
          </div>
        ) : status === 'unavailable' ? (
          <ErrorState title="We couldn’t load your account" error={new Error('unavailable')} onRetry={retry} />
        ) : (
          <Outlet />
        )}
      </Container>
    </>
  )
}
