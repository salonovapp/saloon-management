import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react'

const categories = [
  'Hair',
  'Skin',
  'Nails',
  'Spa',
  'Makeup',
  'Bridal',
  'Beard',
]

const createService = () => ({
  name: '',
  category: '',
  duration: 60,
  price: 0,
  bufferTime: 5,
})

const fieldClass = 'w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400'
const selectClass = 'w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900'
const rangeWrapClass = 'rounded-xl border border-slate-300 bg-white px-3 py-2'
const priceInputClass = 'w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-8 pr-3 text-sm text-slate-900 placeholder:text-slate-400'

const StepService = forwardRef(function StepService({ modelValue = { services: [], skipped: false }, onUpdateModelValue }, ref) {
  const [services, setServices] = useState(
    modelValue.services?.length ? structuredClone(modelValue.services) : [createService()],
  )
  const [skipped, setSkipped] = useState(Boolean(modelValue.skipped))
  const [error, setError] = useState('')

  const formatDuration = (minutes) => {
    const hour = Math.floor(minutes / 60)
    const min = minutes % 60
    if (!hour) return `${min}m`
    if (!min) return `${hour}h`
    return `${hour}h ${min}m`
  }

  const addService = () => {
    if (services.length >= 5) return
    setServices((previous) => [...previous, createService()])
    setSkipped(false)
  }

  const removeService = (index) => {
    setServices((previous) => previous.filter((_, serviceIndex) => serviceIndex !== index))
  }

  const skipForNow = () => {
    setSkipped(true)
    setError('')
  }

  const validate = () => {
    if (skipped) return true

    const hasInvalid = services.some(
      (service) => !service.name || !service.category || !service.duration || service.price < 0,
    )

    const nextError = hasInvalid
      ? 'Please complete required details for each service, or choose "Skip for now".'
      : ''

    setError(nextError)
    return !hasInvalid
  }

  const getData = () => ({
    skipped,
    services: structuredClone(services),
  })

  useImperativeHandle(ref, () => ({
    validate,
    getData,
  }), [services, skipped])

  useEffect(() => {
    onUpdateModelValue?.(getData())
  }, [services, skipped, onUpdateModelValue])

  return (
    <div>
      <h2 className="text-2xl font-semibold text-slate-900">Add First Service</h2>
      <p className="mt-1 text-sm text-slate-500">
        Create your first services so appointments can be booked immediately.
      </p>

      {services.map((service, index) => (
        <div key={index} className="mt-5 rounded-xl border border-slate-200 p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-800">Service {index + 1}</p>
            {services.length > 1 ? (
              <button
                type="button"
                className="text-xs font-medium text-rose-600 hover:text-rose-700"
                onClick={() => removeService(index)}
              >
                Remove
              </button>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">Name</label>
              <input
                value={service.name}
                type="text"
                className={fieldClass}
                placeholder="Haircut + Styling"
                onChange={(event) => {
                  setServices((previous) => previous.map((item, serviceIndex) => (
                    serviceIndex === index ? { ...item, name: event.target.value } : item
                  )))
                }}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Category</label>
              <select
                value={service.category}
                className={selectClass}
                onChange={(event) => {
                  setServices((previous) => previous.map((item, serviceIndex) => (
                    serviceIndex === index ? { ...item, category: event.target.value } : item
                  )))
                }}
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Duration</label>
              <div className={rangeWrapClass}>
                <input
                  value={service.duration}
                  type="range"
                  min="15"
                  max="240"
                  step="15"
                  className="w-full accent-slate-900"
                  onChange={(event) => {
                    setServices((previous) => previous.map((item, serviceIndex) => (
                      serviceIndex === index ? { ...item, duration: Number(event.target.value) } : item
                    )))
                  }}
                />
                <p className="mt-1 text-xs text-slate-600">{formatDuration(service.duration)}</p>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Price (INR)</label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-slate-500">₹</span>
                <input
                  value={service.price}
                  type="number"
                  min="0"
                  className={priceInputClass}
                  placeholder="799"
                  onChange={(event) => {
                    setServices((previous) => previous.map((item, serviceIndex) => (
                      serviceIndex === index ? { ...item, price: Number(event.target.value) } : item
                    )))
                  }}
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Buffer Time</label>
              <select
                value={service.bufferTime}
                className={selectClass}
                onChange={(event) => {
                  setServices((previous) => previous.map((item, serviceIndex) => (
                    serviceIndex === index ? { ...item, bufferTime: Number(event.target.value) } : item
                  )))
                }}
              >
                <option value={0}>0 min</option>
                <option value={5}>5 min</option>
                <option value={10}>10 min</option>
                <option value={15}>15 min</option>
              </select>
            </div>
          </div>
        </div>
      ))}

      <div className="mt-4 flex items-center justify-between">
        <button
          type="button"
          className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={services.length >= 5}
          onClick={addService}
        >
          + Add Another Service
        </button>

        <button
          type="button"
          className="text-sm text-slate-500 hover:text-slate-700"
          onClick={skipForNow}
        >
          Skip for now
        </button>
      </div>

      {error ? <p className="mt-2 text-xs text-rose-600">{error}</p> : null}
    </div>
  )
})

export default StepService
