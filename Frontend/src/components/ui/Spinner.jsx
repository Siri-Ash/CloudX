import { Loader2 } from 'lucide-react'

export default function Spinner({ label, size = 20, className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 py-10 text-ink-400 ${className}`}>
      <Loader2 size={size} className="animate-spin text-accent-500" />
      {label && <p className="text-sm">{label}</p>}
    </div>
  )
}
