import { useEffect, useMemo, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, FolderPlus, PackageOpen, Clock, Boxes, Files, HardDrive } from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import Button from '../components/ui/Button'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import BucketCard from '../components/dashboard/BucketCard'
import CreateBucketModal from '../components/dashboard/CreateBucketModal'
import UnlockBucketModal from '../components/dashboard/UnlockBucketModal'
import { getBuckets, deleteBucket } from '../api/buckets'
import { getFiles } from '../api/files'
import { useToast } from '../context/ToastContext'
import { useSession } from '../context/SessionContext'
import { formatBytes } from '../utils/format'

export default function Dashboard() {
  const toast = useToast()
  const navigate = useNavigate()
  const { isUnlocked } = useSession()

  const [buckets, setBuckets] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [search, setSearch] = useState('')

  // bucket_id -> { fileCount, totalSize }, filled in from the real
  // GET /buckets/{id}/files endpoint (the owner can list files without
  // opening the bucket first — the backend only checks ownership there).
  const [stats, setStats] = useState({})

  const [createOpen, setCreateOpen] = useState(false)
  const [unlockTarget, setUnlockTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const loadStatsFor = useCallback(async (bucketList) => {
    const results = await Promise.allSettled(bucketList.map((b) => getFiles(b.bucket_id)))
    setStats((prev) => {
      const next = { ...prev }
      results.forEach((result, i) => {
        if (result.status === 'fulfilled') {
          const files = Array.isArray(result.value) ? result.value : []
          next[bucketList[i].bucket_id] = {
            fileCount: files.length,
            totalSize: files.reduce((sum, f) => sum + (f.file_size || 0), 0),
          }
        }
      })
      return next
    })
  }, [])

  const loadBuckets = async () => {
    setLoading(true)
    setLoadError('')
    try {
      const data = await getBuckets()
      const list = Array.isArray(data) ? data : []
      setBuckets(list)
      loadStatsFor(list)
    } catch (err) {
      setLoadError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBuckets()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filtered = useMemo(() => {
    if (!search.trim()) return buckets
    const q = search.trim().toLowerCase()
    return buckets.filter((b) => b.bucket_name?.toLowerCase().includes(q))
  }, [buckets, search])

  const recentlyUsed = useMemo(
    () => buckets.filter((b) => isUnlocked(b.bucket_id)).slice(0, 6),
    [buckets, isUnlocked]
  )

  const totals = useMemo(() => {
    const values = Object.values(stats)
    return {
      buckets: buckets.length,
      files: values.reduce((sum, s) => sum + s.fileCount, 0),
      size: values.reduce((sum, s) => sum + s.totalSize, 0),
      statsReady: values.length === buckets.length && buckets.length > 0,
    }
  }, [buckets, stats])

  const handleOpenBucket = (bucket) => {
    if (isUnlocked(bucket.bucket_id)) {
      navigate(`/buckets/${bucket.bucket_id}`, {
        state: { bucketName: bucket.bucket_name, visibility: bucket.visibility },
      })
      return
    }
    setUnlockTarget(bucket)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteBucket(deleteTarget.bucket_id)
      toast.success(`Bucket "${deleteTarget.bucket_name}" deleted.`)
      setBuckets((prev) => prev.filter((b) => b.bucket_id !== deleteTarget.bucket_id))
      setStats((prev) => {
        const next = { ...prev }
        delete next[deleteTarget.bucket_id]
        return next
      })
      setDeleteTarget(null)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-canvas">
      <Navbar search={search} onSearchChange={setSearch} searchPlaceholder="Search your buckets" />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-ink-400">Storage / Overview</p>
            <h1 className="mt-1 text-[22px] font-semibold">Your storage</h1>
            <p className="mt-1 text-sm text-ink-500">Manage your buckets and everything inside them.</p>
          </div>
          <Button icon={Plus} onClick={() => setCreateOpen(true)}>
            Create new bucket
          </Button>
        </div>

        {!loading && !loadError && buckets.length > 0 && (
          <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="flex items-center gap-3 rounded-card border border-border bg-surface p-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-control bg-accent-50 text-accent-600">
                <Boxes size={16} />
              </span>
              <div>
                <p className="text-[17px] font-semibold leading-none">{totals.buckets}</p>
                <p className="mt-1 text-xs text-ink-500">Total buckets</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-card border border-border bg-surface p-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-control bg-accent-50 text-accent-600">
                <Files size={16} />
              </span>
              <div>
                <p className="text-[17px] font-semibold leading-none">{totals.statsReady ? totals.files : '\u2026'}</p>
                <p className="mt-1 text-xs text-ink-500">Total files</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-card border border-border bg-surface p-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-control bg-accent-50 text-accent-600">
                <HardDrive size={16} />
              </span>
              <div>
                <p className="text-[17px] font-semibold leading-none">
                  {totals.statsReady ? formatBytes(totals.size) : '\u2026'}
                </p>
                <p className="mt-1 text-xs text-ink-500">Total storage used</p>
              </div>
            </div>
          </div>
        )}

        {recentlyUsed.length > 0 && (
          <section className="mb-8">
            <div className="mb-3 flex items-center gap-1.5 text-[13px] font-medium text-ink-500">
              <Clock size={14} />
              Recently used
            </div>
            <div className="flex gap-3 overflow-x-auto pb-1">
              {recentlyUsed.map((b) => (
                <button
                  key={b.bucket_id}
                  onClick={() => handleOpenBucket(b)}
                  className="focus-ring transition-base flex shrink-0 items-center gap-2.5 rounded-control border border-border bg-surface px-3.5 py-2.5 text-left hover:border-border-strong hover:shadow-soft"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-[6px] bg-accent-50 text-accent-600">
                    <PackageOpen size={14} />
                  </span>
                  <span className="max-w-[140px] truncate text-[13px] font-medium text-ink-700">
                    {b.bucket_name}
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="mb-3 text-[11px] font-medium uppercase tracking-wide text-ink-400">Your buckets</h2>

          {loading && <Spinner label="Loading your buckets..." />}

          {!loading && loadError && (
            <EmptyState
              icon={PackageOpen}
              title="Couldn't load your buckets"
              description={loadError}
              action={
                <Button variant="secondary" onClick={loadBuckets}>
                  Try again
                </Button>
              }
            />
          )}

          {!loading && !loadError && buckets.length === 0 && (
            <EmptyState
              icon={FolderPlus}
              title="No buckets yet"
              description="Create your first bucket to start storing files."
              action={
                <Button icon={Plus} onClick={() => setCreateOpen(true)}>
                  Create bucket
                </Button>
              }
            />
          )}

          {!loading && !loadError && buckets.length > 0 && filtered.length === 0 && (
            <EmptyState title="No buckets match your search" description={`Nothing found for "${search}".`} />
          )}

          {!loading && !loadError && filtered.length > 0 && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((bucket) => (
                <BucketCard
                  key={bucket.bucket_id}
                  bucket={bucket}
                  stats={stats[bucket.bucket_id]}
                  onOpen={handleOpenBucket}
                  onDelete={setDeleteTarget}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <CreateBucketModal open={createOpen} onClose={() => setCreateOpen(false)} onCreated={loadBuckets} />

      <UnlockBucketModal open={!!unlockTarget} bucket={unlockTarget} onClose={() => setUnlockTarget(null)} />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => !deleting && setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete this bucket?"
        itemName={deleteTarget?.bucket_name}
        message="This removes the bucket and every file stored inside it."
        warning="This action cannot be undone."
        loading={deleting}
      />
    </div>
  )
}
