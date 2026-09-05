import { createContext, useCallback, useContext, useRef, useState } from 'react'
import { CheckCircle2, XCircle, Info, X } from 'lucide-react'

const ToastContext = createContext(null)

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const idRef = useRef(0)

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const push = useCallback(
    (message, type = 'info', duration = 4000) => {
      const id = ++idRef.current
      setToasts((prev) => [...prev, { id, message, type }])
      if (duration) {
        setTimeout(() => dismiss(id), duration)
      }
      return id
    },
    [dismiss]
  )

  const toast = {
    success: (msg) => push(msg, 'success'),
    error: (msg) => push(msg, 'error'),
    info: (msg) => push(msg, 'info'),
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="pointer-events-none fixed top-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2">
        {toasts.map((t) => {
          const Icon = ICONS[t.type]
          const styles =
            t.type === 'success'
              ? 'border-success-500/20 text-success-600'
              : t.type === 'error'
              ? 'border-danger-500/20 text-danger-600'
              : 'border-accent-500/20 text-accent-600'
          return (
            <div
              key={t.id}
              className="animate-toast-in pointer-events-auto flex items-start gap-2.5 rounded-card border border-border bg-surface px-4 py-3 shadow-raised"
            >
              <Icon size={18} className={`mt-0.5 shrink-0 ${styles}`} />
              <p className="flex-1 text-sm text-ink-700">{t.message}</p>
              <button
                onClick={() => dismiss(t.id)}
                className="text-ink-400 transition-base hover:text-ink-700 focus-ring rounded"
                aria-label="Dismiss notification"
              >
                <X size={15} />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
