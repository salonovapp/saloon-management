import React from 'react'
import { motion } from 'framer-motion'
import { Star, Calendar, MessageSquare, ArrowRight } from 'lucide-react'
import BaseBadge from '../ui/BaseBadge.jsx'

export default function StaffCard({ staff, onClick }) {
  const getInitials = (name) => {
    return name
      ? name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2)
      : 'ST'
  }

  // Get status details
  const getStatusDetails = (status) => {
    switch (status?.toLowerCase()) {
      case 'available':
        return { dotClass: 'bg-emerald-500 ring-emerald-500/20', text: 'Available', badgeVariant: 'success' }
      case 'busy':
        return { dotClass: 'bg-rose-500 ring-rose-500/20', text: 'Busy', badgeVariant: 'danger' }
      case 'day-off':
      default:
        return { dotClass: 'bg-slate-400 ring-slate-400/20', text: 'Day Off', badgeVariant: 'default' }
    }
  }

  const { dotClass, text: statusText, badgeVariant } = getStatusDetails(staff.status)

  // Subtle colors based on name to make initials avatar look cool
  const getAvatarBg = (name) => {
    const colors = [
      'bg-teal-600 text-teal-50 border-teal-500/30',
      'bg-indigo-600 text-indigo-50 border-indigo-500/30',
      'bg-rose-600 text-rose-50 border-rose-500/30',
      'bg-amber-600 text-amber-50 border-amber-500/30',
      'bg-sky-600 text-sky-50 border-sky-500/30',
      'bg-purple-600 text-purple-50 border-purple-500/30'
    ]
    let hash = 0
    for (let i = 0; i < (name?.length || 0); i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }
    return colors[Math.abs(hash) % colors.length]
  }

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' }}
      whileTap={{ scale: 0.99 }}
      onClick={() => onClick?.(staff.id)}
      className="relative flex flex-col justify-between overflow-hidden bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:border-slate-300 transition-colors cursor-pointer group"
    >
      {/* Background Micro-animation glow */}
      <div className="absolute -right-16 -top-16 w-32 h-32 bg-teal-500/5 rounded-full blur-2xl group-hover:bg-teal-500/10 transition-colors duration-500" />
      
      <div>
        {/* Top: Status & Role */}
        <div className="flex items-center justify-between mb-4">
          <BaseBadge variant={badgeVariant} size="sm">
            {staff.role || 'Staff'}
          </BaseBadge>
          <div className="flex items-center gap-1.5">
            <span className={`relative flex h-2 w-2 rounded-full ${dotClass} ring-4`} />
            <span className="text-xs font-semibold text-slate-500">{statusText}</span>
          </div>
        </div>

        {/* Profile Info */}
        <div className="flex items-center gap-3.5 mb-4">
          {staff.photo ? (
            <img
              src={staff.photo}
              alt={staff.name}
              className="w-12 h-12 rounded-xl object-cover border border-slate-100 shadow-sm"
              onError={(e) => {
                e.target.onerror = null
                e.target.style.display = 'none'
                // Trigger fallback
                e.target.nextSibling.style.display = 'flex'
              }}
            />
          ) : null}
          
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm border shadow-sm ${getAvatarBg(staff.name)}`}
            style={{ display: staff.photo ? 'none' : 'flex' }}
          >
            {getInitials(staff.name)}
          </div>

          <div>
            <h3 className="font-bold text-slate-900 group-hover:text-teal-600 transition-colors tracking-tight text-[15px]">
              {staff.name}
            </h3>
            <span className="text-xs text-slate-400 font-medium">Joined {staff.joinDate || 'recently'}</span>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 mb-4">
          {/* Today Appointments */}
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-50 border border-indigo-100 rounded-lg text-indigo-500">
              <Calendar className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Today</p>
              <p className="text-xs font-bold text-slate-700">{staff.appointmentsCount ?? 0} bookings</p>
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-50 border border-amber-100 rounded-lg text-amber-500">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Rating</p>
              <p className="text-xs font-bold text-slate-700">{staff.rating ?? '5.0'} / 5</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer: View Profile link */}
      <div className="flex items-center justify-between text-xs font-bold text-slate-400 group-hover:text-teal-600 border-t border-slate-100 pt-3 transition-colors">
        <span>View detailed profile</span>
        <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
      </div>
    </motion.div>
  )
}
