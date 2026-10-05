import { ArrowLeft, ArrowRight } from 'lucide-react'

import { PAGE_SIZE } from '../../api/content'

type PaginationProps = { page: number; count: number; onChange: (page: number) => void; label?: string }

export function Pagination({ page, count, onChange, label = 'Pagination' }: PaginationProps) {
  const pages = Math.max(1, Math.ceil(count / PAGE_SIZE))
  if (pages <= 1) return null
  const control = 'inline-flex min-h-11 items-center gap-2 px-1 text-sm font-semibold tracking-[0.04em] disabled:opacity-35 enabled:hover:text-bronze-dark'
  return (
    <nav aria-label={label} className="flex items-center justify-between border-t border-stone-300 pt-6">
      <button type="button" className={control} disabled={page <= 1} onClick={() => onChange(page - 1)}>
        <ArrowLeft aria-hidden="true" className="size-4" /> Previous
      </button>
      <p className="text-sm text-stone-600" aria-live="polite">
        Page <span className="font-semibold text-ink">{page}</span> of {pages}
      </p>
      <button type="button" className={control} disabled={page >= pages} onClick={() => onChange(page + 1)}>
        Next <ArrowRight aria-hidden="true" className="size-4" />
      </button>
    </nav>
  )
}
