import { Suspense, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'

import { useAuth } from '../../context/useAuth'

import { Footer } from './Footer'
import { OfflineBanner, SessionExpiredModal } from './GlobalStatus'
import { Header } from './Header'

function ScrollToTop() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    // Pages with an anchor (e.g. /services#renovation) handle their own scrolling.
    if (!hash) window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname, hash])
  return null
}

/** After a deliberate sign-out, later visits to the account area should prompt sign-in again. */
function SignOutTracker() {
  const { pathname } = useLocation()
  const { signedOut, acknowledgeSignOut } = useAuth()
  useEffect(() => {
    if (signedOut && !pathname.startsWith('/account')) acknowledgeSignOut()
  }, [signedOut, pathname, acknowledgeSignOut])
  return null
}

function RouteFallback() {
  return (
    <div className="min-h-screen bg-bg" role="status" aria-busy="true">
      <span className="sr-only">Loading page…</span>
    </div>
  )
}

export function SiteLayout() {
  const { pathname } = useLocation()
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <SignOutTracker />
      {/* Spec §05: transparent over the photograph on the home hero only. */}
      <Header overHero={pathname === '/'} />
      <OfflineBanner />
      <SessionExpiredModal />
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        <Suspense fallback={<RouteFallback />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
