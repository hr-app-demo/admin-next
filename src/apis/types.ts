export interface PermissionCatalogGroup {
  group: string
  items: string[]
}

export interface AdminRole {
  id: number
  name: string
  description: string | null
  enabled: boolean
  permissions: string[]
  created_at: string
  updated_at: string | null
  data: Record<string, unknown>
}

export interface AdminUser {
  id: number
  name: string
  username: string
  email: string
  phone: string | null
  note: string | null
  status: 'enabled' | 'disabled'
  profile_image_url: string
  role_id: number | null
  role_name: string | null
  is_superuser: boolean
  last_login_at: string | null
  created_at: string
  updated_at: string | null
}

export interface AdminUserAuth extends AdminUser {
  permissions: string[]
}

export interface AdminTokenPayload {
  access_token: string
  refresh_token: string
  token_type: string
  access_token_expires_in: number
  refresh_token_expires_in: number
  user: AdminUserAuth
}
