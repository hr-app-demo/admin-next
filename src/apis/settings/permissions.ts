import { http } from '../http'
import type { PermissionCatalogGroup } from '../types'

export async function listPermissionCatalog() {
  const response = await http.get<PermissionCatalogGroup[]>('/v1/settings/permissions/catalog')
  return response.data
}
