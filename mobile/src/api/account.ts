import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { apiClient } from './client'
import { fetchAll, nextPageParam } from './content'
import type { Appointment, AppointmentInput, Enquiry, EnquiryInput, Paginated, ProfileInput, RegisterInput, SavedProject, SavedProperty, TokenPair, User } from './types'

export const accountKeys = {
  me: ['me'] as const,
  allSaved: ['saved'] as const,
  saved: (kind: SavedKind) => ['saved', kind] as const,
  savedList: (kind: SavedKind) => ['saved', kind, 'list'] as const,
  savedIndex: (kind: SavedKind) => ['saved', kind, 'index'] as const,
  enquiries: ['enquiries'] as const,
  enquiryList: ['enquiries', 'list'] as const,
  enquiry: (id: number) => ['enquiries', 'detail', id] as const,
  appointments: ['appointments'] as const,
  appointmentList: ['appointments', 'list'] as const,
  appointment: (id: number) => ['appointments', 'detail', id] as const,
}

/** Every query that holds the signed-in user's own data, dropped on sign-out. */
export const privateKeys = [accountKeys.me, accountKeys.allSaved, accountKeys.enquiries, accountKeys.appointments]

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

/** A prepared image ready to upload: a native file URI, or a Blob in the web preview. */
export type UploadableImage = { uri: string; name: string; type: string; blob?: Blob }

/** Upload or replace the profile photo. The server crops it to a 512px square JPEG. */
export function useUploadAvatar() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (image: UploadableImage) => {
      const form = new FormData()
      // React Native's FormData accepts a { uri, name, type } descriptor for local files.
      if (image.blob) form.append('avatar', image.blob, image.name)
      else form.append('avatar', { uri: image.uri, name: image.name, type: image.type } as unknown as Blob)
      // The client defaults to JSON, which would make Axios serialise the form; send it as multipart.
      return (await apiClient.put<User>('/auth/me/avatar/', form, { headers: { 'Content-Type': 'multipart/form-data' } })).data
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

// --- Saved projects and properties --------------------------------------------------------

export type SavedKind = 'projects' | 'properties'

const savedEndpoints: Record<SavedKind, { url: string; field: 'project' | 'property' }> = {
  projects: { url: '/saved-projects/', field: 'project' },
  properties: { url: '/saved-properties/', field: 'property' },
}

type SavedRecord<K extends SavedKind> = K extends 'projects' ? SavedProject : SavedProperty

export function useSavedList<K extends SavedKind>(kind: K, enabled: boolean) {
  return useInfiniteQuery({
    queryKey: accountKeys.savedList(kind),
    queryFn: async ({ pageParam }) => (await apiClient.get<Paginated<SavedRecord<K>>>(savedEndpoints[kind].url, { params: { page: pageParam } })).data,
    initialPageParam: 1,
    getNextPageParam: nextPageParam,
    enabled,
  })
}

/** Saved item id (project or property) → saved record id, for everything the user has saved. */
export type SavedIndex = Record<number, number>

export function useSavedIndex(kind: SavedKind, enabled: boolean) {
  const { url, field } = savedEndpoints[kind]
  return useQuery({
    queryKey: accountKeys.savedIndex(kind),
    queryFn: async () => Object.fromEntries((await fetchAll<Record<string, number>>(url)).map((saved) => [saved[field], saved.id])) as SavedIndex,
    enabled,
  })
}

/** Save or unsave a project or property, updating the saved index optimistically. */
export function useToggleSaved(kind: SavedKind) {
  const queryClient = useQueryClient()
  const { url, field } = savedEndpoints[kind]
  const indexKey = accountKeys.savedIndex(kind)
  return useMutation({
    mutationFn: async ({ itemId, savedId }: { itemId: number; savedId?: number }) => {
      if (savedId) {
        await apiClient.delete(`${url}${savedId}/`)
        return { itemId, savedId: undefined }
      }
      const { data } = await apiClient.post<{ id: number }>(url, { [field]: itemId })
      return { itemId, savedId: data.id }
    },
    onMutate: async ({ itemId, savedId }) => {
      await queryClient.cancelQueries({ queryKey: indexKey })
      const previous = queryClient.getQueryData<SavedIndex>(indexKey)
      queryClient.setQueryData<SavedIndex>(indexKey, (index = {}) => {
        const next = { ...index }
        // -1 marks an optimistic save until the server returns the record id.
        if (savedId) delete next[itemId]
        else next[itemId] = -1
        return next
      })
      return { previous }
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(indexKey, context.previous)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: accountKeys.saved(kind) }),
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
