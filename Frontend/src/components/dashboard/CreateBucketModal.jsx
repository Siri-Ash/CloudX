import { useState } from 'react'
import { Lock, Globe2 } from 'lucide-react'
import Modal from '../ui/Modal'
import Input from '../ui/Input'
import Button from '../ui/Button'
import { createBucket } from '../../api/buckets'
import { useToast } from '../../context/ToastContext'

const initialForm = { bucketName: '', visibility: 'private', password: '', confirm: '' }

export default function CreateBucketModal({ open, onClose, onCreated }) {
  const toast = useToast()
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const close = () => {
    if (submitting) return
    setForm(initialForm)
    setErrors({})
    onClose()
  }

  const validate = () => {
    const next = {}
    const name = form.bucketName.trim()
    if (!name) next.bucketName = 'Give your bucket a name.'
    else if (name.length > 63) next.bucketName = 'Keep it under 63 characters.'
    else if (!/^[a-zA-Z0-9._-]+$/.test(name))
      next.bucketName = 'Use only letters, numbers, dots, dashes, or underscores.'

    if (!form.password) next.password = 'Set a password for this bucket.'
    else if (form.password.length < 4) next.password = 'Use at least 4 characters.'

    if (form.confirm !== form.password) next.confirm = 'Passwords don\u2019t match.'

    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      await createBucket({
        bucketName: form.bucketName.trim(),
        password: form.password,
        visibility: form.visibility,
      })
      toast.success(`Bucket "${form.bucketName.trim()}" created.`)
      setForm(initialForm)
      onCreated()
      onClose()
    } catch (err) {
      setErrors({ form: err.message })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open={open} onClose={close} title="Create bucket" description="A bucket holds a group of encrypted files behind one password.">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <Input
          label="Bucket name"
          name="bucketName"
          placeholder="e.g. product-assets"
          value={form.bucketName}
          onChange={(e) => setForm((f) => ({ ...f, bucketName: e.target.value }))}
          error={errors.bucketName}
          autoFocus
        />

        <div className="flex flex-col gap-1.5">
          <span className="text-[13px] font-medium text-ink-700">Visibility</span>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'private', label: 'Private', icon: Lock, hint: 'Only you, with the password' },
              { value: 'public', label: 'Public', icon: Globe2, hint: 'Marked public in the console' },
            ].map(({ value, label, icon: Icon, hint }) => (
              <button
                key={value}
                type="button"
                onClick={() => setForm((f) => ({ ...f, visibility: value }))}
                className={`transition-base focus-ring flex flex-col items-start gap-1 rounded-control border px-3 py-2.5 text-left ${
                  form.visibility === value
                    ? 'border-accent-500 bg-accent-50'
                    : 'border-border-strong hover:border-ink-400/60'
                }`}
              >
                <span className={`flex items-center gap-1.5 text-[13px] font-medium ${form.visibility === value ? 'text-accent-700' : 'text-ink-700'}`}>
                  <Icon size={14} />
                  {label}
                </span>
                <span className="text-[11px] text-ink-400">{hint}</span>
              </button>
            ))}
          </div>
        </div>

        <Input
          label="Bucket password"
          type="password"
          name="password"
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          error={errors.password}
          hint="Protects this bucket only — separate from your account password."
          autoComplete="new-password"
        />
        <Input
          label="Confirm password"
          type="password"
          name="confirm"
          value={form.confirm}
          onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))}
          error={errors.confirm}
          autoComplete="new-password"
        />

        {errors.form && <p className="rounded-control bg-danger-50 px-3 py-2 text-xs text-danger-600">{errors.form}</p>}

        <div className="mt-1 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={close} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            Create bucket
          </Button>
        </div>
      </form>
    </Modal>
  )
}
