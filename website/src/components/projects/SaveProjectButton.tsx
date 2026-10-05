import { Bookmark, BookmarkCheck } from 'lucide-react'
import { useLocation } from 'react-router-dom'

import { useRemoveSavedProject, useSavedRecord, useSaveProject } from '../../api/account'
import { toApiError } from '../../api/errors'
import type { Project } from '../../api/types'
import { useAuth } from '../../context/useAuth'
import { Button, ButtonLink } from '../ui/Button'
import { useToast } from '../ui/toast-context'

export function SaveProjectButton({ project }: { project: Project }) {
  const { status } = useAuth()
  const location = useLocation()
  const notify = useToast()
  const signedIn = status === 'authenticated'
  const saved = useSavedRecord(project.id, signedIn)
  const save = useSaveProject()
  const remove = useRemoveSavedProject()

  if (!signedIn) {
    return (
      <ButtonLink to="/login" state={{ from: location }} variant="secondary">
        <Bookmark aria-hidden="true" className="-ml-1 size-4" />
        Sign in to save
      </ButtonLink>
    )
  }

  const record = saved.data
  const busy = saved.isPending || save.isPending || remove.isPending
  const onError = (error: unknown) => notify({ tone: 'error', title: 'We couldn’t update your saved projects', description: toApiError(error).message })

  return (
    <Button
      variant={record ? 'primary' : 'secondary'}
      loading={busy}
      aria-pressed={Boolean(record)}
      onClick={() =>
        record
          ? remove.mutate(record.id, { onSuccess: () => notify({ tone: 'info', title: 'Removed from saved projects' }), onError })
          : save.mutate(project.id, { onSuccess: () => notify({ tone: 'success', title: 'Project saved', description: 'Find it any time under My account.' }), onError })
      }
    >
      {!busy && (record ? <BookmarkCheck aria-hidden="true" className="-ml-1 size-4" /> : <Bookmark aria-hidden="true" className="-ml-1 size-4" />)}
      {record ? 'Saved' : 'Save project'}
    </Button>
  )
}
