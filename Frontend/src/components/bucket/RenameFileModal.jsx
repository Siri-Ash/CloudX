import { useEffect, useState } from 'react'
import Modal from '../ui/Modal'
import Input from '../ui/Input'
import Button from '../ui/Button'

export default function RenameFileModal({ open, file, onClose, onSubmit, submitting }) {
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (file) setName(file.file_name)
    setError('')
  }, [file])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      setError('File name can\u2019t be empty.')
      return
    }
    try {
      await onSubmit(trimmed)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Rename file" width="max-w-sm">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <Input
          label="File name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={error}
          autoFocus
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            Save name
          </Button>
        </div>
      </form>
    </Modal>
  )
}
