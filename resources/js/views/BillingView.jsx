import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Receipt, Plus, Search, Filter, X, Download,
  CheckCircle2, Clock, AlertCircle, DollarSign,
  TrendingUp, CreditCard, FileText, ChevronDown,
  Printer, Send, Eye, IndianRupee
} from 'lucide-react'
import PageHeader from '../components/ui/PageHeader.jsx'
import BaseButton from '../components/ui/BaseButton.jsx'

// ─── Mock Invoices ────────────────────────────────────────────
const MOCK_INVOICES = [
  {
    id: 'INV-2026-0542', customer: 'Priya Sharma', phone: '+91 98765 43210',
    date: 'May 24, 2026', dueDate: 'May 24, 2026',
    services: [
      { name: 'Balayage Coloring', qty: 1, price: 2500, gstRate: 18 },
      { name: 'Hair Spa Treatment', qty: 1, price: 1200, gstRate: 18 },
    ],
    paymentMethod: 'UPI', status: 'paid', staff: 'Emma Watson',
  },
  {
    id: 'INV-2026-0541', customer: 'Ananya Iyer', phone: '+91 88900 12345',
    date: 'May 24, 2026', dueDate: 'May 24, 2026',
    services: [
      { name: 'Bridal Makeup Trial', qty: 1, price: 4500, gstRate: 18 },
    ],
    paymentMethod: 'Card', status: 'paid', staff: 'Brad Pitt',
  },
  {
    id: 'INV-2026-0540', customer: 'Rohan Mehra', phone: '+91 91234 56789',
    date: 'May 23, 2026', dueDate: 'May 23, 2026',
    services: [
      { name: 'Beard Trim & Styling', qty: 1, price: 450, gstRate: 18 },
      { name: 'Classic Haircut',      qty: 1, price: 600, gstRate: 18 },
    ],
    paymentMethod: 'Cash', status: 'paid', staff: 'Liam Neeson',
  },
  {
    id: 'INV-2026-0539', customer: 'Sneha Kulkarni', phone: '+91 99001 77600',
    date: 'May 22, 2026', dueDate: 'May 29, 2026',
    services: [
      { name: 'Hydrating Facial', qty: 1, price: 1600, gstRate: 18 },
      { name: 'Full Body Waxing', qty: 1, price: 2200, gstRate: 18 },
    ],
    paymentMethod: null, status: 'pending', staff: 'Sophia Loren',
  },
  {
    id: 'INV-2026-0538', customer: 'Kabir Thapar', phone: '+91 97600 88800',
    date: 'May 20, 2026', dueDate: 'May 20, 2026',
    services: [
      { name: 'Hair Coloring', qty: 1, price: 1800, gstRate: 18 },
    ],
    paymentMethod: 'UPI', status: 'paid', staff: 'Emma Watson',
  },
  {
    id: 'INV-2026-0537', customer: 'Arjun Nair', phone: '+91 80123 45678',
    date: 'May 18, 2026', dueDate: 'May 25, 2026',
    services: [
      { name: 'Classic Haircut', qty: 1, price: 600, gstRate: 18 },
      { name: 'Beard Trim',      qty: 1, price: 350, gstRate: 18 },
    ],
    paymentMethod: null, status: 'overdue', staff: 'Brad Pitt',
  },
]

// ─── Helpers ──────────────────────────────────────────────────
const calcTotals = (services) => {
  const subtotal = services.reduce((s, svc) => s + svc.price * svc.qty, 0)
  const gst      = services.reduce((s, svc) => s + (svc.price * svc.qty * svc.gstRate) / 100, 0)
  return { subtotal, gst, total: subtotal + gst }
}

const STATUS_CONFIG = {
  paid:    { label: 'Paid',    icon: CheckCircle2, bg: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
  pending: { label: 'Pending', icon: Clock,        bg: 'bg-amber-50 border-amber-200 text-amber-700'       },
  overdue: { label: 'Overdue', icon: AlertCircle,  bg: 'bg-rose-50 border-rose-200 text-rose-700'          },
}

const PAYMENT_ICONS = {
  UPI:  '📲', Card: '💳', Cash: '💵', null: '—'
}

// ─── Invoice Detail Modal ─────────────────────────────────────
function InvoiceModal({ invoice, onClose }) {
  const { subtotal, gst, total } = calcTotals(invoice.services)
  const status = STATUS_CONFIG[invoice.status]
  const StatusIcon = status.icon

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
          className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-slate-900">{invoice.id}</h2>
                <span className={`flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase border rounded-full ${status.bg}`}>
                  <StatusIcon className="w-2.5 h-2.5" /> {status.label}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Issued: {invoice.date} · Due: {invoice.dueDate}</p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 transition cursor-pointer">
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </div>

          {/* Customer + Staff */}
          <div className="p-6 grid grid-cols-2 gap-4 border-b border-slate-100">
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Customer</p>
              <p className="text-sm font-bold text-slate-900 mt-0.5">{invoice.customer}</p>
              <p className="text-xs text-slate-500">{invoice.phone}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Served By</p>
              <p className="text-sm font-bold text-slate-900 mt-0.5">{invoice.staff}</p>
              <p className="text-xs text-slate-500">{invoice.paymentMethod ? `${PAYMENT_ICONS[invoice.paymentMethod]} ${invoice.paymentMethod}` : '— Unpaid'}</p>
            </div>
          </div>

          {/* Services table */}
          <div className="p-6 border-b border-slate-100">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
                  <th className="pb-2 text-left">Service</th>
                  <th className="pb-2 text-center">Qty</th>
                  <th className="pb-2 text-right">Price</th>
                  <th className="pb-2 text-right">GST ({invoice.services[0]?.gstRate}%)</th>
                  <th className="pb-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {invoice.services.map((svc, i) => {
                  const lineGst = (svc.price * svc.qty * svc.gstRate) / 100
                  return (
                    <tr key={i}>
                      <td className="py-2.5 font-bold text-slate-900">{svc.name}</td>
                      <td className="py-2.5 text-center">{svc.qty}</td>
                      <td className="py-2.5 text-right">₹{svc.price.toLocaleString('en-IN')}</td>
                      <td className="py-2.5 text-right">₹{lineGst.toLocaleString('en-IN')}</td>
                      <td className="py-2.5 text-right font-bold text-slate-900">₹{(svc.price * svc.qty + lineGst).toLocaleString('en-IN')}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="px-6 py-4 space-y-2 text-xs border-b border-slate-100">
            <div className="flex justify-between text-slate-600 font-medium">
              <span>Subtotal</span>
              <span>₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-slate-600 font-medium">
              <span>GST (18%)</span>
              <span>₹{gst.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-sm font-black text-slate-900 border-t border-slate-200 pt-2 mt-2">
              <span>Total</span>
              <span className="text-teal-700">₹{total.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="p-4 flex gap-2 justify-end">
            <BaseButton variant="secondary" size="sm" leftIcon={Printer}>Print</BaseButton>
            <BaseButton variant="secondary" size="sm" leftIcon={Download}>Download PDF</BaseButton>
            {invoice.status !== 'paid' && (
              <BaseButton size="sm" leftIcon={CheckCircle2}>Mark as Paid</BaseButton>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ─── Invoice Row ──────────────────────────────────────────────
function InvoiceRow({ invoice, onClick }) {
  const { total } = calcTotals(invoice.services)
  const status = STATUS_CONFIG[invoice.status]
  const StatusIcon = status.icon

  return (
    <motion.tr
      whileHover={{ backgroundColor: 'rgba(248,250,252,0.8)' }}
      className="border-b border-slate-100 cursor-pointer"
      onClick={() => onClick(invoice)}
    >
      <td className="py-3.5 px-4">
        <span className="font-bold text-teal-700 text-xs">{invoice.id}</span>
      </td>
      <td className="py-3.5 px-4">
        <p className="text-xs font-bold text-slate-900">{invoice.customer}</p>
        <p className="text-[10px] text-slate-400 mt-0.5">{invoice.phone}</p>
      </td>
      <td className="py-3.5 px-4 text-xs font-semibold text-slate-600">{invoice.date}</td>
      <td className="py-3.5 px-4 text-xs font-semibold text-slate-600">{invoice.staff}</td>
      <td className="py-3.5 px-4 text-xs text-slate-600 font-medium">
        {invoice.paymentMethod ? `${PAYMENT_ICONS[invoice.paymentMethod]} ${invoice.paymentMethod}` : '—'}
      </td>
      <td className="py-3.5 px-4 text-right text-xs font-black text-slate-900">
        ₹{total.toLocaleString('en-IN')}
      </td>
      <td className="py-3.5 px-4">
        <span className={`flex items-center gap-1 w-fit px-2 py-0.5 text-[10px] font-bold uppercase border rounded-full ${status.bg}`}>
          <StatusIcon className="w-2.5 h-2.5" /> {status.label}
        </span>
      </td>
      <td className="py-3.5 px-4 text-right">
        <button className="p-1.5 rounded-lg bg-slate-100 hover:bg-teal-50 hover:text-teal-600 text-slate-400 transition cursor-pointer">
          <Eye className="w-3.5 h-3.5" />
        </button>
      </td>
    </motion.tr>
  )
}

// ─── Main View ───────────────────────────────────────────────
export default function BillingView() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedInvoice, setSelectedInvoice] = useState(null)

  const filtered = useMemo(() => {
    return MOCK_INVOICES.filter(inv => {
      const matchSearch = !search ||
        inv.id.toLowerCase().includes(search.toLowerCase()) ||
        inv.customer.toLowerCase().includes(search.toLowerCase())
      const matchStatus = statusFilter === 'all' || inv.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [search, statusFilter])

  // Summary stats
  const totalRevenue = MOCK_INVOICES.filter(i => i.status === 'paid').reduce((sum, inv) => {
    const { total } = calcTotals(inv.services)
    return sum + total
  }, 0)
  const pendingAmt = MOCK_INVOICES.filter(i => i.status !== 'paid').reduce((sum, inv) => {
    const { total } = calcTotals(inv.services)
    return sum + total
  }, 0)
  const gstCollected = MOCK_INVOICES.filter(i => i.status === 'paid').reduce((sum, inv) => {
    const { gst } = calcTotals(inv.services)
    return sum + gst
  }, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Billing & Invoices"
          subtitle="Manage invoices, track payments, and monitor GST collection."
        />
        <BaseButton leftIcon={Plus} size="sm">New Invoice</BaseButton>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Revenue Collected', value: `₹${(totalRevenue / 1000).toFixed(1)}k`, icon: CheckCircle2, color: 'teal' },
          { label: 'Pending Amount',    value: `₹${(pendingAmt / 1000).toFixed(1)}k`,   icon: Clock,         color: 'amber' },
          { label: 'GST Collected',     value: `₹${(gstCollected / 1000).toFixed(1)}k`, icon: IndianRupee,   color: 'indigo' },
          { label: 'Total Invoices',    value: MOCK_INVOICES.length,                     icon: FileText,      color: 'violet' },
        ].map(stat => {
          const Icon = stat.icon
          const colorMap = {
            teal:   'bg-teal-50 border-teal-100 text-teal-600',
            amber:  'bg-amber-50 border-amber-100 text-amber-600',
            indigo: 'bg-indigo-50 border-indigo-100 text-indigo-600',
            violet: 'bg-violet-50 border-violet-100 text-violet-600',
          }
          return (
            <div key={stat.label} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm relative overflow-hidden">
              <div className={`absolute right-4 top-4 p-2 rounded-xl border ${colorMap[stat.color]}`}>
                <Icon className="w-4 h-4" />
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
              <h3 className="text-2xl font-black text-slate-800 mt-2">{stat.value}</h3>
            </div>
          )
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search invoice ID or customer..."
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <div className="flex gap-2">
          {['all', 'paid', 'pending', 'overdue'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-xl border transition cursor-pointer ${
                statusFilter === s
                  ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-800'
              }`}
            >
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                {['Invoice ID', 'Customer', 'Date', 'Staff', 'Payment', 'Amount', 'Status', ''].map(col => (
                  <th key={col} className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map(invoice => (
                  <InvoiceRow key={invoice.id} invoice={invoice} onClick={setSelectedInvoice} />
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400">
                    <Receipt className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold">No invoices found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <InvoiceModal invoice={selectedInvoice} onClose={() => setSelectedInvoice(null)} />
      )}
    </div>
  )
}
