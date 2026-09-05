import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Download, FileText } from 'lucide-react'

import Navbar from '../components/layout/Navbar'
import Button from '../components/ui/Button'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'

import {
  getSharedBucket,
  downloadSharedFile,
} from '../api/sharing'

import { formatBytes } from '../utils/format'


export default function SharedBucket() {
  const { token } = useParams()

  const [bucket, setBucket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadSharedBucket = async () => {
      try {
        setLoading(true)
        setError('')

        const data = await getSharedBucket(token)
        setBucket(data)
      } catch (err) {
        setError(err.message || 'This share link is invalid or has expired.')
      } finally {
        setLoading(false)
      }
    }

    loadSharedBucket()
  }, [token])


  const handleDownload = async (file) => {
    try {
      const response = await downloadSharedFile(token, file.file_id)

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = url
      link.download = file.file_name
      document.body.appendChild(link)
      link.click()
      link.remove()

      window.URL.revokeObjectURL(url)
    } catch (err) {
      setError(err.message || 'Could not download the file.')
    }
  }


  if (loading) {
    return (
      <div className="min-h-screen bg-canvas">
        <Navbar />

        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <Spinner label="Loading shared bucket..." />
        </main>
      </div>
    )
  }


  if (error || !bucket) {
    return (
      <div className="min-h-screen bg-canvas">
        <Navbar />

        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <EmptyState
            title="Couldn't open shared bucket"
            description={error || 'This share link is invalid or has expired.'}
          />
        </main>
      </div>
    )
  }


  return (
    <div className="min-h-screen bg-canvas">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">

        <div className="mb-6">
          <h1 className="text-[20px] font-semibold">
            {bucket.bucket_name}
          </h1>

          <p className="mt-1 text-xs text-ink-400">
            {bucket.files?.length || 0}{' '}
            {bucket.files?.length === 1 ? 'file' : 'files'}
          </p>
        </div>


        {bucket.files?.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No files yet"
            description="This bucket doesn't contain any files."
          />
        ) : (
          <div className="overflow-hidden rounded-card border border-border bg-surface">

            {bucket.files.map((file) => (
              <div
                key={file.file_id}
                className="flex items-center justify-between gap-4 border-b border-border px-4 py-3 last:border-b-0"
              >

                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-accent-50 text-accent-600">
                    <FileText size={16} />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium text-ink-900">
                      {file.file_name}
                    </p>

                    <p className="mt-0.5 text-xs text-ink-400">
                      {formatBytes(file.file_size)}
                    </p>
                  </div>
                </div>


                <Button
                  size="sm"
                  variant="secondary"
                  icon={Download}
                  onClick={() => handleDownload(file)}
                >
                  Download
                </Button>

              </div>
            ))}

          </div>
        )}

      </main>
    </div>
  )
}