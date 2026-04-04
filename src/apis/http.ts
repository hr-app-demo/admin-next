import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import {
  buildAuthSession,
  clearAuthSession,
  readAuthSession,
  type AuthSession,
  writeAuthSession,
} from '../lib/auth-session'
import type { AdminTokenPayload } from './types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.trim() || 'http://127.0.0.1:8001/api'

type RetriableRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean }

let refreshPromise: Promise<AuthSession | null> | null = null
let unauthorizedHandler: (() => void) | null = null

export const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
})

export function configureUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler
}

export function getApiErrorMessage(error: unknown, fallback = '请求失败，请稍后重试') {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data
    if (typeof detail === 'string') return detail
    if (detail && typeof detail === 'object' && 'detail' in detail) {
      const message = (detail as { detail?: unknown }).detail
      if (typeof message === 'string') return message
    }
    if (error.message) return error.message
  }

  if (error instanceof Error && error.message) return error.message
  return fallback
}

export function isUnauthorizedError(error: unknown) {
  return axios.isAxiosError(error) && error.response?.status === 401
}

async function refreshAuthSession() {
  const current = readAuthSession()
  if (!current?.refreshToken) return null

  const response = await axios.post<AdminTokenPayload>(
    `${API_BASE_URL}/v1/auth/refresh`,
    { refresh_token: current.refreshToken },
    { timeout: 15000 },
  )

  const nextSession = buildAuthSession(response.data)
  writeAuthSession(nextSession)
  return nextSession
}

function handleUnauthorized() {
  clearAuthSession()
  unauthorizedHandler?.()
}

http.interceptors.request.use((config) => {
  config.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
  config.headers.set('Pragma', 'no-cache')
  config.headers.set('Expires', '0')
  const session = readAuthSession()
  if (session?.accessToken) {
    config.headers.set('Authorization', `Bearer ${session.accessToken}`)
  }
  return config
})

http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableRequestConfig | undefined
    const requestUrl = originalRequest?.url || ''
    const isAuthRequest =
      requestUrl.includes('/v1/auth/login') ||
      requestUrl.includes('/v1/auth/refresh')

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isAuthRequest) {
      originalRequest._retry = true

      try {
        if (!refreshPromise) {
          refreshPromise = refreshAuthSession().finally(() => {
            refreshPromise = null
          })
        }

        const nextSession = await refreshPromise
        if (!nextSession) {
          handleUnauthorized()
          return Promise.reject(error)
        }

        originalRequest.headers.set('Authorization', `Bearer ${nextSession.accessToken}`)
        return await http.request(originalRequest)
      } catch (refreshError) {
        handleUnauthorized()
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  },
)
