import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query'

import { apiClient } from './client'
import type { Achievement, Paginated, Project, ProjectCategory, ProjectStatus, Service } from './types'

export const contentKeys = {
  allProjects: ['projects'] as const,
  projects: (params: ProjectListParams) => ['projects', 'list', params] as const,
  featured: ['projects', 'featured'] as const,
  project: (slug: string) => ['project', slug] as const,
  categories: ['categories'] as const,
  services: ['services'] as const,
  service: (slug: string) => ['service', slug] as const,
  achievements: ['achievements'] as const,
}

const CONTENT_STALE = 10 * 60_000

/** Collect every page of a small, paginated collection (services, categories, achievements). */
export async function fetchAll<T>(url: string): Promise<T[]> {
  const results: T[] = []
  let page = 1
  for (;;) {
    const { data } = await apiClient.get<Paginated<T>>(url, { params: { page } })
    results.push(...data.results)
    if (!data.next) return results
    page += 1
  }
}

/** Page number for the next request, or undefined on the last page. */
export const nextPageParam = <T>(last: Paginated<T>, _all: Paginated<T>[], page: number) => (last.next ? page + 1 : undefined)

export type ProjectListParams = {
  category?: number
  status?: ProjectStatus
  search?: string
}

export function useProjectList(params: ProjectListParams) {
  return useInfiniteQuery({
    queryKey: contentKeys.projects(params),
    queryFn: async ({ pageParam }) =>
      (await apiClient.get<Paginated<Project>>('/projects/', { params: { ...params, search: params.search || undefined, page: pageParam } })).data,
    initialPageParam: 1,
    getNextPageParam: nextPageParam,
  })
}

/** The most recent published projects for the Home screen. */
export function useFeaturedProjects() {
  return useQuery({
    queryKey: contentKeys.featured,
    queryFn: async () => (await apiClient.get<Paginated<Project>>('/projects/', { params: { page: 1 } })).data.results.slice(0, 6),
  })
}

export function useProject(slug: string | undefined) {
  const queryClient = useQueryClient()
  return useQuery({
    queryKey: contentKeys.project(slug ?? ''),
    queryFn: async () => (await apiClient.get<Project>(`/projects/${encodeURIComponent(slug ?? '')}/`)).data,
    enabled: Boolean(slug),
    // Show the card's data immediately when arriving from a list, then refresh in the background.
    placeholderData: () => findCachedProject(queryClient, slug),
  })
}

function findCachedProject(queryClient: ReturnType<typeof useQueryClient>, slug: string | undefined) {
  if (!slug) return undefined
  for (const [, data] of queryClient.getQueriesData<Project[] | { pages: Paginated<Project>[] }>({ queryKey: contentKeys.allProjects })) {
    const projects = Array.isArray(data) ? data : data?.pages.flatMap((page) => page.results)
    const match = projects?.find((project) => project.slug === slug)
    if (match) return match
  }
  return undefined
}

export function useCategories() {
  return useQuery({ queryKey: contentKeys.categories, queryFn: () => fetchAll<ProjectCategory>('/categories/'), staleTime: CONTENT_STALE })
}

export function useServices() {
  return useQuery({ queryKey: contentKeys.services, queryFn: () => fetchAll<Service>('/services/'), staleTime: CONTENT_STALE })
}

export function useService(slug: string | undefined) {
  const queryClient = useQueryClient()
  return useQuery({
    queryKey: contentKeys.service(slug ?? ''),
    queryFn: async () => (await apiClient.get<Service>(`/services/${encodeURIComponent(slug ?? '')}/`)).data,
    enabled: Boolean(slug),
    staleTime: CONTENT_STALE,
    placeholderData: () => queryClient.getQueryData<Service[]>(contentKeys.services)?.find((service) => service.slug === slug),
  })
}

export function useAchievements() {
  return useQuery({ queryKey: contentKeys.achievements, queryFn: () => fetchAll<Achievement>('/achievements/'), staleTime: CONTENT_STALE })
}
