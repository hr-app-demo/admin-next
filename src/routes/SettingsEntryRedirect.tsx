import { Navigate } from 'react-router-dom'
import { getFallbackAuthorizedPath, getFirstAccessibleSettingsPath } from '../lib/route-access'
import { useAuth } from '../providers/AuthProvider'

export default function SettingsEntryRedirect() {
  const { currentUser } = useAuth()
  const nextPath = getFirstAccessibleSettingsPath(currentUser) || getFallbackAuthorizedPath(currentUser)
  return <Navigate to={nextPath} replace />
}
