interface StatusBarProps {
  unreadCount: number
  totalCount: number
  label?: string
}

export function StatusBar({ unreadCount, totalCount, label = 'INBOX' }: StatusBarProps) {
  return (
    <div className="status-bar">
      <span className="status-label">{label}</span>
      <span className="status-info">
        {unreadCount > 0 ? (
          <span className="blink">● {unreadCount} NEW</span>
        ) : (
          <span>● READY</span>
        )}
      </span>
      <span className="status-count">{totalCount} MSG</span>
    </div>
  )
}
