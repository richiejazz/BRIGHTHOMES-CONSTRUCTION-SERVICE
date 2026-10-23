import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { apiClient } from './client'
import type { Appointment, AppointmentInput, Enquiry, EnquiryInput, Paginated, ProfileInput, RegisterInput, SavedProject, SavedProperty, TokenPair, User } from './types'

export const accountKeys = {
  me: ['me'] as const,
  saved: ['saved-projects'] as const,
  savedPage: (page: number) => ['saved-projects', 'page', page] as const,
  savedForProject: (projectId: number) => ['saved-projects', 'project', projectId] as const,
  enquiries: ['enquiries'] as const,
  enquiriesPage: (page: number) => ['enquiries', 'page', page] as const,
  appointments: ['appointments'] as const,
  appointmentsPage: (page: number) => ['appointments', 'page', page] as const,
  savedProperties: ['saved-properties'] as const,
  savedPropertiesPage: (page: number) => ['saved-properties', 'page', page] as const,
  savedForProperty: (propertyId: number) => ['saved-properties', 'property', propertyId] as const,
}

// --- Authentication (used by AuthContext) -------------------------------------------------

export const authApi = {
  login: async (email: string, password: string) => (await apiClient.post<TokenPair>('/auth/token/', { email, password })).data,
  register: async (input: RegisterInput) => (await apiClient.post<User>('/auth/register/', input)).data,
  me: async () => (await apiClient.get<User>('/auth/me/')).data,
  /** Always resolves the same way whether or not the account exists (spec §21). */
  requestPasswordReset: async (email: string) => (await apiClient.post<{ detail: string }>('/auth/password-reset/', { email })).data,
  confirmPasswordReset: async (input: { uid: string; token: string; password: string }) => (await apiClient.post<{ detail: string }>('/auth/password-reset/confirm/', input)).data,
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: ProfileInput) => (await apiClient.patch<User>('/auth/me/', input)).data,
    onSuccess: (user) => queryClient.setQueryData(accountKeys.me, user),
  })
}

/** Upload or replace the profile photo. The server validates, crops to a square and strips EXIF. */
export function useUploadAvatar() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (file: File) => {
      const body = new FormData()
      body.append('avatar', file)
      // A JSON content type would make Axios serialise the FormData; the browser adds the boundary.
      return (await apiClient.put<User>('/auth/me/avatar/', body, { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 60000 })).data
    },
    onSuccess: (user) => queryClient.setQueryData(accountKeys.me, user),
  })
}

export function useRemoveAvatar() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => (await apiClient.delete<User>('/auth/me/avatar/')).data,
    onSuccess: (user) => queryClient.setQueryData(accountKeys.me, user),
  })
}

// --- Saved projects ----------------------------------------------------------------------

export function useSavedProjects(page: number, enabled = true) {
  return useQuery({
    queryKey: accountKeys.savedPage(page),
    queryFn: async () => (await apiClient.get<Paginated<SavedProject>>('/saved-projects/', { params: { page } })).data,
    placeholderData: keepPreviousData,
    enabled,
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

// --- Saved properties ----------------------------------------------------------------------

export function useSavedProperties(page: number, enabled = true) {
  return useQuery({
    queryKey: accountKeys.savedPropertiesPage(page),
    queryFn: async () => (await apiClient.get<Paginated<SavedProperty>>('/saved-properties/', { params: { page } })).data,
    placeholderData: keepPreviousData,
    enabled,
  })
}

export function useSavedPropertyRecord(propertyId: number | undefined, enabled: boolean) {
  return useQuery({
    queryKey: accountKeys.savedForProperty(propertyId ?? 0),
    queryFn: async () => (await apiClient.get<Paginated<SavedProperty>>('/saved-properties/', { params: { property: propertyId } })).data.results[0] ?? null,
    enabled: enabled && propertyId !== undefined,
  })
}

export function useSaveProperty() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (propertyId: number) => (await apiClient.post<SavedProperty>('/saved-properties/', { property: propertyId })).data,
    onSettled: () => queryClient.invalidateQueries({ queryKey: accountKeys.savedProperties }),
  })
}

export function useRemoveSavedProperty() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (savedId: number) => {
      await apiClient.delete(`/saved-properties/${savedId}/`)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: accountKeys.savedProperties }),
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
