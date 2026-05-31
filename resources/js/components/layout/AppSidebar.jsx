import React, { useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../stores/auth'
import PlanBadge from '../ui/PlanBadge.jsx'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, CalendarDays, Users, PackageOpen, UsersRound, CreditCard, BarChart3, Settings, HelpCircle, Zap, Scissors, ChevronLeft, ChevronRight, Tags, ShieldCheck, KeyRound } from 'lucide-react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs) {
  return twMerge(clsx(inputs))
}

const navGroups = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
      { label: 'Analytics', to: '/analytics', icon: BarChart3, code: 'analytics.view' },
    ]
  },
  {
    title: 'Operations',
    items: [
      { label: 'Appointments', to: '/appointments', icon: CalendarDays, code: 'appointments.view' },
      { label: 'Customers', to: '/customers', icon: UsersRound, code: 'customers.view' },
      { label: 'Staff', to: '/staff', icon: Users, code: 'staff.view' },
      { label: 'Inventory', to: '/inventory', icon: PackageOpen, code: 'inventory.view' },
      { label: 'Categories', to: '/categories', icon: Tags, code: 'inventory.view' },
    ]
  },
  {
    title: 'Finance',
    items: [
      { label: 'Billing', to: '/billing', icon: CreditCard, code: 'billing.view' },
    ]
  },
  {
    title: 'System',
    items: [
      { label: 'Roles', to: '/roles', icon: ShieldCheck, code: 'roles.read' },
      { label: 'Assign Permissions', to: '/assign-permissions', icon: KeyRound, code: 'roles.assign_permissions' },
    ]
  }
]

export default function AppSidebar({ collapsed = false, onToggleSidebar }) {
  const location = useLocation()
  const auth = useAuthStore()

  const salonName = useMemo(() => auth.tenant?.name || 'salonovapp', [auth.tenant?.name])
  const planLabel = useMemo(() => auth.planName || 'Free', [auth.planName])
  const isFreePlan = useMemo(() => auth.isFree || String(planLabel).toLowerCase() === 'free', [auth.isFree, planLabel])

  const isActive = (targetPath) => location.pathname.startsWith(targetPath)

  return (
    <motion.aside 
      initial={false}
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed left-0 top-0 z-30 hidden h-screen bg-[#0A0F1C] border-r border-slate-800/60 text-slate-300 md:flex md:flex-col shadow-2xl"
    >
      {/* Brand & Workspace Area */}
      <div className="relative flex-shrink-0 border-b border-slate-800/60 p-4 h-16 flex items-center">
        <div className={cn("flex items-center gap-3 w-full", collapsed && "justify-center")}>
          <div className="relative flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 text-white shadow-[0_0_15px_rgba(45,212,191,0.4)]">
            <Scissors className="h-4 w-4 transform -rotate-45" />
          </div>
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, width: 0 }}
                className="flex flex-col min-w-0 flex-1 whitespace-nowrap overflow-hidden"
              >
                <p className="truncate text-[13px] font-semibold text-white tracking-wide">{salonName}</p>
                <div className="flex items-center mt-0.5">
                  <PlanBadge plan={planLabel} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Toggle Button */}
        <button
          onClick={onToggleSidebar}
          className="absolute top-5 -right-3 flex h-6 w-6 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-slate-400 hover:text-white hover:border-slate-500 transition-colors shadow-lg z-50 hidden md:flex"
        >
          {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto scrollbar-hide py-4 px-3 flex flex-col gap-6">
        {navGroups.map((group, idx) => (
          <div key={idx} className="flex flex-col gap-1">
            <AnimatePresence>
              {!collapsed && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="px-2 pb-1 text-[10px] font-bold tracking-wider text-slate-500 uppercase whitespace-nowrap overflow-hidden"
                >
                  {group.title}
                </motion.div>
              )}
            </AnimatePresence>
            
            {group.items.filter(item => !item.code || auth.can(item.code)).map((item) => {
              const active = isActive(item.to)
              const Icon = item.icon
              
              return (
                <Link 
                  key={item.to} 
                  to={item.to} 
                  className={cn(
                    "group relative flex items-center rounded-xl px-2.5 py-2 text-[13px] font-medium transition-all duration-200",
                    active 
                      ? "text-teal-400 bg-teal-500/10 shadow-[inset_0_1px_0_rgba(45,212,191,0.1)]" 
                      : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                  )}
                >
                  {/* Active Indicator Glow */}
                  {active && (
                    <motion.div
                      layoutId="sidebarActiveIndicator"
                      className="absolute left-0 top-1/2 -mt-2.5 h-5 w-1 rounded-r-full bg-teal-500 shadow-[0_0_10px_rgba(45,212,191,0.8)]"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  
                  <Icon className={cn("h-4 w-4 shrink-0 transition-colors", active ? "text-teal-400" : "text-slate-500 group-hover:text-slate-300")} strokeWidth={active ? 2.5 : 2} />
                  
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, width: 0 }}
                        className="ml-3 whitespace-nowrap overflow-hidden"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {/* Tooltip for collapsed mode */}
                  {collapsed && (
                    <div className="absolute left-14 z-50 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white opacity-0 shadow-xl transition-opacity duration-200 group-hover:opacity-100 pointer-events-none whitespace-nowrap border border-slate-700/50">
                      {item.label}
                    </div>
                  )}
                </Link>
              )
            })}
          </div>
        ))}
      </div>

      <div className="flex-shrink-0 p-3 flex flex-col gap-1 border-t border-slate-800/60 bg-slate-900/20">
        {auth.can('settings.view') && (
          <Link 
            to="/settings" 
            className={cn(
              "group relative flex items-center rounded-xl px-2.5 py-2 text-[13px] font-medium transition-all duration-200",
              isActive('/settings') ? "text-teal-400 bg-teal-500/10" : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
            )}
          >
            <Settings className="h-4 w-4 shrink-0 text-slate-500 group-hover:text-slate-300" strokeWidth={2} />
            <AnimatePresence>
              {!collapsed && (
                <motion.span 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, width: 0 }}
                  className="ml-3 whitespace-nowrap overflow-hidden"
                >
                  Settings
                </motion.span>
              )}
            </AnimatePresence>
            {collapsed && (
              <div className="absolute left-14 z-50 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white opacity-0 shadow-xl transition-opacity duration-200 group-hover:opacity-100 pointer-events-none whitespace-nowrap">Settings</div>
            )}
          </Link>
        )}
        
        <button type="button" className="group relative flex items-center rounded-xl px-2.5 py-2 text-left text-[13px] font-medium text-slate-400 transition-all duration-200 hover:bg-slate-800/50 hover:text-slate-200 w-full">
          <HelpCircle className="h-4 w-4 shrink-0 text-slate-500 group-hover:text-slate-300" strokeWidth={2} />
          <AnimatePresence>
            {!collapsed && (
              <motion.span 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, width: 0 }}
                className="ml-3 whitespace-nowrap overflow-hidden"
              >
                Support
              </motion.span>
            )}
          </AnimatePresence>
          {collapsed && (
            <div className="absolute left-14 z-50 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white opacity-0 shadow-xl transition-opacity duration-200 group-hover:opacity-100 pointer-events-none whitespace-nowrap">Support</div>
          )}
        </button>

        {isFreePlan && (
          <div className="mt-2">
            <button type="button" className={cn(
              "relative flex w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-teal-500 to-teal-400 py-2.5 text-sm font-semibold text-white transition-all hover:from-teal-400 hover:to-teal-300 shadow-[0_4px_15px_rgba(20,184,166,0.3)] hover:shadow-[0_6px_20px_rgba(20,184,166,0.4)]",
              collapsed ? "px-0" : "px-3"
            )}>
              {collapsed ? (
                <Zap className="h-4 w-4" fill="currentColor" />
              ) : (
                <span className="flex items-center gap-2">
                  <Zap className="h-4 w-4" fill="currentColor" /> Upgrade Pro
                </span>
              )}
            </button>
          </div>
        )}
      </div>
    </motion.aside>
  )
}
