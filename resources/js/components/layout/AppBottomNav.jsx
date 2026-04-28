import React from 'react'
import { Link, useLocation } from 'react-router-dom'

function Icon({ paths, className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      {paths.map((d, i) => (
        <path key={i} d={d} strokeLinecap="round" strokeLinejoin="round" />
      ))}
    </svg>
  )
}

const items = [
  { label: 'Dashboard', to: '/dashboard', icon: ['M3 10.5L12 3l9 7.5', 'M5.25 9.75V21h13.5V9.75'] },
  { label: 'Appointments', to: '/appointments', icon: ['M8 2v4', 'M16 2v4', 'M3 9h18', 'M4 5h16a1 1 0 011 1v14a1 1 0 01-1 1H4a1 1 0 01-1-1V6a1 1 0 011-1z'] },
  { label: 'Customers', to: '/customers', icon: ['M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2', 'M9 7a4 4 0 110-8 4 4 0 010 8', 'M23 21v-2a4 4 0 00-3-3.87', 'M16 3.13a4 4 0 010 7.75'] },
  { label: 'Billing', to: '/billing', icon: ['M3 7h18', 'M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z', 'M7 15h4'] },
  { label: 'More', to: '/settings', icon: ['M5 12h.01', 'M12 12h.01', 'M19 12h.01'] },
]

export default function AppBottomNav() {
  const location = useLocation()
  const isActive = (targetPath) => location.pathname.startsWith(targetPath)

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white md:hidden">
      <div className="grid grid-cols-5">
        {items.map((item) => (
          <Link key={item.to} to={item.to} className={`flex flex-col items-center justify-center py-2 text-xs ${isActive(item.to) ? 'text-teal-600' : 'text-slate-500'}`}>
            <Icon className="h-5 w-5" paths={item.icon} />
            <span className="mt-0.5">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}
