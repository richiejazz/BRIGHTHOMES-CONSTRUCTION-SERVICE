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
      timers.current.set(id, window.setTimeout(() => dismiss(id), toast.tone === 'error' ? 8000 : 5000))
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
      <div aria-live="polite" aria-relevant="additions" className="pointer-events-none fixed inset-x-4 bottom-4 z-[60] flex flex-col items-end gap-3 sm:inset-x-auto sm:right-6 sm:bottom-6">
        {toasts.map(({ id, title, description, tone = 'info' }) => {
          const Icon = icons[tone]
          return (
            <div key={id} role={tone === 'error' ? 'alert' : 'status'} className="pointer-events-auto flex w-full max-w-sm animate-rise items-start gap-4 border border-graphite bg-ink p-5 text-paper shadow-[0_18px_40px_-20px_rgb(22_21_19/0.6)]">
              <Icon aria-hidden="true" className={`mt-0.5 size-5 shrink-0 ${tone === 'error' ? 'text-[#e3907f]' : 'text-bronze-light'}`} />
              <div className="flex-1">
                <p className="font-semibold">{title}</p>
                {description && <p className="mt-1 text-sm leading-relaxed text-stone-300">{description}</p>}
              </div>
              <button type="button" onClick={() => dismiss(id)} className="-m-2 p-2 text-stone-400 hover:text-paper" aria-label="Dismiss notification">
                <X aria-hidden="true" className="size-4" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
