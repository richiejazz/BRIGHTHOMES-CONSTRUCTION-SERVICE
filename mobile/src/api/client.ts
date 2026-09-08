import axios from 'axios'

export const apiClient = axios.create({ baseURL: process.env.EXPO_PUBLIC_API_BASE_URL })
