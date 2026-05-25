import axios from 'axios'
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'

const TOKEN_KEY = 'salonos_token'
const USE_MOCK_AUTH = import.meta.env.VITE_USE_MOCK_AUTH === 'true'
const MOCK_TOKEN = 'mock-token-salonos'
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

const sleep = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms))

const buildMockSession = (email) => ({
  token: MOCK_TOKEN,
  user: {
    id: 1,
    name: 'Salon Owner',
    email: email || 'owner@salonos.test',
    role: 'owner',
    roles: ['owner'],
  },
  tenant: {
    id: 1,
    name: 'salonovapp',
    plan: { name: 'Free Trial', slug: 'free' },
  },
  permissions: [
    'appointments.view',
    'staff.view',
    'inventory.view',
    'customers.view',
    'billing.view',
    'analytics.view',
    'settings.view',
  ],
})

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

  const isOwner = useMemo(() => {
    const role = user?.role || user?.role_name
    const roles = user?.roles || []
    return role === 'owner' || roles.includes('owner')
  }, [user])

  const isManager = useMemo(() => {
    const role = user?.role || user?.role_name
    const roles = user?.roles || []
    return role === 'manager' || roles.includes('manager')
  }, [user])

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
    setShouldOnboard(false)
    setPermissions([])
    setIsAuthenticated(false)
  }, [])

  const markOnboardingCompleted = useCallback(() => {
    setShouldOnboard(false)
  }, [])

  const fetchMe = useCallback(async () => {
    setLoading(true)
    try {
      if (USE_MOCK_AUTH) {
        await sleep(200)
        const mock = buildMockSession(user?.email || 'owner@salonos.test')
        setUser(mock.user)
        setTenant(mock.tenant)
        setPermissions(mock.permissions)
        setIsAuthenticated(true)
        return mock
      }

      const response = await axios.get('/v1/me', {
        headers: authHeaders(),
        withCredentials: true,
      })

      const data = response.data || {}
      const payload = data.data || data
      setUser(payload.user || data.user || null)
      setTenant(payload.tenant || data.tenant || null)
      setPermissions(payload.permissions || data.permissions || [])
      setIsAuthenticated(Boolean(payload.user || data.user))
      return payload
    } catch (error) {
      const status = error?.response?.status
      if (status === 401 || status === 419) {
        setToken(null)
        localStorage.removeItem(TOKEN_KEY)
      }

      if (token) {
        const mock = buildMockSession(user?.email || 'owner@salonos.test')
        setUser(mock.user)
        setTenant(mock.tenant)
        setPermissions(mock.permissions)
        setIsAuthenticated(true)
        return mock
      }

      setUser(null)
      setTenant(null)
      setPermissions([])
      setIsAuthenticated(false)
      throw error
    } finally {
      setLoading(false)
    }
  }, [authHeaders, token, user?.email])

  const login = useCallback(async (email, password, deviceName = 'web') => {
    setLoading(true)
    try {
      if (USE_MOCK_AUTH) {
        await sleep()
        const mock = buildMockSession(email)
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
        email,
        password,
        device_name: deviceName,
      })

      const data = response.data || {}
      const nextToken = data.token || data.access_token || data?.data?.token || null
      setToken(nextToken)
      if (nextToken) localStorage.setItem(TOKEN_KEY, nextToken)
      else localStorage.removeItem(TOKEN_KEY)

      setUser(data.user || data?.data?.user || null)
      setTenant(data.tenant || data?.data?.tenant || null)
      setShouldOnboard(Boolean(data.should_onboard || data?.data?.should_onboard))
      setPermissions(data.permissions || data?.data?.permissions || [])

      if (!(data.user || data?.data?.user)) {
        await fetchMe()
      } else {
        setIsAuthenticated(true)
      }

      return response.data
    } catch (error) {
      if (USE_MOCK_AUTH) {
        await sleep()
        const mock = buildMockSession(email)
        setToken(mock.token)
        setUser(mock.user)
        setTenant(mock.tenant)
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
        await axios.post('/v1/logout', {}, { headers: authHeaders(), withCredentials: true })
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

  const can = useCallback((permission) => {
    if (!permission) return true
    if (isOwner) return true
    return permissions.includes(permission)
  }, [isOwner, permissions])

  const initialize = useCallback(async () => {
    if (initialized) return
    const savedToken = localStorage.getItem(TOKEN_KEY)
    if (savedToken) {
      setToken(savedToken)
      try {
        await fetchMe()
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
    shouldOnboard,
    permissions,
    isAuthenticated,
    loading,
    initialized,
    isOwner,
    isManager,
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
    user, token, tenant, shouldOnboard, permissions, isAuthenticated, loading, initialized,
    isOwner, isManager, isFree, planName,
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
