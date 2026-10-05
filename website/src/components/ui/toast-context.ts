import { createContext, useContext } from 'react'

export type ToastTone = 'success' | 'error' | 'info'
export type ToastInput = { title: string; description?: string; tone?: ToastTone }

export const ToastContext = createContext<((toast: ToastInput) => void) | undefined>(undefined)

export function useToast() {
  const notify = useContext(ToastContext)
  if (!notify) throw new Error('useToast must be used within ToastProvider')
  return notify
}
