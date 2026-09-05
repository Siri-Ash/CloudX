export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2.5 rounded-card border border-dashed border-border-strong bg-surface/60 px-6 py-9 text-center">
      {Icon && (
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-50 text-accent-600">
          <Icon size={16} />
        </div>
      )}
      <div className="space-y-0.5">
        <p className="text-[14px] font-medium text-ink-900">{title}</p>
        {description && <p className="max-w-xs text-[13px] text-ink-500">{description}</p>}
      </div>
      {action}
    </div>
  )
}
