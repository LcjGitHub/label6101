import type { PagerMessage } from '../types/pager'

interface MessageListProps {
  messages: PagerMessage[]
  selectedId: string | null
  onSelect: (id: string) => void
  onToggleFavorite: (id: string) => void
}

export function MessageList({
  messages,
  selectedId,
  onSelect,
  onToggleFavorite,
}: MessageListProps) {
  if (messages.length === 0) {
    return <div className="empty-list">-- 无匹配记录 --</div>
  }

  return (
    <ul className="message-list">
      {messages.map((msg) => (
        <li key={msg.id}>
          <div className="message-item-wrapper">
            <button
              type="button"
              className={`message-item ${selectedId === msg.id ? 'selected' : ''} ${msg.read ? '' : 'unread'} ${msg.favorite ? 'is-favorite' : ''}`}
              onClick={() => onSelect(msg.id)}
            >
              <span className="msg-indicator">{msg.read ? ' ' : '▶'}</span>
              <span className="msg-number">{msg.number}</span>
              <span className="msg-time">{msg.time.slice(5)}</span>
              <span className="msg-preview">
                {msg.content.length > 18 ? `${msg.content.slice(0, 18)}…` : msg.content}
              </span>
            </button>
            <button
              type="button"
              className={`fav-toggle ${msg.favorite ? 'favorited' : ''}`}
              onClick={(e) => {
                e.stopPropagation()
                onToggleFavorite(msg.id)
              }}
              title={msg.favorite ? '取消收藏' : '收藏'}
            >
              {msg.favorite ? '★' : '☆'}
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}
