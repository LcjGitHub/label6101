import type { Contact, PagerMessage, Tag } from '../types/pager'
import { highlightText } from '../utils/highlight'

interface MessageListProps {
  messages: PagerMessage[]
  selectedId: string | null
  onSelect: (id: string) => void
  onToggleFavorite: (id: string, currentlyFavorite: boolean) => void
  onTogglePin: (id: string) => void
  showFavoritesOnly: boolean
  filterNumber: string
  filterTagId: string | null
  searchQuery: string
  getTagById: (tagId: string | null) => Tag | undefined
  getContactByNumber: (number: string) => Contact | undefined
  getThreadForMessage: (messageId: string) => PagerMessage[]
}

function renderHighlighted(segments: (string | { match: string })[]) {
  return segments.map((segment, index) => {
    if (typeof segment === 'string') {
      return segment
    }
    return (
      <span key={index} className="search-highlight">
        {segment.match}
      </span>
    )
  })
}

export function MessageList({
  messages,
  selectedId,
  onSelect,
  onToggleFavorite,
  onTogglePin,
  showFavoritesOnly,
  filterNumber,
  filterTagId,
  searchQuery,
  getTagById,
  getContactByNumber,
  getThreadForMessage,
}: MessageListProps) {
  if (messages.length === 0) {
    let emptyText = '-- 无匹配记录 --'
    const hasNumberFilter = !!filterNumber.trim()
    const hasTagFilter = !!filterTagId
    const hasSearchQuery = !!searchQuery.trim()
    const hasAnyFilter = hasNumberFilter || hasTagFilter || hasSearchQuery || showFavoritesOnly
    if (showFavoritesOnly && !hasSearchQuery && !hasNumberFilter && !hasTagFilter) {
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
        const thread = getThreadForMessage(msg.id)
        const threadCount = thread.length - 1
        const hasThread = threadCount > 0
        const isReply = !!msg.replyToId
        const previewText = msg.content.length > 18 ? `${msg.content.slice(0, 18)}…` : msg.content
        const highlightedName = highlightText(displayName, searchQuery)
        const highlightedPreview = highlightText(previewText, searchQuery)
        return (
          <li key={msg.id}>
            <div className="message-item-wrapper">
              <button
                type="button"
                className={`message-item ${selectedId === msg.id ? 'selected' : ''} ${msg.read ? '' : 'unread'} ${msg.favorite ? 'is-favorite' : ''} ${msg.pinned ? 'is-pinned' : ''} ${isReply ? 'is-reply' : ''}`}
                onClick={() => onSelect(msg.id)}
              >
                <span className="msg-indicator">{msg.read ? ' ' : '▶'}</span>
                <span className="msg-number">
                  {msg.pinned && <span className="msg-pin-icon" title="置顶">📌</span>}
                  {isReply && <span className="msg-reply-icon" title="回复">↩</span>}
                  {renderHighlighted(highlightedName)}
                </span>
                <span className="msg-time">{msg.time.slice(5)}</span>
                <span className="msg-preview">
                  {renderHighlighted(highlightedPreview)}
                </span>
                <span
                  className="msg-tag"
                  style={tag ? { borderColor: tag.color, color: tag.color } : {}}
                >
                  {tag ? tag.name : '无标签'}
                  {hasThread && <span className="msg-reply-count"> · {threadCount}条</span>}
                </span>
              </button>
              <button
                type="button"
                className={`pin-toggle ${msg.pinned ? 'pinned' : ''}`}
                onClick={(e) => {
                  e.stopPropagation()
                  onTogglePin(msg.id)
                }}
                title={msg.pinned ? '取消置顶' : '置顶'}
              >
                {msg.pinned ? '📌' : '📍'}
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
