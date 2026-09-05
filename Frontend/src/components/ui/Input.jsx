import { forwardRef, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

const Input = forwardRef(function Input(
  { label, error, hint, icon: Icon, className = '', id, type = 'text', ...props },
  ref
) {
  const inputId = id || props.name
  const [showPassword, setShowPassword] = useState(false)

  const isPassword = type === 'password'
  const inputType = isPassword && showPassword ? 'text' : type

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-[13px] font-medium text-ink-700">
          {label}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <Icon
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"
          />
        )}

        <input
          ref={ref}
          id={inputId}
          type={inputType}
          className={`focus-ring transition-base h-10 w-full rounded-control border bg-surface px-3 text-sm text-ink-900 placeholder:text-ink-400 ${
            Icon ? 'pl-9' : ''
          } ${
            isPassword ? 'pr-10' : ''
          } ${
            error
              ? 'border-danger-500 focus-visible:ring-danger-500'
              : 'border-border-strong hover:border-ink-400/60'
          } ${className}`}
          aria-invalid={!!error}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(prev => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 transition hover:text-ink-700"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>

      {error && <p className="text-xs text-danger-600">{error}</p>}
      {!error && hint && <p className="text-xs text-ink-400">{hint}</p>}
    </div>
  )
})

export default Input