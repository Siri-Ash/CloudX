import { useRef, useState } from 'react'
import { UploadCloud, Loader2 } from 'lucide-react'

export default function UploadDropzone({ onFiles, uploading }) {
  const inputRef = useRef(null)
  const [dragOver, setDragOver] = useState(false)

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    if (uploading) return
    const files = Array.from(e.dataTransfer.files || [])
    if (files.length) onFiles(files)
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        if (!uploading) setDragOver(true)
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => !uploading && inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !uploading) inputRef.current?.click()
      }}
      className={`focus-ring transition-base flex cursor-pointer flex-col items-center justify-center gap-2 rounded-card border-2 border-dashed px-6 py-8 text-center ${
        dragOver ? 'border-accent-500 bg-accent-50' : 'border-border-strong bg-surface hover:border-ink-400/60'
      } ${uploading ? 'pointer-events-none opacity-70' : ''}`}
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-50 text-accent-500">
        {uploading ? <Loader2 size={18} className="animate-spin" /> : <UploadCloud size={18} />}
      </span>
      <p className="text-[13.5px] font-medium text-ink-900">
        {uploading ? 'Uploading...' : 'Drop a file here, or click to browse'}
      </p>
      <p className="text-xs text-ink-400">Files are encrypted before they\u2019re stored</p>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files || [])
          if (files.length) onFiles(files)
          e.target.value = ''
        }}
      />
    </div>
  )
}
