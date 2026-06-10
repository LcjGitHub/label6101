import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Contact, PagerMessage, Tag } from '../types/pager'
import { TagSelector } from './TagSelector'

interface MessageDetailProps {
  message: PagerMessage | null
  onToggleFavorite: (id: string, currentlyFavorite: boolean) => void
  onTogglePin: (id: string) => void
  getTagById: (tagId: string | null) => Tag | undefined
  setMessageTag: (messageId: string, tagId: string | null) => void
  getContactByNumber: (number: string) => Contact | undefined
  getMessageById: (id: string | null) => PagerMessage | null
  getRepliesForMessage: (messageId: string) => PagerMessage[]
  getThreadForMessage: (messageId: string) => PagerMessage[]
  onStartReply: (messageId: string) => void
  onSelectMessage: (id: string) => void
}

export function MessageDetail({
  message,
  onToggleFavorite,
  onTogglePin,
  getTagById,
  setMessageTag,
  getContactByNumber,
  getMessageById,
  getThreadForMessage,
  onStartReply,
  onSelectMessage,
}: MessageDetailProps) {
  const [editingTag, setEditingTag] = useState(false)
  const navigate = useNavigate()

  if (!message) {
    return (
      <div className="message-detail empty">
        <p>↑ 选择一条消息查看</p>
      </div>
    )
  }

  const tag = getTagById(message.tagId)
  const contact = getContactByNumber(message.number)
  const displayName = contact ? contact.name : message.number
  const repliedTo = getMessageById(message.replyToId)
  const thread = getThreadForMessage(message.id)
  const hasThread = thread.length > 1

  const handleReply = () => {
    onStartReply(message.id)
    navigate('/send')
  }

  const handleReplyRefClick = () => {
    if (repliedTo) {
      onSelectMessage(repliedTo.id)
    }
  }

  return (
    <div className="message-detail">
      <div className="detail-header">
        <div className="detail-header-info">
          {repliedTo && (
            <div
              className="reply-reference clickable"
              onClick={handleReplyRefClick}
              title="点击查看原消息"
            >
              <span className="reply-reference-label">↩ 回复</span>
              <span className="reply-reference-content">
                {getContactByNumber(repliedTo.number)?.name || repliedTo.number}:
                {repliedTo.content.length > 20
                  ? `${repliedTo.content.slice(0, 20)}…`
                  : repliedTo.content}
              </span>
            </div>
          )}
          <div className="detail-row">
            <span className="detail-label">FROM</span>
            <span className="detail-value">
              {message.pinned && <span className="detail-pin-label" title="已置顶">📌 </span>}
              {displayName}
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">TIME</span>
            <span className="detail-value">{message.time}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">STAT</span>
            <span className="detail-value">
              {message.read ? '已读' : '未读'}
              {message.pinned && <span className="detail-pin-status"> · 置顶</span>}
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">TAG</span>
            {editingTag ? (
              <div className="detail-tag-editor">
                <TagSelector
                  selectedTagId={message.tagId}
                  onSelect={(tagId) => {
                    setMessageTag(message.id, tagId)
                    setEditingTag(false)
                  }}
                  showAddTag
                />
              </div>
            ) : (
              <span
                className="detail-value detail-tag-value"
                onClick={() => setEditingTag(true)}
              >
                {tag ? (
                  <>
                    <span className="tag-dot" style={{ background: tag.color }} />
                    <span style={{ color: tag.color }}>{tag.name}</span>
                    <span className="detail-tag-edit"> ✎</span>
                  </>
                ) : (
                  <span className="detail-tag-none">无标签 ✎</span>
                )}
              </span>
            )}
          </div>
        </div>
        <div className="detail-actions">
          <button
            type="button"
            className="detail-reply-btn"
            onClick={handleReply}
            title="回复此消息"
          >
            ↩ 回复
          </button>
          <button
            type="button"
            className={`detail-pin-btn ${message.pinned ? 'pinned' : ''}`}
            onClick={() => onTogglePin(message.id)}
            title={message.pinned ? '取消置顶' : '置顶'}
          >
            {message.pinned ? '📌 取消置顶' : '📍 置顶'}
          </button>
          <button
            type="button"
            className={`detail-fav-btn ${message.favorite ? 'favorited' : ''}`}
            onClick={() => onToggleFavorite(message.id, message.favorite)}
            title={message.favorite ? '取消收藏' : '收藏'}
          >
            {message.favorite ? '★' : '☆'}
          </button>
        </div>
      </div>
      <div className="detail-content">{message.content}</div>

      {hasThread && (
        <div className="reply-thread">
          <div className="reply-thread-title">── 对话线程 ({thread.length}条) ──</div>
          <div className="reply-thread-list">
            {thread.map((threadMsg) => {
              const isCurrent = threadMsg.id === message.id
              const threadContact = getContactByNumber(threadMsg.number)
              const threadName = threadContact ? threadContact.name : threadMsg.number
              const threadTag = getTagById(threadMsg.tagId)
              const threadRepliedTo = getMessageById(threadMsg.replyToId)
              return (
                <div
                  key={threadMsg.id}
                  className={`reply-thread-item ${isCurrent ? 'current' : ''}`}
                  onClick={() => !isCurrent && onSelectMessage(threadMsg.id)}
                >
                  <div className="reply-thread-header">
                    <span className="reply-thread-name">
                      {threadMsg.pinned && (
                        <span className="reply-thread-pin-icon" title="置顶">📌</span>
                      )}
                      {threadRepliedTo && (
                        <span className="reply-thread-reply-icon" title="回复">↩</span>
                      )}
                      {threadName}
                      {isCurrent && <span className="reply-thread-current-label"> 当前</span>}
                    </span>
                    <span className="reply-thread-time">{threadMsg.time.slice(5)}</span>
                    {threadTag && (
                      <span
                        className="reply-thread-tag"
                        style={{ borderColor: threadTag.color, color: threadTag.color }}
                      >
                        {threadTag.name}
                      </span>
                    )}
                  </div>
                  <div className="reply-thread-content">{threadMsg.content}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
