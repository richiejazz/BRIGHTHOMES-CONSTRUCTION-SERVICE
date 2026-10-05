import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'

import type { Project } from '../../api/types'
import { Badge, DemoBadge, ProjectStatusBadge } from '../ui/Badges'
import { Skeleton } from '../ui/States'
import { coverImage } from '../../lib/projects'
import { ProjectMedia } from './ProjectMedia'

type ProjectCardProps = { project: Project; aspect?: string; eager?: boolean; titleSize?: 'md' | 'lg'; sizes?: string }

export function ProjectCard({ project, aspect = 'aspect-[4/5]', eager, titleSize = 'md', sizes }: ProjectCardProps) {
  return (
    <article className="group relative">
      <div className="relative">
        <ProjectMedia image={coverImage(project.images)} seed={project.id} eager={eager} sizes={sizes} className={aspect} imgClassName="transition-transform duration-[1.2s] ease-[var(--ease-architectural)] group-hover:scale-[1.03]" />
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          {project.is_demo && <DemoBadge />}
          {!project.is_published && <Badge tone="outline-dark" className="bg-ink/70">Unpublished</Badge>}
        </div>
      </div>
      <div className="mt-5 flex items-start justify-between gap-6 border-t border-stone-300 pt-5">
        <div>
          <p className="eyebrow text-stone-500">{project.category.name}</p>
          <h3 className={`mt-2 font-display leading-[1.05] text-ink ${titleSize === 'lg' ? 'text-4xl sm:text-5xl' : 'text-3xl'}`}>
            <Link to={`/projects/${project.slug}`} className="after:absolute after:inset-0 focus-visible:outline-none group-has-[:focus-visible]:underline decoration-bronze underline-offset-4">
              {project.title}
            </Link>
          </h3>
          {project.location && <p className="mt-2 text-sm text-stone-600">{project.location}</p>}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-3">
          <ProjectStatusBadge status={project.status} />
          <ArrowUpRight aria-hidden="true" className="size-5 text-stone-400 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-bronze-dark" />
        </div>
      </div>
    </article>
  )
}

export function ProjectCardSkeleton({ aspect = 'aspect-[4/5]' }: { aspect?: string }) {
  return (
    <div>
      <Skeleton className={aspect} />
      <div className="mt-5 border-t border-stone-300 pt-5">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="mt-3 h-8 w-3/4" />
      </div>
    </div>
  )
}
