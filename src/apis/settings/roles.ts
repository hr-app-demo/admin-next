import { http } from '../http'
import type { AdminRole } from '../types'

export interface AdminRolePayload {
  name: string
  description?: string
  enabled: boolean
  permissions: string[]
}

export async function listAdminRoles() {
  const response = await http.get<AdminRole[]>('/v1/settings/roles')
  return response.data
}

export async function createAdminRole(payload: AdminRolePayload) {
  const response = await http.post<AdminRole>('/v1/settings/roles', payload)
  return response.data
}

export async function updateAdminRole(roleId: number, payload: Partial<AdminRolePayload>) {
  const response = await http.patch<AdminRole>(`/v1/settings/roles/${roleId}`, payload)
  return response.data
}

export async function deleteAdminRole(roleId: number) {
  const response = await http.delete<{ message: string }>(`/v1/settings/roles/${roleId}`)
  return response.data
}
