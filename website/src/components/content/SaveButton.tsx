import { Heart } from 'lucide-react'
import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { useRemoveSavedProject, useRemoveSavedProperty, useSavedPropertyRecord, useSavedRecord, useSaveProject, useSaveProperty } from '../../api/account'
import { toApiError } from '../../api/errors'
import { useAuth } from '../../context/useAuth'
import { routes } from '../../lib/routes'
import { useToast } from '../ui/toast-context'

export type SaveKind = 'project' | 'property'
export type PendingSave = { kind: SaveKind; id: number }

// A save started while signed out is carried through sign-in in router state and completed when
// the visitor returns (§17 "Save prompts sign-in, then completes"). Each navigation is consumed once,
// even when a page shows more than one save control for the same item.
const consumed = new Set<string>()

function useSaveToggle(kind: SaveKind, id: number) {
  const { status } = useAuth()
  const signedIn = status === 'authenticated'
  const location = useLocation()
  const navigate = useNavigate()
  const notify = useToast()
  const projectRecord = useSavedRecord(kind === 'project' ? id : undefined, signedIn && kind === 'project')
  const propertyRecord = useSavedPropertyRecord(kind === 'property' ? id : undefined, signedIn && kind === 'property')
  const saveProject = useSaveProject()
  const removeProject = useRemoveSavedProject()
  const saveProperty = useSaveProperty()
  const removeProperty = useRemoveSavedProperty()

  const record = kind === 'project' ? projectRecord : propertyRecord
  const save = kind === 'project' ? saveProject : saveProperty
  const remove = kind === 'project' ? removeProject : removeProperty
  const saved = Boolean(record.data)
  const busy = (signedIn && record.isPending) || save.isPending || remove.isPending

  const onError = (error: unknown) => notify({ tone: 'error', title: 'We couldn’t update your saved items', description: toApiError(error).message })
  const doSave = () => save.mutate(id, { onSuccess: () => notify({ tone: 'success', title: 'Added to Saved' }), onError })

  const toggle = () => {
    if (!signedIn) {
      navigate(routes.login, { state: { from: location, pendingSave: { kind, id } satisfies PendingSave } })
      return
    }
    if (record.data) remove.mutate(record.data.id, { onSuccess: () => notify({ tone: 'info', title: 'Removed from Saved' }), onError })
    else doSave()
  }

  const pending = (location.state as { pendingSave?: PendingSave } | null)?.pendingSave
  useEffect(() => {
    if (!signedIn || !pending || pending.kind !== kind || pending.id !== id || !record.isSuccess) return
    if (consumed.has(location.key)) return
    consumed.add(location.key)
    navigate(`${location.pathname}${location.search}${location.hash}`, { replace: true, state: null })
    if (!record.data) doSave()
    // doSave is recreated each render; the guard above makes this run once per navigation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signedIn, pending, kind, id, record.isSuccess, record.data, location.key])

  return { saved, busy, toggle }
}

/** §14 / §17: 44px square on images, --bg fill; saved = bronze filled heart. */
export function SaveHeart({ kind, id, title, className = '' }: { kind: SaveKind; id: number; title: string; className?: string }) {
  const { saved, busy, toggle } = useSaveToggle(kind, id)
  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
        toggle()
      }}
      disabled={busy}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${title} from Saved` : `Save ${title}`}
      className={`relative z-10 inline-flex size-11 items-center justify-center bg-bg text-ink transition-colors hover:text-bronze disabled:opacity-60 ${className}`}
    >
      <Heart aria-hidden="true" className={`size-[18px] ${saved ? 'fill-bronze text-bronze' : ''}`} strokeWidth={1.5} />
    </button>
  )
}

/** Detail-page save control: "SAVE PROJECT" outline button, or a text link inside a panel. */
export function SaveTextButton({ kind, id, variant = 'button' }: { kind: SaveKind; id: number; variant?: 'button' | 'link' }) {
  const { saved, busy, toggle } = useSaveToggle(kind, id)
  const noun = kind === 'project' ? 'project' : 'property'
  const label = saved ? 'Saved' : `Save ${noun}`
  return (
    <button type="button" onClick={toggle} disabled={busy} aria-pressed={saved} className={variant === 'button' ? 'btn btn-secondary btn-compact gap-2.5' : 'text-link gap-2.5 no-underline'}>
      <Heart aria-hidden="true" className={`size-4 ${saved ? 'fill-bronze text-bronze' : ''}`} strokeWidth={1.5} />
      {label}
    </button>
  )
}
