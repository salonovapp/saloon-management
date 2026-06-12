import axios from 'axios'
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'

const TOKEN_KEY = 'salonos_token'
const USE_MOCK_AUTH = import.meta.env.VITE_USE_MOCK_AUTH === 'true'
const MOCK_TOKEN = 'mock-token-salonos'
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

const sleep = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms))

const buildMockSession = (identifier) => {
  const isSysAdmin = identifier === 'admin@salonos.com'
  return {
    token: MOCK_TOKEN,
    is_system_admin: isSysAdmin,
    user: {
      id: 1,
      name: isSysAdmin ? 'System Admin' : 'Salon Owner',
      email: String(identifier || '').includes('@') ? identifier : 'owner@salonos.test',
      phone: String(identifier || '').includes('@') ? null : (identifier || null),
      is_system_admin: isSysAdmin,
      role_id: isSysAdmin ? null : 1,
      saloon_id: isSysAdmin ? null : 1,
    },
    tenant: isSysAdmin ? null : {
      id: 1,
      name: 'salonovapp',
      plan: { name: 'Free Trial', slug: 'free' },
    },
    role: isSysAdmin ? null : {
      id: 1,
      name: 'Owner',
      is_active: true,
      saloon_id: 1,
      permissions: [ { code: 'appointments.view' } ]
    },
    permissions: isSysAdmin ? [
      'appointments.view',
      'staff.view',
      'inventory.view',
      'customers.view',
      'billing.view',
      'analytics.view',
      'settings.view',
      'roles.read',
      'roles.create',
      'roles.update',
      'roles.delete',
      'roles.assign_permissions'
    ] : [
      'appointments.view',
      'staff.view',
      'inventory.view',
      'customers.view',
      'billing.view',
      'analytics.view',
      'settings.view',
      'roles.read',
      'roles.create',
      'roles.update',
      'roles.delete',
      'roles.assign_permissions'
    ],
  }
}

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [tenant, setTenant] = useState(null)
  const [shouldOnboard, setShouldOnboard] = useState(false)
  const [permissions, setPermissions] = useState([])
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const [role, setRole] = useState(null)
  const [isSystemAdmin, setIsSystemAdmin] = useState(false)

  const planName = useMemo(() => (
    tenant?.plan?.name || tenant?.plan_name || tenant?.subscription_plan || null
  ), [tenant])

  const isFree = useMemo(() => {
    const plan = tenant?.plan?.slug || tenant?.plan?.name || tenant?.plan_name || tenant?.subscription_plan
    return String(plan || '').toLowerCase() === 'free'
  }, [tenant])

  const authHeaders = useCallback(() => (token ? { Authorization: `Bearer ${token}` } : {}), [token])

  const clearAuthState = useCallback(() => {
    setUser(null)
    setToken(null)
    setTenant(null)
    setRole(null)
    setIsSystemAdmin(false)
    setShouldOnboard(false)
    setPermissions([])
    setIsAuthenticated(false)
  }, [])

  const markOnboardingCompleted = useCallback(() => {
    setShouldOnboard(false)
  }, [])

  const fetchMe = useCallback(async (overrideToken = null) => {
    setLoading(true)
    try {
      if (USE_MOCK_AUTH) {
        await sleep(200)
        const mock = buildMockSession(user?.email || user?.phone || 'owner@salonos.test')
        setUser(mock.user)
        setTenant(mock.tenant)
        setPermissions(mock.permissions)
        setIsAuthenticated(true)
        return mock
      }

      const activeToken = overrideToken || token
      const currentHeaders = activeToken ? { Authorization: `Bearer ${activeToken}` } : {}

      const response = await axios.get(`${API_BASE_URL}/v1/me`, {
        headers: {
          ...currentHeaders,
          'Accept': 'application/json',
        },
      })

      const data = response.data || {}
      const payload = data.data || data
      setUser(payload.user || null)
      setTenant(payload.tenant || null)
      setRole(payload.role || null)
      setIsSystemAdmin(Boolean(payload.is_system_admin))
      setPermissions(payload.permissions || [])
      setIsAuthenticated(Boolean(payload.user))
      return payload
    } catch (error) {
      const status = error?.response?.status
      if (status === 401 || status === 419) {
        setToken(null)
        localStorage.removeItem(TOKEN_KEY)
      }

      if (token) {
        const mock = buildMockSession(user?.email || user?.phone || 'owner@salonos.test')
        setUser(mock.user)
        setTenant(mock.tenant)
        setPermissions(mock.permissions)
        setIsAuthenticated(true)
        return mock
      }

      setUser(null)
      setTenant(null)
      setRole(null)
      setIsSystemAdmin(false)
      setPermissions([])
      setIsAuthenticated(false)
      throw error
    } finally {
      setLoading(false)
    }
  }, [authHeaders, token, user?.email, user?.phone])

  const login = useCallback(async (login, password, deviceName = 'web') => {
    setLoading(true)
    try {
      if (USE_MOCK_AUTH) {
        await sleep()
        const mock = buildMockSession(login)
        setToken(mock.token)
        setUser(mock.user)
        setTenant(mock.tenant)
        setPermissions(mock.permissions)
        setIsAuthenticated(true)
        localStorage.setItem(TOKEN_KEY, mock.token)
        return {
          ...mock,
          mock: true,
          next_step: password === '222222' ? '2fa' : null,
        }
      }

      const response = await axios.post(`${API_BASE_URL}/v1/public/login`, {
        login,
        password,
        device_name: deviceName,
      })

      const data = response.data || {}
      const nextToken = data.token || data.access_token || data?.data?.token || null
      setToken(nextToken)
      if (nextToken) localStorage.setItem(TOKEN_KEY, nextToken)
      else localStorage.removeItem(TOKEN_KEY)

      const payload = data.data || data
      setUser(payload.user || null)
      setTenant(payload.tenant || null)
      setRole(payload.role || null)
      setIsSystemAdmin(Boolean(payload.is_system_admin))
      setShouldOnboard(Boolean(payload.should_onboard))
      setPermissions(payload.permissions || [])

      if (!(data.user || data?.data?.user)) {
        await fetchMe(nextToken)
      } else {
        setIsAuthenticated(true)
      }

      return response.data
    } catch (error) {
      if (USE_MOCK_AUTH) {
        await sleep()
        const mock = buildMockSession(login)
        setToken(mock.token)
        setUser(mock.user)
        setTenant(mock.tenant)
        setRole(mock.role)
        setIsSystemAdmin(mock.is_system_admin)
        setPermissions(mock.permissions)
        setIsAuthenticated(true)
        localStorage.setItem(TOKEN_KEY, mock.token)
        return { ...mock, mock: true }
      }
      throw error
    } finally {
      setLoading(false)
    }
  }, [fetchMe])

  const logout = useCallback(async () => {
    setLoading(true)
    try {
      if (!USE_MOCK_AUTH) {
        await axios.post(`${API_BASE_URL}/v1/logout`, {}, {
          headers: { ...authHeaders(), 'Accept': 'application/json' },
        })
      } else {
        await sleep(150)
      }
    } catch {
      // ignore
    } finally {
      clearAuthState()
      localStorage.removeItem(TOKEN_KEY)
      setLoading(false)
    }
  }, [authHeaders, clearAuthState])

  const can = useCallback((code) => {
    if (!code) return true
    if (isSystemAdmin) return true
    return permissions.includes(code)
  }, [isSystemAdmin, permissions])

  const initialize = useCallback(async () => {
    if (initialized) return
    const savedToken = localStorage.getItem(TOKEN_KEY)
    if (savedToken) {
      setToken(savedToken)
      try {
        await fetchMe(savedToken)
      } catch {
        // handled
      }
    } else {
      setIsAuthenticated(false)
    }
    setInitialized(true)
  }, [fetchMe, initialized])

  const value = useMemo(() => ({
    user,
    token,
    tenant,
    role,
    isSystemAdmin,
    shouldOnboard,
    permissions,
    isAuthenticated,
    loading,
    initialized,
    isFree,
    planName,
    authHeaders,
    clearAuthState,
    markOnboardingCompleted,
    login,
    logout,
    fetchMe,
    can,
    initialize,
  }), [
    user, token, tenant, role, isSystemAdmin, shouldOnboard, permissions, isAuthenticated, loading, initialized,
    isFree, planName,
    authHeaders, clearAuthState, markOnboardingCompleted, login, logout, fetchMe, can, initialize,
  ])

  return React.createElement(AuthContext.Provider, { value }, children)
}

export function useAuthStore() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuthStore must be used within AuthProvider')
  }
  return ctx
}
