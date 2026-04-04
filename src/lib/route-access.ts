import type { AdminUserAuth } from '../apis/types'
import {
  ADMIN_PERMISSION_DASHBOARD,
  ADMIN_PERMISSION_CANDIDATES,
  ADMIN_PERMISSION_JOBS,
  ADMIN_PERMISSION_MAIL,
  ADMIN_PERMISSION_ACCOUNT_PAGE,
  ADMIN_PERMISSION_DICTIONARY_PAGE,
  ADMIN_PERMISSION_FORM_PAGE,
  ADMIN_PERMISSION_ROLE_PAGE,
  hasAdminPermission,
} from './admin-permissions'

export interface SettingsRouteItem {
  key: string
  label: string
  permission: string
}

export interface RoutePermissionRule {
  key: string
  label: string
  permissions: readonly string[]
}

export const SETTINGS_ROUTE_ITEMS: SettingsRouteItem[] = [
  { key: '/settings/account', label: '账户管理', permission: ADMIN_PERMISSION_ACCOUNT_PAGE },
  { key: '/settings/permission', label: '权限与角色', permission: ADMIN_PERMISSION_ROLE_PAGE },
  { key: '/settings/dictionaries', label: '常量字典', permission: ADMIN_PERMISSION_DICTIONARY_PAGE },
  { key: '/settings/form', label: '报名表单策略', permission: ADMIN_PERMISSION_FORM_PAGE },
]

export const TOP_LEVEL_ROUTE_ITEMS: RoutePermissionRule[] = [
  { key: '/dashboard', label: '工作台', permissions: [ADMIN_PERMISSION_DASHBOARD] },
  {
    key: '/jobs',
    label: '岗位管理',
    permissions: [ADMIN_PERMISSION_JOBS],
  },
  {
    key: '/candidates',
    label: '总人才库',
    permissions: [ADMIN_PERMISSION_CANDIDATES],
  },
]

export const MAIL_ROUTE_ITEMS: RoutePermissionRule[] = [
  {
    key: '/mail/templates',
    label: '邮件模板',
    permissions: [ADMIN_PERMISSION_MAIL],
  },
  {
    key: '/mail/signatures',
    label: '邮件签名模板',
    permissions: [ADMIN_PERMISSION_MAIL],
  },
  {
    key: '/mail/accounts',
    label: '邮箱账号管理',
    permissions: [ADMIN_PERMISSION_MAIL],
  },
]

const EXTRA_ROUTE_RULES: RoutePermissionRule[] = [
  {
    key: '/jobs/create',
    label: '创建岗位',
    permissions: [ADMIN_PERMISSION_JOBS],
  },
  {
    key: '/jobs/:jobId',
    label: '岗位详情',
    permissions: [ADMIN_PERMISSION_JOBS],
  },
  {
    key: '/jobs/:jobId/progress',
    label: '招聘进展',
    permissions: [ADMIN_PERMISSION_JOBS],
  },
  {
    key: '/candidates/:candidateId',
    label: '候选人详情',
    permissions: [ADMIN_PERMISSION_CANDIDATES],
  },
]

const ALL_ROUTE_RULES: RoutePermissionRule[] = [
  ...TOP_LEVEL_ROUTE_ITEMS,
  ...MAIL_ROUTE_ITEMS,
  ...SETTINGS_ROUTE_ITEMS.map((item) => ({
    key: item.key,
    label: item.label,
    permissions: [item.permission],
  })),
  ...EXTRA_ROUTE_RULES,
]

function normalizePathname(pathname: string) {
  if (!pathname) return '/'
  return pathname.replace(/\/+$/, '') || '/'
}

function matchPath(pathname: string, routePath: string) {
  const current = normalizePathname(pathname)
  const target = normalizePathname(routePath)
  if (target.includes('/:')) {
    const targetSegments = target.split('/')
    const currentSegments = current.split('/')
    if (targetSegments.length !== currentSegments.length) return false
    return targetSegments.every((segment, index) => segment.startsWith(':') || segment === currentSegments[index])
  }
  return current === target || current.startsWith(`${target}/`)
}

function hasAnyRoutePermission(user: AdminUserAuth | null | undefined, permissions: readonly string[]) {
  return permissions.some((permission) => hasAdminPermission(user, permission))
}

export function getVisibleTopLevelItems(user: AdminUserAuth | null | undefined) {
  return TOP_LEVEL_ROUTE_ITEMS.filter((item) => hasAnyRoutePermission(user, item.permissions))
}

export function getVisibleMailItems(user: AdminUserAuth | null | undefined) {
  return MAIL_ROUTE_ITEMS.filter((item) => hasAnyRoutePermission(user, item.permissions))
}

export function getVisibleSettingsItems(user: AdminUserAuth | null | undefined) {
  return SETTINGS_ROUTE_ITEMS.filter((item) => hasAdminPermission(user, item.permission))
}

export function canAccessPath(user: AdminUserAuth | null | undefined, pathname: string) {
  const normalized = normalizePathname(pathname)
  if (normalized === '/login') return true
  if (normalized === '/no-access') return true

  if (normalized === '/settings') {
    return getVisibleSettingsItems(user).length > 0
  }

  const matchedRoute = ALL_ROUTE_RULES.find((item) => matchPath(normalized, item.key))
  if (!matchedRoute) return true

  return hasAnyRoutePermission(user, matchedRoute.permissions)
}

export function getFirstAccessibleSettingsPath(user: AdminUserAuth | null | undefined) {
  return getVisibleSettingsItems(user)[0]?.key || null
}

export function getFirstAccessiblePath(user: AdminUserAuth | null | undefined) {
  return ALL_ROUTE_RULES.find((item) => hasAnyRoutePermission(user, item.permissions))?.key || null
}

export function getFallbackAuthorizedPath(user: AdminUserAuth | null | undefined) {
  return getFirstAccessiblePath(user) || '/no-access'
}
