import type { PagerMessage } from '../types/pager'

interface MessageListProps {
  messages: PagerMessage[]
  selectedId: string | null
  onSelect: (id: string) => void
}

export function MessageList({ messages, selectedId, onSelect }: MessageListProps) {
  if (messages.length === 0) {
    return <div className="empty-list">-- 无匹配记录 --</div>
  }

  return (
    <ul className="message-list">
      {messages.map((msg) => (
        <li key={msg.id}>
          <button
            type="button"
            className={`message-item ${selectedId === msg.id ? 'selected' : ''} ${msg.read ? '' : 'unread'}`}
            onClick={() => onSelect(msg.id)}
          >
            <span className="msg-indicator">{msg.read ? ' ' : '▶'}</span>
            <span className="msg-number">{msg.number}</span>
            <span className="msg-time">{msg.time.slice(5)}</span>
            <span className="msg-preview">
              {msg.content.length > 18 ? `${msg.content.slice(0, 18)}…` : msg.content}
            </span>
          </button>
        </li>
      ))}
    </ul>
  )
}
