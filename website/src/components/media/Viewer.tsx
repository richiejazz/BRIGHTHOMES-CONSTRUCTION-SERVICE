import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Modal } from '../ui/Modal'

export type GalleryImage = { id: number | string; src: string; alt: string; caption?: string }

const pad = (value: number) => String(value).padStart(2, '0')

/**
 * Full-screen viewer (spec §16): black at 94%, "02 / 04" counter, title, previous / next,
 * thumbnail strip. Arrow keys move, Escape closes (native <dialog>), focus returns to the opener.
 */
export function Viewer({ images, index, onIndexChange, onClose, title, illustrative }: { images: GalleryImage[]; index: number | null; onIndexChange: (index: number) => void; onClose: () => void; title: string; illustrative?: boolean }) {
  const open = index !== null && images.length > 0
  const current = open ? images[index] : null
  const count = images.length
  const go = (step: number) => index !== null && onIndexChange((index + step + count) % count)

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') go(1)
      if (event.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  return (
    <Modal open={open} onClose={onClose} label={`${title} — photo viewer`} className="h-dvh w-full bg-black/94 text-[#EEE8DD] backdrop:bg-black/60">
      {current && index !== null && (
        <div className="flex h-dvh flex-col">
          <div className="flex min-h-16 items-center justify-between gap-4 px-[var(--gutter)]">
            <p className="text-[12px] font-semibold tracking-[0.16em] tabular-nums" aria-live="polite">
              {pad(index + 1)} / {pad(count)}
            </p>
            <p className="hidden truncate text-[12px] text-[#EEE8DD]/80 phone:block">
              {title}
              {illustrative && ' — Illustrative imagery'}
            </p>
            <button type="button" onClick={onClose} className="icon-btn -mr-2.5" aria-label="Close viewer">
              <X aria-hidden="true" className="size-5" strokeWidth={1.5} />
            </button>
          </div>

          <div className="relative flex min-h-0 flex-1 items-center justify-center px-[var(--gutter)]">
            <ViewerImage key={current.id} image={current} />
            {count > 1 && (
              <>
                <button type="button" onClick={() => go(-1)} className="icon-btn absolute left-2 bg-black/40 phone:left-[calc(var(--gutter)-8px)]" aria-label="Previous photo">
                  <ChevronLeft aria-hidden="true" className="size-5" strokeWidth={1.5} />
                </button>
                <button type="button" onClick={() => go(1)} className="icon-btn absolute right-2 bg-black/40 phone:right-[calc(var(--gutter)-8px)]" aria-label="Next photo">
                  <ChevronRight aria-hidden="true" className="size-5" strokeWidth={1.5} />
                </button>
              </>
            )}
          </div>

          {current.caption && <p className="px-[var(--gutter)] pt-3 text-center text-[13px] text-[#EEE8DD]/80">{current.caption}</p>}

          {count > 1 && (
            <ul className="flex justify-center gap-2 overflow-x-auto px-[var(--gutter)] py-4" aria-label="Photos">
              {images.map((image, position) => (
                <li key={image.id} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => onIndexChange(position)}
                    aria-label={`Photo ${position + 1}`}
                    aria-current={position === index}
                    className={`block h-12 w-16 overflow-hidden border transition-opacity ${position === index ? 'border-[#EEE8DD] opacity-100' : 'border-transparent opacity-55 hover:opacity-90'}`}
                  >
                    <img src={image.src} alt="" className="size-full object-cover" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Modal>
  )
}

function ViewerImage({ image }: { image: GalleryImage }) {
  const [loaded, setLoaded] = useState(false)
  return (
    <img
      src={image.src}
      alt={image.alt}
      onLoad={() => setLoaded(true)}
      ref={(node) => {
        if (node?.complete && node.naturalWidth > 0) setLoaded(true)
      }}
      className={`max-h-full max-w-full object-contain transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
    />
  )
}
