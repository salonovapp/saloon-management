import React, { useState, useEffect } from 'react'
import { Calendar, DollarSign, Award, ThumbsUp, ChevronDown, Award as StarIcon, TrendingUp, Sparkles } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader.jsx'
import BaseSelect from '../../components/ui/BaseSelect.jsx'

export default function PerformanceView({ staffId, staffName }) {
  const [selectedMonth, setSelectedMonth] = useState('2026-05')
  const [loading, setLoading] = useState(false)
  const [performanceData, setPerformanceData] = useState(null)

  const monthOptions = [
    { value: '2026-05', label: 'May 2026' },
    { value: '2026-04', label: 'April 2026' },
    { value: '2026-03', label: 'March 2026' },
    { value: '2026-02', label: 'February 2026' },
  ]

  useEffect(() => {
    const fetchPerformance = async () => {
      setLoading(true)
      // Simulate loading latency
      await new Promise((resolve) => setTimeout(resolve, 800))

      // Setup simulated mock performance data
      const mockData = {
        '2026-05': {
          kpis: {
            revenue: 42500,
            appointments: 86,
            rating: 4.8,
            attendance: 98.2,
          },
          targets: {
            target: 50000,
            actual: 42500,
          },
          services: [
            { name: 'Balayage Hair Coloring', category: 'Hair', count: 24, revenue: 19200, share: 45.2 },
            { name: 'Advanced Haircut & Blowdry', category: 'Hair', count: 42, revenue: 16800, share: 39.5 },
            { name: 'Deep Conditioning Treatment', category: 'Hair', count: 12, revenue: 4800, share: 11.3 },
            { name: 'Beard Trim & Styling', category: 'Beard', count: 8, revenue: 1700, share: 4.0 },
          ],
          ratings: [
            { id: 1, customer: 'Aarav Mehta', rating: 5, comment: 'Excellent styling! Emma knew exactly what would suit my face shape.', date: 'May 24, 2026' },
            { id: 2, customer: 'Priya Sharma', rating: 5, comment: 'Very professional, the coloring is perfect and blends naturally.', date: 'May 23, 2026' },
            { id: 3, customer: 'John Wick', rating: 4, comment: 'Quick haircut. Good attention to detail.', date: 'May 22, 2026' },
            { id: 4, customer: 'Anjali Gupta', rating: 5, comment: 'Always a pleasure getting hair done by her. Highly recommend!', date: 'May 20, 2026' },
            { id: 5, customer: 'Vikram Singh', rating: 5, comment: 'Fantastic beard trim. Super neat.', date: 'May 18, 2026' },
            { id: 6, customer: 'Rohan Sen', rating: 4, comment: 'Friendly staff and good hair spa. Will visit again.', date: 'May 16, 2026' },
            { id: 7, customer: 'Sneha Patel', rating: 5, comment: 'Emma is the best hair artist in town!', date: 'May 14, 2026' },
            { id: 8, customer: 'David Miller', rating: 5, comment: 'Great execution of balayage. Extremely satisfied.', date: 'May 12, 2026' },
            { id: 9, customer: 'Meera Nair', rating: 3, comment: 'Styling was fine, but wait time was 15 minutes past appointment.', date: 'May 10, 2026' },
            { id: 10, customer: 'Kabir Thapar', rating: 5, comment: 'Precision cut. Five stars.', date: 'May 08, 2026' },
            { id: 11, customer: 'Rhea Kapoor', rating: 5, comment: 'Very careful and thorough job with styling.', date: 'May 06, 2026' },
            { id: 12, customer: 'Neel Roy', rating: 4, comment: 'Pleasant experience overall. Good service.', date: 'May 05, 2026' },
            { id: 13, customer: 'Shreya Shah', rating: 5, comment: 'Love my new look! Thanks Emma.', date: 'May 04, 2026' },
            { id: 14, customer: 'Sarah Connor', rating: 5, comment: 'Excellent conditioning treatment, left my hair super soft.', date: 'May 03, 2026' },
            { id: 15, customer: 'Rajesh Koothrapali', rating: 4, comment: 'Happy with the haircut. Fast service.', date: 'May 02, 2026' },
            { id: 16, customer: 'Tara Alisha', rating: 5, comment: 'Masterful hand with coloring. Very creative.', date: 'May 01, 2026' },
            { id: 17, customer: 'Tony Stark', rating: 5, comment: 'Top-tier haircut. Outstanding.', date: 'Apr 30, 2026' },
            { id: 18, customer: 'Bruce Wayne', rating: 5, comment: 'Professional staff. Quiet and premium experience.', date: 'Apr 28, 2026' },
            { id: 19, customer: 'Peter Parker', rating: 4, comment: 'A bit expensive but worth the quality.', date: 'Apr 26, 2026' },
            { id: 20, customer: 'Clark Kent', rating: 5, comment: 'Perfect, neat trim. Cleanest look I have had.', date: 'Apr 25, 2026' },
          ]
        },
        '2026-04': {
          kpis: {
            revenue: 38400,
            appointments: 74,
            rating: 4.9,
            attendance: 96.5,
          },
          targets: {
            target: 45000,
            actual: 38400,
          },
          services: [
            { name: 'Balayage Hair Coloring', category: 'Hair', count: 20, revenue: 16000, share: 41.7 },
            { name: 'Advanced Haircut & Blowdry', category: 'Hair', count: 38, revenue: 15200, share: 39.6 },
            { name: 'Deep Conditioning Treatment', category: 'Hair', count: 14, revenue: 5600, share: 14.6 },
            { name: 'Beard Trim & Styling', category: 'Beard', count: 7, revenue: 1600, share: 4.1 },
          ],
          ratings: [
            { id: 1, customer: 'Tony Stark', rating: 5, comment: 'Top-tier haircut. Outstanding.', date: 'Apr 30, 2026' },
            { id: 2, customer: 'Bruce Wayne', rating: 5, comment: 'Professional staff. Quiet and premium experience.', date: 'Apr 28, 2026' },
            { id: 3, customer: 'Peter Parker', rating: 4, comment: 'A bit expensive but worth the quality.', date: 'Apr 26, 2026' },
            { id: 4, customer: 'Clark Kent', rating: 5, comment: 'Perfect, neat trim. Cleanest look I have had.', date: 'Apr 25, 2026' },
          ]
        }
      }

      setPerformanceData(mockData[selectedMonth] || mockData['2026-05'])
      setLoading(false)
    }

    fetchPerformance()
  }, [selectedMonth])

  // Formatting utils
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val)
  }

  const getTargetPercent = () => {
    if (!performanceData) return 0
    const { actual, target } = performanceData.targets
    return Math.min(Math.round((actual / target) * 100), 100)
  }

  return (
    <div className="space-y-6">
      {/* Header and Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title={staffName ? `${staffName}'s Performance` : 'Staff Performance'}
          subtitle="Track key indicators, target achievement progress, and customer reviews."
        />
        <div className="w-48 self-start sm:self-center">
          <BaseSelect
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            options={monthOptions}
          />
        </div>
      </div>

      {loading ? (
        // Skeleton Loaders
        <div className="space-y-6 animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {Array(4).fill(0).map((_, idx) => (
              <div key={idx} className="h-28 bg-slate-100 border border-slate-200 rounded-2xl"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 h-96 bg-slate-100 border border-slate-200 rounded-2xl"></div>
            <div className="h-96 bg-slate-100 border border-slate-200 rounded-2xl"></div>
          </div>
        </div>
      ) : performanceData ? (
        <>
          {/* KPI Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Revenue */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm relative overflow-hidden group">
              <div className="absolute right-4 top-4 p-2.5 bg-teal-50 border border-teal-100 text-teal-600 rounded-xl">
                <DollarSign className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Revenue Generated</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-2 tracking-tight">
                {formatCurrency(performanceData.kpis.revenue)}
              </h3>
              <div className="mt-3 flex items-center gap-1 text-xs text-teal-600 font-semibold">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+14.2% vs last month</span>
              </div>
            </div>

            {/* Appointments */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm relative overflow-hidden group">
              <div className="absolute right-4 top-4 p-2.5 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl">
                <Calendar className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Appointments Done</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-2 tracking-tight">
                {performanceData.kpis.appointments}
              </h3>
              <div className="mt-3 flex items-center gap-1 text-xs text-indigo-600 font-semibold">
                <span>Completed successfully</span>
              </div>
            </div>

            {/* Rating */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm relative overflow-hidden group">
              <div className="absolute right-4 top-4 p-2.5 bg-amber-50 border border-amber-100 text-amber-600 rounded-xl">
                <StarIcon className="w-5 h-5 fill-amber-400 text-amber-500" />
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg Rating</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-2 tracking-tight">
                {performanceData.kpis.rating} <span className="text-xs text-slate-400 font-medium">/ 5</span>
              </h3>
              <div className="mt-3 flex items-center gap-0.5">
                {Array(5).fill(0).map((_, i) => (
                  <StarIcon
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < Math.floor(performanceData.kpis.rating)
                        ? 'fill-amber-400 text-amber-500'
                        : 'text-slate-200'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Attendance */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm relative overflow-hidden group">
              <div className="absolute right-4 top-4 p-2.5 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl">
                <ThumbsUp className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Attendance Rate</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-2 tracking-tight">
                {performanceData.kpis.attendance}%
              </h3>
              <div className="mt-3 text-xs text-slate-500 font-semibold">
                <span>0 unexcused leaves</span>
              </div>
            </div>
          </div>

          {/* Row 2: Target achievement + Service breakdown */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            {/* Target card */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Target Achievement</h4>
                  <Sparkles className="w-4 h-4 text-teal-600 animate-pulse" />
                </div>
                <p className="text-xs text-slate-500">Monthly goal set for commission tier triggers.</p>
                
                {/* Stats */}
                <div className="mt-6 flex justify-between items-baseline mb-2">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Actual Revenue</p>
                    <p className="text-2xl font-black text-teal-600 mt-0.5">
                      {formatCurrency(performanceData.targets.actual)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Monthly Target</p>
                    <p className="text-lg font-bold text-slate-700 mt-0.5">
                      {formatCurrency(performanceData.targets.target)}
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden border border-slate-200 mt-4">
                  <div
                    className="bg-gradient-to-r from-teal-500 to-emerald-500 h-full rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${getTargetPercent()}%` }}
                  />
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-teal-50 bg-teal-50/40 p-4 text-xs text-teal-800 font-medium">
                Emma has achieved <strong className="text-teal-900 font-bold">{getTargetPercent()}%</strong> of her monthly target. She is on track to unlock the gold tier commission rate!
              </div>
            </div>

            {/* Service breakdown */}
            <div className="xl:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
              <div className="mb-4">
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Service Breakdown</h4>
                <p className="text-xs text-slate-500 mt-1">Top-performing services sorted by total revenue generated.</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="pb-3 text-left">Service</th>
                      <th className="pb-3 text-center">Category</th>
                      <th className="pb-3 text-center">Bookings</th>
                      <th className="pb-3 text-right">Revenue</th>
                      <th className="pb-3 text-right">Share</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {performanceData.services.map((svc, i) => (
                      <tr key={i} className="hover:bg-slate-50/30">
                        <td className="py-3 text-slate-900 font-bold">{svc.name}</td>
                        <td className="py-3 text-center">
                          <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded-full font-bold text-[9px] uppercase">
                            {svc.category}
                          </span>
                        </td>
                        <td className="py-3 text-center font-bold">{svc.count}</td>
                        <td className="py-3 text-right font-bold text-slate-800">{formatCurrency(svc.revenue)}</td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span className="font-bold">{svc.share}%</span>
                            <div className="w-12 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                              <div className="bg-teal-500 h-full" style={{ width: `${svc.share}%` }} />
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Row 3: Rating timeline */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
            <div className="mb-4">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Customer Rating Timeline</h4>
              <p className="text-xs text-slate-500 mt-1">Review feedback left by customers in their last 20 visits.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[420px] overflow-y-auto pr-2">
              {performanceData.ratings.map((rtg) => (
                <div key={rtg.id} className="p-4 border border-slate-100 rounded-xl bg-slate-50/30 hover:border-slate-200 transition-colors flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-4 mb-2">
                      <span className="text-xs font-bold text-slate-900">{rtg.customer}</span>
                      <span className="text-[10px] font-semibold text-slate-400">{rtg.date}</span>
                    </div>
                    <p className="text-xs text-slate-600 italic leading-relaxed">
                      "{rtg.comment}"
                    </p>
                  </div>
                  <div className="mt-3 flex items-center gap-0.5">
                    {Array(5).fill(0).map((_, i) => (
                      <StarIcon
                        key={i}
                        className={`w-3 h-3 ${
                          i < rtg.rating ? 'fill-amber-400 text-amber-500' : 'text-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="p-8 text-center text-slate-500 border border-dashed rounded-2xl bg-slate-50/50">
          No performance data available.
        </div>
      )}
    </div>
  )
}
