import { buildAuthSession, type AuthSession } from '../lib/auth-session'
import { http } from './http'
import type { AdminTokenPayload, AdminUserAuth } from './types'

export interface AdminLoginPayload {
  username_or_email: string
  password: string
}

export async function loginAdmin(payload: AdminLoginPayload): Promise<AuthSession> {
  const response = await http.post<AdminTokenPayload>('/v1/auth/login', payload)
  return buildAuthSession(response.data)
}

export async function refreshAdmin(refreshToken: string): Promise<AuthSession> {
  const response = await http.post<AdminTokenPayload>('/v1/auth/refresh', {
    refresh_token: refreshToken,
  })
  return buildAuthSession(response.data)
}

export async function fetchCurrentAdmin(): Promise<AdminUserAuth> {
  const response = await http.get<AdminUserAuth>('/v1/auth/me')
  return response.data
}

export async function logoutAdmin(refreshToken: string) {
  const response = await http.post<{ message: string }>('/v1/auth/logout', {
    refresh_token: refreshToken,
  })
  return response.data
}

export async function changeAdminPassword(currentPassword: string, newPassword: string) {
  const response = await http.post<{ message: string }>('/v1/auth/change-password', {
    current_password: currentPassword,
    new_password: newPassword,
  })
  return response.data
}
