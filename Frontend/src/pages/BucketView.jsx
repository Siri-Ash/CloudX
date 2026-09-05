import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useLocation, Link } from 'react-router-dom'
import { ArrowLeft, Share2, LayoutGrid, List as ListIcon, FileText } from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import Button from '../components/ui/Button'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { VisibilityBadge } from '../components/ui/Badge'
import UploadDropzone from '../components/bucket/UploadDropzone'
import FileRow from '../components/bucket/FileRow'
import RenameFileModal from '../components/bucket/RenameFileModal'
import ShareBucketModal from '../components/bucket/ShareBucketModal'
import { getFiles, uploadFile, downloadFile, deleteFile, renameFile } from '../api/files'
import { getBuckets, updateBucketVisibility } from '../api/buckets'
import { useToast } from '../context/ToastContext'
import { useSession } from '../context/SessionContext'
import { formatBytes } from '../utils/format'

export default function BucketView() {
  const { bucketId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const toast = useToast()
  const { isUnlocked } = useSession()

  const [bucketMeta, setBucketMeta] = useState(location.state || null)
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [search, setSearch] = useState('')
  const [view, setView] = useState('list')

  const [renameTarget, setRenameTarget] = useState(null)
  const [renaming, setRenaming] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [visibilityChanging, setVisibilityChanging] = useState(false)

  // Guard: without a real session/token from the backend, we only trust
  // that a bucket is open if it was unlocked with the right password
  // during this browser session.
  useEffect(() => {
    if (!isUnlocked(bucketId)) {
      navigate('/', { replace: true })
    }
  }, [bucketId, isUnlocked, navigate])

  const loadFiles = async () => {
    setLoading(true)
    setLoadError('')
    try {
      const data = await getFiles(bucketId)
      setFiles(Array.isArray(data) ? data : [])
    } catch (err) {
      setLoadError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFiles()
    // Fill in bucket name/visibility if the page was opened without router state (e.g. deep link)
    if (!bucketMeta) {
      getBuckets()
        .then((all) => {
          const match = all.find((b) => b.bucket_id === bucketId)
          if (match) setBucketMeta({ bucketName: match.bucket_name, visibility: match.visibility })
        })
        .catch(() => {})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bucketId])

  const filteredFiles = useMemo(() => {
    if (!search.trim()) return files
    const q = search.trim().toLowerCase()
    return files.filter((f) => f.file_name?.toLowerCase().includes(q))
  }, [files, search])

  const totalSize = useMemo(() => files.reduce((sum, f) => sum + (f.file_size || 0), 0), [files])

  const handleUpload = async (fileList) => {
    setUploading(true)
    try {
      for (const file of fileList) {
        await uploadFile(bucketId, file)
      }
      toast.success(fileList.length > 1 ? `${fileList.length} files uploaded.` : `"${fileList[0].name}" uploaded.`)
      loadFiles()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setUploading(false)
    }
  }

  const handleDownload = async (file) => {
    try {
      await downloadFile(bucketId, file.file_id, file.file_name)
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleRename = async (newName) => {
    setRenaming(true)
    try {
      await renameFile(bucketId, renameTarget.file_id, newName)
      toast.success('File renamed.')
      setRenameTarget(null)
      loadFiles()
    } finally {
      setRenaming(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteFile(bucketId, deleteTarget.file_id)
      toast.success(`"${deleteTarget.file_name}" deleted.`)
      setFiles((prev) => prev.filter((f) => f.file_id !== deleteTarget.file_id))
      setDeleteTarget(null)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setDeleting(false)
    }
  }
  const handleVisibilityChange = async () => {
  const newVisibility =
    bucketMeta?.visibility === 'public' ? 'private' : 'public'

  setVisibilityChanging(true)

  try {
    const updated = await updateBucketVisibility(bucketId, newVisibility)

    setBucketMeta((prev) => ({
      ...prev,
      visibility: updated.visibility
    }))

    toast.success(`Bucket is now ${newVisibility}.`)
  } catch (err) {
    toast.error(err.message)
  } finally {
    setVisibilityChanging(false)
  }
}

  if (!isUnlocked(bucketId)) return null

  return (
    <div className="min-h-screen bg-canvas">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <Link
          to="/"
          className="focus-ring transition-base mb-4 inline-flex items-center gap-1.5 rounded-control text-[13px] font-medium text-ink-500 hover:text-ink-900"
        >
          <ArrowLeft size={14} />
          Back to dashboard
        </Link>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-[20px] font-semibold">{bucketMeta?.bucketName || 'Bucket'}</h1>
                {bucketMeta?.visibility && <VisibilityBadge visibility={bucketMeta.visibility} />}
              </div>
              <p className="mt-1 text-xs text-ink-400">
                {files.length} {files.length === 1 ? 'file' : 'files'} &middot; {formatBytes(totalSize)} total
              </p>
            </div>
          </div>
          <Button variant="secondary" icon={Share2} onClick={() => setShareOpen(true)}>
            Share
          </Button>
          <Button
            variant="secondary"
            onClick={handleVisibilityChange}
            disabled={visibilityChanging}
          >
          {visibilityChanging
            ? 'Updating...'
            : bucketMeta?.visibility === 'public'
            ? 'Make Private'
            : 'Make Public'}
          </Button>
        </div>

        <div className="mb-5">
          <UploadDropzone onFiles={handleUpload} uploading={uploading} />
        </div>

        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search files in this bucket"
              className="focus-ring transition-base h-9 w-full rounded-control border border-border-strong bg-surface px-3 text-[13px] placeholder:text-ink-400 hover:border-ink-400/60"
            />
          </div>
          <div className="flex items-center gap-1 self-start rounded-control border border-border-strong bg-surface p-0.5">
            <button
              onClick={() => setView('list')}
              className={`transition-base rounded-[6px] p-1.5 ${view === 'list' ? 'bg-accent-50 text-accent-600' : 'text-ink-400 hover:text-ink-700'}`}
              aria-label="List view"
              aria-pressed={view === 'list'}
            >
              <ListIcon size={15} />
            </button>
            <button
              onClick={() => setView('grid')}
              className={`transition-base rounded-[6px] p-1.5 ${view === 'grid' ? 'bg-accent-50 text-accent-600' : 'text-ink-400 hover:text-ink-700'}`}
              aria-label="Grid view"
              aria-pressed={view === 'grid'}
            >
              <LayoutGrid size={15} />
            </button>
          </div>
        </div>

        {loading && <Spinner label="Loading files..." />}

        {!loading && loadError && (
          <EmptyState
            title="Couldn't load files"
            description={loadError}
            action={
              <Button variant="secondary" onClick={loadFiles}>
                Try again
              </Button>
            }
          />
        )}

        {!loading && !loadError && files.length === 0 && (
          <EmptyState
            icon={FileText}
            title="No files yet"
            description="Upload your first file to this bucket using the dropzone above."
          />
        )}

        {!loading && !loadError && files.length > 0 && filteredFiles.length === 0 && (
          <EmptyState title="No files match your search" description={`Nothing found for "${search}".`} />
        )}

        {!loading && !loadError && filteredFiles.length > 0 && view === 'list' && (
          <div className="overflow-hidden rounded-card border border-border bg-surface">
            {filteredFiles.map((file) => (
              <FileRow
                key={file.file_id}
                file={file}
                onDownload={handleDownload}
                onRename={setRenameTarget}
                onDelete={setDeleteTarget}
              />
            ))}
          </div>
        )}

        {!loading && !loadError && filteredFiles.length > 0 && view === 'grid' && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredFiles.map((file) => (
              <div key={file.file_id} className="rounded-card border border-border bg-surface p-3">
                <FileRow file={file} onDownload={handleDownload} onRename={setRenameTarget} onDelete={setDeleteTarget} />
              </div>
            ))}
          </div>
        )}
      </main>

      <RenameFileModal
        open={!!renameTarget}
        file={renameTarget}
        submitting={renaming}
        onClose={() => !renaming && setRenameTarget(null)}
        onSubmit={handleRename}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => !deleting && setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete this file?"
        itemName={deleteTarget?.file_name}
        message="The file will be permanently removed from this bucket."
        warning="This action cannot be undone."
        loading={deleting}
      />

      <ShareBucketModal
        open={shareOpen}
        bucket={{ bucket_id: bucketId, bucket_name: bucketMeta?.bucketName || 'Bucket' }}
        onClose={() => setShareOpen(false)}
      />
    </div>
  )
}
