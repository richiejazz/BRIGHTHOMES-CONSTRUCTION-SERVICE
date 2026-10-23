import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

/**
 * Listing filters mirrored in the URL (PRD: filter state lives in the query string so links stay
 * shareable). Changing a filter resets to page 1 unless `keepPage` is set; history is replaced so
 * Back leaves the page rather than stepping through every filter change.
 */
export function useUrlFilters() {
  const [params, setParams] = useSearchParams()

  const update = useCallback(
    (changes: Record<string, string>, { keepPage = false } = {}) =>
      setParams(
        (current) => {
          const next = new URLSearchParams(current)
          for (const [key, value] of Object.entries(changes)) {
            if (value) next.set(key, value)
            else next.delete(key)
          }
          if (!keepPage) next.delete('page')
          return next
        },
        { replace: true },
      ),
    [setParams],
  )

  const clear = useCallback(() => setParams({}, { replace: true }), [setParams])
  const page = Math.max(1, Number.parseInt(params.get('page') ?? '1', 10) || 1)

  return { params, update, clear, page }
}

/** Search box state debounced into the URL (300ms, PRD code-quality checklist). */
export function useDebouncedSearch(value: string, commit: (value: string) => void, delay = 300) {
  const [draft, setDraft] = useState(value)
  const [lastValue, setLastValue] = useState(value)
  // Follow external changes (e.g. "Clear filters") without an effect.
  if (value !== lastValue) {
    setLastValue(value)
    setDraft(value)
  }
  useEffect(() => {
    if (draft.trim() === value) return
    const timer = window.setTimeout(() => commit(draft.trim()), delay)
    return () => window.clearTimeout(timer)
  }, [draft, value, commit, delay])
  return [draft, setDraft] as const
}
