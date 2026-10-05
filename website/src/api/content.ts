import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { apiClient } from './client'
import type { Achievement, Paginated, Project, ProjectCategory, ProjectStatus, Service } from './types'

export const PAGE_SIZE = 12

export const contentKeys = {
  projects: (params: ProjectListParams) => ['projects', params] as const,
  allProjects: ['projects'] as const,
  project: (slug: string) => ['project', slug] as const,
  categories: ['categories'] as const,
  services: ['services'] as const,
  achievements: ['achievements'] as const,
}

/** Collect every page of a small, paginated collection (services, categories, achievements). */
async function fetchAll<T>(url: string): Promise<T[]> {
  const results: T[] = []
  let page = 1
  for (;;) {
    const { data } = await apiClient.get<Paginated<T>>(url, { params: { page } })
    results.push(...data.results)
    if (!data.next) return results
    page += 1
  }
}

export type ProjectListParams = {
  page?: number
  category?: number
  status?: ProjectStatus
  search?: string
}

export function useProjects(params: ProjectListParams, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: contentKeys.projects(params),
    queryFn: async () => (await apiClient.get<Paginated<Project>>('/projects/', { params: { ...params, search: params.search || undefined } })).data,
    placeholderData: keepPreviousData,
    enabled: options.enabled ?? true,
  })
}

export function useProject(slug: string, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: contentKeys.project(slug),
    queryFn: async () => (await apiClient.get<Project>(`/projects/${encodeURIComponent(slug)}/`)).data,
    enabled: options.enabled ?? true,
  })
}

export function useCategories() {
  return useQuery({ queryKey: contentKeys.categories, queryFn: () => fetchAll<ProjectCategory>('/categories/'), staleTime: 10 * 60_000 })
}

export function useServices() {
  return useQuery({ queryKey: contentKeys.services, queryFn: () => fetchAll<Service>('/services/'), staleTime: 10 * 60_000 })
}

export function useAchievements() {
  return useQuery({ queryKey: contentKeys.achievements, queryFn: () => fetchAll<Achievement>('/achievements/'), staleTime: 10 * 60_000 })
}
