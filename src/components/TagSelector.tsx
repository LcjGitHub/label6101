import { useState } from 'react'
import { usePager } from '../context/PagerContext'
import type { Tag } from '../types/pager'

interface TagSelectorProps {
  selectedTagId: string | null
  onSelect: (tagId: string | null) => void
  showAddTag?: boolean
}

export function TagSelector({ selectedTagId, onSelect, showAddTag = false }: TagSelectorProps) {
  const { tags, addTag } = usePager()
  const [showAddInput, setShowAddInput] = useState(false)
  const [newTagName, setNewTagName] = useState('')

  const handleAddTag = () => {
    const trimmed = newTagName.trim()
    if (!trimmed) return
    const existing = tags.find((t) => t.name === trimmed)
    if (existing) {
      onSelect(existing.id)
      setNewTagName('')
      setShowAddInput(false)
      return
    }
    const newId = `tag_${Date.now()}`
    addTag(trimmed)
    setTimeout(() => onSelect(newId), 0)
    setNewTagName('')
    setShowAddInput(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    } else if (e.key === 'Escape') {
      setShowAddInput(false)
      setNewTagName('')
    }
  }

  return (
    <div className="tag-selector">
      <div className="tag-options">
        <button
          type="button"
          className={`tag-chip ${selectedTagId === null ? 'active' : ''}`}
          onClick={() => onSelect(null)}
        >
          无标签
        </button>
        {tags.map((tag: Tag) => (
          <button
            key={tag.id}
            type="button"
            className={`tag-chip ${selectedTagId === tag.id ? 'active' : ''}`}
            style={selectedTagId === tag.id ? { borderColor: tag.color, color: tag.color, textShadow: `0 0 4px ${tag.color}` } : {}}
            onClick={() => onSelect(tag.id)}
          >
            <span className="tag-dot" style={{ background: tag.color }} />
            {tag.name}
          </button>
        ))}
      </div>
      {showAddTag && (
        <div className="tag-add-row">
          {showAddInput ? (
            <>
              <input
                type="text"
                className="pager-input tag-add-input"
                placeholder="新标签名..."
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyDown={handleKeyDown}
                maxLength={10}
                autoFocus
              />
              <button
                type="button"
                className="pager-btn pager-btn-sm"
                onClick={handleAddTag}
                disabled={!newTagName.trim()}
              >
                确定
              </button>
              <button
                type="button"
                className="pager-btn pager-btn-sm"
                onClick={() => {
                  setShowAddInput(false)
                  setNewTagName('')
                }}
              >
                取消
              </button>
            </>
          ) : (
            <button
              type="button"
              className="pager-btn pager-btn-sm tag-add-btn"
              onClick={() => setShowAddInput(true)}
            >
              + 新标签
            </button>
          )}
        </div>
      )}
    </div>
  )
}
