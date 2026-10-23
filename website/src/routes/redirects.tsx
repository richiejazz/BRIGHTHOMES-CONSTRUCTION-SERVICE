import { Navigate, useLocation, useParams } from 'react-router-dom'

/**
 * Client-side redirect for a retired URL. It keeps the query string and hash, and replaces the
 * history entry so Back does not bounce. This is an in-app redirect only: true HTTP 301s for
 * the same paths are configured at the host (website/vercel.json and website/public/_redirects).
 */
export function LegacyRedirect({ to }: { to: (params: Record<string, string | undefined>) => string }) {
  const params = useParams()
  const { search, hash } = useLocation()
  return <Navigate to={`${to(params)}${search}${hash}`} replace />
}
