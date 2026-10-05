import type { ProjectImage } from '../api/types'

export function coverImage(images: ProjectImage[]): ProjectImage | null {
  return images.find((image) => image.is_cover) ?? images[0] ?? null
}

/** Staggered editorial grid: two columns on tablets, three on desktop, with an offset column. */
export const projectGridClasses = 'grid gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3 lg:gap-x-10'

export function staggerClass(index: number) {
  return `${index % 2 === 1 ? 'md:mt-16' : ''} ${index % 3 === 1 ? 'lg:mt-20' : 'lg:mt-0'}`
}
