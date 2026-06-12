import React, { useEffect } from 'react'
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { useAuthStore } from '../stores/auth'
import AnalyticsView from '../views/AnalyticsView.jsx'
import AppointmentsView from '../views/AppointmentsView.jsx'
import BillingView from '../views/BillingView.jsx'
import CustomersView from '../views/CustomersView.jsx'
import DashboardView from '../views/DashboardView.jsx'
import InventoryView from '../views/InventoryView.jsx'
import SettingsView from '../views/SettingsView.jsx'
import RolesView from '../views/settings/RolesView.jsx'
import AssignPermissionsView from '../views/settings/AssignPermissionsView.jsx'
import StaffView from '../views/StaffView.jsx'
import CategoriesView from '../views/CategoriesView.jsx'
import ForgotPasswordView from '../views/auth/ForgotPasswordView.jsx'
import LoginView from '../views/auth/LoginView.jsx'
import RegisterView from '../views/auth/RegisterView.jsx'
import ResetPasswordView from '../views/auth/ResetPasswordView.jsx'
import TwoFactorView from '../views/auth/TwoFactorView.jsx'
import ComponentsTestView from '../views/ComponentsTestView.jsx'
import OnboardingComplete from '../views/onboarding/OnboardingComplete.jsx'
import OnboardingWizard from '../views/onboarding/OnboardingWizard.jsx'
import AdminOnboardingPage from '../views/admin/onboarding/AdminOnboardingPage.jsx'

const authLayoutPaths = new Set([
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-2fa',
  '/onboarding',
  '/onboarding/complete',
  '/admin/onboarding',
])

export function isAuthLayoutPath(pathname) {
  return authLayoutPaths.has(pathname)
}

function InitAuth() {
  const auth = useAuthStore()

  useEffect(() => {
    if (!auth.initialized) {
      void auth.initialize()
    }
  }, [auth.initialized, auth.initialize])

  return null
}

function GuestOnly({ children }) {
  const auth = useAuthStore()

  if (!auth.initialized) return null
  if (auth.isAuthenticated) return <Navigate to={auth.shouldOnboard ? '/onboarding' : '/dashboard'} replace />

  return children
}

function RequireAuth({ permission }) {
  const auth = useAuthStore()
  const location = useLocation()

  if (!auth.initialized) return null

  if (!auth.isAuthenticated) {
    const redirect = encodeURIComponent(`${location.pathname}${location.search}`)
    return <Navigate to={`/login?redirect=${redirect}`} replace />
  }

  if (auth.shouldOnboard && !location.pathname.startsWith('/onboarding') && !location.pathname.startsWith('/admin/onboarding')) {
    return <Navigate to="/onboarding" replace />
  }

  if (permission && !auth.can(permission)) {
    return <Navigate to="/403" replace />
  }

  return <Outlet />
}

function ForbiddenView() {
  return (
    <div className="p-8">
      <h1 className="mb-2 text-2xl font-semibold">403</h1>
      <p>You do not have permission to access this page.</p>
    </div>
  )
}

export function AppRoutes() {
  return (
    <>
      <InitAuth />
      <Routes>
        <Route path="/login" element={<GuestOnly><LoginView /></GuestOnly>} />
        <Route path="/register" element={<GuestOnly><RegisterView /></GuestOnly>} />
        <Route path="/forgot-password" element={<GuestOnly><ForgotPasswordView /></GuestOnly>} />
        <Route path="/reset-password" element={<GuestOnly><ResetPasswordView /></GuestOnly>} />
        <Route path="/verify-2fa" element={<GuestOnly><TwoFactorView /></GuestOnly>} />

        <Route element={<RequireAuth />}>
          <Route path="/onboarding" element={<OnboardingWizard />} />
          <Route path="/onboarding/complete" element={<OnboardingComplete />} />
          <Route path="/admin/onboarding" element={<AdminOnboardingPage />} />
          <Route path="/dashboard" element={<DashboardView />} />

          <Route element={<RequireAuth permission="staff.view" />}>
            <Route path="/staff" element={<StaffView />} />
          </Route>
          
          <Route element={<RequireAuth permission="inventory.view" />}>
            <Route path="/inventory" element={<InventoryView />} />
            <Route path="/categories" element={<CategoriesView />} />
          </Route>

          <Route element={<RequireAuth permission="customers.view" />}>
            <Route path="/customers" element={<CustomersView />} />
          </Route>

          <Route element={<RequireAuth permission="billing.view" />}>
            <Route path="/billing" element={<BillingView />} />
          </Route>

          <Route element={<RequireAuth permission="analytics.view" />}>
            <Route path="/analytics" element={<AnalyticsView />} />
          </Route>

          <Route element={<RequireAuth permission="settings.view" />}>
            <Route path="/settings" element={<SettingsView />} />
          </Route>

          <Route element={<RequireAuth permission="roles.read" />}>
            <Route path="/roles" element={<RolesView />} />
          </Route>

          <Route element={<RequireAuth permission="roles.assign_permissions" />}>
            <Route path="/assign-permissions" element={<AssignPermissionsView />} />
          </Route>

          <Route path="/ui-test" element={<ComponentsTestView />} />
        </Route>

        <Route element={<RequireAuth permission="appointments.view" />}>
          <Route path="/appointments" element={<AppointmentsView />} />
        </Route>

        <Route path="/403" element={<ForbiddenView />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  )
}
