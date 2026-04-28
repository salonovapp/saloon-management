import React, { useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../stores/auth'
import PlanBadge from '../ui/PlanBadge.jsx'

function Icon({ paths, className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      {paths.map((d, i) => (
        <path key={i} d={d} strokeLinecap="round" strokeLinejoin="round" />
      ))}
    </svg>
  )
}

const navItems = [
  { label: 'Dashboard', to: '/dashboard', icon: ['M3 10.5L12 3l9 7.5', 'M5.25 9.75V21h13.5V9.75'] },
  { label: 'Appointments', to: '/appointments', icon: ['M8 2v4', 'M16 2v4', 'M3 9h18', 'M4 5h16a1 1 0 011 1v14a1 1 0 01-1 1H4a1 1 0 01-1-1V6a1 1 0 011-1z'] },
  { label: 'Staff', to: '/staff', icon: ['M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2', 'M9 7a4 4 0 110-8 4 4 0 010 8', 'M23 21v-2a4 4 0 00-3-3.87', 'M16 3.13a4 4 0 010 7.75'] },
  { label: 'Inventory', to: '/inventory', icon: ['M12 2l9 5-9 5-9-5 9-5z', 'M3 7v10l9 5 9-5V7', 'M12 12v10'] },
  { label: 'Customers', to: '/customers', icon: ['M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2', 'M9 7a4 4 0 110-8 4 4 0 010 8', 'M23 21v-2a4 4 0 00-3-3.87', 'M16 3.13a4 4 0 010 7.75'] },
  { label: 'Billing', to: '/billing', icon: ['M3 7h18', 'M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z', 'M7 15h4'] },
  { label: 'Analytics', to: '/analytics', icon: ['M4 20V10', 'M10 20V4', 'M16 20v-7', 'M22 20V8'] },
]

export default function AppSidebar({ collapsed = false }) {
  const location = useLocation()
  const auth = useAuthStore()

  const salonName = useMemo(() => auth.tenant?.name || 'SalonOS Workspace', [auth.tenant?.name])
  const planLabel = useMemo(() => auth.planName || 'Free', [auth.planName])
  const isFreePlan = useMemo(() => auth.isFree || String(planLabel).toLowerCase() === 'free', [auth.isFree, planLabel])

  const isActive = (targetPath) => location.pathname.startsWith(targetPath)
  const linkClass = (targetPath) => (isActive(targetPath)
    ? 'border-l-2 border-teal-400 bg-teal-500/10 text-teal-300'
    : 'border-l-2 border-transparent text-slate-300 hover:bg-slate-700 hover:text-white')

  return (
    <aside className={`fixed left-0 top-0 z-30 hidden h-screen border-r border-slate-800 bg-[#0F172A] text-slate-200 md:flex md:flex-col ${collapsed ? 'w-16' : 'w-60'}`}>
      <div className="border-b border-slate-800 px-3 py-4">
        <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
          <div className="rounded-lg bg-teal-500/20 p-2 text-teal-300">
            <Icon className="h-5 w-5" paths={['M5 5l14 14', 'M19 5L5 19', 'M4 4a2 2 0 104 0 2 2 0 00-4 0zm12 0a2 2 0 104 0 2 2 0 00-4 0']} />
          </div>
          {!collapsed ? (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{salonName}</p>
              <PlanBadge plan={planLabel} />
            </div>
          ) : null}
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-3">
        {navItems.map((item) => (
          <Link key={item.to} to={item.to} className={`group relative flex items-center rounded-lg px-3 py-2 text-sm transition ${linkClass(item.to)}`} title={collapsed ? item.label : ''}>
            <span className={`mr-3 inline-flex h-5 w-5 shrink-0 ${isActive(item.to) ? 'text-teal-300' : 'text-slate-300'}`}>
              <Icon className="h-5 w-5" paths={item.icon} />
            </span>
            {!collapsed ? <span className="font-medium">{item.label}</span> : null}
            {collapsed ? <span className="pointer-events-none absolute left-14 z-40 hidden rounded bg-slate-900 px-2 py-1 text-xs text-white group-hover:block">{item.label}</span> : null}
          </Link>
        ))}
      </nav>

      <div className="space-y-1 border-t border-slate-800 px-2 py-3">
        <Link to="/settings" className={`group relative flex items-center rounded-lg px-3 py-2 text-sm transition ${linkClass('/settings')}`} title={collapsed ? 'Settings' : ''}>
          <Icon className={`h-5 w-5 shrink-0 ${isActive('/settings') ? 'text-teal-300' : 'text-slate-300'}`} paths={['M10.325 4.317a1 1 0 011.35-.936l.402.162a1 1 0 00.846 0l.402-.162a1 1 0 011.35.936l.07.431a1 1 0 00.592.758l.39.167a1 1 0 01.548 1.27l-.149.406a1 1 0 00.11.898l.262.35a1 1 0 010 1.2l-.262.35a1 1 0 00-.11.898l.149.406a1 1 0 01-.548 1.27l-.39.167a1 1 0 00-.592.758l-.07.431a1 1 0 01-1.35.936l-.402-.162a1 1 0 00-.846 0l-.402.162a1 1 0 01-1.35-.936l-.07-.431a1 1 0 00-.592-.758l-.39-.167a1 1 0 01-.548-1.27l.149-.406a1 1 0 00-.11-.898l-.262-.35a1 1 0 010-1.2l.262-.35a1 1 0 00.11-.898l-.149-.406a1 1 0 01.548-1.27l.39-.167a1 1 0 00.592-.758l.07-.431z', 'M12 15.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z']} />
          {!collapsed ? <span className="ml-3 font-medium">Settings</span> : null}
          {collapsed ? <span className="pointer-events-none absolute left-14 z-40 hidden rounded bg-slate-900 px-2 py-1 text-xs text-white group-hover:block">Settings</span> : null}
        </Link>

        <button type="button" className="group relative flex w-full items-center rounded-lg px-3 py-2 text-left text-sm text-slate-300 transition hover:bg-slate-700 hover:text-white" title={collapsed ? 'Help' : ''}>
          <Icon className="h-5 w-5 shrink-0" paths={['M9.09 9a3 3 0 115.82 1c0 2-3 3-3 3', 'M12 17h.01', 'M12 22a10 10 0 100-20 10 10 0 000 20z']} />
          {!collapsed ? <span className="ml-3 font-medium">Help</span> : null}
          {collapsed ? <span className="pointer-events-none absolute left-14 z-40 hidden rounded bg-slate-900 px-2 py-1 text-xs text-white group-hover:block">Help</span> : null}
        </button>

        {isFreePlan ? (
          <button type="button" className="w-full rounded-lg bg-teal-600 px-3 py-2 text-left text-sm font-semibold text-white hover:bg-teal-500">
            {collapsed ? <span>UP</span> : <span>Upgrade to Pro</span>}
          </button>
        ) : null}
      </div>
    </aside>
  )
}
