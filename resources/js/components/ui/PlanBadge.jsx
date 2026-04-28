import React from 'react'

export default function PlanBadge({ plan = 'Free' }) {
  const normalized = String(plan || 'Free').trim()
  const label = normalized ? normalized.charAt(0).toUpperCase() + normalized.slice(1).toLowerCase() : 'Free'
  const key = label.toLowerCase()

  const cls = key === 'enterprise'
    ? 'bg-teal-100 text-teal-800'
    : key === 'pro'
      ? 'bg-amber-100 text-amber-800'
      : 'bg-slate-200 text-slate-700'

  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${cls}`}>{label}</span>
}
