import { http } from '../http'
import type { AdminUser } from '../types'

export interface AdminAccountCreatePayload {
  name: string
  username?: string
  email: string
  phone?: string
  note?: string
  status: 'enabled' | 'disabled'
  role_id?: number
  password?: string
}

export interface AdminAccountUpdatePayload {
  name?: string
  username?: string
  email?: string
  phone?: string
  note?: string
  status?: 'enabled' | 'disabled'
  role_id?: number | null
  password?: string
}

export interface AdminAccountCreateResponse extends AdminUser {
  temporary_password: string | null
}

export async function listAdminAccounts(keyword?: string) {
  const response = await http.get<AdminUser[]>('/v1/settings/accounts', {
    params: keyword?.trim() ? { keyword: keyword.trim() } : undefined,
  })
  return response.data
}

export async function createAdminAccount(payload: AdminAccountCreatePayload) {
  const response = await http.post<AdminAccountCreateResponse>('/v1/settings/accounts', payload)
  return response.data
}

export async function updateAdminAccount(accountId: number, payload: AdminAccountUpdatePayload) {
  const response = await http.patch<AdminUser>(`/v1/settings/accounts/${accountId}`, payload)
  return response.data
}

export async function deleteAdminAccount(accountId: number) {
  const response = await http.delete<{ message: string }>(`/v1/settings/accounts/${accountId}`)
  return response.data
}
