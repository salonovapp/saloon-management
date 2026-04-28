import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import AppBottomNav from '../components/layout/AppBottomNav.jsx'
import AppHeader from '../components/layout/AppHeader.jsx'
import AppSidebar from '../components/layout/AppSidebar.jsx'

const STORAGE_KEY = 'salonos_sidebar_collapsed'

export default function AppLayout({ children, drawer }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(localStorage.getItem(STORAGE_KEY) === 'true')

  const toggleSidebar = () => {
    const nextValue = !sidebarCollapsed
    setSidebarCollapsed(nextValue)
    localStorage.setItem(STORAGE_KEY, String(nextValue))
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <AppSidebar collapsed={sidebarCollapsed} />

      <div className={`min-h-screen transition-all md:pb-0 ${sidebarCollapsed ? 'md:ml-16' : 'md:ml-60'}`}>
        <AppHeader onToggleSidebar={toggleSidebar} />

        <main className="relative px-4 py-4 pb-24 sm:px-6 lg:px-8">
          {children || <Outlet />}
        </main>
      </div>

      {drawer ? (
        <div className="fixed right-0 top-0 z-40 h-screen w-full max-w-md border-l border-slate-200 bg-white shadow-xl">
          {drawer}
        </div>
      ) : null}

      <AppBottomNav />
    </div>
  )
}
