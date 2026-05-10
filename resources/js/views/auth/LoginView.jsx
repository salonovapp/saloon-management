import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import BaseInput from '../../components/ui/BaseInput.jsx'
import { useAuthStore } from '../../stores/auth'
import BrandLogo from '../../components/ui/BrandLogo.jsx'


export default function LoginView() {
  const router = useNavigate()
  const auth = useAuthStore()

  const [submitting, setSubmitting] = useState(false)
  const [authError, setAuthError] = useState('')
  const [errors, setErrors] = useState({ email: '', password: '' })
  const [form, setForm] = useState({ email: '', password: '', remember: false })

  const validateEmail = () => {
    setErrors((prev) => ({
      ...prev,
      email: /\S+@\S+\.\S+/.test(form.email) ? '' : 'Please enter a valid email address.',
    }))
  }

  const validate = () => {
    const next = {
      email: /\S+@\S+\.\S+/.test(form.email) ? '' : 'Please enter a valid email address.',
      password: form.password.length >= 6 ? '' : 'Password must be at least 6 characters.',
    }
    setErrors(next)
    return !next.email && !next.password
  }

  const submit = async (e) => {
    e.preventDefault()
    setAuthError('')
    if (!validate()) return

    setSubmitting(true)
    try {
      const response = await auth.login(
        form.email,
        form.password,
        form.remember ? 'web-remember' : 'web',
      )
      const data = response?.data || response || {}
      const shouldOnboard = Boolean(data.should_onboard || data?.data?.should_onboard)
      const needs2fa = Boolean(
        data.requires_2fa || data.two_factor_required || data.next_step === '2fa',
      )
      if (needs2fa) {
        router('/verify-2fa')
        return
      }
      router(shouldOnboard ? '/onboarding' : '/dashboard')
    } catch (error) {
      setAuthError(error?.response?.data?.message || 'Invalid credentials. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0F172A] font-[Inter,ui-sans-serif,system-ui] text-white">
      <div className="grid min-h-screen lg:grid-cols-2">
        <section className="relative hidden overflow-hidden border-r border-white/10 p-10 lg:flex lg:flex-col lg:justify-between">
          <div>

          <div className="mb-10">
  <BrandLogo size="text-6xl" />
</div>


            <h1 className="max-w-lg text-4xl font-semibold leading-tight">
              Run your salon with clarity and control.
            </h1>
            <p className="mt-4 max-w-md text-sm text-white/70">
              Appointments, customers, billing, and operations - all in one workspace.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-white/15 bg-white/5 p-5">
              <p className="text-3xl font-semibold">8,458</p>
              <p className="mt-1 text-sm text-white/65">New Customers</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/5 p-5">
              <p className="text-3xl font-semibold">155K</p>
              <p className="mt-1 text-sm text-white/65">Total Orders</p>
            </div>
            <div className="col-span-2 rounded-2xl border border-white/15 bg-white/5 p-5">
              <p className="text-3xl font-semibold">$42.5K</p>
              <p className="mt-1 text-sm text-white/65">Monthly Revenue</p>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center px-4 py-10 sm:px-8">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl sm:p-8">

          <div className="mb-6 lg:hidden">
  <BrandLogo size="text-4xl" />
</div>


            <h2 className="text-2xl font-bold text-slate-900">Welcome back</h2>
            <p className="mt-1 text-sm text-slate-500">
              Sign in to your account and continue managing your salon.
            </p>

            {authError ? (
              <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {authError}
              </div>
            ) : null}

            <form className="mt-5 space-y-4" onSubmit={submit}>
              <BaseInput
                id="email"
                modelValue={form.email}
                onUpdateModelValue={(v) => setForm((f) => ({ ...f, email: v }))}
                label="Email"
                type="email"
                autocomplete="email"
                placeholder="you@salon.com"
                error={errors.email}
                onBlur={validateEmail}
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M4 6h16v12H4z" />
                    <path d="M4 8l8 6 8-6" />
                  </svg>
                }
              />

              <BaseInput
                id="password"
                modelValue={form.password}
                onUpdateModelValue={(v) => setForm((f) => ({ ...f, password: v }))}
                label="Password"
                type="password"
                autocomplete="current-password"
                placeholder="Enter your password"
                error={errors.password}
                toggleableType
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect x="4" y="10" width="16" height="10" rx="2" />
                    <path d="M8 10V7a4 4 0 118 0v3" />
                  </svg>
                }
              />

              <div className="flex items-center justify-between">
                <label className="inline-flex items-center gap-2 text-sm text-slate-600">
                  <input
                    checked={form.remember}
                    onChange={(e) => setForm((f) => ({ ...f, remember: e.target.checked }))}
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                  />
                  Remember me
                </label>

                <Link to="/forgot-password" className="text-sm font-medium text-slate-900 hover:text-slate-700">
                  Forgot password?
                </Link>
              </div>

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
                {submitting ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <p className="mt-5 text-center text-sm text-slate-600">
              New salon?{' '}
              <Link to="/register" className="font-semibold text-slate-900 hover:text-slate-700">
                Start free trial
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
