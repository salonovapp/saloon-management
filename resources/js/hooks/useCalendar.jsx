import { useRef, useMemo, useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import resourceTimeGridPlugin from '@fullcalendar/resource-timegrid'
import { useAppointmentStore } from '../stores/appointmentStore'

export function useCalendar() {
  const queryClient = useQueryClient()
  const calendarRef = useRef(null)
  
  const [currentDate, setCurrentDate] = useState(new Date())
  const [currentView, setCurrentView] = useState('resourceTimeGridDay')
  
  // Zustand State
  const selectedEvent = useAppointmentStore(state => state.selectedEvent)
  const setSelectedEvent = useAppointmentStore(state => state.setSelectedEvent)
  const openBookingModalWithSlot = useAppointmentStore(state => state.openBookingModalWithSlot)

  const { data: resources = [], isLoading: isLoadingResources } = useQuery({
    queryKey: ['calendar-resources'],
    queryFn: async () => {
      await new Promise(r => setTimeout(r, 500))
      return [
        { id: '1', title: 'Emma Watson' },
        { id: '2', title: 'Liam Neeson' },
        { id: '3', title: 'Olivia Jones' }
      ]
    }
  })

  const { data: events = [], refetch: refetchEvents, isLoading: isLoadingEvents } = useQuery({
    queryKey: ['calendar-events'],
    queryFn: async () => {
      await new Promise(r => setTimeout(r, 600))
      const today = new Date().toISOString().split('T')[0]
      return [
        { id: '1', resourceId: '1', title: 'Hair Coloring', start: `${today}T09:00:00`, end: `${today}T11:00:00`, extendedProps: { status: 'completed', service: 'Hair Coloring', customer: 'Sarah Connor', duration: '2h', price: '₹4,500', notes: 'First time client.' } },
        { id: '2', resourceId: '2', title: 'Beard Trim', start: `${today}T10:30:00`, end: `${today}T11:00:00`, extendedProps: { status: 'in-progress', service: 'Beard Trim', customer: 'John Wick', duration: '30m', price: '₹800', notes: 'Prefers sharp lines.' } },
        { id: '3', resourceId: '3', title: 'Manicure', start: `${today}T11:00:00`, end: `${today}T12:00:00`, extendedProps: { status: 'confirmed', service: 'Manicure', customer: 'Ellen Ripley', duration: '1h', price: '₹1,200', notes: '' } },
      ]
    }
  })

  const updateAppointmentMutation = useMutation({
    mutationFn: async (payload) => {
      await new Promise(r => setTimeout(r, 400))
      return payload
    },
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: ['calendar-events'] })
      const previousEvents = queryClient.getQueryData(['calendar-events'])
      queryClient.setQueryData(['calendar-events'], (old) => {
        if (!old) return []
        return old.map(evt => {
          if (evt.id === payload.id) {
            return {
              ...evt,
              start: payload.start,
              end: payload.end,
              resourceId: payload.resourceId || evt.resourceId
            }
          }
          return evt
        })
      })
      return { previousEvents }
    },
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(['calendar-events'], context.previousEvents)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] })
    }
  })

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Echo) {
      try {
        const channel = window.Echo.channel('tenant.mock')
        channel.listen('AppointmentUpdated', () => {
          queryClient.invalidateQueries({ queryKey: ['calendar-events'] })
        })
        return () => channel.stopListening('AppointmentUpdated')
      } catch (err) {
        console.warn('Echo listener setup failed:', err)
      }
    }
  }, [queryClient])

  const calendarOptions = useMemo(() => ({
    plugins: [resourceTimeGridPlugin, timeGridPlugin, dayGridPlugin, interactionPlugin],
    initialView: 'resourceTimeGridDay',
    headerToolbar: false,
    allDaySlot: false,
    slotMinTime: '08:00:00',
    slotMaxTime: '20:00:00',
    expandRows: true,
    stickyHeaderDates: true,
    resources,
    events,
    editable: true,
    selectable: true,
    selectMirror: true,
    nowIndicator: true,
    slotLabelFormat: {
      hour: 'numeric',
      minute: '2-digit',
      omitZeroMinute: true,
      meridiem: 'short'
    },
    
    datesSet: (info) => {
      setCurrentDate(info.view.currentStart)
      setCurrentView(info.view.type)
    },
    
    eventClick: (info) => setSelectedEvent(info.event),
    
    select: (info) => {
      openBookingModalWithSlot({
        start: info.startStr,
        end: info.endStr,
        resourceId: info.resource?.id
      })
    },
    
    eventDrop: (info) => {
      updateAppointmentMutation.mutate({
        id: info.event.id,
        start: info.event.startStr,
        end: info.event.endStr,
        resourceId: info.event.getResources()[0]?.id
      })
    },
    
    eventResize: (info) => {
      updateAppointmentMutation.mutate({
        id: info.event.id,
        start: info.event.startStr,
        end: info.event.endStr,
      })
    },
    
    eventContent: (arg) => {
      const { customer, service, status, duration, price, notes } = arg.event.extendedProps
      const timeText = arg.timeText
      const isSelected = selectedEvent?.id === arg.event.id

      const start = arg.event.start
      const end = arg.event.end
      const durationMs = end && start ? (end.getTime() - start.getTime()) : 0
      const durationMin = durationMs / (1000 * 60)
      const isShort = durationMin <= 45

      const statusColors = {
        confirmed: 'bg-teal-500',
        'in-progress': 'bg-blue-500',
        completed: 'bg-slate-400',
        cancelled: 'bg-rose-500'
      }

      const gradientMap = {
        confirmed: 'from-teal-500/10 to-teal-500/5 border-teal-200/50',
        'in-progress': 'from-blue-500/10 to-blue-500/5 border-blue-200/50',
        completed: 'from-slate-500/10 to-slate-500/5 border-slate-200/50',
        cancelled: 'from-rose-500/10 to-rose-500/5 border-rose-200/50'
      }

      if (isShort) {
        return (
          <div className={`group h-full w-full rounded-xl border bg-gradient-to-r ${gradientMap[status] || gradientMap.confirmed} px-3 py-1 flex items-center justify-between gap-2 overflow-hidden transition-all duration-200 hover:scale-[1.01] hover:shadow-md ${isSelected ? 'ring-2 ring-teal-500 shadow-teal-500/20' : 'hover:border-teal-300 shadow-sm'}`}>
            <div className="absolute inset-0 bg-white/40 backdrop-blur-sm -z-10 rounded-xl" />
            <div className="flex items-center gap-1.5 min-w-0">
              <div className={`h-1.5 w-1.5 rounded-full shrink-0 ${statusColors[status] || 'bg-slate-400'}`} />
              <span className="font-bold text-slate-900 text-[11px] truncate">{customer}</span>
              <span className="text-[10px] text-slate-500 truncate hidden sm:inline">• {service}</span>
            </div>
            <span className="text-[9px] font-medium text-slate-400 shrink-0">{timeText}</span>
          </div>
        )
      }

      return (
        <div className={`group h-full w-full rounded-xl border bg-gradient-to-br ${gradientMap[status] || gradientMap.confirmed} p-2 flex flex-col relative overflow-hidden transition-all duration-200 hover:scale-[1.02] hover:shadow-lg ${isSelected ? 'ring-2 ring-teal-500 shadow-teal-500/20' : 'hover:border-teal-300 shadow-sm'}`}>
          {/* Glassmorphism background blur (simulated via backdrop utility if container allows) */}
          <div className="absolute inset-0 bg-white/40 backdrop-blur-sm -z-10 rounded-xl" />
          
          <div className="flex items-start justify-between gap-2 z-10">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-white shadow-sm flex items-center justify-center text-[10px] font-bold text-slate-700 shrink-0">
                {(customer || 'C').charAt(0)}
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-slate-900 text-xs truncate">{customer}</div>
                <div className="text-[10px] text-slate-500 truncate">{service}</div>
              </div>
            </div>
            <div className={`h-2 w-2 rounded-full shrink-0 ${statusColors[status] || 'bg-slate-400'}`} />
          </div>
          
          <div className="mt-auto pt-1 flex items-center justify-between text-[10px] font-medium text-slate-500 z-10">
            <span>{timeText}</span>
          </div>

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-slate-900/95 text-white p-3 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20 flex flex-col justify-between hidden md:flex pointer-events-none">
            <div>
              <div className="font-semibold text-xs mb-1">{service}</div>
              <div className="text-[10px] text-slate-300">{duration} • {price}</div>
            </div>
            {notes && <div className="text-[10px] text-slate-400 italic line-clamp-2">"{notes}"</div>}
          </div>
        </div>
      )
    }
  }), [resources, events, selectedEvent, setSelectedEvent, openBookingModalWithSlot, updateAppointmentMutation])

  return {
    calendarRef,
    calendarOptions,
    refetchEvents,
    currentDate,
    currentView,
    isLoading: isLoadingResources || isLoadingEvents
  }
}
