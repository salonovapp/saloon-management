import React, { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import AppBottomNav from '../components/layout/AppBottomNav.jsx'
import AppHeader from '../components/layout/AppHeader.jsx'
import AppSidebar from '../components/layout/AppSidebar.jsx'

const STORAGE_KEY = 'salonos_sidebar_collapsed'

export default function AppLayout({ children, drawer }) {
  const location = useLocation()
  
  // Initialize from localStorage or default to false
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) === 'true'
  })

  // Check window size on mount to auto-collapse on smaller desktop screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024 && window.innerWidth >= 768) {
        setSidebarCollapsed(true)
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const toggleSidebar = () => {
    const nextValue = !sidebarCollapsed
    setSidebarCollapsed(nextValue)
    localStorage.setItem(STORAGE_KEY, String(nextValue))
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 selection:bg-teal-500/30 font-sans">
      <AppSidebar collapsed={sidebarCollapsed} onToggleSidebar={toggleSidebar} />

      <motion.div 
        layout
        initial={false}
        animate={{ 
          marginLeft: window.innerWidth >= 768 ? (sidebarCollapsed ? 72 : 260) : 0 
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="flex flex-col min-h-screen md:pb-0"
      >
        <AppHeader onToggleSidebar={toggleSidebar} />

        <main className="flex-1 relative w-full max-w-[1600px] mx-auto px-4 py-8 sm:px-8 lg:px-12 pb-32 md:pb-12">
          {children || (
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="w-full h-full"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          )}
        </main>
      </motion.div>

      {/* Floating detail drawer overlay */}
      <AnimatePresence>
        {drawer && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: "100%", boxShadow: "-10px 0 30px rgba(0,0,0,0)" }}
              animate={{ x: 0, boxShadow: "-10px 0 30px rgba(0,0,0,0.1)" }}
              exit={{ x: "100%", boxShadow: "-10px 0 30px rgba(0,0,0,0)" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed right-0 top-0 z-50 h-screen w-full max-w-md border-l border-slate-200/60 bg-white"
            >
              {drawer}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AppBottomNav />
    </div>
  )
}
