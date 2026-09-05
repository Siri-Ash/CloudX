import { Loader2 } from 'lucide-react'

const VARIANTS = {
  primary:
    'bg-accent-600 text-white hover:bg-accent-700 active:bg-accent-700 disabled:bg-accent-600/50',
  secondary:
    'bg-surface text-ink-700 border border-border-strong hover:bg-canvas active:bg-border/40 disabled:opacity-50',
  ghost:
    'bg-transparent text-ink-500 hover:bg-ink-900/5 hover:text-ink-700 disabled:opacity-50',
  destructive:
    'bg-danger-500 text-white hover:bg-danger-600 active:bg-danger-600 disabled:bg-danger-500/50',
}

const SIZES = {
  sm: 'h-8 px-3 text-[13px] gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-11 px-5 text-[15px] gap-2',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  className = '',
  children,
  ...props
}) {
  return (
    <button
      className={`focus-ring transition-base inline-flex items-center justify-center rounded-control font-medium disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 size={size === 'sm' ? 14 : 16} className="animate-spin" />
      ) : (
        Icon && <Icon size={size === 'sm' ? 14 : 16} />
      )}
      {children}
    </button>
  )
}
