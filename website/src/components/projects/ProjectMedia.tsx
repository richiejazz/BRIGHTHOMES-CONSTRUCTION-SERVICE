import type { ProjectImage } from '../../api/types'
import { ElevationPlaceholder } from '../art/Elevations'

type ProjectMediaProps = {
  image: ProjectImage | null
  seed: number
  className?: string
  imgClassName?: string
  eager?: boolean
  sizes?: string
}

/**
 * A project's photograph, or a clearly labelled illustration when none has been published.
 * The wrapper controls the aspect ratio; the media always fills it with a centred crop.
 */
export function ProjectMedia({ image, seed, className = '', imgClassName = '', eager = false, sizes = '(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw' }: ProjectMediaProps) {
  return (
    <div className={`relative overflow-hidden bg-charcoal ${className}`}>
      {image ? (
        <img src={image.image} alt={image.alt_text} sizes={sizes} loading={eager ? 'eager' : 'lazy'} decoding="async" className={`absolute inset-0 size-full object-cover ${imgClassName}`} />
      ) : (
        <>
          <ElevationPlaceholder seed={seed} className={`absolute inset-0 size-full ${imgClassName}`} />
          <span className="absolute bottom-3 right-3 text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-stone-400">Illustration</span>
        </>
      )}
    </div>
  )
}
