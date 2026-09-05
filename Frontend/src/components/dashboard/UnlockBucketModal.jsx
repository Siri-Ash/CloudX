import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock } from 'lucide-react'
import Modal from '../ui/Modal'
import Input from '../ui/Input'
import Button from '../ui/Button'
import { openBucket } from '../../api/buckets'
import { useSession } from '../../context/SessionContext'

export default function UnlockBucketModal({ open, bucket, onClose }) {
  const navigate = useNavigate()
  const { markUnlocked } = useSession()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const close = () => {
    if (submitting) return
    setPassword('')
    setError('')
    onClose()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!password) {
      setError('Enter the bucket password.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      await openBucket(bucket.bucket_id, password)
      markUnlocked(bucket.bucket_id)
      setPassword('')
      onClose()
      navigate(`/buckets/${bucket.bucket_id}`, { state: { bucketName: bucket.bucket_name, visibility: bucket.visibility } })
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (!bucket) return null

  return (
    <Modal open={open} onClose={close} width="max-w-sm">
      <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4 text-center" noValidate>
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-50 text-accent-500">
          <Lock size={20} />
        </span>
        <div>
          <h2 className="text-[16px] font-semibold text-ink-900">{bucket.bucket_name}</h2>
          <p className="mt-1 text-sm text-ink-500">Enter the password to open this bucket.</p>
        </div>

        <div className="w-full text-left">
          <Input
            type="password"
            name="unlock-password"
            placeholder="Bucket password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={error}
            autoFocus
          />
        </div>

        <div className="flex w-full gap-2">
          <Button type="button" variant="secondary" className="flex-1" onClick={close} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" className="flex-1" loading={submitting}>
            Unlock
          </Button>
        </div>
      </form>
    </Modal>
  )
}
