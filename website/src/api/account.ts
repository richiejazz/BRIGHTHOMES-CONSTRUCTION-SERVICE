import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { apiClient } from './client'
import type { Appointment, AppointmentInput, Enquiry, EnquiryInput, Paginated, RegisterInput, SavedProject, TokenPair, User } from './types'

export const accountKeys = {
  me: ['me'] as const,
  saved: ['saved-projects'] as const,
  savedPage: (page: number) => ['saved-projects', 'page', page] as const,
  savedForProject: (projectId: number) => ['saved-projects', 'project', projectId] as const,
  enquiries: ['enquiries'] as const,
  enquiriesPage: (page: number) => ['enquiries', 'page', page] as const,
  appointments: ['appointments'] as const,
  appointmentsPage: (page: number) => ['appointments', 'page', page] as const,
}

// --- Authentication (used by AuthContext) -------------------------------------------------

export const authApi = {
  login: async (email: string, password: string) => (await apiClient.post<TokenPair>('/auth/token/', { email, password })).data,
  register: async (input: RegisterInput) => (await apiClient.post<User>('/auth/register/', input)).data,
  me: async () => (await apiClient.get<User>('/auth/me/')).data,
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: Pick<User, 'first_name' | 'last_name'>) => (await apiClient.patch<User>('/auth/me/', input)).data,
    onSuccess: (user) => queryClient.setQueryData(accountKeys.me, user),
  })
}

// --- Saved projects ----------------------------------------------------------------------

export function useSavedProjects(page: number) {
  return useQuery({
    queryKey: accountKeys.savedPage(page),
    queryFn: async () => (await apiClient.get<Paginated<SavedProject>>('/saved-projects/', { params: { page } })).data,
    placeholderData: keepPreviousData,
  })
}

/** The saved record for one project, or null when the user has not saved it. */
export function useSavedRecord(projectId: number | undefined, enabled: boolean) {
  return useQuery({
    queryKey: accountKeys.savedForProject(projectId ?? 0),
    queryFn: async () => (await apiClient.get<Paginated<SavedProject>>('/saved-projects/', { params: { project: projectId } })).data.results[0] ?? null,
    enabled: enabled && projectId !== undefined,
  })
}

export function useSaveProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (projectId: number) => (await apiClient.post<SavedProject>('/saved-projects/', { project: projectId })).data,
    onSettled: () => queryClient.invalidateQueries({ queryKey: accountKeys.saved }),
  })
}

export function useRemoveSavedProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (savedId: number) => {
      await apiClient.delete(`/saved-projects/${savedId}/`)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: accountKeys.saved }),
  })
}

// --- Enquiries and appointments -----------------------------------------------------------

export function useMyEnquiries(page: number) {
  return useQuery({
    queryKey: accountKeys.enquiriesPage(page),
    queryFn: async () => (await apiClient.get<Paginated<Enquiry>>('/enquiries/', { params: { page } })).data,
    placeholderData: keepPreviousData,
  })
}

export function useMyAppointments(page: number) {
  return useQuery({
    queryKey: accountKeys.appointmentsPage(page),
    queryFn: async () => (await apiClient.get<Paginated<Appointment>>('/appointments/', { params: { page } })).data,
    placeholderData: keepPreviousData,
  })
}

export function useSubmitEnquiry() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: EnquiryInput) => (await apiClient.post<Enquiry>('/enquiries/', input)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: accountKeys.enquiries }),
  })
}

export function useSubmitAppointment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: AppointmentInput) => (await apiClient.post<Appointment>('/appointments/', input)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: accountKeys.appointments }),
  })
}
