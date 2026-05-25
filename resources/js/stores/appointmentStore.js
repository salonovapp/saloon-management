import { create } from 'zustand'

export const useAppointmentStore = create((set) => ({
  selectedEvent: null,
  selectedSlot: null,
  isBookingModalOpen: false,
  
  setSelectedEvent: (event) => set({ selectedEvent: event }),
  setSelectedSlot: (slot) => set({ selectedSlot: slot }),
  setIsBookingModalOpen: (isOpen) => set({ isBookingModalOpen: isOpen }),
  
  openBookingModalWithSlot: (slot) => set({ 
    selectedSlot: slot, 
    isBookingModalOpen: true 
  }),
  
  clearSelection: () => set({ 
    selectedEvent: null, 
    selectedSlot: null 
  })
}))
