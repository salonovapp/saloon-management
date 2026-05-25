import React from 'react'
import FullCalendar from '@fullcalendar/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus, ChevronLeft, ChevronRight, MapPin, Calendar as CalendarIcon, Inbox } from 'lucide-react'
import { format, getWeek } from 'date-fns'
import { useCalendar } from '../hooks/useCalendar.jsx'
import { useAppointmentStore } from '../stores/appointmentStore'
import BaseButton from '../components/ui/BaseButton.jsx'
import BaseSelect from '../components/ui/BaseSelect.jsx'
import AppointmentDetail from '../components/appointments/AppointmentDetail.jsx'
import BookingModal from '../components/appointments/BookingModal.jsx'

export default function AppointmentsView() {
  const { calendarRef, calendarOptions, currentDate, currentView, isLoading } = useCalendar()
  
  const selectedEvent = useAppointmentStore(state => state.selectedEvent)
  const setIsBookingModalOpen = useAppointmentStore(state => state.setIsBookingModalOpen)

  const handlePrev = () => calendarRef.current?.getApi().prev()
  const handleNext = () => calendarRef.current?.getApi().next()
  const handleToday = () => calendarRef.current?.getApi().today()
  const handleViewChange = (e) => calendarRef.current?.getApi().changeView(e.target.value)

  // Format Date String for Center Display
  const getFormattedDateString = () => {
    if (!currentDate) return ''
    if (currentView === 'resourceTimeGridDay' || currentView === 'timeGridDay') {
      return format(currentDate, "EEEE, d MMMM yyyy")
    }
    if (currentView === 'timeGridWeek') {
      return `Week ${getWeek(currentDate)}`
    }
    return format(currentDate, "MMMM yyyy")
  }

  const getSubFormattedDateString = () => {
    if (!currentDate) return ''
    if (currentView === 'timeGridWeek') {
      // In a real app, calculate start/end of the week
      return format(currentDate, "MMMM yyyy")
    }
    return ''
  }

  const hasEvents = calendarOptions.events && calendarOptions.events.length > 0

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] relative w-full overflow-hidden">
      
      {/* Top Toolbar */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
        
        {/* Left: Search & Nav */}
        <div className="flex items-center gap-3">
          <div className="relative group hidden sm:block">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-teal-500" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="pl-9 pr-4 py-2 w-48 focus:w-64 transition-all duration-300 rounded-xl border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
            />
          </div>
          <div className="h-6 w-px bg-slate-200 hidden sm:block mx-1"></div>
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-1">
            <button onClick={handlePrev} className="p-2 rounded-lg hover:bg-white hover:shadow-sm text-slate-600 transition-all">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={handleToday} className="px-4 py-2 text-sm font-semibold hover:bg-white hover:shadow-sm text-slate-700 rounded-lg transition-all">
              Today
            </button>
            <button onClick={handleNext} className="p-2 rounded-lg hover:bg-white hover:shadow-sm text-slate-600 transition-all">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Center: Formatted Date */}
        <div className="flex flex-col items-center justify-center min-w-[200px]">
          <motion.h2 
            key={currentDate?.toString()}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-lg font-bold text-slate-900 tracking-tight"
          >
            {getFormattedDateString()}
          </motion.h2>
          <span className="text-xs font-medium text-slate-500">{getSubFormattedDateString()}</span>
        </div>

        {/* Right: Filters & Actions */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 rounded-xl p-1 border border-slate-200">
            <MapPin className="w-4 h-4 text-slate-400 ml-2" />
            <select className="bg-transparent border-none text-sm font-medium text-slate-700 py-1.5 pr-8 outline-none focus:ring-0">
              <option>Downtown Branch</option>
              <option>Westside Branch</option>
            </select>
          </div>

          <BaseSelect 
            className="w-36"
            value={currentView}
            onChange={handleViewChange}
            options={[
              { value: 'resourceTimeGridDay', label: 'Day View' },
              { value: 'timeGridWeek', label: 'Week View' },
              { value: 'dayGridMonth', label: 'Month View' }
            ]}
          />
          <BaseButton leftIcon={Plus} onClick={() => setIsBookingModalOpen(true)} className="h-[42px]">
            New Appointment
          </BaseButton>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex gap-4 overflow-hidden relative">
        
        {/* Calendar Wrapper */}
        <motion.div 
          layout
          className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-full flex flex-col relative"
          style={{ width: selectedEvent ? 'calc(100% - 384px - 1rem)' : '100%' }}
        >
          {isLoading ? (
            <div className="flex-1 p-6 space-y-6 animate-pulse">
              {/* Header skeleton */}
              <div className="flex justify-between items-center">
                <div className="h-6 bg-slate-200 rounded-lg w-1/4"></div>
                <div className="h-6 bg-slate-200 rounded-lg w-24"></div>
              </div>
              {/* Grid skeleton */}
              <div className="grid grid-cols-3 gap-6 h-12">
                <div className="h-full bg-slate-100 rounded-xl border border-slate-200/55"></div>
                <div className="h-full bg-slate-100 rounded-xl border border-slate-200/55"></div>
                <div className="h-full bg-slate-100 rounded-xl border border-slate-200/55"></div>
              </div>
              {/* Time grid blocks */}
              <div className="flex-1 bg-slate-50 rounded-2xl border border-slate-200/50 h-80 p-4 space-y-4">
                <div className="h-10 bg-slate-100 rounded-xl w-3/4"></div>
                <div className="h-20 bg-slate-100 rounded-xl w-full"></div>
                <div className="h-16 bg-slate-100 rounded-xl w-1/2"></div>
              </div>
            </div>
          ) : hasEvents ? (
            <div className="flex-1 p-4 overflow-hidden">
              <style>{`
                .fc { height: 100%; font-family: 'Instrument Sans', sans-serif; }
                .fc-theme-standard td, .fc-theme-standard th { border-color: #e2e8f0 !important; }
                .fc-col-header-cell { padding: 12px 0 !important; background-color: #f8fafc !important; border-bottom: 2px solid #e2e8f0 !important; }
                .fc-col-header-cell-cushion { font-size: 0.875rem !important; font-weight: 700 !important; color: #1e293b !important; text-decoration: none !important; }
                .fc-timegrid-slot { height: 4rem !important; }
                .fc-timegrid-slot-minor { border-top-style: dashed !important; border-top-color: #e2e8f0 !important; }
                .fc-timegrid-slot-label-cushion { font-size: 0.7rem !important; font-weight: 700 !important; color: #64748b !important; text-transform: uppercase !important; letter-spacing: 0.05em !important; }
                .fc-timegrid-axis-cushion { font-size: 0.7rem !important; font-weight: 700 !important; color: #64748b !important; text-transform: uppercase !important; }
                .fc-event { border: none !important; background: transparent !important; }
                .fc-timegrid-divider { display: none; }
                .fc-now-indicator-line { border-color: #14b8a6 !important; border-width: 2px !important; }
                .fc-now-indicator-arrow { border-color: #14b8a6 !important; fill: #14b8a6 !important; }
              `}</style>
              
              <FullCalendar
                ref={calendarRef}
                {...calendarOptions}
              />
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-50/50">
              <div className="h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <Inbox className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">No appointments scheduled</h3>
              <p className="text-sm text-slate-500 max-w-sm mb-6">There are no appointments scheduled for this date. Create a new one to get started.</p>
              <BaseButton variant="primary" leftIcon={Plus} onClick={() => setIsBookingModalOpen(true)}>
                Create Appointment
              </BaseButton>
            </div>
          )}
        </motion.div>

        {/* Sidebar Wrapper (AnimatePresence ensures unmounting) */}
        <AnimatePresence>
          {selectedEvent && (
            <AppointmentDetail />
          )}
        </AnimatePresence>

      </div>

      <BookingModal />
    </div>
  )
}
