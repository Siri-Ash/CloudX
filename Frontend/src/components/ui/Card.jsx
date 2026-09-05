export default function Card({ className = '', interactive = false, children, ...props }) {
  return (
    <div
      className={`rounded-card border border-border bg-surface shadow-card ${
        interactive ? 'transition-base cursor-pointer hover:border-border-strong hover:shadow-raised' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
