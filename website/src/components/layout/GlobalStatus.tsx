import { useQueryClient } from '@tanstack/react-query'
import { WifiOff } from 'lucide-react'
import { useSyncExternalStore } from 'react'
import { Link, useLocation } from 'react-router-dom'

import { useAuth } from '../../context/useAuth'
import { routes } from '../../lib/routes'
import { Modal } from '../ui/Modal'

function subscribeOnline(callback: () => void) {
  window.addEventListener('online', callback)
  window.addEventListener('offline', callback)
  return () => {
    window.removeEventListener('online', callback)
    window.removeEventListener('offline', callback)
  }
}

/**
 * §05 / §21 offline banner: a full-width stone bar under the navigation. What has already loaded
 * stays usable; Retry re-checks the connection and reloads the page's data.
 */
export function OfflineBanner() {
  const online = useSyncExternalStore(subscribeOnline, () => navigator.onLine, () => true)
  const queryClient = useQueryClient()
  if (online) return null
  return (
    <div role="status" className="fixed inset-x-0 top-[72px] z-40 border-b border-line bg-stone text-ink">
      <div className="container-page flex min-h-11 flex-wrap items-center justify-center gap-x-4 gap-y-1 py-2 text-center text-[13px]">
        <WifiOff aria-hidden="true" className="size-4 shrink-0" strokeWidth={1.5} />
        <span>
          <strong className="font-semibold">You’re offline.</strong> You can browse what’s already loaded; enquiries and requests can’t be sent until you reconnect.
        </span>
        <button type="button" className="text-link min-h-9" onClick={() => void queryClient.refetchQueries({ type: 'active' })}>
          Retry
        </button>
      </div>
    </div>
  )
}

/**
 * §05 / §21 session expired: a centred modal with a bronze top rule and two actions. Signing in
 * returns the visitor to the page they were on; saved items are stored on the server, so nothing
 * is lost.
 */
export function SessionExpiredModal() {
  const { sessionExpired, dismissSessionExpired } = useAuth()
  const location = useLocation()
  // Interrupt the page the visitor is reading, but not the sign-in screens themselves.
  const show = sessionExpired && location.pathname !== routes.login && location.pathname !== routes.register
  return (
    <Modal open={show} onClose={dismissSessionExpired} label="Session expired" className="m-auto! w-[min(440px,calc(100%-40px))] border-t-2! border-bronze bg-paper text-ink backdrop:bg-black/45">
      <div className="p-8 phone:p-10">
        <p className="label text-bronze">Signed out for your security</p>
        <h2 className="mt-4 font-display text-[36px] leading-[1.05] font-medium tracking-[-0.015em]">
          Your session has <em className="font-normal">expired.</em>
        </h2>
        <p className="mt-4 text-[15px] leading-[1.6] text-ink2">Sign in again to pick up where you left off. Nothing you saved has been lost.</p>
        <div className="mt-8 flex flex-col gap-3 phone:flex-row">
          <Link to={routes.login} state={{ from: location }} onClick={dismissSessionExpired} className="btn btn-primary btn-compact">
            Sign in again
          </Link>
          <button type="button" onClick={dismissSessionExpired} className="btn btn-secondary btn-compact">
            Continue browsing
          </button>
        </div>
      </div>
    </Modal>
  )
}
