import { useState } from 'react'
import type { PagerMessage, Tag } from '../types/pager'
import { TagSelector } from './TagSelector'

interface MessageDetailProps {
  message: PagerMessage | null
  onToggleFavorite: (id: string, currentlyFavorite: boolean) => void
  getTagById: (tagId: string | null) => Tag | undefined
  setMessageTag: (messageId: string, tagId: string | null) => void
}

export function MessageDetail({ message, onToggleFavorite, getTagById, setMessageTag }: MessageDetailProps) {
  const [editingTag, setEditingTag] = useState(false)

  if (!message) {
    return (
      <div className="message-detail empty">
        <p>↑ 选择一条消息查看</p>
      </div>
    )
  }

  const tag = getTagById(message.tagId)

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
