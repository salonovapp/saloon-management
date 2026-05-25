import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, Calendar, Users, CreditCard, MoreHorizontal } from 'lucide-react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs) {
  return twMerge(clsx(inputs))
}

const items = [
  { label: 'Home', to: '/dashboard', icon: Home },
  { label: 'Schedule', to: '/appointments', icon: Calendar },
  { label: 'Clients', to: '/customers', icon: Users },
  { label: 'Billing', to: '/billing', icon: CreditCard },
  { label: 'More', to: '/settings', icon: MoreHorizontal },
]

export default function AppBottomNav() {
  const location = useLocation()
  const isActive = (targetPath) => location.pathname.startsWith(targetPath)

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 pb-safe md:hidden">
      {/* Glassmorphism Background with shadow */}
      <div className="absolute inset-0 bg-white/80 backdrop-blur-xl border-t border-slate-200/50 shadow-[0_-8px_30px_rgba(0,0,0,0.04)]" />
      
      <div className="relative flex justify-between items-center px-2 py-1">
        {items.map((item) => {
          const active = isActive(item.to)
          const Icon = item.icon

          return (
            <Link 
              key={item.to} 
              to={item.to} 
              className={cn(
                "relative flex flex-col items-center justify-center w-full py-2 tap-highlight-transparent",
                active ? "text-teal-600" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <div className="relative flex items-center justify-center w-10 h-8">
                {active && (
                  <motion.div
                    layoutId="bottomNavIndicator"
                    className="absolute inset-0 bg-teal-100/50 rounded-full"
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  />
                )}
                <Icon 
                  className={cn("relative z-10 w-5 h-5 transition-transform duration-300", active && "scale-110")} 
                  strokeWidth={active ? 2.5 : 2}
                />
              </div>
              <span className={cn(
                "mt-0.5 text-[10px] tracking-wide transition-colors duration-300",
                active ? "font-semibold" : "font-medium"
              )}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
