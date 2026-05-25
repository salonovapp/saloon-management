import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/dist/style.css'
import { format } from 'date-fns'
import { ChevronRight, ChevronLeft, Check, User, Scissors, Calendar as CalendarIcon, ClipboardCheck } from 'lucide-react'
import BaseModal from '../ui/BaseModal.jsx'
import BaseInput from '../ui/BaseInput.jsx'
import BaseButton from '../ui/BaseButton.jsx'
import { useAppointmentStore } from '../../stores/appointmentStore'

const bookingSchema = z.object({
  customer: z.string().min(2, "Required"),
  service: z.string().min(1, "Required"),
  staff: z.string().min(1, "Required"),
  date: z.date({ required_error: "Date is required" }),
  time: z.string().min(1, "Time is required"),
  notes: z.string().optional()
})

const timeSlots = ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '01:00 PM', '01:30 PM', '02:00 PM']

export default function BookingModal() {
  const queryClient = useQueryClient()
  const open = useAppointmentStore(state => state.isBookingModalOpen)
  const selectedSlot = useAppointmentStore(state => state.selectedSlot)
  const setIsBookingModalOpen = useAppointmentStore(state => state.setIsBookingModalOpen)

  const [step, setStep] = useState(1)

  const { register, handleSubmit, control, watch, reset, trigger, formState: { errors } } = useForm({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      customer: '',
      service: '',
      staff: '',
      notes: ''
    }
  })

  const formValues = watch()

  useEffect(() => {
    if (open) {
      if (selectedSlot) {
        reset({
          customer: '',
          service: '',
          staff: selectedSlot.resourceId || '',
          date: new Date(selectedSlot.start),
          time: new Date(selectedSlot.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          notes: ''
        })
        setStep(1)
      } else {
        reset()
        setStep(1)
      }
    }
  }, [open, selectedSlot, reset])

  const createAppointmentMutation = useMutation({
    mutationFn: async (data) => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] })
      setIsBookingModalOpen(false)
    }
  })

  const onSubmit = (data) => {
    createAppointmentMutation.mutate(data)
  }

  const nextStep = async () => {
    let fieldsToValidate = []
    if (step === 1) fieldsToValidate = ['customer']
    if (step === 2) fieldsToValidate = ['service', 'staff']
    if (step === 3) fieldsToValidate = ['date', 'time']

    const isValid = await trigger(fieldsToValidate)
    if (isValid) {
      setStep(s => Math.min(s + 1, 4))
    }
  }

  const prevStep = () => setStep(s => Math.max(s - 1, 1))

  const stepIcons = [User, Scissors, CalendarIcon, ClipboardCheck]

  return (
    <BaseModal
      open={open}
      onClose={() => setIsBookingModalOpen(false)}
      title="New Appointment"
      size="md" // Medium modal for cleaner UI
      footer={
        <div className="flex justify-between w-full">
          <BaseButton variant="ghost" onClick={step === 1 ? () => setIsBookingModalOpen(false) : prevStep} disabled={createAppointmentMutation.isPending}>
            {step === 1 ? 'Cancel' : 'Back'}
          </BaseButton>
          
          {step < 4 ? (
            <BaseButton variant="primary" rightIcon={ChevronRight} onClick={nextStep}>
              Next Step
            </BaseButton>
          ) : (
            <BaseButton variant="primary" rightIcon={Check} onClick={handleSubmit(onSubmit)} loading={createAppointmentMutation.isPending}>
              Confirm Booking
            </BaseButton>
          )}
        </div>
      }
    >
      {/* Stepper Header */}
      <div className="flex items-center justify-between mb-8 relative px-4">
        <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-slate-100 -z-10 -translate-y-1/2"></div>
        {[1, 2, 3, 4].map((i) => {
          const Icon = stepIcons[i-1]
          const isActive = step >= i
          return (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isActive ? 'bg-teal-500 border-teal-500 text-white shadow-md shadow-teal-500/20' : 'bg-white border-slate-200 text-slate-400'}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className={`text-[10px] uppercase tracking-wider font-bold ${isActive ? 'text-teal-600' : 'text-slate-400'}`}>Step {i}</span>
            </div>
          )
        })}
      </div>

      <div className="min-h-[360px]">
        <AnimatePresence mode="wait">
          {/* STEP 1 */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4 max-w-sm mx-auto pt-4">
              <h3 className="text-xl font-bold text-center text-slate-900 mb-6">Who is the customer?</h3>
              <BaseInput 
                label="Customer Name or Phone" 
                placeholder="e.g. Sarah Connor" 
                {...register('customer')}
                error={errors.customer?.message}
                autoFocus
              />
              <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 text-center cursor-pointer hover:bg-slate-100 transition-colors">
                <span className="text-sm font-semibold text-teal-600">+ Add New Customer</span>
              </div>
            </motion.div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6 pt-4">
              <h3 className="text-xl font-bold text-center text-slate-900 mb-6">Select Service & Staff</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700">Service</label>
                  <select {...register('service')} className="block w-full rounded-xl border-slate-300 py-3 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm cursor-pointer bg-slate-50">
                    <option value="">Select a service...</option>
                    <optgroup label="Hair">
                      <option value="haircut">Haircut (45m) - ₹500</option>
                      <option value="color">Coloring (2h) - ₹4,500</option>
                    </optgroup>
                    <optgroup label="Grooming">
                      <option value="beard">Beard Trim (30m) - ₹300</option>
                    </optgroup>
                  </select>
                  {errors.service && <span className="text-xs text-rose-500">{errors.service.message}</span>}
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700">Staff</label>
                  <select {...register('staff')} className="block w-full rounded-xl border-slate-300 py-3 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm cursor-pointer bg-slate-50">
                    <option value="">No preference</option>
                    <option value="1">Emma Watson</option>
                    <option value="2">Liam Neeson</option>
                    <option value="3">Olivia Jones</option>
                  </select>
                  {errors.staff && <span className="text-xs text-rose-500">{errors.staff.message}</span>}
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="pt-2">
              <h3 className="text-xl font-bold text-center text-slate-900 mb-6">When do they want to come in?</h3>
              
              <div className="space-y-6 max-w-sm mx-auto">
                {/* Modern Date Picker */}
                <div className="flex justify-center bg-slate-50 rounded-2xl p-4 border border-slate-100 shadow-sm">
                  <style>{`
                    .rdp { --rdp-cell-size: 36px; --rdp-accent-color: #14b8a6; margin: 0; }
                    .rdp-day_selected, .rdp-day_selected:focus-visible, .rdp-day_selected:hover { background-color: var(--rdp-accent-color); color: white; font-weight: bold; border-radius: 12px; }
                    .rdp-day { border-radius: 12px; }
                    .rdp-button:hover:not([disabled]):not(.rdp-day_selected) { background-color: #f1f5f9; }
                  `}</style>
                  <Controller
                    control={control}
                    name="date"
                    render={({ field }) => (
                      <DayPicker
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        showOutsideDays
                      />
                    )}
                  />
                </div>
                {errors.date && <span className="text-xs text-rose-500 block text-center mt-2">{errors.date.message}</span>}

                {/* Time Pills */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3 text-center">Available Times</label>
                  <div className="grid grid-cols-3 gap-2">
                    <Controller
                      control={control}
                      name="time"
                      render={({ field }) => (
                        <>
                          {timeSlots.map(time => (
                            <button
                              key={time}
                              type="button"
                              onClick={() => field.onChange(time)}
                              className={`py-2 px-1 text-[11px] font-semibold rounded-xl border transition-all ${field.value === time ? 'bg-teal-500 text-white border-teal-500 shadow-md shadow-teal-500/20' : 'bg-white text-slate-600 border-slate-200 hover:border-teal-300 hover:bg-slate-50'}`}
                            >
                              {time}
                            </button>
                          ))}
                        </>
                      )}
                    />
                  </div>

                  {/* Custom Time Input Option */}
                  <div className="relative flex py-3 items-center">
                    <div className="flex-grow border-t border-slate-200"></div>
                    <span className="flex-shrink mx-3 text-[10px] text-slate-400 font-bold uppercase tracking-wider">OR</span>
                    <div className="flex-grow border-t border-slate-200"></div>
                  </div>

                  <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">Custom Time</label>
                    <input
                      type="time"
                      {...register('time')}
                      className="flex-1 rounded-lg border-slate-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-xs font-semibold py-1.5 px-2.5 bg-white outline-none"
                    />
                  </div>

                  {errors.time && <span className="text-xs text-rose-500 block text-center mt-2">{errors.time.message}</span>}
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6 max-w-sm mx-auto pt-4">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-teal-100 text-teal-600 mb-4">
                  <Check className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Review Booking</h3>
              </div>
              
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-4">
                <div className="flex justify-between border-b border-slate-200 pb-3">
                  <span className="text-slate-500 text-sm">Customer</span>
                  <span className="font-semibold text-slate-900 text-sm">{formValues.customer || '-'}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-3">
                  <span className="text-slate-500 text-sm">Service</span>
                  <span className="font-semibold text-slate-900 text-sm">{formValues.service || '-'}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-3">
                  <span className="text-slate-500 text-sm">When</span>
                  <span className="font-semibold text-slate-900 text-sm text-right">
                    {formValues.date ? format(formValues.date, 'MMM d, yyyy') : '-'}<br/>
                    {(() => {
                      const timeStr = formValues.time
                      if (!timeStr) return '-'
                      if (timeStr.includes(':') && !timeStr.toLowerCase().includes('am') && !timeStr.toLowerCase().includes('pm')) {
                        const [hoursStr, minutesStr] = timeStr.split(':')
                        const hours = parseInt(hoursStr, 10)
                        const ampm = hours >= 12 ? 'PM' : 'AM'
                        const formattedHours = hours % 12 || 12
                        return `${formattedHours}:${minutesStr} ${ampm}`
                      }
                      return timeStr
                    })()}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Optional Notes</label>
                <textarea 
                  {...register('notes')}
                  className="block w-full rounded-xl border-slate-300 bg-slate-50 py-3 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm" 
                  rows={2}
                  placeholder="Any special requests..."
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </BaseModal>
  )
}
