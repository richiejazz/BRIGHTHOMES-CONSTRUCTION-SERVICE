import { Search } from 'lucide-react'
import { useId } from 'react'

import { useCategories, useProjects } from '../api/content'
import type { ProjectStatus } from '../api/types'
import { ProjectItem, ProjectItemSkeleton } from '../components/content/ProjectItem'
import { ConsultationCta } from '../components/sections/ConsultationCta'
import { Button, ButtonLink } from '../components/ui/Button'
import { ChipGroup, Segmented } from '../components/ui/Controls'
import { PageHeader } from '../components/ui/Layout'
import { Pagination } from '../components/ui/Pagination'
import { EmptyState, ErrorState, LoadingAnnouncement } from '../components/ui/States'
import { useDebouncedSearch, useUrlFilters } from '../hooks/useUrlFilters'
import { routes } from '../lib/routes'

const STATUSES: { value: ProjectStatus | 'any'; label: string }[] = [
  { value: 'any', label: 'Any status' },
  { value: 'completed', label: 'Completed' },
  { value: 'ongoing', label: 'Ongoing' },
]

/** W-05: the first case study spans 21:9; the rest alternate 4:3 and 4:5, the second column offset 96px. */
function cellFor(index: number) {
  if (index === 0) return { cell: 'desk:col-span-12', aspect: 'aspect-[4/3] phone:aspect-[21/9]', title: 'text-[clamp(30px,3.2vw,46px)]' }
  const right = index % 2 === 0
  return { cell: `desk:col-span-6 ${right ? 'desk:mt-24' : ''}`, aspect: index % 4 === 1 || index % 4 === 2 ? 'aspect-[4/3]' : 'aspect-[4/5]', title: undefined }
}

export default function ProjectsPage() {
  const { params, update, clear, page } = useUrlFilters()
  const categorySlug = params.get('category') ?? ''
  const statusParam = params.get('status')
  const status: ProjectStatus | 'any' = statusParam === 'completed' || statusParam === 'ongoing' ? statusParam : 'any'
  const search = params.get('q') ?? ''

  const categories = useCategories()
  const category = categories.data?.find((item) => item.slug === categorySlug)
  const waitingForCategory = Boolean(categorySlug) && categories.isPending
  const projects = useProjects({ page, category: category?.id, status: status === 'any' ? undefined : status, search }, { enabled: !waitingForCategory })
  const [draft, setDraft] = useDebouncedSearch(search, (value) => update({ q: value }))
  const searchId = useId()

  const results = projects.data?.results ?? []
  const anyDemo = results.some((project) => project.is_demo)
  const filtersActive = Boolean(categorySlug || statusParam || search)
  const count = projects.data?.count ?? 0

  return (
    <>
      <title>Construction — BRIGHTHOMES Construction Service</title>
      <PageHeader
        section="Construction"
        title="Construction"
        intro="Case studies across residential, commercial and renovation work — from drawings and approvals to the finished building."
        note={anyDemo ? 'Projects shown are illustrative placeholders.' : undefined}
      />

      <div className="border-y border-line">
        <div className="container-page flex flex-col gap-4 py-4 desk:flex-row desk:items-center desk:justify-between">
          <ChipGroup
            label="Category"
            value={categorySlug || 'all'}
            onChange={(value) => update({ category: value === 'all' ? '' : value })}
            options={[{ value: 'all', label: 'All' }, ...(categories.data ?? []).map((item) => ({ value: item.slug, label: item.name }))]}
          />
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            <Segmented label="Status" value={status} onChange={(value) => update({ status: value === 'any' ? '' : value })} options={STATUSES} />
            <label htmlFor={searchId} className="flex min-h-11 items-center gap-2 border-b border-control-line focus-within:border-bronze">
              <Search aria-hidden="true" className="size-4 text-mute" strokeWidth={1.5} />
              <span className="sr-only">Search projects</span>
              <input id={searchId} type="search" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Search projects" className="w-40 bg-transparent py-2 text-[14px] outline-none placeholder:text-mute" />
            </label>
            <p className="text-[12px] text-ink2 tabular-nums" aria-live="polite">
              {projects.data ? `${String(count).padStart(2, '0')} ${count === 1 ? 'project' : 'projects'}` : ' '}
            </p>
          </div>
        </div>
      </div>

      <section className="container-page py-[clamp(40px,5vw,80px)]" aria-label="Case studies" aria-busy={projects.isPending}>
        {projects.isPending || waitingForCategory ? (
          <div className="grid-editorial gap-y-16">
            <LoadingAnnouncement label="Loading projects" />
            {[0, 1, 2].map((index) => (
              <div key={index} className={cellFor(index).cell}>
                <ProjectItemSkeleton aspect={cellFor(index).aspect} />
              </div>
            ))}
          </div>
        ) : projects.isError ? (
          <ErrorState title="We couldn’t load projects." error={projects.error} onRetry={() => void projects.refetch()} />
        ) : results.length === 0 ? (
          filtersActive ? (
            <EmptyState title="No projects match these filters." action={<Button onClick={clear}>Clear filters</Button>}>
              Try another category or status, or clear the search.
            </EmptyState>
          ) : (
            <EmptyState title="Case studies are being prepared." action={<ButtonLink to={routes.consultation()} arrow>Request a consultation</ButtonLink>}>
              Our project records will appear here soon. In the meantime, tell us about your build.
            </EmptyState>
          )
        ) : (
          <>
            <div className="grid-editorial gap-y-[clamp(56px,6vw,96px)]">
              {results.map((project, index) => {
                const cell = cellFor(index)
                return (
                  <div key={project.id} className={cell.cell}>
                    <ProjectItem project={project} index={(page - 1) * 12 + index} aspect={cell.aspect} titleSize={cell.title} sizes={index === 0 ? '100vw' : '(min-width: 980px) 50vw, 100vw'} />
                  </div>
                )
              })}
            </div>
            <div className="mt-[clamp(56px,6vw,96px)]">
              <Pagination page={page} count={count} onChange={(next) => update({ page: String(next) }, { keepPage: true })} label="Project pages" />
            </div>
          </>
        )}
      </section>
      <ConsultationCta />
    </>
  )
}
