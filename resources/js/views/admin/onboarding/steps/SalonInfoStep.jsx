import React from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { Building2, CreditCard, Hash, Tag } from 'lucide-react'
import BaseInput from '../../../../components/ui/BaseInput.jsx'
import BaseSelect from '../../../../components/ui/BaseSelect.jsx'
import FormToggle from '../../../../components/ui/FormToggle.jsx'

const PAYMENT_TYPES = [
  { value: 'Monthly', label: 'Monthly' },
  { value: 'Quarterly', label: 'Quarterly' },
  { value: 'Yearly', label: 'Yearly' },
  { value: 'One-time', label: 'One-time' },
]

export default function SalonInfoStep() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext()

  const salonErrors = errors.salon || {}

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
          <Building2 className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Salon Information</h2>
          <p className="text-sm text-slate-500">Basic salon details and payment info</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Business Name */}
        <div className="sm:col-span-2">
          <BaseInput
            id="salon-business_name"
            label="Business Name"
            required
            placeholder="ABC Salon"
            prefix={Building2}
            error={salonErrors.business_name?.message}
            {...register('salon.business_name')}
          />
        </div>

        {/* Payment Type */}
        <div>
          <Controller
            name="salon.payment_type"
            control={control}
            render={({ field }) => (
              <BaseSelect
                id="salon-payment_type"
                label="Payment Type"
                placeholder="Select payment type"
                options={PAYMENT_TYPES}
                error={salonErrors.payment_type?.message}
                {...field}
              />
            )}
          />
        </div>

        {/* Amount */}
        <div>
          <BaseInput
            id="salon-amount"
            label="Amount"
            required
            type="number"
            min="0"
            placeholder="1000"
            prefix={CreditCard}
            error={salonErrors.amount?.message}
            {...register('salon.amount')}
          />
        </div>

        {/* Transaction ID */}
        <div>
          <BaseInput
            id="salon-transaction_id"
            label="Transaction ID"
            required
            placeholder="TXN123456"
            prefix={Hash}
            error={salonErrors.transaction_id?.message}
            {...register('salon.transaction_id')}
          />
        </div>

        {/* Referral Code */}
        <div>
          <BaseInput
            id="salon-referral_code"
            label="Referral Code"
            placeholder="REF100 (optional)"
            prefix={Tag}
            error={salonErrors.referral_code?.message}
            {...register('salon.referral_code')}
          />
        </div>

        {/* Active Toggle */}
        <div className="sm:col-span-2 flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-700">Active Status</p>
            <p className="text-xs text-slate-500">Enable or disable this salon immediately upon creation</p>
          </div>
          <Controller
            name="salon.active"
            control={control}
            render={({ field }) => (
              <FormToggle
                id="salon-active"
                checked={field.value}
                onChange={field.onChange}
                label={field.value ? 'Active' : 'Inactive'}
              />
            )}
          />
        </div>
      </div>
    </div>
  )
}
