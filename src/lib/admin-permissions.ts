import type { AdminUserAuth } from '../apis/types'

export const ADMIN_PERMISSION_DASHBOARD = '工作台'
export const ADMIN_PERMISSION_JOBS = '岗位管理'
export const ADMIN_PERMISSION_CANDIDATES = '总人才库'
export const ADMIN_PERMISSION_MAIL = '邮件与模板'
export const ADMIN_PERMISSION_ACCOUNT_PAGE = '账户管理'
export const ADMIN_PERMISSION_ROLE_PAGE = '权限与角色'
export const ADMIN_PERMISSION_DICTIONARY_PAGE = '常量字典'
export const ADMIN_PERMISSION_FORM_PAGE = '报名表单策略'

export const ALL_ADMIN_PERMISSION_KEYS = [
  ADMIN_PERMISSION_DASHBOARD,
  ADMIN_PERMISSION_JOBS,
  ADMIN_PERMISSION_CANDIDATES,
  ADMIN_PERMISSION_MAIL,
  ADMIN_PERMISSION_ACCOUNT_PAGE,
  ADMIN_PERMISSION_ROLE_PAGE,
  ADMIN_PERMISSION_DICTIONARY_PAGE,
  ADMIN_PERMISSION_FORM_PAGE,
] as const

export function hasAdminPermission(user: AdminUserAuth | null | undefined, permission: string) {
  if (!user) return false
  if (user.is_superuser) return true
  return user.permissions.includes(permission)
}

export function hasAnyAdminPermission(user: AdminUserAuth | null | undefined, permissions: string[]) {
  if (!user) return false
  if (user.is_superuser) return true
  return permissions.some((permission) => user.permissions.includes(permission))
}
