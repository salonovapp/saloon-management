import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Package, Plus, Search, X, AlertTriangle,
  TrendingDown, ShoppingCart, Archive, RefreshCw,
  ChevronRight, Filter, Edit2, Trash2, Eye,
  CheckCircle2, BarChart2, Layers
} from 'lucide-react'
import PageHeader from '../components/ui/PageHeader.jsx'
import BaseButton from '../components/ui/BaseButton.jsx'
import BaseBadge from '../components/ui/BaseBadge.jsx'

// ─── Mock Inventory ───────────────────────────────────────────
const MOCK_PRODUCTS = [
  { id: 1, name: 'Wella Koleston Perfect 60g', sku: 'WKP-60G-001', category: 'Hair Color', brand: 'Wella', unit: 'tube', stock: 28, minStock: 10, maxStock: 60, costPrice: 320, sellingPrice: 580, supplier: 'Wella India' },
  { id: 2, name: 'Schwarzkopf BlondMe Bleach', sku: 'SBB-500G-002', category: 'Bleach', brand: 'Schwarzkopf', unit: 'pack', stock: 4, minStock: 8, maxStock: 30, costPrice: 780, sellingPrice: 1200, supplier: 'Henkel India' },
  { id: 3, name: 'Loreal Keratin Smoothing 1L', sku: 'LKS-1L-003', category: 'Treatment', brand: "L'Oreal", unit: 'bottle', stock: 12, minStock: 5, maxStock: 25, costPrice: 2200, sellingPrice: 3800, supplier: "L'Oreal Pro" },
  { id: 4, name: 'OPI Nail Lacquer 15ml', sku: 'OPI-NL-004', category: 'Nail', brand: 'OPI', unit: 'bottle', stock: 87, minStock: 20, maxStock: 120, costPrice: 380, sellingPrice: 680, supplier: 'OPI Imports' },
  { id: 5, name: 'Schwarzkopf BLONDME Developer', sku: 'SBD-1L-005', category: 'Developer', brand: 'Schwarzkopf', unit: 'bottle', stock: 3, minStock: 6, maxStock: 20, costPrice: 420, sellingPrice: 750, supplier: 'Henkel India' },
  { id: 6, name: 'Matrix Biolage Shampoo 1L', sku: 'MBS-1L-006', category: 'Shampoo', brand: 'Matrix', unit: 'bottle', stock: 18, minStock: 8, maxStock: 40, costPrice: 560, sellingPrice: 950, supplier: 'Matrix India' },
  { id: 7, name: 'Wella EIMI Volume Spray', sku: 'WEV-300ML-007', category: 'Styling', brand: 'Wella', unit: 'can', stock: 1, minStock: 5, maxStock: 25, costPrice: 480, sellingPrice: 820, supplier: 'Wella India' },
  { id: 8, name: 'Disposable Neck Strips 100pc', sku: 'DNS-100-008', category: 'Consumables', brand: 'Generic', unit: 'pack', stock: 45, minStock: 15, maxStock: 100, costPrice: 120, sellingPrice: 220, supplier: 'Local Supplier' },
  { id: 9, name: 'Foil Sheets (500 pcs)', sku: 'FLS-500-009', category: 'Consumables', brand: 'Generic', unit: 'pack', stock: 6, minStock: 5, maxStock: 30, costPrice: 280, sellingPrice: 480, supplier: 'Local Supplier' },
  { id: 10, name: 'Colour Touch Vibration Toner', sku: 'CVT-60G-010', category: 'Hair Color', brand: 'Wella', unit: 'tube', stock: 34, minStock: 10, maxStock: 60, costPrice: 290, sellingPrice: 520, supplier: 'Wella India' },
]

const CATEGORIES = ['All', 'Hair Color', 'Bleach', 'Treatment', 'Nail', 'Developer', 'Shampoo', 'Styling', 'Consumables']

// ─── Stock Level indicator ────────────────────────────────────
function getStockStatus(stock, minStock, maxStock) {
  if (stock === 0)         return { label: 'Out of Stock', variant: 'danger',  color: 'text-rose-600',  bg: 'bg-rose-50 border-rose-200' }
  if (stock <= minStock)   return { label: 'Low Stock',    variant: 'warning', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' }
  if (stock >= maxStock * 0.8) return { label: 'Well Stocked', variant: 'success', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' }
  return { label: 'In Stock', variant: 'info', color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-200' }
}

// ─── Category color ───────────────────────────────────────────
const CAT_COLORS = {
  'Hair Color': 'bg-teal-100 text-teal-700',
  'Bleach':     'bg-amber-100 text-amber-700',
  'Treatment':  'bg-violet-100 text-violet-700',
  'Nail':       'bg-rose-100 text-rose-700',
  'Developer':  'bg-indigo-100 text-indigo-700',
  'Shampoo':    'bg-sky-100 text-sky-700',
  'Styling':    'bg-orange-100 text-orange-700',
  'Consumables':'bg-slate-100 text-slate-600',
}

// ─── Product Row ──────────────────────────────────────────────
function ProductRow({ product, i }) {
  const status = getStockStatus(product.stock, product.minStock, product.maxStock)
  const stockPercent = Math.min(Math.round((product.stock / product.maxStock) * 100), 100)
  const barColor = product.stock === 0 ? 'bg-rose-400' :
    product.stock <= product.minStock ? 'bg-amber-400' : 'bg-teal-500'

  return (
    <motion.tr
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.04 }}
      whileHover={{ backgroundColor: 'rgba(248,250,252,0.8)' }}
      className="border-b border-slate-100 group"
    >
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors">
            <Package className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 leading-tight">{product.name}</p>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">{product.sku}</p>
          </div>
        </div>
      </td>
      <td className="py-4 px-4">
        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${CAT_COLORS[product.category] || 'bg-slate-100 text-slate-600'}`}>
          {product.category}
        </span>
      </td>
      <td className="py-4 px-4 text-xs font-semibold text-slate-600">{product.brand}</td>
      <td className="py-4 px-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-[10px] font-bold">
            <span className={status.color}>{product.stock} {product.unit}s</span>
            <span className="text-slate-400">/ {product.maxStock}</span>
          </div>
          <div className="w-24 bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${stockPercent}%` }} />
          </div>
        </div>
      </td>
      <td className="py-4 px-4">
        <span className={`flex items-center w-fit gap-1 px-2 py-0.5 text-[10px] font-bold uppercase border rounded-full ${status.bg} ${status.color}`}>
          {product.stock === 0 && <AlertTriangle className="w-2.5 h-2.5" />}
          {product.stock <= product.minStock && product.stock > 0 && <TrendingDown className="w-2.5 h-2.5" />}
          {status.label}
        </span>
      </td>
      <td className="py-4 px-4 text-right">
        <p className="text-[10px] text-slate-400 font-bold uppercase">Cost / Sell</p>
        <p className="text-xs font-black text-slate-900 mt-0.5">₹{product.costPrice} / ₹{product.sellingPrice}</p>
      </td>
      <td className="py-4 px-4 text-xs font-medium text-slate-500">{product.supplier}</td>
      <td className="py-4 px-4">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
          <button className="p-1.5 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-400 transition cursor-pointer">
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button className="p-1.5 rounded-lg bg-slate-100 hover:bg-teal-50 hover:text-teal-600 text-slate-400 transition cursor-pointer">
            <ShoppingCart className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </motion.tr>
  )
}

// ─── Main View ───────────────────────────────────────────────
export default function InventoryView() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')

  const filtered = useMemo(() => {
    return MOCK_PRODUCTS.filter(p => {
      const matchSearch = !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase()) ||
        p.brand.toLowerCase().includes(search.toLowerCase())
      const matchCat = category === 'All' || p.category === category
      return matchSearch && matchCat
    })
  }, [search, category])

  const totalProducts   = MOCK_PRODUCTS.length
  const lowStockCount   = MOCK_PRODUCTS.filter(p => p.stock > 0 && p.stock <= p.minStock).length
  const outOfStockCount = MOCK_PRODUCTS.filter(p => p.stock === 0).length
  const totalValue      = MOCK_PRODUCTS.reduce((sum, p) => sum + (p.costPrice * p.stock), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Inventory"
          subtitle="Track products, monitor stock levels, and manage restocking."
        />
        <div className="flex gap-2">
          <BaseButton variant="secondary" size="sm" leftIcon={RefreshCw}>Restock Order</BaseButton>
          <BaseButton size="sm" leftIcon={Plus}>Add Product</BaseButton>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Products',   value: totalProducts,                             icon: Layers,        color: 'indigo', sub: 'SKUs tracked' },
          { label: 'Inventory Value',  value: `₹${(totalValue / 1000).toFixed(1)}k`,     icon: BarChart2,     color: 'teal',   sub: 'at cost price' },
          { label: 'Low Stock Alerts', value: lowStockCount,                             icon: TrendingDown,  color: 'amber',  sub: 'need attention' },
          { label: 'Out of Stock',     value: outOfStockCount,                           icon: AlertTriangle, color: 'rose',   sub: 'urgent restock' },
        ].map(stat => {
          const Icon = stat.icon
          const colorMap = {
            indigo: 'bg-indigo-50 border-indigo-100 text-indigo-600',
            teal:   'bg-teal-50 border-teal-100 text-teal-600',
            amber:  'bg-amber-50 border-amber-100 text-amber-600',
            rose:   'bg-rose-50 border-rose-100 text-rose-600',
          }
          return (
            <div key={stat.label} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm relative overflow-hidden">
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

      {/* Low Stock Banner */}
      {(lowStockCount + outOfStockCount) > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl"
        >
          <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-xs font-bold text-amber-800">
              {outOfStockCount > 0 && `${outOfStockCount} product(s) are out of stock. `}
              {lowStockCount > 0 && `${lowStockCount} product(s) are running low.`}
            </p>
            <p className="text-[10px] text-amber-700 mt-0.5">Consider placing a purchase order to avoid service disruptions.</p>
          </div>
          <BaseButton size="sm" variant="secondary" leftIcon={ShoppingCart} className="flex-shrink-0">
            Order Now
          </BaseButton>
        </motion.div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, SKU, or brand..."
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        {/* Category pills */}
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-2 text-xs font-bold rounded-xl border transition cursor-pointer ${
                category === cat
                  ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <p className="text-xs font-semibold text-slate-500">
        Showing <span className="text-slate-800 font-bold">{filtered.length}</span> of {totalProducts} products
      </p>

      {/* Products Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                {['Product', 'Category', 'Brand', 'Stock Level', 'Status', 'Price', 'Supplier', ''].map(col => (
                  <th key={col} className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((product, i) => (
                  <ProductRow key={product.id} product={product} i={i} />
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400">
                    <Package className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold">No products found</p>
                    <p className="text-sm mt-1">Try adjusting your search or filter.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
