import React from 'react'
import { motion } from 'framer-motion'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { X, Calendar, Clock, User, Phone, CheckCircle, Play, FileText, Ban } from 'lucide-react'
import BaseBadge from '../ui/BaseBadge.jsx'
import BaseButton from '../ui/BaseButton.jsx'
import { useAppointmentStore } from '../../stores/appointmentStore'

export default function AppointmentDetail() {
  const queryClient = useQueryClient()
  
  const event = useAppointmentStore(state => state.selectedEvent)
  const setSelectedEvent = useAppointmentStore(state => state.setSelectedEvent)

  // Keep a local copy of the event so that when Zustand's event becomes null (during exit animation),
  // we still render the details of the departing event rather than crashing or showing blank fields.
  const [localEvent, setLocalEvent] = React.useState(event)

  React.useEffect(() => {
    if (event) {
      setLocalEvent(event)
    }
  }, [event])

  const activeEvent = event || localEvent

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      await new Promise(resolve => setTimeout(resolve, 800))
      return { id, status }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] })
      setSelectedEvent(null)
    }
  })

  const handleAction = (status) => {
    if (!activeEvent) return
    updateStatusMutation.mutate({ id: activeEvent.id, status })
  }

  if (!activeEvent) return null

  const props = activeEvent.extendedProps || {}
  
  const statusColors = {
    confirmed: 'success',
    'in-progress': 'info',
    completed: 'default',
    cancelled: 'danger'
  }

  const isPending = updateStatusMutation.isPending

  return (
    <motion.div
      initial={{ width: 0, opacity: 0, x: 20 }}
      animate={{ width: 384, opacity: 1, x: 0 }}
      exit={{ width: 0, opacity: 0, x: 20 }}
      transition={{ duration: 0.3, ease: "circOut" }}
      className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden shrink-0 h-full relative"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50 shrink-0 w-96">
        <h3 className="font-bold text-slate-900">Appointment Details</h3>
        <button 
          onClick={() => setSelectedEvent(null)}
          className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 relative w-96">
        {isPending && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
              <span className="text-sm font-medium text-teal-700">Updating...</span>
            </div>
          </div>
        )}

        {/* Status & Service */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <BaseBadge variant={statusColors[props.status] || 'default'}>
              {props.status?.replace('-', ' ') || 'Unknown'}
            </BaseBadge>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-100 px-2 py-1 rounded-md">#{activeEvent.id}</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{props.service || activeEvent.title}</h2>
        </div>

        {/* Customer Info Card */}
        <motion.div 
          whileHover={{ scale: 1.01 }}
          className="p-4 rounded-xl border border-slate-100 bg-slate-50 shadow-sm space-y-3 cursor-pointer group transition-all hover:border-slate-200 hover:bg-white"
        >
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 text-white flex items-center justify-center font-bold text-lg shadow-inner ring-2 ring-white">
              {(props.customer || 'C').charAt(0)}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 group-hover:text-teal-600 transition-colors">{props.customer}</p>
              <p className="text-xs text-slate-500 font-medium">VIP Client • 12 visits</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-slate-600 pt-3 border-t border-slate-200/60">
            <Phone className="w-4 h-4 text-slate-400" />
            +1 (555) 123-4567
          </div>
        </motion.div>

        {/* Time & Staff */}
        <div className="space-y-5 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-slate-50 rounded-lg text-slate-400"><Calendar className="w-5 h-5" /></div>
            <div>
              <p className="text-sm font-bold text-slate-900">{activeEvent.start ? activeEvent.start.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }) : 'N/A'}</p>
              <p className="text-xs font-medium text-slate-500 mt-0.5">Date</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="p-2 bg-slate-50 rounded-lg text-slate-400"><Clock className="w-5 h-5" /></div>
            <div>
              <p className="text-sm font-bold text-slate-900">
                {activeEvent.start ? activeEvent.start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''} - {activeEvent.end ? activeEvent.end.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
              </p>
              <p className="text-xs font-medium text-slate-500 mt-0.5">Duration: {props.duration || 'N/A'}</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="p-2 bg-slate-50 rounded-lg text-slate-400"><User className="w-5 h-5" /></div>
            <div>
              <p className="text-sm font-bold text-slate-900">{activeEvent.getResources?.()?.[0]?.title || 'Any Staff'}</p>
              <p className="text-xs font-medium text-slate-500 mt-0.5">Assigned Professional</p>
            </div>
          </div>
        </div>

        {/* Notes */}
        {props.notes && (
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Customer Notes</h4>
            <div className="p-3 bg-amber-50/80 border border-amber-100 rounded-xl text-sm font-medium text-amber-800 shadow-sm">
              {props.notes}
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50 shrink-0 w-96 grid grid-cols-2 gap-3">
        {props.status === 'confirmed' && (
          <>
            <BaseButton variant="primary" leftIcon={Play} className="col-span-2 shadow-md shadow-teal-500/20" onClick={() => handleAction('in-progress')} loading={isPending}>Start Service</BaseButton>
            <BaseButton variant="ghost" leftIcon={Ban} className="bg-slate-200/50 hover:bg-slate-200 text-slate-700" onClick={() => handleAction('no-show')} disabled={isPending}>No-Show</BaseButton>
            <BaseButton variant="ghost" leftIcon={X} className="text-rose-600 bg-rose-50 hover:bg-rose-100" onClick={() => handleAction('cancelled')} disabled={isPending}>Cancel</BaseButton>
          </>
        )}
        {props.status === 'in-progress' && (
          <BaseButton variant="primary" leftIcon={CheckCircle} className="col-span-2 bg-emerald-500 hover:bg-emerald-600 ring-emerald-500 shadow-md shadow-emerald-500/20" onClick={() => handleAction('completed')} loading={isPending}>Complete Service</BaseButton>
        )}
        {props.status === 'completed' && (
          <BaseButton variant="secondary" leftIcon={FileText} className="col-span-2 shadow-sm border-slate-200">View Invoice & Receipt</BaseButton>
        )}
      </div>
    </motion.div>
  )
}
