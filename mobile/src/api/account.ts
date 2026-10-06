import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { apiClient } from './client'
import { fetchAll, nextPageParam } from './content'
import type { Appointment, AppointmentInput, Enquiry, EnquiryInput, Paginated, ProfileInput, RegisterInput, SavedProject, TokenPair, User } from './types'

export const accountKeys = {
  me: ['me'] as const,
  saved: ['saved-projects'] as const,
  savedList: ['saved-projects', 'list'] as const,
  savedIndex: ['saved-projects', 'index'] as const,
  enquiries: ['enquiries'] as const,
  enquiryList: ['enquiries', 'list'] as const,
  enquiry: (id: number) => ['enquiries', 'detail', id] as const,
  appointments: ['appointments'] as const,
  appointmentList: ['appointments', 'list'] as const,
  appointment: (id: number) => ['appointments', 'detail', id] as const,
}

/** Every query that holds the signed-in user's own data, dropped on sign-out. */
export const privateKeys = [accountKeys.me, accountKeys.saved, accountKeys.enquiries, accountKeys.appointments]

// --- Authentication (used by AuthProvider) ------------------------------------------------

export const authApi = {
  login: async (email: string, password: string) => (await apiClient.post<TokenPair>('/auth/token/', { email, password })).data,
  register: async (input: RegisterInput) => (await apiClient.post<User>('/auth/register/', input)).data,
  me: async () => (await apiClient.get<User>('/auth/me/')).data,
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: ProfileInput) => (await apiClient.patch<User>('/auth/me/', input)).data,
    onSuccess: (user) => queryClient.setQueryData(accountKeys.me, user),
  })
}

// --- Saved projects ----------------------------------------------------------------------

export function useSavedProjects(enabled: boolean) {
  return useInfiniteQuery({
    queryKey: accountKeys.savedList,
    queryFn: async ({ pageParam }) => (await apiClient.get<Paginated<SavedProject>>('/saved-projects/', { params: { page: pageParam } })).data,
    initialPageParam: 1,
    getNextPageParam: nextPageParam,
    enabled,
  })
}

/** project id → saved record id, for every project the user has saved. */
export type SavedIndex = Record<number, number>

export function useSavedIndex(enabled: boolean) {
  return useQuery({
    queryKey: accountKeys.savedIndex,
    queryFn: async () => Object.fromEntries((await fetchAll<SavedProject>('/saved-projects/')).map((saved) => [saved.project, saved.id])) as SavedIndex,
    enabled,
  })
}

/** Save or unsave a project, updating the saved index optimistically. */
export function useToggleSavedProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ projectId, savedId }: { projectId: number; savedId?: number }) => {
      if (savedId) {
        await apiClient.delete(`/saved-projects/${savedId}/`)
        return { projectId, savedId: undefined }
      }
      const { data } = await apiClient.post<SavedProject>('/saved-projects/', { project: projectId })
      return { projectId, savedId: data.id }
    },
    onMutate: async ({ projectId, savedId }) => {
      await queryClient.cancelQueries({ queryKey: accountKeys.savedIndex })
      const previous = queryClient.getQueryData<SavedIndex>(accountKeys.savedIndex)
      queryClient.setQueryData<SavedIndex>(accountKeys.savedIndex, (index = {}) => {
        const next = { ...index }
        // -1 marks an optimistic save until the server returns the record id.
        if (savedId) delete next[projectId]
        else next[projectId] = -1
        return next
      })
      return { previous }
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(accountKeys.savedIndex, context.previous)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: accountKeys.saved }),
  })
}

// --- Enquiries and appointments -----------------------------------------------------------

export function useMyEnquiries(enabled: boolean) {
  return useInfiniteQuery({
    queryKey: accountKeys.enquiryList,
    queryFn: async ({ pageParam }) => (await apiClient.get<Paginated<Enquiry>>('/enquiries/', { params: { page: pageParam } })).data,
    initialPageParam: 1,
    getNextPageParam: nextPageParam,
    enabled,
  })
}

export function useEnquiry(id: number, enabled: boolean) {
  return useQuery({
    queryKey: accountKeys.enquiry(id),
    queryFn: async () => (await apiClient.get<Enquiry>(`/enquiries/${id}/`)).data,
    enabled: enabled && Number.isInteger(id),
  })
}

export function useMyAppointments(enabled: boolean) {
  return useInfiniteQuery({
    queryKey: accountKeys.appointmentList,
    queryFn: async ({ pageParam }) => (await apiClient.get<Paginated<Appointment>>('/appointments/', { params: { page: pageParam } })).data,
    initialPageParam: 1,
    getNextPageParam: nextPageParam,
    enabled,
  })
}

export function useAppointment(id: number, enabled: boolean) {
  return useQuery({
    queryKey: accountKeys.appointment(id),
    queryFn: async () => (await apiClient.get<Appointment>(`/appointments/${id}/`)).data,
    enabled: enabled && Number.isInteger(id),
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
