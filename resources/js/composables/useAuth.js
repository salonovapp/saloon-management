import { useMemo } from 'react'
import { useAuthStore } from '../stores/auth'

export function useAuth() {
  const auth = useAuthStore()

  return useMemo(
    () => ({
      user: auth.user,
      tenant: auth.tenant,
      isAuthenticated: auth.isAuthenticated,
      can: auth.can,
      isOwner: auth.isOwner,
      isManager: auth.isManager,
    }),
    [auth]
  )
}
