import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { Config } from '../../../constants'
import { tokenStorage } from '../storage/tokenStorage'

export const apiClient = axios.create({
  baseURL: Config.API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// Inyecta el token en cada request
apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await tokenStorage.getAccessToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Refresca el token si expira (401)
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true

      const refreshToken = await tokenStorage.getRefreshToken()
      if (!refreshToken) return Promise.reject(error)

      try {
        const { data } = await axios.post(`${Config.API_URL}/auth/refresh`, { refresh_token: refreshToken })
        await tokenStorage.saveTokens(data.access_token, data.refresh_token ?? refreshToken)
        original.headers.Authorization = `Bearer ${data.access_token}`
        return apiClient(original)
      } catch {
        await tokenStorage.clearTokens()
        return Promise.reject(error)
      }
    }

    return Promise.reject(error)
  }
)
