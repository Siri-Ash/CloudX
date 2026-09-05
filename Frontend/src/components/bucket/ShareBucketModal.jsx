import { useEffect, useState } from 'react'
import { Copy, Check, Info } from 'lucide-react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import { createShareLink } from '../../api/sharing'

export default function ShareBucketModal({ open, bucket, onClose }) {
  const [copied, setCopied] = useState(false)
  const [shareUrl, setShareUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open || !bucket) return

    setShareUrl('')
    setCopied(false)
    setError('')
    setLoading(true)

    createShareLink(bucket.bucket_id)
      .then((data) => {
        setShareUrl(data.share_url)
      })
      .catch((err) => {
        setError(err.message || 'Could not create share link.')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [open, bucket])

  if (!bucket) return null

  const handleCopy = async () => {
    if (!shareUrl) return

    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard access can fail in some browser contexts.
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Share bucket"
      description={bucket.bucket_name}
      width="max-w-sm"
    >
      <div className="flex flex-col gap-4">

        {error && (
          <div className="flex items-start gap-2 rounded-control bg-warning-50 px-3 py-2.5 text-xs text-ink-700">
            <Info size={14} className="mt-0.5 shrink-0 text-warning-500" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex items-center gap-2 rounded-control border border-border-strong bg-canvas px-3 py-2">
          <span className="flex-1 truncate font-mono text-[12px] text-ink-500">
            {loading ? 'Generating link...' : shareUrl || 'Unable to generate link'}
          </span>

          <Button
            size="sm"
            variant="secondary"
            icon={copied ? Check : Copy}
            onClick={handleCopy}
            disabled={!shareUrl || loading}
          >
            {copied ? 'Copied' : 'Copy'}
          </Button>
        </div>

        <div className="flex justify-end">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>

      </div>
    </Modal>
  )
}