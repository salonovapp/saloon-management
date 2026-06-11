import React from 'react'
import { Controller, useFieldArray, useFormContext } from 'react-hook-form'
import { Plus, Scissors, Trash2 } from 'lucide-react'
import BaseInput from '../../../../components/ui/BaseInput.jsx'
import FormToggle from '../../../../components/ui/FormToggle.jsx'

const createServiceProduct = () => ({
  service: '',
  product: '',
  price: 0,
  duration: 30,
  active: true,
})

export default function ServiceProductsStep() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext()

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'service_products',
  })

  const spErrors = errors.service_products || []

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <Scissors className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Service Products</h2>
            <p className="text-sm text-slate-500">Optional — add services offered by this salon</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => append(createServiceProduct())}
          className="inline-flex items-center gap-1.5 rounded-xl border border-teal-200 bg-teal-50 px-3 py-1.5 text-sm font-medium text-teal-700 transition hover:bg-teal-100"
        >
          <Plus className="h-4 w-4" />
          Add Row
        </button>
      </div>

      {fields.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 py-10 text-center">
          <Scissors className="mx-auto mb-3 h-8 w-8 text-slate-300" />
          <p className="text-sm text-slate-500">No services added yet.</p>
          <button
            type="button"
            onClick={() => append(createServiceProduct())}
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-teal-600 hover:text-teal-700"
          >
            <Plus className="h-4 w-4" />
            Add your first service
          </button>
        </div>
      )}

      <div className="space-y-4">
        {fields.map((field, index) => {
          const rowErrors = spErrors[index] || {}
          return (
            <div
              key={field.id}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-700">Service #{index + 1}</p>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-rose-500 transition hover:bg-rose-50 hover:text-rose-600"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remove
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {/* Service */}
                <div>
                  <BaseInput
                    id={`sp-${index}-service`}
                    label="Service"
                    required
                    placeholder="Hair Cut"
                    error={rowErrors.service?.message}
                    {...register(`service_products.${index}.service`)}
                  />
                </div>

                {/* Product */}
                <div>
                  <BaseInput
                    id={`sp-${index}-product`}
                    label="Product"
                    required
                    placeholder="Premium"
                    error={rowErrors.product?.message}
                    {...register(`service_products.${index}.product`)}
                  />
                </div>

                {/* Price */}
                <div>
                  <BaseInput
                    id={`sp-${index}-price`}
                    label="Price (₹)"
                    required
                    type="number"
                    min="0"
                    placeholder="500"
                    error={rowErrors.price?.message}
                    {...register(`service_products.${index}.price`)}
                  />
                </div>

                {/* Duration */}
                <div>
                  <BaseInput
                    id={`sp-${index}-duration`}
                    label="Duration (min)"
                    required
                    type="number"
                    min="1"
                    placeholder="30"
                    error={rowErrors.duration?.message}
                    {...register(`service_products.${index}.duration`)}
                  />
                </div>

                {/* Active Toggle */}
                <div className="sm:col-span-2 flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50 px-4 py-2.5">
                  <p className="flex-1 text-sm text-slate-600">Service active</p>
                  <Controller
                    name={`service_products.${index}.active`}
                    control={control}
                    render={({ field: f }) => (
                      <FormToggle
                        id={`sp-${index}-active`}
                        checked={f.value}
                        onChange={f.onChange}
                        label={f.value ? 'Active' : 'Inactive'}
                      />
                    )}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
