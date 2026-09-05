import { Search, X } from 'lucide-react'

export default function SearchBar({ value, onChange, placeholder = 'Search...', className = '' }) {
  return (
    <div className={`relative ${className}`}>
      <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="focus-ring transition-base h-9 w-full rounded-control border border-border-strong bg-surface pl-9 pr-8 text-[13px] text-ink-900 placeholder:text-ink-400 hover:border-ink-400/60"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="focus-ring transition-base absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-ink-400 hover:text-ink-700"
          aria-label="Clear search"
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
}
