import React, { forwardRef, useImperativeHandle, useRef } from 'react'

const StepAccount = forwardRef(function StepAccount({ modelValue }, ref) {
  const account = modelValue || {}
  const trialStartedAt = useRef(Date.now())

  const daysLeft = Math.max(14 - Math.floor((Date.now() - trialStartedAt.current) / (1000 * 60 * 60 * 24)), 0)

  useImperativeHandle(ref, () => ({
    validate: () => true,
    getData: () => ({ ...account, plan: 'Free Trial' }),
  }), [account])

  return (
    <div>
      <h2 className="text-2xl font-semibold text-slate-900">Account Setup</h2>
      <p className="mt-1 text-sm text-slate-500">
        Review your account details before creating your first branch.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Owner name</p>
          <p className="mt-1 text-sm font-medium text-slate-900">{account.name || '-'}</p>
        </div>
        <div className="rounded-xl border border-slate-200 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Email</p>
          <p className="mt-1 text-sm font-medium text-slate-900">{account.email || '-'}</p>
        </div>
        <div className="rounded-xl border border-slate-200 p-4 sm:col-span-2">
          <p className="text-xs uppercase tracking-wide text-slate-500">Plan</p>
          <p className="mt-1 text-sm font-medium text-slate-900">Free Trial</p>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-teal-200 bg-teal-50 p-4">
        <p className="text-sm font-semibold text-teal-800">Your 14-day free trial is active.</p>
        <p className="mt-1 text-sm text-teal-700">
          {daysLeft} days remaining to explore SalonOS without limits.
        </p>
      </div>
    </div>
  )
})

export default StepAccount
