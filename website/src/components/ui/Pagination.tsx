import { ArrowLeft, ArrowRight } from 'lucide-react'

import { PAGE_SIZE } from '../../api/content'

type PaginationProps = { page: number; count: number; onChange: (page: number) => void; label?: string }

/** Hairline-ruled previous / next pagination with the current page in words. */
export function Pagination({ page, count, onChange, label = 'Pagination' }: PaginationProps) {
  const pages = Math.max(1, Math.ceil(count / PAGE_SIZE))
  if (pages <= 1) return null
  const control = 'text-link no-underline disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-ink'
  return (
    <nav aria-label={label} className="flex items-center justify-between gap-4 border-t border-line pt-6">
      <button type="button" className={control} disabled={page <= 1} onClick={() => onChange(page - 1)}>
        <ArrowLeft aria-hidden="true" className="size-4" strokeWidth={1.5} /> Previous
      </button>
      <p className="text-[13px] text-ink2" aria-live="polite">
        Page <span className="font-semibold text-ink">{page}</span> of {pages}
      </p>
      <button type="button" className={control} disabled={page >= pages} onClick={() => onChange(page + 1)}>
        Next <ArrowRight aria-hidden="true" className="size-4" strokeWidth={1.5} />
      </button>
    </nav>
  )
}
