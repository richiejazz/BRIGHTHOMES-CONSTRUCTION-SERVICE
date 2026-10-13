import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query'

import { apiClient } from './client'
import type { Achievement, ListingType, Paginated, Project, ProjectCategory, ProjectStatus, Property, PropertyCategory, PropertyStatus, Service } from './types'

export const contentKeys = {
  allProjects: ['projects'] as const,
  projects: (params: ProjectListParams) => ['projects', 'list', params] as const,
  featured: ['projects', 'featured'] as const,
  project: (slug: string) => ['project', slug] as const,
  allProperties: ['properties'] as const,
  properties: (params: PropertyListParams) => ['properties', 'list', params] as const,
  featuredProperties: ['properties', 'featured'] as const,
  property: (slug: string) => ['property', slug] as const,
  categories: ['categories'] as const,
  propertyTypes: ['property-types'] as const,
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

/** Featured records first, topped up with the most recent ones so the section is never sparse. */
async function fetchFeatured<T extends { id: number }>(url: string, count: number) {
  const featured = (await apiClient.get<Paginated<T>>(url, { params: { is_featured: true } })).data.results
  if (featured.length >= count) return featured.slice(0, count)
  const recent = (await apiClient.get<Paginated<T>>(url)).data.results.filter((item) => !featured.some((pick) => pick.id === item.id))
  return [...featured, ...recent].slice(0, count)
}

/** A placeholder from any cached list, so detail screens render immediately from a card tap. */
function findCached<T extends { slug: string }>(queryClient: ReturnType<typeof useQueryClient>, queryKey: readonly string[], slug: string | undefined) {
  if (!slug) return undefined
  for (const [, data] of queryClient.getQueriesData<T[] | { pages: Paginated<T>[] }>({ queryKey })) {
    const items = Array.isArray(data) ? data : data?.pages.flatMap((page) => page.results)
    const match = items?.find((item) => item.slug === slug)
    if (match) return match
  }
  return undefined
}

// --- Construction projects ----------------------------------------------------------------

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

/** Selected construction work for the Home screen. */
export function useFeaturedProjects() {
  return useQuery({ queryKey: contentKeys.featured, queryFn: () => fetchFeatured<Project>('/projects/', 5) })
}

export function useProject(slug: string | undefined) {
  const queryClient = useQueryClient()
  return useQuery({
    queryKey: contentKeys.project(slug ?? ''),
    queryFn: async () => (await apiClient.get<Project>(`/projects/${encodeURIComponent(slug ?? '')}/`)).data,
    enabled: Boolean(slug),
    placeholderData: () => findCached<Project>(queryClient, contentKeys.allProjects, slug),
  })
}

export function useCategories() {
  return useQuery({ queryKey: contentKeys.categories, queryFn: () => fetchAll<ProjectCategory>('/categories/'), staleTime: CONTENT_STALE })
}

// --- Real estate --------------------------------------------------------------------------

export type PropertyListParams = {
  search?: string
  listing_type?: ListingType
  category?: number
  status?: PropertyStatus
  location?: string
  min_price?: number
  max_price?: number
  min_bedrooms?: number
}

export function usePropertyList(params: PropertyListParams) {
  return useInfiniteQuery({
    queryKey: contentKeys.properties(params),
    queryFn: async ({ pageParam }) =>
      (await apiClient.get<Paginated<Property>>('/properties/', { params: { ...params, search: params.search || undefined, location: params.location || undefined, page: pageParam } })).data,
    initialPageParam: 1,
    getNextPageParam: nextPageParam,
  })
}

export function useFeaturedProperties() {
  return useQuery({ queryKey: contentKeys.featuredProperties, queryFn: () => fetchFeatured<Property>('/properties/', 6) })
}

export function useProperty(slug: string | undefined) {
  const queryClient = useQueryClient()
  return useQuery({
    queryKey: contentKeys.property(slug ?? ''),
    queryFn: async () => (await apiClient.get<Property>(`/properties/${encodeURIComponent(slug ?? '')}/`)).data,
    enabled: Boolean(slug),
    placeholderData: () => findCached<Property>(queryClient, contentKeys.allProperties, slug),
  })
}

export function usePropertyTypes() {
  return useQuery({ queryKey: contentKeys.propertyTypes, queryFn: () => fetchAll<PropertyCategory>('/property-types/'), staleTime: CONTENT_STALE })
}

// --- Services and achievements ------------------------------------------------------------

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
