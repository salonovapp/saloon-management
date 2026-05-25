import React from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export default function KpiCard({
  title,
  value,
  change,
  trend = 'up',
  icon: Icon,
  color = 'teal',
  loading = false,
  delay = 0
}) {
  const colorMap = {
    teal: 'text-teal-600 bg-teal-50',
    blue: 'text-blue-600 bg-blue-50',
    indigo: 'text-indigo-600 bg-indigo-50',
    rose: 'text-rose-600 bg-rose-50',
    amber: 'text-amber-600 bg-amber-50',
  }

  const TrendIcon = trend === 'up' ? ArrowUpRight : ArrowDownRight
  const trendColor = trend === 'up' ? 'text-emerald-500' : 'text-rose-500'

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col gap-4 animate-pulse">
        <div className="flex justify-between items-start">
          <div className="h-4 w-24 bg-slate-100 rounded"></div>
          <div className="h-10 w-10 bg-slate-100 rounded-xl"></div>
        </div>
        <div>
          <div className="h-8 w-32 bg-slate-100 rounded mb-2"></div>
          <div className="h-3 w-16 bg-slate-100 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30, delay }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all"
    >
      <div className="flex justify-between items-start">
        <p className="text-sm font-semibold text-slate-500 tracking-wide uppercase">{title}</p>
        <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl", colorMap[color] || colorMap.teal)}>
          {Icon && <Icon className="h-6 w-6" strokeWidth={2} />}
        </div>
      </div>
      <div className="mt-2">
        <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{value}</h3>
        {change && (
          <div className="flex items-center gap-1.5 mt-2">
            <span className={cn("flex items-center text-xs font-semibold", trendColor)}>
              <TrendIcon className="h-3 w-3 mr-0.5" strokeWidth={3} />
              {change}
            </span>
            <span className="text-xs text-slate-400 font-medium">vs last period</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}
