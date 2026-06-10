import { FilterBar } from '../components/FilterBar'
import { MessageDetail } from '../components/MessageDetail'
import { MessageList } from '../components/MessageList'
import { NavButtons } from '../components/NavButtons'
import { PagerShell } from '../components/PagerShell'
import { StatusBar } from '../components/StatusBar'
import { usePager } from '../context/PagerContext'
import type { Tag } from '../types/pager'

export function HomePage() {
  const {
    filteredMessages,
    filterNumber,
    setFilterNumber,
    unreadCount,
    messages,
    selectedId,
    setSelectedId,
    selectedMessage,
    markAsRead,
    markAllAsRead,
    showFavoritesOnly,
    setShowFavoritesOnly,
    favoriteCount,
    addFavorite,
    removeFavorite,
    tags,
    filterTagId,
    setFilterTagId,
    getTagById,
    setMessageTag,
  } = usePager()

  const handleSelect = (id: string) => {
    setSelectedId(id)
    markAsRead(id)
  }

  const handleToggleFavorite = (id: string, currentlyFavorite: boolean) => {
    if (currentlyFavorite) {
      removeFavorite(id)
    } else {
      addFavorite(id)
    }
  }

  const getTagCount = (tagId: string | null) => {
    return messages.filter((m) => m.tagId === tagId).length
  }

  return (
    <PagerShell>
      <StatusBar
        unreadCount={unreadCount}
        totalCount={filteredMessages.length}
      />
      <FilterBar value={filterNumber} onChange={setFilterNumber} />
      <div className="tags-filter-row">
        <button
          type="button"
          className={`tag-filter-btn ${filterTagId === null ? 'active' : ''}`}
          onClick={() => setFilterTagId(null)}
        >
          全部 ({messages.length})
        </button>
        {tags.map((tag: Tag) => (
          <button
            key={tag.id}
            type="button"
            className={`tag-filter-btn ${filterTagId === tag.id ? 'active' : ''}`}
            style={filterTagId === tag.id ? { borderColor: tag.color, color: tag.color, textShadow: `0 0 4px ${tag.color}` } : {}}
            onClick={() => setFilterTagId(tag.id)}
          >
            <span className="tag-dot" style={{ background: tag.color }} />
            {tag.name} ({getTagCount(tag.id)})
          </button>
        ))}
      </div>
      <div className="favorites-filter-row">
        <button
          type="button"
          className={`pager-btn pager-btn-sm ${showFavoritesOnly ? 'active' : ''}`}
          onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
        >
          <span className="fav-icon">{showFavoritesOnly ? '★' : '☆'}</span>
          收藏 ({favoriteCount})
        </button>
        <span className="action-hint">
          {showFavoritesOnly ? '点击显示全部消息' : '点击只显示收藏消息'}
        </span>
      </div>
      <MessageList
        messages={filteredMessages}
        selectedId={selectedId}
        onSelect={handleSelect}
        onToggleFavorite={handleToggleFavorite}
        showFavoritesOnly={showFavoritesOnly}
        filterNumber={filterNumber}
        getTagById={getTagById}
      />
      <MessageDetail
        message={selectedMessage}
        onToggleFavorite={handleToggleFavorite}
        getTagById={getTagById}
        setMessageTag={setMessageTag}
      />
      <div className="action-row">
        <button
          type="button"
          className="pager-btn pager-btn-sm"
          onClick={markAllAsRead}
          disabled={unreadCount === 0}
        >
          全部已读
        </button>
        <span className="action-hint">
          共 {messages.length} 条 · 筛选 {filteredMessages.length} 条
        </span>
      </div>
      <NavButtons />
    </PagerShell>
  )
}
