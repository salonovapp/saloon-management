import React, { useCallback, useRef, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, ChevronDown, ChevronUp, ShieldAlert } from 'lucide-react'
import { useAuthStore } from '../../../stores/auth'
import { submitOnboarding } from '../../../services/adminOnboardingService.js'
import { onboardingSchema } from './onboardingSchema.js'
import SalonInfoStep from './steps/SalonInfoStep.jsx'
import BranchInfoStep from './steps/BranchInfoStep.jsx'
import OwnerInfoStep from './steps/OwnerInfoStep.jsx'
import ServiceProductsStep from './steps/ServiceProductsStep.jsx'
import OnboardingSuccessScreen from './OnboardingSuccessScreen.jsx'
import BaseButton from '../../../components/ui/BaseButton.jsx'
import BrandLogo from '../../../components/ui/BrandLogo.jsx'

const SECTIONS = [
  { id: 'salon', label: 'Salon Information', component: SalonInfoStep },
  { id: 'branch', label: 'Branch Information', component: BranchInfoStep },
  { id: 'owner', label: 'Owner User', component: OwnerInfoStep },
  { id: 'service_products', label: 'Service Products', component: ServiceProductsStep, optional: true },
]

const DEFAULT_VALUES = {
  salon: {
    business_name: '',
    payment_type: undefined,
    amount: '',
    transaction_id: '',
    active: true,
    referral_code: '',
  },
  branch: {
    name: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    active: true,
  },
  owner: {
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    active: true,
  },
  service_products: [],
}

/**
 * Collapsible section wrapper
 */
function Section({ id, label, optional, isOpen, onToggle, index, hasError, children }) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border transition-colors ${
        hasError
          ? 'border-rose-200 bg-rose-50/30'
          : isOpen
          ? 'border-teal-200 bg-white shadow-sm'
          : 'border-slate-200 bg-white'
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <div className="flex items-center gap-3">
          <span
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
              hasError
                ? 'bg-rose-100 text-rose-600'
                : isOpen
                ? 'bg-teal-600 text-white'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {index + 1}
          </span>
          <div>
            <span className="text-sm font-semibold text-slate-900">{label}</span>
            {optional && (
              <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                Optional
              </span>
            )}
            {hasError && (
              <span className="ml-2 rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-600">
                Fix errors
              </span>
            )}
          </div>
        </div>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-slate-400" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
        )}
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="border-t border-slate-100 px-5 pb-6 pt-5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function AdminOnboardingPage() {
  const auth = useAuthStore()
  const sectionRefs = useRef({})

  const [openSections, setOpenSections] = useState({
    salon: true,
    branch: true,
    owner: true,
    service_products: false,
  })
  const [submitting, setSubmitting] = useState(false)
  const [globalError, setGlobalError] = useState('')
  const [forbidden, setForbidden] = useState(false)
  const [successData, setSuccessData] = useState(null)

  const methods = useForm({
    resolver: zodResolver(onboardingSchema),
    defaultValues: DEFAULT_VALUES,
    mode: 'onTouched',
  })

  const {
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = methods

  const toggleSection = useCallback((sectionId) => {
    setOpenSections((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }))
  }, [])

  /** Map backend 422 dot-notation errors → RHF field errors */
  const applyBackendErrors = useCallback(
    (validationErrors) => {
      let firstKey = null
      for (const [key, messages] of Object.entries(validationErrors)) {
        const message = Array.isArray(messages) ? messages[0] : String(messages)
        // key is like "owner.email" or "branch.pincode"
        setError(key, { type: 'server', message })
        if (!firstKey) firstKey = key
      }

      // Expand sections with errors and scroll to first one
      if (firstKey) {
        const sectionId = firstKey.split('.')[0]
        setOpenSections((prev) => ({ ...prev, [sectionId]: true }))
        setTimeout(() => {
          const ref = sectionRefs.current[sectionId]
          if (ref) {
            ref.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        }, 100)
      }
    },
    [setError],
  )

  const onSubmit = async (data) => {
    setGlobalError('')
    setForbidden(false)

    if (!auth.token) {
      setGlobalError('Authentication token is missing. Please log in again.')
      return
    }

    setSubmitting(true)

    // Clean up empty service_products and empty password
    const payload = {
      ...data,
      owner: {
        ...data.owner,
        password: data.owner.password || undefined,
      },
      service_products: (data.service_products || []).filter(
        (sp) => sp.service || sp.product,
      ),
    }

    try {
      const response = await submitOnboarding(payload, auth.token)
      setSuccessData(response)
    } catch (err) {
      if (err.forbidden) {
        setForbidden(true)
        return
      }
      if (err.validationErrors) {
        applyBackendErrors(err.validationErrors)
        setGlobalError('Please fix the highlighted errors below.')
        return
      }
      setGlobalError(
        err?.response?.data?.message ||
          'Something went wrong. Please try again.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  /** Reset everything for "Create Another Salon" */
  const handleCreateAnother = useCallback(() => {
    reset(DEFAULT_VALUES)
    setSuccessData(null)
    setGlobalError('')
    setForbidden(false)
    setOpenSections({ salon: true, branch: true, owner: true, service_products: false })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [reset])

  /** Section-level error detection */
  const sectionHasError = (sectionId) => {
    if (!errors[sectionId]) return false
    return Object.keys(errors[sectionId]).length > 0
  }

  return (
    <div className="min-h-screen bg-slate-50 font-[Inter,ui-sans-serif,system-ui]">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6">
          <BrandLogo size="text-3xl" />
          <div className="flex items-center gap-2 rounded-full border border-teal-100 bg-teal-50 px-3 py-1.5">
            <span className="h-2 w-2 rounded-full bg-teal-500" />
            <span className="text-xs font-semibold text-teal-700">Super Admin</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        {/* Page heading */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">New Salon Onboarding</h1>
          <p className="mt-1 text-sm text-slate-500">
            Fill in all details to register a new salon, branch, and owner in one step.
          </p>
        </div>

        {/* Forbidden banner */}
        {forbidden && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4"
          >
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />
            <p className="text-sm font-medium text-rose-700">
              You do not have permission to perform onboarding.
            </p>
          </motion.div>
        )}

        {/* Success state */}
        <AnimatePresence mode="wait">
          {successData ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10"
            >
              <OnboardingSuccessScreen
                data={successData}
                onCreateAnother={handleCreateAnother}
              />
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                  {/* Global error banner */}
                  {globalError && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3"
                    >
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                      <p className="text-sm text-amber-800">{globalError}</p>
                    </motion.div>
                  )}

                  {/* Section accordion */}
                  <div className="space-y-4">
                    {SECTIONS.map((section, i) => (
                      <div
                        key={section.id}
                        ref={(el) => { sectionRefs.current[section.id] = el }}
                      >
                        <Section
                          id={section.id}
                          label={section.label}
                          optional={section.optional}
                          isOpen={openSections[section.id]}
                          onToggle={() => toggleSection(section.id)}
                          index={i}
                          hasError={sectionHasError(section.id)}
                        >
                          <section.component />
                        </Section>
                      </div>
                    ))}
                  </div>

                  {/* Submit */}
                  <div className="mt-8 flex items-center justify-end gap-3 border-t border-slate-200 pt-6">
                    <p className="mr-auto text-xs text-slate-400">
                      All fields marked <span className="text-rose-400">*</span> are required
                    </p>
                    <BaseButton
                      type="submit"
                      variant="primary"
                      size="lg"
                      loading={submitting}
                      disabled={submitting}
                    >
                      {submitting ? 'Creating Salon…' : 'Submit Onboarding'}
                    </BaseButton>
                  </div>
                </form>
              </FormProvider>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
