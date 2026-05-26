import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Mail, Phone, Calendar, MapPin, Camera, Star, Award, Shield, Clock,
  FileText, Percent, ChevronRight, CheckCircle2, AlertCircle, Plus, Loader2, BarChart2
} from 'lucide-react'
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler
} from 'chart.js'
import { Line } from 'react-chartjs-2'

import PageHeader from '../../components/ui/PageHeader.jsx'
import BaseBadge from '../../components/ui/BaseBadge.jsx'
import BaseButton from '../../components/ui/BaseButton.jsx'
import WeeklyHoursInput from '../../components/inputs/WeeklyHoursInput.jsx'
import LeaveRequestForm from '../../components/staff/LeaveRequestForm.jsx'
import PerformanceView from './PerformanceView.jsx'
import axios from 'axios'

// Register Chart.js modules
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

export default function StaffProfileView({ staffId: propStaffId, onBack }) {
  const staffId = propStaffId || 1 // fallback to ID 1 for testing
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(false)
  const [staff, setStaff] = useState(null)
  const [leaveModalOpen, setLeaveModalOpen] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const fileInputRef = useRef(null)

  // Load staff profile details
  useEffect(() => {
    const fetchStaffProfile = async () => {
      setLoading(true)
      // Simulate loading latency
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock full staff data
      const mockStaff = {
        id: staffId,
        name: 'Emma Watson',
        role: 'Senior Stylist',
        joinDate: 'Jan 15, 2024',
        branch: 'Downtown Branch',
        email: 'emma.watson@salonos.com',
        phone: '+91 98765 43210',
        whatsapp: '+91 98765 43210',
        photo: null,
        status: 'available',
        rating: 4.85,
        ratingHistory: [4.5, 4.6, 4.7, 4.68, 4.8, 4.85],
        ratingHistoryMonths: ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'],
        services: ['Balayage Coloring', 'Precision Haircut', 'Blowdry', 'Hair Spa', 'Keratin Treatment'],
        schedule: {
          monday: { enabled: true, open: '09:00', close: '20:00' },
          tuesday: { enabled: true, open: '09:00', close: '20:00' },
          wednesday: { enabled: true, open: '09:00', close: '20:00' },
          thursday: { enabled: true, open: '09:00', close: '20:00' },
          friday: { enabled: true, open: '09:00', close: '20:00' },
          saturday: { enabled: true, open: '09:00', close: '18:00' },
          sunday: { enabled: false, open: '09:00', close: '18:00' },
        },
        leaveRequests: [
          { id: 101, type: 'sick', label: 'Sick Leave', startDate: '2026-05-10', endDate: '2026-05-11', duration: 1, reason: 'Dental checkup and recovery', status: 'approved' },
          { id: 102, type: 'casual', label: 'Casual Leave', startDate: '2026-05-28', endDate: '2026-05-30', duration: 3, reason: 'Family trip out of town', status: 'pending' },
        ],
        attendanceSummary: {
          present: 21,
          absent: 0,
          late: 1,
          leave: 1,
        },
        commission: {
          planName: 'Senior Stylist Tiered Plan',
          baseRate: 10,
          currentMonthRevenue: 42500,
          tiers: [
            { threshold: 0, rate: 10, label: 'Bronze' },
            { threshold: 30000, rate: 15, label: 'Silver' },
            { threshold: 50000, rate: 20, label: 'Gold' },
          ],
        }
      }

      setStaff(mockStaff)
      setLoading(false)
    }

    fetchStaffProfile()
  }, [staffId])

  // Avatar file upload handler
  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingAvatar(true)
    
    // Simulate upload progress
    const formData = new FormData()
    formData.append('photo', file)
    
    try {
      // In a real app: await axios.post(`/v1/staff/${staff.id}/avatar`, formData)
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const localUrl = URL.createObjectURL(file)
      setStaff(prev => ({
        ...prev,
        photo: localUrl
      }))
    } catch (err) {
      console.error(err)
      alert('Failed to upload image.')
    } finally {
      setUploadingAvatar(false)
    }
  }

  // Update schedule handler
  const [savingSchedule, setSavingSchedule] = useState(false)
  const [scheduleSuccess, setScheduleSuccess] = useState(false)

  const handleSaveSchedule = async (newHours) => {
    setSavingSchedule(true)
    setScheduleSuccess(false)
    try {
      // In a real app: await axios.put(`/v1/staff/${staffId}/schedule`, { schedule: newHours })
      await new Promise(resolve => setTimeout(resolve, 1000))
      setStaff(prev => ({
        ...prev,
        schedule: newHours
      }))
      setScheduleSuccess(true)
      setTimeout(() => setScheduleSuccess(false), 3000)
    } catch (err) {
      console.error(err)
    } finally {
      setSavingSchedule(false)
    }
  }

  // Leave added handler
  const handleLeaveRequested = (newLeave) => {
    setStaff(prev => ({
      ...prev,
      leaveRequests: [newLeave, ...prev.leaveRequests]
    }))
  }

  if (loading || !staff) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-slate-500">
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
        <p className="text-sm font-semibold">Loading staff profile...</p>
      </div>
    )
  }

  // Rating history chart configuration
  const chartData = {
    labels: staff.ratingHistoryMonths,
    datasets: [
      {
        fill: true,
        label: 'Average Monthly Rating',
        data: staff.ratingHistory,
        borderColor: 'rgb(20, 184, 166)',
        backgroundColor: 'rgba(20, 184, 166, 0.05)',
        tension: 0.35,
        pointBackgroundColor: 'rgb(20, 184, 166)',
        pointBorderColor: '#fff',
        pointHoverRadius: 6,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1e293b',
        titleFont: { size: 11, weight: 'bold' },
        bodyFont: { size: 12 },
        padding: 10,
        cornerRadius: 8,
      }
    },
    scales: {
      y: {
        min: 4.0,
        max: 5.0,
        grid: { color: '#f1f5f9' },
        ticks: { color: '#64748b', stepSize: 0.2 }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#64748b' }
      }
    }
  }

  // Tabs layout data
  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'schedule', label: 'Schedule', icon: Clock },
    { id: 'attendance', label: 'Attendance', icon: Calendar },
    { id: 'performance', label: 'Performance', icon: BarChart2 },
    { id: 'commission', label: 'Commission', icon: Percent },
  ]

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <BaseBadge variant="success">Approved</BaseBadge>
      case 'pending':
        return <BaseBadge variant="warning">Pending</BaseBadge>
      case 'rejected':
        return <BaseBadge variant="danger">Rejected</BaseBadge>
      default:
        return <BaseBadge variant="default">{status}</BaseBadge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Back nav & page header */}
      <div className="flex items-center gap-2">
        <button
          onClick={onBack}
          className="text-xs font-bold text-slate-500 hover:text-slate-900 transition flex items-center gap-1 cursor-pointer bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl border border-slate-200"
        >
          &larr; Back to Staff List
        </button>
      </div>

      {/* Profile Header Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden group">
        <div className="absolute -right-24 -top-24 w-48 h-48 bg-teal-500/5 rounded-full blur-3xl group-hover:bg-teal-500/10 transition duration-500" />
        
        <div className="flex items-center gap-5 z-10">
          {/* Avatar Area */}
          <div className="relative cursor-pointer group" onClick={handleAvatarClick}>
            <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-teal-500/10 shadow-md bg-slate-50 relative flex items-center justify-center">
              {uploadingAvatar ? (
                <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center text-white">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
              ) : staff.photo ? (
                <img src={staff.photo} alt={staff.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-black text-slate-400">
                  {staff.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </span>
              )}
              {/* Camera Icon Overlay */}
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition duration-200">
                <Camera className="w-5 h-5 text-white" />
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              accept="image/*"
              className="hidden"
            />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">{staff.name}</h2>
              <BaseBadge variant="info" size="sm">
                {staff.role}
              </BaseBadge>
            </div>
            <div className="mt-2 flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-1 text-xs font-semibold text-slate-500">
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>{staff.branch}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>Joined {staff.joinDate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Rating Score */}
        <div className="flex items-center gap-3.5 bg-slate-50/70 border border-slate-100 p-4 rounded-xl self-start md:self-auto z-10 min-w-[150px] justify-center shadow-inner">
          <div className="p-2 bg-amber-50 rounded-xl text-amber-500 border border-amber-100/50">
            <Star className="w-6 h-6 fill-amber-400 text-amber-500" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Avg Rating</p>
            <p className="text-lg font-black text-slate-800 mt-0.5">{staff.rating}</p>
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="border-b border-slate-200 bg-white p-2 rounded-2xl border flex flex-wrap gap-1 shadow-sm">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition cursor-pointer ${
                isActive
                  ? 'bg-teal-600 text-white shadow-sm shadow-teal-500/20'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Tab Panels with framer-motion Transitions */}
      <div className="min-h-[400px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            {/* OVERVIEW PANEL */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Contact and Service list */}
                <div className="space-y-6">
                  {/* Contact Info Card */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Contact Details</h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Email</p>
                          <p className="text-xs font-semibold text-slate-700 mt-0.5">{staff.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Phone</p>
                          <p className="text-xs font-semibold text-slate-700 mt-0.5">{staff.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Home Branch</p>
                          <p className="text-xs font-semibold text-slate-700 mt-0.5">{staff.branch}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Service list Card */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Assigned Services</h3>
                    <div className="flex flex-wrap gap-2">
                      {staff.services.map((svc) => (
                        <span key={svc} className="px-2.5 py-1 bg-teal-50 border border-teal-100 text-teal-700 rounded-xl text-xs font-semibold">
                          {svc}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Rating Chart */}
                <div className="xl:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
                  <div className="mb-4">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Rating History</h3>
                    <p className="text-xs text-slate-500 mt-1">Average customer rating progression over the last 6 months.</p>
                  </div>
                  <div className="h-64 relative w-full">
                    <Line data={chartData} options={chartOptions} />
                  </div>
                </div>
              </div>
            )}

            {/* SCHEDULE PANEL */}
            {activeTab === 'schedule' && (
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Weekly Work Hours</h3>
                    <p className="text-xs text-slate-500 mt-1">Set the active operating schedule for Emma Watson.</p>
                  </div>
                  {scheduleSuccess && (
                    <span className="text-xs font-bold text-emerald-600 animate-fade-in pr-2">Schedule saved!</span>
                  )}
                </div>
                <div className="max-w-2xl">
                  <WeeklyHoursInput
                    modelValue={staff.schedule}
                    onUpdateModelValue={handleSaveSchedule}
                  />
                </div>
              </div>
            )}

            {/* ATTENDANCE & LEAVES PANEL */}
            {activeTab === 'attendance' && (
              <div className="space-y-6">
                {/* Attendance Summary */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Days Present</p>
                    <p className="text-3xl font-black text-slate-800 mt-2">{staff.attendanceSummary.present}</p>
                  </div>
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Late Arrivals</p>
                    <p className="text-3xl font-black text-amber-600 mt-2">{staff.attendanceSummary.late}</p>
                  </div>
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Days on Leave</p>
                    <p className="text-3xl font-black text-indigo-600 mt-2">{staff.attendanceSummary.leave}</p>
                  </div>
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Absent (Unexcused)</p>
                    <p className="text-3xl font-black text-rose-600 mt-2">{staff.attendanceSummary.absent}</p>
                  </div>
                </div>

                {/* Leave requests section: submitted/pending/approved */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Leave Requests</h3>
                      <p className="text-xs text-slate-500 mt-1">Leave requests history and status tracking.</p>
                    </div>
                    <BaseButton
                      size="sm"
                      leftIcon={Plus}
                      onClick={() => setLeaveModalOpen(true)}
                    >
                      Apply for Leave
                    </BaseButton>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-semibold text-slate-700">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                          <th className="pb-3">Type</th>
                          <th className="pb-3">Duration</th>
                          <th className="pb-3">Reason</th>
                          <th className="pb-3 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {staff.leaveRequests.map((req) => (
                          <tr key={req.id} className="hover:bg-slate-50/20">
                            <td className="py-3.5">
                              <span className="font-bold text-slate-900">{req.label}</span>
                              <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                                {req.startDate} to {req.endDate}
                              </div>
                            </td>
                            <td className="py-3.5 font-bold">{req.duration} day(s)</td>
                            <td className="py-3.5 text-slate-500 font-medium max-w-xs truncate">{req.reason}</td>
                            <td className="py-3.5 text-center">{getStatusBadge(req.status)}</td>
                          </tr>
                        ))}
                        {staff.leaveRequests.length === 0 && (
                          <tr>
                            <td colSpan={4} className="py-8 text-center text-slate-500">
                              No leave requests found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* PERFORMANCE PANEL */}
            {activeTab === 'performance' && (
              <PerformanceView staffId={staff.id} staffName={staff.name} />
            )}

            {/* COMMISSION PANEL */}
            {activeTab === 'commission' && (
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Active Plan details */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Active Plan</h3>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-500">
                        <Award className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{staff.commission.planName}</p>
                        <p className="text-xs text-slate-500">Base Commission: {staff.commission.baseRate}%</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3 mt-6">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tier Progression</p>
                      {staff.commission.tiers.map((tier) => {
                        const isUnlocked = staff.commission.currentMonthRevenue >= tier.threshold
                        return (
                          <div key={tier.label} className="flex items-center justify-between p-3 border border-slate-100 bg-slate-50/50 rounded-xl">
                            <div className="flex items-center gap-2">
                              {isUnlocked ? (
                                <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500" />
                              ) : (
                                <AlertCircle className="w-4.5 h-4.5 text-slate-300" />
                              )}
                              <span className={`text-xs font-bold ${isUnlocked ? 'text-slate-800' : 'text-slate-400'}`}>
                                {tier.label} ({tier.rate}%)
                              </span>
                            </div>
                            <span className="text-xs font-semibold text-slate-500">
                              &gt; ₹{tier.threshold.toLocaleString('en-IN')}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div className="mt-6 p-4 rounded-xl border border-indigo-100 bg-indigo-50/40 text-xs text-indigo-800 font-medium">
                    Commission rates are automatically updated on invoice completion based on target thresholds.
                  </div>
                </div>

                {/* Commission Summary */}
                <div className="xl:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
                  <div className="mb-4">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Earnings Summary</h3>
                    <p className="text-xs text-slate-500 mt-1">Commission earned based on current tier completion.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 pt-4 mt-4">
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Total Service Revenue</p>
                      <p className="text-2xl font-black text-slate-800 mt-1">₹{staff.commission.currentMonthRevenue.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="p-4 bg-teal-50 border border-teal-100 rounded-xl">
                      <p className="text-[10px] text-teal-600 font-bold uppercase">Est. Commission (15%)</p>
                      <p className="text-2xl font-black text-teal-700 mt-1">₹{(staff.commission.currentMonthRevenue * 0.15).toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Leave Request Form Modal */}
      <LeaveRequestForm
        open={leaveModalOpen}
        onClose={() => setLeaveModalOpen(false)}
        staffId={staff.id}
        onLeaveRequested={handleLeaveRequested}
      />
    </div>
  )
}
