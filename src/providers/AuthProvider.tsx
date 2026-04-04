import { Spin } from '@arco-design/web-react'
import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react'
import { fetchCurrentAdmin, loginAdmin, logoutAdmin } from '../apis/auth'
import { configureUnauthorizedHandler, getApiErrorMessage, isUnauthorizedError } from '../apis/http'
import {
  clearAuthSession,
  readAuthSession,
  writeAuthSession,
  type AuthSession,
} from '../lib/auth-session'
import type { AdminUserAuth } from '../apis/types'

interface AuthContextValue {
  bootstrapping: boolean
  isAuthenticated: boolean
  session: AuthSession | null
  currentUser: AdminUserAuth | null
  login: (usernameOrEmail: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshCurrentUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function FullscreenLoading() {
  return (
    <div className="next-auth-loading">
      <Spin size={36} tip="正在恢复登录状态..." />
    </div>
  )
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<AuthSession | null>(() => readAuthSession())
  const [bootstrapping, setBootstrapping] = useState(true)

  useEffect(() => {
    configureUnauthorizedHandler(() => {
      clearAuthSession()
      setSession(null)
      window.location.replace('/login')
    })

    return () => {
      configureUnauthorizedHandler(null)
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      const current = readAuthSession()
      if (!current) {
        if (!cancelled) setBootstrapping(false)
        return
      }

      setSession(current)

      try {
        const user = await fetchCurrentAdmin()
        if (cancelled) return

        const next = {
          ...current,
          user,
        }
        writeAuthSession(next)
        setSession(next)
      } catch (error) {
        if (cancelled) return
        if (isUnauthorizedError(error)) {
          clearAuthSession()
          setSession(null)
          return
        }
      } finally {
        if (!cancelled) setBootstrapping(false)
      }
    }

    void bootstrap()

    return () => {
      cancelled = true
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      bootstrapping,
      isAuthenticated: Boolean(session?.accessToken),
      session,
      currentUser: session?.user || null,
      login: async (usernameOrEmail, password) => {
        const nextSession = await loginAdmin({
          username_or_email: usernameOrEmail,
          password,
        })
        writeAuthSession(nextSession)
        setSession(nextSession)
      },
      logout: async () => {
        const current = readAuthSession()
        try {
          if (current?.refreshToken) {
            await logoutAdmin(current.refreshToken)
          }
        } catch {
          // Ignore logout API errors and clear local session anyway.
        } finally {
          clearAuthSession()
          setSession(null)
        }
      },
      refreshCurrentUser: async () => {
        try {
          const user = await fetchCurrentAdmin()
          const current = readAuthSession()
          if (!current) {
            clearAuthSession()
            setSession(null)
            throw new Error('当前登录态不存在')
          }
          const next = {
            ...current,
            user,
          }
          writeAuthSession(next)
          setSession(next)
        } catch (error) {
          if (isUnauthorizedError(error)) {
            clearAuthSession()
            setSession(null)
          }
          throw new Error(getApiErrorMessage(error, '刷新当前登录信息失败'))
        }
      },
    }),
    [bootstrapping, session],
  )

  if (bootstrapping) {
    return <FullscreenLoading />
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
