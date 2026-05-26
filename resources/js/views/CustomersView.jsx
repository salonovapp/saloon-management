import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, Search, Filter, Star, Phone, Mail, Calendar,
  Gift, ChevronRight, X, Clock, TrendingUp, Award,
  ArrowUpRight, MessageCircle, Heart, Scissors, Plus
} from 'lucide-react'
import PageHeader from '../components/ui/PageHeader.jsx'
import BaseButton from '../components/ui/BaseButton.jsx'
import BaseBadge from '../components/ui/BaseBadge.jsx'

// ─── Mock Data ────────────────────────────────────────────────
const MOCK_CUSTOMERS = [
  {
    id: 1, name: 'Priya Sharma', email: 'priya.sharma@gmail.com', phone: '+91 98765 43210',
    totalVisits: 28, totalSpent: 42500, loyaltyPoints: 850, rating: 4.9,
    lastVisit: 'May 22, 2026', joinDate: 'Jan 2024', tier: 'gold',
    preferredServices: ['Balayage', 'Hair Spa'],
    appointments: [
      { id: 101, date: 'May 22, 2026', service: 'Balayage Coloring', staff: 'Emma Watson', amount: 2500, status: 'completed' },
      { id: 102, date: 'Apr 18, 2026', service: 'Hair Spa Treatment', staff: 'Emma Watson', amount: 1200, status: 'completed' },
      { id: 103, date: 'Mar 10, 2026', service: 'Precision Haircut', staff: 'Liam Neeson', amount: 800, status: 'completed' },
      { id: 104, date: 'Jun 02, 2026', service: 'Keratin Treatment', staff: 'Emma Watson', amount: 3500, status: 'upcoming' },
    ]
  },
  {
    id: 2, name: 'Rohan Mehra', email: 'rohan.mehra@outlook.com', phone: '+91 91234 56789',
    totalVisits: 15, totalSpent: 18600, loyaltyPoints: 372, rating: 4.7,
    lastVisit: 'May 20, 2026', joinDate: 'Mar 2024', tier: 'silver',
    preferredServices: ['Beard Trim', 'Haircut'],
    appointments: [
      { id: 201, date: 'May 20, 2026', service: 'Beard Trim & Styling', staff: 'Liam Neeson', amount: 450, status: 'completed' },
      { id: 202, date: 'Apr 28, 2026', service: 'Classic Haircut', staff: 'Brad Pitt', amount: 600, status: 'completed' },
    ]
  },
  {
    id: 3, name: 'Ananya Iyer', email: 'ananya.iyer@yahoo.com', phone: '+91 88900 12345',
    totalVisits: 42, totalSpent: 78900, loyaltyPoints: 1580, rating: 5.0,
    lastVisit: 'May 24, 2026', joinDate: 'Sep 2023', tier: 'platinum',
    preferredServices: ['Bridal Makeup', 'Nail Art'],
    appointments: [
      { id: 301, date: 'May 24, 2026', service: 'Bridal Makeup Trial', staff: 'Brad Pitt', amount: 4500, status: 'completed' },
      { id: 302, date: 'May 15, 2026', service: 'Nail Art Full Set', staff: 'Olivia Jones', amount: 1200, status: 'completed' },
      { id: 303, date: 'Jun 15, 2026', service: 'Bridal Makeup (Wedding Day)', staff: 'Brad Pitt', amount: 12000, status: 'upcoming' },
    ]
  },
  {
    id: 4, name: 'Kabir Thapar', email: 'kabir.t@proton.me', phone: '+91 97600 88800',
    totalVisits: 8, totalSpent: 7200, loyaltyPoints: 144, rating: 4.5,
    lastVisit: 'May 05, 2026', joinDate: 'Nov 2024', tier: 'bronze',
    preferredServices: ['Hair Color', 'Haircut'],
    appointments: [
      { id: 401, date: 'May 05, 2026', service: 'Hair Coloring', staff: 'Emma Watson', amount: 1800, status: 'completed' },
    ]
  },
  {
    id: 5, name: 'Sneha Kulkarni', email: 'sneha.k@gmail.com', phone: '+91 99001 77600',
    totalVisits: 19, totalSpent: 31400, loyaltyPoints: 628, rating: 4.8,
    lastVisit: 'May 18, 2026', joinDate: 'Jun 2024', tier: 'silver',
    preferredServices: ['Facial', 'Waxing'],
    appointments: [
      { id: 501, date: 'May 18, 2026', service: 'Hydrating Facial', staff: 'Sophia Loren', amount: 1600, status: 'completed' },
      { id: 502, date: 'Apr 20, 2026', service: 'Full Body Waxing', staff: 'Sophia Loren', amount: 2200, status: 'completed' },
    ]
  },
  {
    id: 6, name: 'Arjun Nair', email: 'arjun.nair@gmail.com', phone: '+91 80123 45678',
    totalVisits: 5, totalSpent: 4100, loyaltyPoints: 82, rating: 4.3,
    lastVisit: 'Apr 30, 2026', joinDate: 'Feb 2025', tier: 'bronze',
    preferredServices: ['Haircut'],
    appointments: [
      { id: 601, date: 'Apr 30, 2026', service: 'Classic Haircut', staff: 'Brad Pitt', amount: 600, status: 'completed' },
    ]
  },
]

// ─── Tier config ─────────────────────────────────────────────
const TIER_CONFIG = {
  platinum: { label: 'Platinum', color: 'bg-violet-100 text-violet-700 border-violet-200', dot: 'bg-violet-500' },
  gold:     { label: 'Gold',     color: 'bg-amber-100 text-amber-700 border-amber-200',   dot: 'bg-amber-500' },
  silver:   { label: 'Silver',   color: 'bg-slate-100 text-slate-600 border-slate-200',   dot: 'bg-slate-400' },
  bronze:   { label: 'Bronze',   color: 'bg-orange-100 text-orange-700 border-orange-200', dot: 'bg-orange-400' },
}

// ─── Helper: Initials avatar bg ──────────────────────────────
function getAvatarBg(name) {
  const colors = [
    'bg-teal-600 text-white', 'bg-indigo-600 text-white',
    'bg-rose-600 text-white', 'bg-amber-600 text-white',
    'bg-sky-600 text-white', 'bg-purple-600 text-white',
  ]
  let hash = 0
  for (let i = 0; i < (name?.length || 0); i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

function getInitials(name) {
  return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'CU'
}

// ─── Customer Detail Modal ────────────────────────────────────
function CustomerDetailModal({ customer, onClose }) {
  const [activeTab, setActiveTab] = useState('overview')

  const completedVisits = customer.appointments.filter(a => a.status === 'completed').length
  const upcomingVisits = customer.appointments.filter(a => a.status === 'upcoming').length
  const tier = TIER_CONFIG[customer.tier]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="relative bg-gradient-to-br from-teal-600 to-teal-700 p-6 text-white">
            <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-xl bg-white/10 hover:bg-white/20 transition cursor-pointer">
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black border-2 border-white/20 shadow-lg ${getAvatarBg(customer.name)}`}>
                {getInitials(customer.name)}
              </div>
              <div>
                <h2 className="text-lg font-black tracking-tight">{customer.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full border ${tier.color}`}>
                    {tier.label}
                  </span>
                  <span className="text-white/70 text-xs font-semibold">Member since {customer.joinDate}</span>
                </div>
              </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-3 mt-5">
              {[
                { label: 'Total Visits', value: customer.totalVisits },
                { label: 'Total Spent', value: `₹${customer.totalSpent.toLocaleString('en-IN')}` },
                { label: 'Loyalty Pts', value: customer.loyaltyPoints },
              ].map(stat => (
                <div key={stat.label} className="bg-white/10 rounded-xl p-3 text-center border border-white/10">
                  <p className="text-[10px] font-bold uppercase text-white/60">{stat.label}</p>
                  <p className="text-base font-black mt-0.5">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-3 border-b border-slate-100 bg-slate-50/50">
            {[{ id: 'overview', label: 'Overview' }, { id: 'appointments', label: `Appointments (${customer.appointments.length})` }].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition cursor-pointer ${
                  activeTab === tab.id ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Body */}
          <div className="overflow-y-auto flex-1 p-6">
            {activeTab === 'overview' && (
              <div className="space-y-5">
                {/* Contact */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Contact Info</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Email</p>
                        <p className="text-xs font-semibold text-slate-700 mt-0.5">{customer.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Phone</p>
                        <p className="text-xs font-semibold text-slate-700 mt-0.5">{customer.phone}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preferred Services */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Preferred Services</h4>
                  <div className="flex flex-wrap gap-2">
                    {customer.preferredServices.map(svc => (
                      <span key={svc} className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 border border-teal-100 text-teal-700 rounded-xl text-xs font-semibold">
                        <Scissors className="w-3 h-3" /> {svc}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                      <p className="text-[10px] text-amber-700 font-bold uppercase">Rating</p>
                    </div>
                    <p className="text-2xl font-black text-amber-700">{customer.rating} <span className="text-xs font-medium text-amber-500">/ 5</span></p>
                  </div>
                  <div className="p-4 bg-violet-50 border border-violet-100 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <Gift className="w-4 h-4 text-violet-500" />
                      <p className="text-[10px] text-violet-700 font-bold uppercase">Loyalty Points</p>
                    </div>
                    <p className="text-2xl font-black text-violet-700">{customer.loyaltyPoints}</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'appointments' && (
              <div className="space-y-3">
                {customer.appointments.map(apt => (
                  <div key={apt.id} className="flex items-start justify-between p-4 border border-slate-100 rounded-xl hover:border-slate-200 transition-colors bg-slate-50/30">
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 p-1.5 rounded-lg ${apt.status === 'upcoming' ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'}`}>
                        <Calendar className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">{apt.service}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">with {apt.staff} · {apt.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-slate-800">₹{apt.amount.toLocaleString('en-IN')}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 inline-block ${apt.status === 'upcoming' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {apt.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ─── Customer Card ────────────────────────────────────────────
function CustomerCard({ customer, onClick }) {
  const tier = TIER_CONFIG[customer.tier]
  return (
    <motion.div
      whileHover={{ y: -3, boxShadow: '0 16px 24px -4px rgb(0 0 0 / 0.1)' }}
      whileTap={{ scale: 0.99 }}
      onClick={() => onClick(customer)}
      className="relative bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm cursor-pointer group overflow-hidden hover:border-slate-300 transition-colors"
    >
      {/* Glow */}
      <div className="absolute -right-12 -top-12 w-24 h-24 bg-teal-500/5 rounded-full blur-2xl group-hover:bg-teal-500/10 transition duration-500" />

      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-black shadow-sm ${getAvatarBg(customer.name)}`}>
          {getInitials(customer.name)}
        </div>
        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase border rounded-full ${tier.color}`}>
          {tier.label}
        </span>
      </div>

      <h3 className="font-bold text-slate-900 tracking-tight group-hover:text-teal-600 transition-colors">{customer.name}</h3>
      <p className="text-xs text-slate-400 font-medium mt-0.5 truncate">{customer.email}</p>

      <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-100">
        <div>
          <p className="text-[10px] text-slate-400 font-bold uppercase">Visits</p>
          <p className="text-sm font-black text-slate-800 mt-0.5">{customer.totalVisits}</p>
        </div>
        <div>
          <p className="text-[10px] text-slate-400 font-bold uppercase">Spent</p>
          <p className="text-sm font-black text-slate-800 mt-0.5">₹{(customer.totalSpent / 1000).toFixed(1)}k</p>
        </div>
        <div>
          <p className="text-[10px] text-slate-400 font-bold uppercase">Rating</p>
          <div className="flex items-center gap-1 mt-0.5">
            <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
            <p className="text-sm font-black text-slate-800">{customer.rating}</p>
          </div>
        </div>
        <div>
          <p className="text-[10px] text-slate-400 font-bold uppercase">Loyalty</p>
          <div className="flex items-center gap-1 mt-0.5">
            <Gift className="w-3 h-3 text-violet-500" />
            <p className="text-sm font-black text-slate-800">{customer.loyaltyPoints} pts</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 text-xs font-bold text-slate-400 group-hover:text-teal-600 transition-colors">
        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {customer.lastVisit}</span>
        <ArrowUpRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
      </div>
    </motion.div>
  )
}

// ─── Main View ───────────────────────────────────────────────
export default function CustomersView() {
  const [search, setSearch] = useState('')
  const [tierFilter, setTierFilter] = useState('all')
  const [selectedCustomer, setSelectedCustomer] = useState(null)

  const filteredCustomers = useMemo(() => {
    return MOCK_CUSTOMERS.filter(c => {
      const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.includes(search)
      const matchTier = tierFilter === 'all' || c.tier === tierFilter
      return matchSearch && matchTier
    })
  }, [search, tierFilter])

  // Summary stats
  const totalCustomers = MOCK_CUSTOMERS.length
  const totalRevenue = MOCK_CUSTOMERS.reduce((sum, c) => sum + c.totalSpent, 0)
  const avgVisits = Math.round(MOCK_CUSTOMERS.reduce((sum, c) => sum + c.totalVisits, 0) / MOCK_CUSTOMERS.length)
  const platinumCount = MOCK_CUSTOMERS.filter(c => c.tier === 'platinum').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Customers"
          subtitle="View and manage all customer profiles, loyalty tiers, and visit history."
        />
        <BaseButton leftIcon={Plus} size="sm">
          Add Customer
        </BaseButton>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Customers', value: totalCustomers, sub: 'registered', icon: Users, color: 'indigo' },
          { label: 'Total Revenue', value: `₹${(totalRevenue / 1000).toFixed(0)}k`, sub: 'lifetime', icon: TrendingUp, color: 'teal' },
          { label: 'Avg. Visits / Customer', value: avgVisits, sub: 'visits', icon: Calendar, color: 'amber' },
          { label: 'Platinum Members', value: platinumCount, sub: 'VIP', icon: Award, color: 'violet' },
        ].map(stat => {
          const Icon = stat.icon
          const colorMap = {
            indigo: 'bg-indigo-50 border-indigo-100 text-indigo-600',
            teal: 'bg-teal-50 border-teal-100 text-teal-600',
            amber: 'bg-amber-50 border-amber-100 text-amber-600',
            violet: 'bg-violet-50 border-violet-100 text-violet-600',
          }
          return (
            <div key={stat.label} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm relative overflow-hidden group">
              <div className={`absolute right-4 top-4 p-2 rounded-xl border ${colorMap[stat.color]}`}>
                <Icon className="w-4 h-4" />
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
              <h3 className="text-2xl font-black text-slate-800 mt-2">{stat.value}</h3>
              <p className="text-xs text-slate-400 font-medium mt-0.5">{stat.sub}</p>
            </div>
          )
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email or phone..."
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        {/* Tier Filter */}
        <div className="flex gap-2 flex-wrap">
          {['all', 'platinum', 'gold', 'silver', 'bronze'].map(tier => (
            <button
              key={tier}
              onClick={() => setTierFilter(tier)}
              className={`px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-xl border transition cursor-pointer ${
                tierFilter === tier
                  ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-800'
              }`}
            >
              {tier === 'all' ? 'All Tiers' : tier}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-500">
          Showing <span className="text-slate-800 font-bold">{filteredCustomers.length}</span> of {totalCustomers} customers
        </p>
      </div>

      {/* Customer Grid */}
      <AnimatePresence mode="wait">
        {filteredCustomers.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
          >
            {filteredCustomers.map((customer, i) => (
              <motion.div
                key={customer.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <CustomerCard customer={customer} onClick={setSelectedCustomer} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16 text-slate-400 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50"
          >
            <Users className="w-10 h-10 mb-3 text-slate-300" />
            <p className="font-bold text-slate-500">No customers found</p>
            <p className="text-sm mt-1">Try adjusting your search or filter.</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <CustomerDetailModal
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
        />
      )}
    </div>
  )
}
