import React, { useMemo, useState } from 'react'

export default function BaseInput({
  modelValue = '',
  onUpdateModelValue,
  id = '',
  label = '',
  type = 'text',
  placeholder = '',
  autocomplete = 'off',
  error = '',
  disabled = false,
  toggleableType = false,
  onBlur,
  icon,
}) {
  const [show, setShow] = useState(false)

  const currentType = useMemo(() => {
    if (!toggleableType || type !== 'password') return type
    return show ? 'text' : 'password'
  }, [toggleableType, type, show])

  return (
    <div className="w-full">
      {label ? (
        <label htmlFor={id} className="mb-2 block text-sm font-medium text-slate-700">
          {label}
        </label>
      ) : null}

      <div
        className={`group relative flex items-center rounded-xl border bg-white transition ${
          error
            ? 'border-rose-400 ring-2 ring-rose-100'
            : 'border-slate-300 focus-within:border-slate-900 focus-within:ring-2 focus-within:ring-slate-200'
        }`}
      >
        {icon ? <span className="pl-3 text-slate-400">{icon}</span> : null}

        <input
          id={id}
          type={currentType}
          value={modelValue}
          placeholder={placeholder}
          autoComplete={autocomplete}
          disabled={disabled}
          className={`w-full rounded-xl bg-transparent px-3 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none ${icon ? 'pl-2' : ''}`}
          onChange={(e) => onUpdateModelValue?.(e.target.value)}
          onBlur={onBlur}
        />

        {toggleableType ? (
          <button
            type="button"
            className="mr-2 rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            onClick={() => setShow((v) => !v)}
          >
            <span className="sr-only">{show ? 'Hide' : 'Show'} value</span>
            {show ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M3 3l18 18" />
                <path d="M10.58 10.58a2 2 0 102.83 2.83" />
                <path d="M9.88 5.09A9.77 9.77 0 0112 4c5.5 0 9.5 4 10 8a10.78 10.78 0 01-3.12 5.25" />
                <path d="M6.61 6.61A10.75 10.75 0 002 12c.5 4 4.5 8 10 8a9.77 9.77 0 005.09-1.42" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M2 12s3.5-8 10-8 10 8 10 8-3.5 8-10 8-10-8-10-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        ) : null}
      </div>

      {error ? <p className="mt-1 text-xs text-rose-600">{error}</p> : null}
    </div>
  )
}
