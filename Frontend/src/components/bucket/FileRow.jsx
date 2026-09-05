import { useState } from 'react'
import { FileText, Download, Pencil, Trash2, Loader2 } from 'lucide-react'
import { formatBytes, formatDateTime, fileExtension } from '../../utils/format'

export default function FileRow({ file, onDownload, onRename, onDelete }) {
  const [downloading, setDownloading] = useState(false)

  const handleDownload = async () => {
    setDownloading(true)
    try {
      await onDownload(file)
    } finally {
      setDownloading(false)
    }
  }

  const ext = fileExtension(file.file_name)

  return (
    <div className="group flex items-center gap-3 border-b border-border px-4 py-3 last:border-b-0 hover:bg-canvas/60">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-ink-900/5 text-ink-500">
        {ext ? (
          <span className="text-[9px] font-semibold tracking-tight">{ext.slice(0, 4)}</span>
        ) : (
          <FileText size={16} />
        )}
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[13.5px] font-medium text-ink-900">{file.file_name}</p>
        <p className="mt-0.5 text-xs text-ink-400">
          {formatBytes(file.file_size)} &middot; Uploaded {formatDateTime(file.uploaded_at)}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1 opacity-0 transition-base group-hover:opacity-100 group-focus-within:opacity-100">
        <button
          onClick={handleDownload}
          disabled={downloading}
          title="Download"
          aria-label={`Download ${file.file_name}`}
          className="focus-ring transition-base rounded-control p-2 text-ink-500 hover:bg-ink-900/5 hover:text-ink-900 disabled:opacity-60"
        >
          {downloading ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
        </button>
        <button
          onClick={() => onRename(file)}
          title="Rename"
          aria-label={`Rename ${file.file_name}`}
          className="focus-ring transition-base rounded-control p-2 text-ink-500 hover:bg-ink-900/5 hover:text-ink-900"
        >
          <Pencil size={15} />
        </button>
        <button
          onClick={() => onDelete(file)}
          title="Delete"
          aria-label={`Delete ${file.file_name}`}
          className="focus-ring transition-base rounded-control p-2 text-ink-500 hover:bg-danger-50 hover:text-danger-600"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  )
}
