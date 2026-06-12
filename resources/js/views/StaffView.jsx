import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, UserPlus, Grid, Table, Award, ShieldAlert, CheckCircle2 } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader.jsx'
import BaseButton from '../components/ui/BaseButton.jsx'
import StaffCard from '../components/staff/StaffCard.jsx'
import SkillsMatrix from '../components/staff/SkillsMatrix.jsx'
import StaffProfileView from './staff/StaffProfileView.jsx'

export default function StaffView() {
  const [selectedStaffId, setSelectedStaffId] = useState(null)
  const [viewMode, setViewMode] = useState('roster') // 'roster' | 'matrix'
  
  // Mock Roster Data
  const initialStaffList = [
    { id: 1, name: 'Emma Watson', role: 'Senior Stylist', joinDate: 'Jan 15, 2024', status: 'available', appointmentsCount: 5, rating: 4.85, skills: ['Hair', 'Beard'], primarySkill: 'Hair' },
    { id: 2, name: 'Liam Neeson', role: 'Barber Specialist', joinDate: 'Mar 10, 2024', status: 'busy', appointmentsCount: 3, rating: 4.9, skills: ['Beard', 'Hair'], primarySkill: 'Beard' },
    { id: 3, name: 'Olivia Jones', role: 'Nail Artist', joinDate: 'Jun 22, 2024', status: 'day-off', appointmentsCount: 0, rating: 4.75, skills: ['Nails', 'Spa'], primarySkill: 'Nails' },
    { id: 4, name: 'Sophia Loren', role: 'Spa Therapist', joinDate: 'Aug 05, 2024', status: 'available', appointmentsCount: 4, rating: 4.95, skills: ['Spa', 'Skin'], primarySkill: 'Spa' },
    { id: 5, name: 'Brad Pitt', role: 'Makeup Stylist', joinDate: 'Nov 12, 2024', status: 'available', appointmentsCount: 2, rating: 4.65, skills: ['Makeup', 'Bridal'], primarySkill: 'Makeup' },
  ]

  // Handler to view profile
  const handleSelectStaff = (id) => {
    setSelectedStaffId(id)
  }

  // Back handler
  const handleBackToRoster = () => {
    setSelectedStaffId(null)
  }

  // Get active staff name
  const getSelectedStaffName = () => {
    const staff = initialStaffList.find(s => s.id === selectedStaffId)
    return staff ? staff.name : ''
  }

  // If a specific staff member is selected, show their full profile view!
  if (selectedStaffId) {
    return (
      <StaffProfileView
        staffId={selectedStaffId}
        staffName={getSelectedStaffName()}
        onBack={handleBackToRoster}
      />
    )
  }

  // Calculate statistics
  const totalStaff = initialStaffList.length
  const availableToday = initialStaffList.filter(s => s.status === 'available').length
  const busyToday = initialStaffList.filter(s => s.status === 'busy').length
  const onLeaveToday = initialStaffList.filter(s => s.status === 'day-off').length

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Staff Management"
          subtitle="Manage your salon's workforce, schedules, leaves, skills, and commissions."
        />
        <div className="flex items-center gap-2">
          <BaseButton
            variant={viewMode === 'roster' ? 'primary' : 'secondary'}
            leftIcon={Grid}
            size="sm"
            onClick={() => setViewMode('roster')}
          >
            Roster
          </BaseButton>
          <BaseButton
            variant={viewMode === 'matrix' ? 'primary' : 'secondary'}
            leftIcon={Table}
            size="sm"
            onClick={() => setViewMode('matrix')}
          >
            Skills Matrix
          </BaseButton>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <div className="absolute right-4 top-4 p-2 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Staff</p>
          <h3 className="text-2xl font-black text-slate-800 mt-2">{totalStaff} members</h3>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <div className="absolute right-4 top-4 p-2 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Available Today</p>
          <h3 className="text-2xl font-black text-emerald-600 mt-2">{availableToday} online</h3>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <div className="absolute right-4 top-4 p-2 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl">
            <ShieldAlert className="w-5 h-5 animate-pulse" />
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Busy / In Booking</p>
          <h3 className="text-2xl font-black text-slate-800 mt-2">{busyToday} busy</h3>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <div className="absolute right-4 top-4 p-2 bg-slate-100 border border-slate-200 text-slate-500 rounded-xl">
            <Award className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Day Off</p>
          <h3 className="text-2xl font-black text-slate-500 mt-2">{onLeaveToday} resting</h3>
        </div>
      </div>

      {/* Main Panel views */}
      <AnimatePresence mode="wait">
        <motion.div
          key={viewMode}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.18 }}
        >
          {viewMode === 'roster' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {initialStaffList.map((staff) => (
                <StaffCard
                  key={staff.id}
                  staff={staff}
                  onClick={handleSelectStaff}
                />
              ))}
            </div>
          ) : (
            <SkillsMatrix initialStaff={initialStaffList} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
