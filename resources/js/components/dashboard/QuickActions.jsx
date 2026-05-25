import React from 'react'
import { motion } from 'framer-motion'
import { CalendarPlus, Users, UserPlus, Receipt } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function QuickActions() {
  const actions = [
    { label: 'New Appt.', icon: CalendarPlus, color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-100', to: '/appointments/new' },
    { label: 'Walk-in', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100', to: '/appointments/walk-in' },
    { label: 'Add Client', icon: UserPlus, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100', to: '/customers/new' },
    { label: 'Invoice', icon: Receipt, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', to: '/billing/new' },
  ]

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-full flex flex-col">
      <h3 className="text-base font-semibold text-slate-900 mb-6">Quick Actions</h3>
      
      <div className="grid grid-cols-2 gap-4 flex-1">
        {actions.map((action, idx) => {
          const Icon = action.icon
          return (
            <Link key={idx} to={action.to} className="group block">
              <motion.div 
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.96 }}
                className={`flex flex-col items-center justify-center h-full p-4 rounded-xl border ${action.border} ${action.bg} transition-colors hover:shadow-sm`}
              >
                <div className={`mb-3 p-3 bg-white rounded-xl shadow-sm ${action.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 text-center">
                  {action.label}
                </span>
              </motion.div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
