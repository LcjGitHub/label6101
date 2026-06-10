import type { PagerMessage } from '../types/pager'

interface MessageDetailProps {
  message: PagerMessage | null
  onToggleFavorite: (id: string, currentlyFavorite: boolean) => void
}

export function MessageDetail({ message, onToggleFavorite }: MessageDetailProps) {
  if (!message) {
    return (
      <div className="message-detail empty">
        <p>↑ 选择一条消息查看</p>
      </div>
    )
  }

  return (
    <div className="message-detail">
      <div className="detail-header">
        <div className="detail-header-info">
          <div className="detail-row">
            <span className="detail-label">FROM</span>
            <span className="detail-value">{message.number}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">TIME</span>
            <span className="detail-value">{message.time}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">STAT</span>
            <span className="detail-value">{message.read ? '已读' : '未读'}</span>
          </div>
        </div>
        <button
          type="button"
          className={`detail-fav-btn ${message.favorite ? 'favorited' : ''}`}
          onClick={() => onToggleFavorite(message.id, message.favorite)}
          title={message.favorite ? '取消收藏' : '收藏'}
        >
          {message.favorite ? '★ 已收藏' : '☆ 收藏'}
        </button>
      </div>
      <div className="detail-content">{message.content}</div>
    </div>
  )
}
