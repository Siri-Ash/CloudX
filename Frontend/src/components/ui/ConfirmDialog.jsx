import { AlertTriangle } from 'lucide-react'
import Modal from './Modal'
import Button from './Button'

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
  warning,
  confirmLabel = 'Delete',
  loading = false,
  tone = 'destructive',
}) {
  return (
    <Modal open={open} onClose={onClose} width="max-w-sm">
      <div className="flex flex-col items-start gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-danger-50 text-danger-600">
          <AlertTriangle size={20} />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-[16px] font-semibold text-ink-900">{title}</h2>
          {itemName && (
            <p className="text-sm text-ink-700">
              <span className="font-medium">&ldquo;{itemName}&rdquo;</span>
            </p>
          )}
          <p className="text-sm text-ink-500">{message}</p>
          {warning && (
            <p className="rounded-control bg-danger-50 px-3 py-2 text-xs text-danger-600">{warning}</p>
          )}
        </div>
        <div className="mt-1 flex w-full justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant={tone} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
