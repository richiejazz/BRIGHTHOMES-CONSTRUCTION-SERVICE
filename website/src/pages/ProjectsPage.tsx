import { Search, X } from 'lucide-react'
import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { useCategories, useProjects } from '../api/content'
import { isNotFound } from '../api/errors'
import type { ProjectStatus } from '../api/types'
import { ProjectCard, ProjectCardSkeleton } from '../components/projects/ProjectCard'
import { Button, ButtonLink } from '../components/ui/Button'
import { Container, PageHeader } from '../components/ui/Layout'
import { Pagination } from '../components/ui/Pagination'
import { EmptyState, ErrorState, LoadingAnnouncement, Skeleton } from '../components/ui/States'
import { projectGridClasses, staggerClass } from '../lib/projects'

const STATUSES: { value: ProjectStatus | ''; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'completed', label: 'Completed' },
  { value: 'ongoing', label: 'Ongoing' },
]

function FilterButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`relative min-h-11 whitespace-nowrap text-sm font-medium tracking-[0.04em] transition-colors after:absolute after:inset-x-0 after:bottom-1.5 after:h-px after:bg-bronze-dark after:transition-transform ${active ? 'text-ink after:scale-x-100' : 'text-stone-500 after:scale-x-0 hover:text-ink'}`}
    >
      {children}
    </button>
  )
}

export default function ProjectsPage() {
  const [params, setParams] = useSearchParams()
  const categorySlug = params.get('category') ?? ''
  const statusParam = params.get('status')
  const status: ProjectStatus | '' = statusParam === 'completed' || statusParam === 'ongoing' ? statusParam : ''
  const search = params.get('q') ?? ''
  const page = Math.max(1, Number.parseInt(params.get('page') ?? '1', 10) || 1)

  const categories = useCategories()
  const category = categories.data?.find((item) => item.slug === categorySlug)
  const waitingForCategory = Boolean(categorySlug) && categories.isPending
  const projects = useProjects({ page, category: category?.id, status: status || undefined, search }, { enabled: !waitingForCategory })

  const resultsRef = useRef<HTMLDivElement>(null)
  const searchId = useId()
  const [searchDraft, setSearchDraft] = useState(search)

  const update = useCallback(
    (changes: Record<string, string>, { keepPage = false } = {}) =>
      setParams(
      (current) => {
        const next = new URLSearchParams(current)
        for (const [key, value] of Object.entries(changes)) {
          if (value) next.set(key, value)
          else next.delete(key)
        }
        if (!keepPage) next.delete('page')
        return next
      },
      { replace: true },
      ),
    [setParams],
  )

  // Debounce search input into the URL.
  useEffect(() => {
    if (searchDraft.trim() === search) return
    const timer = window.setTimeout(() => update({ q: searchDraft.trim() }), 350)
    return () => window.clearTimeout(timer)
  }, [searchDraft, search, update])

  const filtersActive = Boolean(categorySlug || status || search)
  const clearFilters = () => {
    setSearchDraft('')
    setParams({}, { replace: true })
  }
  const goToPage = (next: number) => {
    update({ page: next > 1 ? String(next) : '' }, { keepPage: true })
    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const results = projects.data?.results ?? []
  const showSkeleton = waitingForCategory || projects.isPending

  return (
    <>
      <title>Projects — BRIGHTHOMES Construction Service</title>
      <PageHeader eyebrow="Projects" title={<>Built work, <em className="text-bronze-light">completed and ongoing.</em></>} intro="Explore residential and commercial projects by category and status." />

      <section aria-label="Project filters" className="z-30 border-b lg:sticky lg:top-18 border-stone-300 bg-paper/95 backdrop-blur-md">
        <Container className="flex flex-col gap-2 py-3 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
          <div className="-mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
            <div role="group" aria-label="Filter by category" className="flex items-center gap-6">
              <FilterButton active={!categorySlug} onClick={() => update({ category: '' })}>
                All projects
              </FilterButton>
              {categories.isPending && [0, 1, 2].map((index) => <Skeleton key={index} className="h-4 w-20" />)}
              {categories.data?.map((item) => (
                <FilterButton key={item.id} active={item.slug === categorySlug} onClick={() => update({ category: item.slug })}>
                  {item.name}
                </FilterButton>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
            <div role="group" aria-label="Filter by status" className="flex items-center gap-5 border-stone-300 lg:border-l lg:pl-6">
              {STATUSES.map((item) => (
                <FilterButton key={item.label} active={status === item.value} onClick={() => update({ status: item.value })}>
                  {item.label}
                </FilterButton>
              ))}
            </div>
            <div className="relative w-full sm:ml-auto sm:w-64">
              <label htmlFor={searchId} className="sr-only">
                Search projects
              </label>
              <Search aria-hidden="true" className="pointer-events-none absolute left-0 top-1/2 size-4 -translate-y-1/2 text-stone-500" />
              <input
                id={searchId}
                type="search"
                value={searchDraft}
                onChange={(event) => setSearchDraft(event.target.value)}
                placeholder="Search projects"
                className="h-11 w-full border-0 border-b border-stone-300 bg-transparent pl-7 pr-2 text-sm outline-none placeholder:text-stone-500 focus:border-bronze-dark focus-visible:outline-none [&::-webkit-search-cancel-button]:hidden"
              />
            </div>
          </div>
        </Container>
      </section>

      <section aria-label="Project results" className="py-14 sm:py-20">
        <Container>
          <div ref={resultsRef} className="scroll-mt-40 flex flex-wrap items-center justify-between gap-4 pb-10">
            <p className="text-sm text-stone-600" aria-live="polite">
              {showSkeleton ? 'Loading projects…' : projects.isPlaceholderData ? 'Updating results…' : projects.isSuccess ? `${projects.data.count} ${projects.data.count === 1 ? 'project' : 'projects'}${category ? ` in ${category.name}` : ''}` : ''}
            </p>
            {filtersActive && (
              <button type="button" onClick={clearFilters} className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-ink hover:text-bronze-dark">
                <X aria-hidden="true" className="size-4" /> Clear filters
              </button>
            )}
          </div>

          {categorySlug && categories.isSuccess && !category ? (
            <EmptyState title="That category isn’t available." action={<Button onClick={clearFilters}>Show all projects</Button>}>
              It may have been renamed or removed.
            </EmptyState>
          ) : showSkeleton ? (
            <div className={projectGridClasses}>
              <LoadingAnnouncement label="Loading projects" />
              {Array.from({ length: 6 }, (_, index) => (
                <div key={index} className={staggerClass(index)}>
                  <ProjectCardSkeleton />
                </div>
              ))}
            </div>
          ) : projects.isError ? (
            isNotFound(projects.error) && page > 1 ? (
              <EmptyState title="That page doesn’t exist." action={<Button onClick={() => goToPage(1)}>Go to the first page</Button>} />
            ) : (
              <ErrorState error={projects.error} onRetry={() => void projects.refetch()} />
            )
          ) : results.length === 0 ? (
            filtersActive ? (
              <EmptyState title="No projects match these filters." action={<Button variant="secondary" onClick={clearFilters}>Clear filters</Button>}>
                Try another category or status, or adjust your search.
              </EmptyState>
            ) : (
              <EmptyState title="Our portfolio is being prepared." action={<ButtonLink to="/contact" arrow>Discuss your project</ButtonLink>}>
                Project case studies will be published here soon.
              </EmptyState>
            )
          ) : (
            <>
              {results.some((project) => project.is_demo) && (
                <p className="mb-12 border-l-2 border-bronze pl-4 text-sm text-stone-600">Projects marked “Demo content” are placeholders used while the portfolio is prepared. They are not BRIGHTHOMES projects.</p>
              )}
              <ul className={`${projectGridClasses} transition-opacity ${projects.isPlaceholderData ? 'opacity-50' : ''}`} aria-busy={projects.isFetching}>
                {results.map((project, index) => (
                  <li key={project.id} className={`animate-rise ${staggerClass(index)}`} style={{ animationDelay: `${(index % 6) * 60}ms` }}>
                    <ProjectCard project={project} eager={index < 3} />
                  </li>
                ))}
              </ul>
              <div className="mt-20">
                <Pagination page={page} count={projects.data?.count ?? 0} onChange={goToPage} label="Project pages" />
              </div>
            </>
          )}
        </Container>
      </section>
    </>
  )
}
