import { Link } from 'react-router-dom'

import type { Project } from '../../api/types'
import { padIndex } from '../../lib/format'
import { coverImage } from '../../lib/projects'
import { routes } from '../../lib/routes'
import { Media } from '../media/Media'
import { ProjectStatusLabel } from '../ui/Badges'
import { Skeleton } from '../ui/States'
import { SaveHeart } from './SaveButton'

/**
 * W-05 project item (§15): image, then number (bronze 12px/600), serif title, category + status
 * dot, one-line description and save — directly on the page, no card.
 */
export function ProjectItem({ project, index, aspect = 'aspect-[4/3]', titleSize = 'text-[clamp(26px,2.4vw,34px)]', sizes }: { project: Project; index: number; aspect?: string; titleSize?: string; sizes?: string }) {
  const cover = coverImage(project.images)
  return (
    <article className="group relative">
      <Link to={routes.project(project.slug)} className="block focus-visible:outline-offset-4" aria-label={project.title}>
        <Media src={cover?.image} alt={cover?.alt_text ?? ''} aspect={aspect} zoom illustrative={project.is_demo} sizes={sizes} />
      </Link>
      <div className="mt-5 grid grid-cols-[auto_1fr_auto] gap-x-4 gap-y-1 phone:gap-x-6">
        <p className="pt-2 text-[12px] font-semibold text-bronze tabular-nums">{padIndex(index)}</p>
        <div className="min-w-0">
          <h3 className={`font-display leading-[1.05] font-medium tracking-[-0.01em] ${titleSize}`}>
            <Link to={routes.project(project.slug)} className="transition-colors duration-200 hover:text-bronze">
              {project.title}
            </Link>
          </h3>
          <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-ink2">
            <span>{project.category.name}</span>
            <ProjectStatusLabel status={project.status} />
          </p>
          {project.summary && <p className="mt-3 line-clamp-2 max-w-[52ch] text-[14px] leading-[1.6] text-ink2">{project.summary}</p>}
        </div>
        <SaveHeart kind="project" id={project.id} title={project.title} className="-mt-1 bg-transparent" />
      </div>
    </article>
  )
}

export function ProjectItemSkeleton({ aspect = 'aspect-[4/3]' }: { aspect?: string }) {
  return (
    <div>
      <Skeleton className={aspect} />
      <div className="mt-5 grid grid-cols-[auto_1fr] gap-x-6">
        <Skeleton className="mt-2 h-3 w-5" />
        <div className="space-y-3">
          <Skeleton className="h-7 w-3/4" />
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="h-3 w-5/6" />
        </div>
      </div>
    </div>
  )
}
