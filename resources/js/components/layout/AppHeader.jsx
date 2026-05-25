import React, { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/auth'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, Transition } from '@headlessui/react'
import { Search, Bell, Menu as MenuIcon, User, Settings, LogOut, Command } from 'lucide-react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export default function AppHeader({ onToggleSidebar }) {
  const location = useLocation()
  const router = useNavigate()
  const auth = useAuthStore()

  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [notificationCount] = useState(3)
  const [scrolled, setScrolled] = useState(false)

  const breadcrumb = useMemo(() => {
    const map = {
      dashboard: 'Overview',
      appointments: 'Schedule',
      staff: 'Team',
      inventory: 'Inventory',
      customers: 'Customers',
      billing: 'Billing',
      analytics: 'Analytics',
      settings: 'Settings',
    }
    const key = location.pathname.split('/')[1]
    return map[key] || 'salonovapp'
  }, [location.pathname])

  const avatarInitials = useMemo(() => {
    const name = auth.user?.name || 'Salon User'
    return name.split(' ').map((part) => part.charAt(0)).join('').slice(0, 2).toUpperCase()
  }, [auth.user?.name])

  const trialDaysLeft = 5
  const showTrialBanner = auth.isFree && trialDaysLeft < 7

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleKeydown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setSearchOpen(true)
      }
      if (event.key === 'Escape') {
        setSearchOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [])

  const handleLogout = async () => {
    await auth.logout()
    router('/login')
  }

  return (
    <>
      <header className={cn(
        "sticky top-0 z-20 transition-all duration-300",
        scrolled ? "bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm" : "bg-transparent border-b border-transparent"
      )}>
        {showTrialBanner ? (
          <div className="bg-gradient-to-r from-amber-500/10 via-amber-400/10 to-amber-500/10 px-4 py-2.5 border-b border-amber-200/50 flex items-center justify-center">
            <p className="text-xs font-semibold text-amber-800 tracking-wide">
              Trial ending in {trialDaysLeft} days. <Link to="/billing" className="ml-1 underline decoration-amber-400 underline-offset-2 hover:text-amber-900 transition-colors">Upgrade to Pro</Link>
            </p>
          </div>
        ) : null}

        <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6 h-16">
          {/* Left: Mobile Toggle & Breadcrumb */}
          <div className="flex min-w-0 items-center gap-4">
            <button 
              type="button" 
              className="md:hidden flex items-center justify-center p-2 -ml-2 rounded-xl text-slate-500 hover:bg-slate-100/80 hover:text-slate-900 transition-colors"
              onClick={onToggleSidebar}
            >
              <MenuIcon className="w-5 h-5" />
            </button>
            <h1 className="text-[15px] font-semibold tracking-tight text-slate-800 hidden sm:block">
              {breadcrumb}
            </h1>
          </div>

          {/* Center: Global Search (Cmd+K) */}
          <div className="flex-1 max-w-xl mx-auto flex justify-center hidden sm:flex">
            <button 
              type="button" 
              className="group flex w-full max-w-md items-center gap-2 rounded-full border border-slate-200 bg-white/50 px-4 py-2 text-sm text-slate-500 shadow-sm transition-all hover:bg-white hover:border-teal-500/30 hover:shadow-[0_0_15px_rgba(20,184,166,0.1)] focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="h-4 w-4 text-slate-400 group-hover:text-teal-500 transition-colors" />
              <span className="flex-1 text-left tracking-wide">Search workspace...</span>
              <div className="flex items-center gap-1 opacity-70">
                <Command className="h-3 w-3" />
                <span className="text-[11px] font-medium tracking-wider">K</span>
              </div>
            </button>
          </div>

          {/* Right: Actions & Avatar */}
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <button type="button" className="relative p-2 rounded-full text-slate-500 hover:bg-slate-100/80 hover:text-slate-900 transition-colors group">
              <Bell className="w-5 h-5 group-hover:animate-wiggle" />
              {notificationCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                </span>
              )}
            </button>

            <div className="h-5 w-px bg-slate-200 hidden sm:block mx-1" />

            {/* Avatar Dropdown */}
            <Menu as="div" className="relative">
              <Menu.Button className="flex items-center gap-2 rounded-full p-0.5 pr-2 hover:bg-slate-100/80 transition-colors focus:outline-none">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-slate-800 to-slate-700 text-[11px] font-semibold text-white shadow-sm border border-slate-600/20">
                  {avatarInitials}
                </div>
              </Menu.Button>

              <AnimatePresence>
                <Menu.Items
                  as={motion.div}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 5, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  className="absolute right-0 mt-2 w-56 origin-top-right rounded-2xl bg-white p-1.5 shadow-xl border border-slate-100 focus:outline-none"
                >
                  <div className="px-3 py-2.5 mb-1 border-b border-slate-100">
                    <p className="text-sm font-medium text-slate-900 truncate">{auth.user?.name}</p>
                    <p className="text-xs text-slate-500 truncate">{auth.user?.email}</p>
                  </div>
                  
                  <div className="px-1 py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <Link to="/profile" className={cn(
                          "flex w-full items-center gap-2 rounded-xl px-2 py-2 text-sm transition-colors",
                          active ? "bg-slate-50 text-teal-600" : "text-slate-700"
                        )}>
                          <User className="h-4 w-4" /> Profile
                        </Link>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <Link to="/settings" className={cn(
                          "flex w-full items-center gap-2 rounded-xl px-2 py-2 text-sm transition-colors",
                          active ? "bg-slate-50 text-teal-600" : "text-slate-700"
                        )}>
                          <Settings className="h-4 w-4" /> Workspace Settings
                        </Link>
                      )}
                    </Menu.Item>
                  </div>
                  <div className="px-1 py-1 border-t border-slate-100">
                    <Menu.Item>
                      {({ active }) => (
                        <button onClick={handleLogout} className={cn(
                          "flex w-full items-center gap-2 rounded-xl px-2 py-2 text-sm font-medium transition-colors",
                          active ? "bg-rose-50 text-rose-600" : "text-rose-600/90"
                        )}>
                          <LogOut className="h-4 w-4" /> Sign out
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </AnimatePresence>
            </Menu>
          </div>
        </div>
      </header>

      {/* Global Search Command Palette (Modal) */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/20 backdrop-blur-sm px-4 pt-[10vh]" 
            onClick={(e) => { if (e.target === e.currentTarget) setSearchOpen(false) }}
          >
            <motion.div 
              initial={{ opacity: 0, y: -20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200/50"
            >
              <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-4">
                <Search className="h-5 w-5 text-teal-500" />
                <input 
                  autoFocus
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  type="text" 
                  className="w-full border-0 p-0 text-base outline-none placeholder:text-slate-400 focus:ring-0 text-slate-800 bg-transparent" 
                  placeholder="Search customers, appointments, services..." 
                />
                <kbd className="hidden sm:inline-block rounded-md bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-500 border border-slate-200">
                  ESC
                </kbd>
              </div>
              <div className="px-4 py-12 text-center text-sm text-slate-500 bg-slate-50/50">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 mb-3 text-slate-400">
                  <Command className="h-5 w-5" />
                </div>
                <p>Start typing to search your workspace...</p>
                <p className="text-xs text-slate-400 mt-1">Search is UI-only for now.</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
