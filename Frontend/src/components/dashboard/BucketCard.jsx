import { FolderClosed, Lock, LockOpen, MoreHorizontal, Trash2, ArrowUpRight, Files } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import Card from '../ui/Card'
import { VisibilityBadge } from '../ui/Badge'
import { formatDate, formatBytes } from '../../utils/format'
import { useSession } from '../../context/SessionContext'

// `stats` is { fileCount, totalSize } once loaded from the real
// GET /buckets/{id}/files endpoint, or undefined while still loading —
// we never invent placeholder numbers.
export default function BucketCard({ bucket, stats, onOpen, onDelete }) {
  const { isUnlocked } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)
  const ref = useRef(null)
  const unlocked = isUnlocked(bucket.bucket_id)

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  return (
    <Card interactive onClick={() => onOpen(bucket)} className="group flex flex-col gap-3 p-4">
      <div className="flex items-start justify-between">
        <span className="relative flex h-9 w-9 items-center justify-center rounded-control bg-accent-50 text-accent-600">
          <FolderClosed size={17} />
          <span
            className={`absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border border-surface ${
              unlocked ? 'bg-accent-600 text-white' : 'bg-ink-900/10 text-ink-500'
            }`}
            title={unlocked ? 'Unlocked this session' : 'Locked'}
          >
            {unlocked ? <LockOpen size={9} /> : <Lock size={9} />}
          </span>
        </span>
        <div className="relative" ref={ref}>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setMenuOpen((v) => !v)
            }}
            className="focus-ring transition-base rounded-control p-1.5 text-ink-400 opacity-0 hover:bg-ink-900/5 hover:text-ink-700 group-hover:opacity-100"
            aria-label="Bucket actions"
          >
            <MoreHorizontal size={16} />
          </button>
          {menuOpen && (
            <div className="animate-scale-in absolute right-0 top-9 z-10 w-40 rounded-control border border-border bg-surface p-1 shadow-raised">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setMenuOpen(false)
                  onDelete(bucket)
                }}
                className="transition-base flex w-full items-center gap-2 rounded-control px-2.5 py-1.5 text-left text-[13px] font-medium text-danger-600 hover:bg-danger-50"
              >
                <Trash2 size={14} />
                Delete bucket
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="min-w-0">
        <p className="truncate text-[14px] font-medium text-ink-900">{bucket.bucket_name}</p>
        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-ink-400">
          <Files size={11} />
          {stats ? `${stats.fileCount} file${stats.fileCount === 1 ? '' : 's'} \u00b7 ${formatBytes(stats.totalSize)}` : '\u2026'}
        </p>
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-border pt-2.5">
        <div className="flex items-center gap-2">
          <VisibilityBadge visibility={bucket.visibility} />
          <span className="text-[11px] text-ink-400">Updated {formatDate(bucket.updated_at)}</span>
        </div>
        <span className="flex items-center gap-1 text-xs font-medium text-accent-600 opacity-0 transition-base group-hover:opacity-100">
          Open <ArrowUpRight size={13} />
        </span>
      </div>
    </Card>
  )
}
