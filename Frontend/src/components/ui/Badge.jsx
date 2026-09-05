import { Lock, Globe2 } from 'lucide-react'

const TONES = {
  neutral: 'bg-ink-900/5 text-ink-500',
  accent: 'bg-accent-50 text-accent-600',
  success: 'bg-success-50 text-success-600',
  warning: 'bg-warning-50 text-warning-500',
  danger: 'bg-danger-50 text-danger-600',
}

export function Badge({ tone = 'neutral', children, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  )
}

export function VisibilityBadge({ visibility }) {
  const isPrivate = visibility !== 'public'
  return (
    <Badge tone={isPrivate ? 'neutral' : 'accent'}>
      {isPrivate ? <Lock size={11} /> : <Globe2 size={11} />}
      {isPrivate ? 'Private' : 'Public'}
    </Badge>
  )
}
