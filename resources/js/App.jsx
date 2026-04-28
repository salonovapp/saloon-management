import React from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { AppRoutes, isAuthLayoutPath } from './router/index.jsx'
import { useAuthStore } from './stores/auth'

export default function App() {
  const location = useLocation()
  const navigate = useNavigate()
  const auth = useAuthStore()
  const isAuthLayout = isAuthLayoutPath(location.pathname)

  const handleLogout = async () => {
    await auth.logout()
    navigate('/login')
  }

  return (
    <div className="app-shell">
      {!isAuthLayout ? (
        <header className="shell-nav">
          <div className="shell-wrap">
            <div>
              <p className="brand-title">salonovapp</p>
              <p className="text-xs text-white/55">Multi-tenant salon operating system</p>
            </div>

            <nav className="flex flex-wrap items-center gap-2">
              {!auth.isAuthenticated ? (
                <NavLink
                  className={({ isActive }) => (isActive ? 'nav-link router-link-active' : 'nav-link')}
                  to="/login"
                >
                  Login
                </NavLink>
              ) : null}

              <NavLink
                className={({ isActive }) => (isActive ? 'nav-link router-link-active' : 'nav-link')}
                to="/dashboard"
              >
                Dashboard
              </NavLink>

              <NavLink
                className={({ isActive }) => (isActive ? 'nav-link router-link-active' : 'nav-link')}
                to="/appointments"
              >
                Appointments
              </NavLink>

              <NavLink
                className={({ isActive }) => (isActive ? 'nav-link router-link-active' : 'nav-link')}
                to="/customers"
              >
                Customers
              </NavLink>

              <NavLink
                className={({ isActive }) => (isActive ? 'nav-link router-link-active' : 'nav-link')}
                to="/settings"
              >
                Settings
              </NavLink>

              {auth.isAuthenticated ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="nav-link"
                >
                  Logout
                </button>
              ) : null}
            </nav>
          </div>
        </header>
      ) : null}

      <main className={isAuthLayout ? '' : 'page-wrap'}>
        <AppRoutes />
      </main>
    </div>
  )
}
