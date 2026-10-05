import { ArrowLeft, ArrowRight, Expand, X } from 'lucide-react'
import { useState } from 'react'

import type { ProjectImage } from '../../api/types'
import { Modal } from '../ui/Modal'
import { ProjectMedia } from './ProjectMedia'

/** Cover-first gallery with a keyboard-accessible full-screen viewer. */
export function ProjectGallery({ images, seed, title }: { images: ProjectImage[]; seed: number; title: string }) {
  const ordered = [...images].sort((a, b) => Number(b.is_cover) - Number(a.is_cover) || a.display_order - b.display_order)
  const [active, setActive] = useState<number | null>(null)

  if (ordered.length === 0) {
    return (
      <figure>
        <ProjectMedia image={null} seed={seed} className="aspect-[16/10]" />
        <figcaption className="mt-3 text-sm text-stone-500">Photographs of this project have not been published yet. The drawing above is illustrative.</figcaption>
      </figure>
    )
  }

  const [lead, ...rest] = ordered
  const step = (delta: number) => setActive((current) => (current === null ? null : (current + delta + ordered.length) % ordered.length))
  const current = active === null ? null : ordered[active]

  return (
    <div>
      <div className="grid gap-3 sm:gap-4 md:grid-cols-6">
        <GalleryTile image={lead} seed={seed} className={leadLayout(rest.length)} onOpen={() => setActive(0)} eager />
        {rest.slice(0, 2).map((image, index) => (
          <GalleryTile key={image.id} image={image} seed={seed} className={`aspect-[4/3] md:col-span-2 ${rest.length === 1 ? 'md:aspect-auto' : ''}`} onOpen={() => setActive(index + 1)} />
        ))}
      </div>
      {rest.length > 2 && (
        <ul className="mt-3 grid grid-cols-3 gap-3 sm:mt-4 sm:grid-cols-4 sm:gap-4 lg:grid-cols-6">
          {rest.slice(2).map((image, index) => (
            <li key={image.id}>
              <GalleryTile image={image} seed={seed} className="aspect-square" onOpen={() => setActive(index + 3)} />
            </li>
          ))}
        </ul>
      )}

      <Modal open={current !== null} onClose={() => setActive(null)} label={`${title} — image viewer`} className="h-dvh w-full bg-ink/97 text-paper">
        {current && active !== null && (
          <div
            className="flex h-dvh flex-col"
            onKeyDown={(event) => {
              if (event.key === 'ArrowRight') step(1)
              if (event.key === 'ArrowLeft') step(-1)
            }}
          >
            <div className="flex items-center justify-between px-5 py-4 sm:px-8">
              <p className="text-sm text-stone-400" aria-live="polite">
                {active + 1} / {ordered.length}
              </p>
              <button type="button" autoFocus onClick={() => setActive(null)} className="inline-flex size-11 items-center justify-center" aria-label="Close image viewer">
                <X aria-hidden="true" className="size-6" />
              </button>
            </div>
            <figure className="flex min-h-0 flex-1 flex-col items-center justify-center px-5 pb-6 sm:px-20">
              <img src={current.image} alt={current.alt_text} className="max-h-full min-h-0 max-w-full object-contain" />
              {current.caption && <figcaption className="mt-4 max-w-2xl text-center text-sm text-stone-300">{current.caption}</figcaption>}
            </figure>
            {ordered.length > 1 && (
              <div className="flex justify-center gap-4 pb-8">
                <button type="button" onClick={() => step(-1)} className="inline-flex size-12 items-center justify-center border border-graphite hover:border-paper" aria-label="Previous image">
                  <ArrowLeft aria-hidden="true" className="size-5" />
                </button>
                <button type="button" onClick={() => step(1)} className="inline-flex size-12 items-center justify-center border border-graphite hover:border-paper" aria-label="Next image">
                  <ArrowRight aria-hidden="true" className="size-5" />
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

function leadLayout(others: number) {
  if (others === 0) return 'aspect-[16/10] md:col-span-6'
  if (others === 1) return 'aspect-[4/3] md:col-span-4'
  return 'aspect-[4/3] md:col-span-4 md:row-span-2 md:aspect-auto'
}

function GalleryTile({ image, seed, className, onOpen, eager }: { image: ProjectImage; seed: number; className: string; onOpen: () => void; eager?: boolean }) {
  return (
    <button type="button" onClick={onOpen} className={`group relative block w-full overflow-hidden ${className}`} aria-label={`View larger: ${image.alt_text}`}>
      <ProjectMedia image={image} seed={seed} eager={eager} sizes="(min-width: 768px) 66vw, 100vw" className="size-full" imgClassName="transition-transform duration-[1.2s] ease-[var(--ease-architectural)] group-hover:scale-[1.03]" />
      <span aria-hidden="true" className="absolute bottom-3 right-3 inline-flex size-9 items-center justify-center bg-ink/70 text-paper opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
        <Expand className="size-4" />
      </span>
    </button>
  )
}
