import axios from 'axios'
import React, { useState } from 'react'
import BaseInput from '../../components/ui/BaseInput.jsx'
import BrandLogo from '../../components/ui/BrandLogo.jsx'

const USE_MOCK_AUTH = import.meta.env.VITE_USE_MOCK_AUTH !== 'false'

export default function ForgotPasswordView() {
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const submit = async (event) => {
    event.preventDefault()
    setErrorMessage('')

    const nextEmailError = /\S+@\S+\.\S+/.test(email) ? '' : 'Please enter a valid email.'
    setEmailError(nextEmailError)
    if (nextEmailError) return

    setSubmitting(true)
    try {
      if (USE_MOCK_AUTH) {
        await new Promise((resolve) => setTimeout(resolve, 400))
      } else {
        await axios.post('/v1/public/forgot-password', { email })
      }
      setSuccess(true)
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || 'Unable to send reset link right now.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0F172A] px-4 py-8 font-[Inter,ui-sans-serif,system-ui] sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-10">
          <BrandLogo size="text-6xl" />
        </div>

        <div className="mb-6 rounded-2xl border border-white/15 bg-white/5 p-4 text-white/85">
          <div className="flex items-center gap-4">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 120" className="h-20 w-24 shrink-0">
              <circle cx="90" cy="26" r="14" fill="#ffffff" opacity="0.95" />
              <path d="M76 24c3-8 25-10 28 0-3-3-8-5-14-5s-11 2-14 5z" fill="#0f172a" />
              <rect x="69" y="42" width="42" height="40" rx="14" fill="#ffffff" opacity="0.9" />
              <rect x="62" y="52" width="56" height="34" rx="12" fill="none" stroke="#ffffff" strokeOpacity="0.45" strokeWidth="2" />
              <path d="M74 68h32M82 60h16" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
              <path d="M52 56l16 11M128 56l-16 11" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" />
            </svg>
            <p className="text-sm leading-6">
              Your stylist profile, appointments, and settings stay secure. Enter your email and we will send a reset link instantly.
            </p>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
          <h1 className="text-2xl font-bold text-slate-900">Forgot password</h1>
          <p className="mt-1 text-sm text-slate-500">We will send a reset link to your email.</p>

          {success ? (
            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-slate-700">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                <p className="text-sm font-medium">Check your email</p>
              </div>
              <p className="mt-1 text-sm">If an account exists, a reset link has been sent.</p>
            </div>
          ) : null}

          {errorMessage ? (
            <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {errorMessage}
            </div>
          ) : null}

          {!success ? (
            <form className="mt-5 space-y-4" onSubmit={submit}>
              <BaseInput
                modelValue={email}
                onUpdateModelValue={setEmail}
                label="Email"
                type="email"
                placeholder="you@salon.com"
                error={emailError}
              />
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? (
                  <svg className="mr-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                    <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z" />
                  </svg>
                ) : null}
                {submitting ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          ) : null}
        </div>

        <div className="mt-6 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-center text-xs text-white/65">
          Protected by salonovapp security layer
        </div>
      </div>
    </div>
  )
}
