import { useState } from 'react'

import { IllustrativeLabel } from '../ui/Badges'

type MediaProps = {
  src?: string | null
  alt: string
  /** Tailwind aspect class, e.g. "aspect-[4/3]". Omit when the parent sets the size. */
  aspect?: string
  className?: string
  imgClassName?: string
  /** Show the "Illustrative image" chip bottom-right (§16). */
  illustrative?: boolean
  illustrativeText?: string
  /** Where the chip sits; top-left when another element overlaps the image's lower edge. */
  labelPosition?: 'bottom-right' | 'top-left'
  /** §14: sold / rented / unavailable listings are shown 85–90% greyscale. */
  greyscale?: boolean
  /** §24 image hover: scale 1 → 1.04 over 1.4s when the closest `.group` is hovered. */
  zoom?: boolean
  sizes?: string
  eager?: boolean
}

/**
 * Image with a --stone placeholder until it decodes, then a 300ms fade (§16, §22). Dark mode dims
 * imagery 12% globally (index.css). An image that fails to load leaves the stone panel in place.
 */
export function Media({ src, alt, aspect = '', className = '', imgClassName = '', illustrative, illustrativeText, labelPosition = 'bottom-right', greyscale, zoom, sizes, eager }: MediaProps) {
  const [loaded, setLoaded] = useState(false)
  return (
    <div className={`relative overflow-hidden bg-stone ${aspect} ${className}`}>
      {src && (
        <img
          src={src}
          alt={alt}
          sizes={sizes}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={() => setLoaded(true)}
          // A cached image can finish before React attaches onLoad.
          ref={(node) => {
            if (node?.complete && node.naturalWidth > 0) setLoaded(true)
          }}
          className={`absolute inset-0 size-full object-cover transition-[opacity,transform,filter] ease-[var(--ease)] ${loaded ? 'opacity-100' : 'opacity-0'} ${zoom ? 'duration-[1400ms] group-hover:scale-[1.04]' : 'duration-300'} ${greyscale ? 'brightness-[calc(1-var(--img-dim))] grayscale-[0.88]' : ''} ${imgClassName}`}
        />
      )}
      {illustrative && <IllustrativeLabel className={`absolute ${labelPosition === 'top-left' ? 'top-3 left-3' : 'right-3 bottom-3'}`}>{illustrativeText}</IllustrativeLabel>}
    </div>
  )
}
