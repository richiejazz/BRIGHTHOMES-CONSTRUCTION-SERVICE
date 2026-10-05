import { useEffect, useRef, type ReactNode } from 'react'

type ModalProps = {
  open: boolean
  onClose: () => void
  label: string
  children: ReactNode
  className?: string
}

/**
 * Accessible modal built on the native <dialog> element: focus moves inside, Escape closes,
 * the rest of the page becomes inert, and focus returns to the trigger on close.
 */
export function Modal({ open, onClose, label, children, className = '' }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  useEffect(() => {
    if (!open) return
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = overflow
    }
  }, [open])

  return (
    <dialog
      ref={ref}
      aria-label={label}
      onClose={onClose}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
      className={`m-0 max-h-none max-w-none border-0 p-0 ${className}`}
    >
      {open && children}
    </dialog>
  )
}
