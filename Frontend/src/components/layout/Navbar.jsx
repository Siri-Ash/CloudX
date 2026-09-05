import { useNavigate } from 'react-router-dom'
import { Cloud } from 'lucide-react'
import SearchBar from '../ui/SearchBar'
import AccountMenu from './AccountMenu'

export default function Navbar({ search, onSearchChange, searchPlaceholder }) {
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <button
          onClick={() => navigate('/')}
          className="focus-ring transition-base flex shrink-0 items-center gap-2 rounded-control py-1 pr-1 hover:opacity-80"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-[7px] bg-accent-600 text-white">
            <Cloud size={16} strokeWidth={2.4} />
          </span>
          <span className="font-display text-[15px] font-bold tracking-tight text-ink-900">
            CloudX
          </span>
        </button>

        {onSearchChange && (
          <div className="hidden flex-1 justify-center sm:flex">
            <SearchBar
              value={search}
              onChange={onSearchChange}
              placeholder={searchPlaceholder || 'Search'}
              className="w-full max-w-sm"
            />
          </div>
        )}

        <div className="ml-auto flex items-center gap-3">
          <AccountMenu />
        </div>
      </div>

      {onSearchChange && (
        <div className="px-4 pb-3 sm:hidden">
          <SearchBar value={search} onChange={onSearchChange} placeholder={searchPlaceholder || 'Search'} />
        </div>
      )}
    </header>
  )
}
