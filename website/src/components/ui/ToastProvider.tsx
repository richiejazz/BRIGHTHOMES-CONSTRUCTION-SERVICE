import { Check, Info, TriangleAlert, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'

import { ToastContext, type ToastInput } from './toast-context'

type Toast = ToastInput & { id: number }

const icons = { success: Check, error: TriangleAlert, info: Info }

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const nextId = useRef(0)
  const timers = useRef(new Map<number, number>())

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
    window.clearTimeout(timers.current.get(id))
    timers.current.delete(id)
  }, [])

  const notify = useCallback(
    (toast: ToastInput) => {
      const id = ++nextId.current
      setToasts((current) => [...current.slice(-2), { ...toast, id }])
      // §05: confirmations auto-dismiss after 2.6s. Errors stay longer so they can be read.
      timers.current.set(id, window.setTimeout(() => dismiss(id), toast.tone === 'error' ? 8000 : 2600))
    },
    [dismiss],
  )

  useEffect(() => {
    const pending = timers.current
    return () => pending.forEach((timer) => window.clearTimeout(timer))
  }, [])

  return (
    <ToastContext.Provider value={notify}>
      {children}
      <div aria-live="polite" aria-relevant="additions" className="pointer-events-none fixed inset-x-5 bottom-6 z-[60] flex flex-col items-center gap-3">
        {toasts.map(({ id, title, description, tone = 'info' }) => {
          const Icon = icons[tone]
          return (
            <div key={id} role={tone === 'error' ? 'alert' : 'status'} className="pointer-events-auto flex w-full max-w-[440px] animate-[rise_300ms_var(--ease)_both] items-start gap-3.5 bg-ink px-5 py-4 text-bg">
              <Icon aria-hidden="true" className={`mt-0.5 size-[18px] shrink-0 ${tone === 'error' ? 'text-danger-inverse' : ''}`} strokeWidth={1.6} />
              <div className="flex-1">
                <p className="text-[14px] font-semibold">{title}</p>
                {description && <p className="mt-1 text-[13px] leading-relaxed opacity-75">{description}</p>}
              </div>
              <button type="button" onClick={() => dismiss(id)} className="-m-2 p-2 opacity-60 hover:opacity-100" aria-label="Dismiss notification">
                <X aria-hidden="true" className="size-4" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
