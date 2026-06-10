import type { Contact, PagerMessage, Tag } from '../types/pager'

interface MessageListProps {
  messages: PagerMessage[]
  selectedId: string | null
  onSelect: (id: string) => void
  onToggleFavorite: (id: string, currentlyFavorite: boolean) => void
  showFavoritesOnly: boolean
  filterNumber: string
  filterTagId: string | null
  getTagById: (tagId: string | null) => Tag | undefined
  getContactByNumber: (number: string) => Contact | undefined
  getRepliesForMessage: (messageId: string) => PagerMessage[]
}

export function MessageList({
  messages,
  selectedId,
  onSelect,
  onToggleFavorite,
  showFavoritesOnly,
  filterNumber,
  filterTagId,
  getTagById,
  getContactByNumber,
  getRepliesForMessage,
}: MessageListProps) {
  if (messages.length === 0) {
    let emptyText = '-- 无匹配记录 --'
    const hasNumberFilter = !!filterNumber.trim()
    const hasTagFilter = !!filterTagId
    const hasAnyFilter = hasNumberFilter || hasTagFilter
    if (showFavoritesOnly && !hasAnyFilter) {
      emptyText = '-- 暂无收藏消息 --'
    } else if (hasAnyFilter) {
      emptyText = '-- 当前筛选无匹配消息 --'
    }
    return <div className="empty-list">{emptyText}</div>
  }

  return (
    <ul className="message-list">
      {messages.map((msg) => {
        const tag = getTagById(msg.tagId)
        const contact = getContactByNumber(msg.number)
        const displayName = contact ? contact.name : msg.number
        const replies = getRepliesForMessage(msg.id)
        const hasReplies = replies.length > 0
        const isReply = !!msg.replyToId
        return (
          <li key={msg.id}>
            <div className="message-item-wrapper">
              <button
                type="button"
                className={`message-item ${selectedId === msg.id ? 'selected' : ''} ${msg.read ? '' : 'unread'} ${msg.favorite ? 'is-favorite' : ''} ${isReply ? 'is-reply' : ''}`}
                onClick={() => onSelect(msg.id)}
              >
                <span className="msg-indicator">{msg.read ? ' ' : '▶'}</span>
                <span className="msg-number">
                  {isReply && <span className="msg-reply-icon" title="回复">↩</span>}
                  {displayName}
                </span>
                <span className="msg-time">{msg.time.slice(5)}</span>
                <span className="msg-preview">
                  {msg.content.length > 18 ? `${msg.content.slice(0, 18)}…` : msg.content}
                </span>
                <span
                  className="msg-tag"
                  style={tag ? { borderColor: tag.color, color: tag.color } : {}}
                >
                  {tag ? tag.name : '无标签'}
                  {hasReplies && <span className="msg-reply-count"> · {replies.length}回复</span>}
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
        )
      })}
    </ul>
  )
}
