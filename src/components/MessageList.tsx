import type { PagerMessage } from '../types/pager'

interface MessageListProps {
  messages: PagerMessage[]
  selectedId: string | null
  onSelect: (id: string) => void
  onToggleFavorite: (id: string, currentlyFavorite: boolean) => void
  showFavoritesOnly: boolean
  filterNumber: string
}

export function MessageList({
  messages,
  selectedId,
  onSelect,
  onToggleFavorite,
  showFavoritesOnly,
  filterNumber,
}: MessageListProps) {
  if (messages.length === 0) {
    let emptyText = '-- 无匹配记录 --'
    if (showFavoritesOnly && !filterNumber.trim()) {
      emptyText = '-- 暂无收藏消息 --'
    }
    return <div className="empty-list">{emptyText}</div>
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
                onToggleFavorite(msg.id, msg.favorite)
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
