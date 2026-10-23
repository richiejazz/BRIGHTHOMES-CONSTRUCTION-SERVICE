/** The cover image of a project or property gallery: the one marked as cover, else the first. */
export function coverImage<T extends { is_cover: boolean }>(images: T[]): T | null {
  return images.find((image) => image.is_cover) ?? images[0] ?? null
}
