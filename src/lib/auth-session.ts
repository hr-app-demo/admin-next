import type { AdminTokenPayload, AdminUserAuth } from '../apis/types'

const AUTH_STORAGE_KEY = 'hr-admin-auth-session'

interface StoredAuthSession {
  accessToken: string
  refreshToken: string
  accessTokenExpiresIn: number
  refreshTokenExpiresIn: number
  tokenType: string
  issuedAt: number
}

export interface AuthSession {
  accessToken: string
  refreshToken: string
  accessTokenExpiresIn: number
  refreshTokenExpiresIn: number
  tokenType: string
  user: AdminUserAuth | null
  issuedAt: number
}

function hasWindow() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

export function buildAuthSession(payload: AdminTokenPayload): AuthSession {
  return {
    accessToken: payload.access_token,
    refreshToken: payload.refresh_token,
    accessTokenExpiresIn: payload.access_token_expires_in,
    refreshTokenExpiresIn: payload.refresh_token_expires_in,
    tokenType: payload.token_type,
    user: payload.user,
    issuedAt: Date.now(),
  }
}

function toStoredAuthSession(session: AuthSession): StoredAuthSession {
  return {
    accessToken: session.accessToken,
    refreshToken: session.refreshToken,
    accessTokenExpiresIn: session.accessTokenExpiresIn,
    refreshTokenExpiresIn: session.refreshTokenExpiresIn,
    tokenType: session.tokenType,
    issuedAt: session.issuedAt,
  }
}

export function readAuthSession(): AuthSession | null {
  if (!hasWindow()) return null

  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY)
  if (!raw) return null

  try {
    const stored = JSON.parse(raw) as StoredAuthSession
    return {
      ...stored,
      user: null,
    }
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY)
    return null
  }
}

export function writeAuthSession(session: AuthSession) {
  if (!hasWindow()) return
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(toStoredAuthSession(session)))
}

export function clearAuthSession() {
  if (!hasWindow()) return
  window.localStorage.removeItem(AUTH_STORAGE_KEY)
}
