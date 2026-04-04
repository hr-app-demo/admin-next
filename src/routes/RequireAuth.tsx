import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { canAccessPath, getFallbackAuthorizedPath } from '../lib/route-access'
import { useAuth } from '../providers/AuthProvider'

export default function RequireAuth() {
  const location = useLocation()
  const { currentUser, isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (!canAccessPath(currentUser, location.pathname)) {
    return <Navigate to={getFallbackAuthorizedPath(currentUser)} replace state={{ from: location }} />
  }

  return <Outlet />
}
