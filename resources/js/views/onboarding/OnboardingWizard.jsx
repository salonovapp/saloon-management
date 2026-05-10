import axios from 'axios'
import React, { createElement, useCallback, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/auth'
import BrandLogo from '../../components/ui/BrandLogo.jsx'
import StepAccount from './steps/StepAccount.jsx'
import StepBranch from './steps/StepBranch.jsx'
import StepService from './steps/StepService.jsx'

const USE_MOCK_AUTH = import.meta.env.VITE_USE_MOCK_AUTH === 'true'
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

export default function OnboardingWizard() {
  const router = useNavigate()
  const auth = useAuthStore()
  const activeStepRef = useRef(null)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [onboardingData, setOnboardingData] = useState({
    account: {
      name: auth.user?.name || '',
      email: auth.user?.email || '',
      plan: auth.planName || 'Free Trial',
    },
    branch: {},
    service: {
      skipped: false,
      services: [],
    },
  })

  const steps = useMemo(() => ([
    {
      id: 'account',
      title: 'Account Setup',
      subtitle: 'Confirm owner profile and trial plan',
      component: StepAccount,
    },
    {
      id: 'branch',
      title: 'Your Salon Branch',
      subtitle: 'Add branch contact and opening hours',
      component: StepBranch,
    },
    {
      id: 'service',
      title: 'Add First Service',
      subtitle: 'Create services for online bookings',
      component: StepService,
    },
  ]), [])

  const stepKeyByIndex = ['account', 'branch', 'service']
  const currentStepKey = stepKeyByIndex[currentStepIndex]
  const handleStepDataUpdate = useCallback((value) => {
    setOnboardingData((previous) => ({
      ...previous,
      [currentStepKey]: value,
    }))
  }, [currentStepKey])

  const handleSkipForNow = useCallback(async (serviceData) => {
    const updatedOnboardingData = {
      ...onboardingData,
      service: serviceData,
    }
    setOnboardingData(updatedOnboardingData)
    setSubmitError('')
    setSubmitting(true)
    try {
      await saveStep(2, updatedOnboardingData)
      if (!USE_MOCK_AUTH) {
        const email = auth.user?.email || onboardingData.account?.email
        await axios.post(`${API_BASE_URL}/v1/onboarding/complete`, { email })
      }
      auth.markOnboardingCompleted()
      router('/dashboard')
    } catch (error) {
      setSubmitError(error?.response?.data?.message || 'Unable to skip services right now. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }, [auth, onboardingData, router])

  const currentStepData = onboardingData[currentStepKey]
  const currentStepComponent = steps[currentStepIndex].component
  const isLastStep = currentStepIndex === steps.length - 1

  const circleClass = (index) => {
    if (index < currentStepIndex) return 'border-teal-500 bg-teal-500 text-white'
    if (index === currentStepIndex) return 'border-teal-500 text-teal-300'
    return 'border-slate-500 text-slate-300'
  }

  const persistCurrentStepData = () => {
    if (activeStepRef.current?.getData) {
      setOnboardingData((previous) => ({
        ...previous,
        [currentStepKey]: activeStepRef.current.getData(),
      }))
    }
  }

  const goBack = () => {
    persistCurrentStepData()
    if (currentStepIndex > 0) {
      setCurrentStepIndex((previous) => previous - 1)
    }
  }

  const saveStep = async (index, payload) => {
    if (USE_MOCK_AUTH) {
      localStorage.setItem('salonos_mock_onboarding', JSON.stringify(payload))
      await new Promise((resolve) => setTimeout(resolve, 350))
      return
    }

    const email = auth.user?.email || onboardingData.account?.email
    if (!email) {
      throw new Error('Unable to detect current user email for onboarding.')
    }

    if (index === 0) {
      await axios.post(`${API_BASE_URL}/v1/onboarding/account`, {
        email,
        name: payload.account?.name || '',
        plan: payload.account?.plan || 'Free Trial',
      })
      return
    }

    if (index === 1) {
      await axios.post(`${API_BASE_URL}/v1/onboarding/branch`, {
        email,
        ...payload.branch,
      })
      return
    }

    if (index === 2) {
      await axios.post(`${API_BASE_URL}/v1/onboarding/services`, {
        email,
        skipped: Boolean(payload.service?.skipped),
        services: payload.service?.services || [],
      })
    }
  }

  const goNext = async () => {
    setSubmitError('')
    const valid = activeStepRef.current?.validate ? activeStepRef.current.validate() : true
    if (!valid) return

    const nextData = activeStepRef.current?.getData ? activeStepRef.current.getData() : currentStepData
    const updatedOnboardingData = {
      ...onboardingData,
      [currentStepKey]: nextData,
    }
    setOnboardingData(updatedOnboardingData)

    setSubmitting(true)
    try {
      await saveStep(currentStepIndex, updatedOnboardingData)

      if (!isLastStep) {
        setCurrentStepIndex((previous) => previous + 1)
        return
      }

      if (!USE_MOCK_AUTH) {
        const email = auth.user?.email || onboardingData.account?.email
        await axios.post(`${API_BASE_URL}/v1/onboarding/complete`, { email })
      }
      auth.markOnboardingCompleted()
    } catch (error) {
      setSubmitError(error?.response?.data?.message || 'Unable to save this step right now. Please try again.')
      return
    } finally {
      setSubmitting(false)
    }

    router('/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#0F172A] px-4 py-8 font-[Inter,ui-sans-serif,system-ui] sm:px-8">
      <div className="mx-auto grid max-w-6xl overflow-hidden rounded-3xl bg-white shadow-2xl lg:grid-cols-3">
        <aside className="bg-slate-950 p-6 text-white lg:col-span-1">
          <div className="mb-8">
            <BrandLogo size="text-5xl" />
            <p className="mt-2 text-sm text-white/65">Start your salon in one modern workspace</p>
          </div>

          <p className="text-xs uppercase tracking-[0.2em] text-white/60">Tenant Onboarding</p>
          <h1 className="mt-2 text-2xl font-semibold">Set up your salon</h1>
          <p className="mt-2 text-sm text-white/65">Just a few details to launch your workspace.</p>

          <div className="mt-8 space-y-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-start gap-3">
                <div className={`mt-0.5 flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold ${circleClass(index)}`}>
                  {index + 1}
                </div>
                <div>
                  <p className="text-sm font-medium">{step.title}</p>
                  <p className="text-xs text-white/55">{step.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </aside>

        <section className="p-6 lg:col-span-2 lg:p-8">
          {submitError ? (
            <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {submitError}
            </div>
          ) : null}

          {createElement(currentStepComponent, {
            ref: activeStepRef,
            modelValue: currentStepData,
            onUpdateModelValue: handleStepDataUpdate,
            onSkipForNow: currentStepKey === 'service' ? handleSkipForNow : undefined,
          })}

          <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-5">
            <button
              type="button"
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={currentStepIndex === 0 || submitting}
              onClick={goBack}
            >
              Back
            </button>

            <button
              type="button"
              className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
              disabled={submitting}
              onClick={goNext}
            >
              {submitting ? 'Saving...' : isLastStep ? 'Finish Setup' : 'Next'}
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
