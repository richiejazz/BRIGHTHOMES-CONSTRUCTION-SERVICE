import { LoaderCircle } from 'lucide-react'

import type { User } from '../../api/types'

/**
 * §19 profile photo: the uploaded photo, or serif initials on --stone so the layout never collapses.
 * `busy` overlays a spinner while an upload is in progress (spinners are for actions, not content).
 */
export function Avatar({ user, size = 48, busy = false, className = '' }: { user: Pick<User, 'first_name' | 'last_name' | 'email' | 'avatar'>; size?: number; busy?: boolean; className?: string }) {
  const initials = `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase() || user.email.charAt(0).toUpperCase()
  return (
    <span className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-stone text-ink ${className}`} style={{ width: size, height: size }}>
      {user.avatar ? (
        <img src={user.avatar} alt="" className="size-full object-cover" data-no-dim />
      ) : (
        <span aria-hidden="true" className="font-display font-medium" style={{ fontSize: size * 0.4 }}>
          {initials}
        </span>
      )}
      {busy && (
        <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-white">
          <LoaderCircle aria-hidden="true" className="size-5 animate-spin" />
        </span>
      )}
    </span>
  )
}
