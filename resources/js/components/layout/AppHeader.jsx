import React, { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/auth'

function Icon({ paths, className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      {paths.map((d, i) => (
        <path key={i} d={d} strokeLinecap="round" strokeLinejoin="round" />
      ))}
    </svg>
  )
}

export default function AppHeader({ onToggleSidebar }) {
  const location = useLocation()
  const router = useNavigate()
  const auth = useAuthStore()

  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [notificationCount] = useState(3)

  const breadcrumb = useMemo(() => {
    const map = {
      dashboard: 'Dashboard',
      appointments: 'Appointments',
      staff: 'Staff',
      inventory: 'Inventory',
      customers: 'Customers',
      billing: 'Billing',
      analytics: 'Analytics',
      settings: 'Settings',
    }
    const key = location.pathname.split('/')[1]
    return map[key] || 'SalonOS'
  }, [location.pathname])

  const avatarInitials = useMemo(() => {
    const name = auth.user?.name || 'Salon User'
    return name.split(' ').map((part) => part.charAt(0)).join('').slice(0, 2).toUpperCase()
  }, [auth.user?.name])

  const trialDaysLeft = 5
  const showTrialBanner = auth.isFree && trialDaysLeft < 7

  useEffect(() => {
    const handleKeydown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setSearchOpen(true)
      }
      if (event.key === 'Escape') {
        setSearchOpen(false)
        setMenuOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [])

  const handleLogout = async () => {
    await auth.logout()
    setMenuOpen(false)
    router('/login')
  }

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
        {showTrialBanner ? (
          <div className="bg-amber-100 px-4 py-2 text-center text-xs font-medium text-amber-800">
            Your free trial ends in {trialDaysLeft} days. Upgrade to avoid interruption.
          </div>
        ) : null}

        <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button type="button" className="hidden rounded-lg border border-slate-300 p-2 text-slate-600 hover:bg-slate-50 md:inline-flex" onClick={onToggleSidebar}>
              <Icon className="h-5 w-5" paths={['M4 6h16', 'M4 12h16', 'M4 18h16']} />
            </button>
            <p className="truncate text-sm font-medium text-slate-700">{breadcrumb}</p>
          </div>

          <button type="button" className="hidden w-full max-w-md items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-left text-sm text-slate-500 hover:bg-slate-50 lg:flex" onClick={() => setSearchOpen(true)}>
            <Icon className="h-4 w-4" paths={['M11 19a8 8 0 100-16 8 8 0 000 16z', 'M21 21l-4.35-4.35']} />
            <span>Search anything...</span>
            <kbd className="ml-auto rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500">Cmd+K</kbd>
          </button>

          <div className="relative flex items-center gap-2">
            <button type="button" className="relative rounded-lg border border-slate-300 p-2 text-slate-600 hover:bg-slate-50">
              <Icon className="h-5 w-5" paths={['M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2c0 .53-.2 1.04-.6 1.4L4 17h5', 'M10 17a2 2 0 004 0']} />
              {notificationCount > 0 ? <span className="absolute -right-1 -top-1 rounded-full bg-teal-600 px-1.5 text-[10px] font-semibold text-white">{notificationCount}</span> : null}
            </button>

            <div className="relative">
              <button type="button" className="flex items-center gap-2 rounded-lg border border-slate-300 px-2 py-1.5 hover:bg-slate-50" onClick={() => setMenuOpen((v) => !v)}>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">{avatarInitials}</div>
                <Icon className="hidden h-4 w-4 text-slate-500 sm:block" paths={['M6 9l6 6 6-6']} />
              </button>

              {menuOpen ? (
                <div className="absolute right-0 mt-2 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                  <Link className="block px-3 py-2 text-sm text-slate-700 hover:bg-slate-50" to="/profile">Profile</Link>
                  <Link className="block px-3 py-2 text-sm text-slate-700 hover:bg-slate-50" to="/settings">Settings</Link>
                  <button type="button" className="block w-full px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50" onClick={handleLogout}>Logout</button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      {searchOpen ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/40 px-4 pt-24" onClick={(e) => { if (e.target === e.currentTarget) setSearchOpen(false) }}>
          <div className="w-full max-w-2xl rounded-2xl bg-white p-4 shadow-2xl">
            <div className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2">
              <Icon className="h-4 w-4 text-slate-500" paths={['M11 19a8 8 0 100-16 8 8 0 000 16z', 'M21 21l-4.35-4.35']} />
              <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} type="text" className="w-full border-0 p-0 text-sm outline-none" placeholder="Search customers, appointments, services..." />
              <button type="button" className="text-xs text-slate-500" onClick={() => setSearchOpen(false)}>Esc</button>
            </div>
            <p className="mt-3 text-xs text-slate-500">Search is UI-only for now.</p>
          </div>
        </div>
      ) : null}
    </>
  )
}
