import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, LogOut, KeyRound, User } from 'lucide-react'
import { useSession } from '../../context/SessionContext'
import { initials } from '../../utils/format'

export default function AccountMenu() {
  const { user, logout } = useSession()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  if (!user) return null

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="focus-ring transition-base flex items-center gap-2 rounded-control border border-transparent py-1 pl-1 pr-2 hover:border-border-strong hover:bg-canvas"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-100 text-[11px] font-semibold text-accent-600">
          {initials(user.username) || 'U'}
        </span>
        <span className="hidden text-[13px] font-medium text-ink-700 sm:block">{user.username}</span>
        <ChevronDown size={14} className="text-ink-400" />
      </button>

      {open && (
        <div className="animate-scale-in absolute right-0 top-11 w-64 origin-top-right rounded-card border border-border bg-surface p-1.5 shadow-raised">
          <div className="px-2.5 py-2">
            <p className="text-sm font-medium text-ink-900">{user.username}</p>
            <p className="truncate text-xs text-ink-400">{user.email}</p>
          </div>
          <div className="my-1 h-px bg-border" />
          <button
            disabled
            className="flex w-full cursor-not-allowed items-center gap-2.5 rounded-control px-2.5 py-2 text-left text-[13px] text-ink-400"
            title="Not available yet"
          >
            <KeyRound size={15} />
            Change password
            <span className="ml-auto rounded-full bg-ink-900/5 px-1.5 py-0.5 text-[10px] text-ink-400">Soon</span>
          </button>
          <button
            disabled
            className="flex w-full cursor-not-allowed items-center gap-2.5 rounded-control px-2.5 py-2 text-left text-[13px] text-ink-400"
            title="Not available yet"
          >
            <User size={15} />
            Edit profile
            <span className="ml-auto rounded-full bg-ink-900/5 px-1.5 py-0.5 text-[10px] text-ink-400">Soon</span>
          </button>
          <div className="my-1 h-px bg-border" />
          <button
            onClick={handleLogout}
            className="transition-base flex w-full items-center gap-2.5 rounded-control px-2.5 py-2 text-left text-[13px] font-medium text-danger-600 hover:bg-danger-50"
          >
            <LogOut size={15} />
            Log out
          </button>
        </div>
      )}
    </div>
  )
}
