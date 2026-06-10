import { FilterBar } from '../components/FilterBar'
import { MessageDetail } from '../components/MessageDetail'
import { MessageList } from '../components/MessageList'
import { NavButtons } from '../components/NavButtons'
import { PagerShell } from '../components/PagerShell'
import { SearchInput } from '../components/SearchInput'
import { StatusBar } from '../components/StatusBar'
import { FILTER_NO_TAG, usePager } from '../context/PagerContext'
import type { Tag } from '../types/pager'

export function HomePage() {
  const {
    filteredMessages,
    filterNumber,
    setFilterNumber,
    searchQuery,
    setSearchQuery,
    clearAllFilters,
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
    pinnedCount,
    addFavorite,
    removeFavorite,
    togglePin,
    tags,
    filterTagId,
    setFilterTagId,
    getTagById,
    setMessageTag,
    getContactByNumber,
    getMessageById,
    getThreadForMessage,
    startReply,
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
    if (tagId === FILTER_NO_TAG) {
      return messages.filter((m) => m.tagId === null).length
    }
    return messages.filter((m) => m.tagId === tagId).length
  }

  const hasAnyFilter =
    !!filterNumber.trim() ||
    !!searchQuery.trim() ||
    showFavoritesOnly ||
    !!filterTagId

  return (
    <PagerShell>
      <StatusBar
        unreadCount={unreadCount}
        totalCount={filteredMessages.length}
      />
      <FilterBar value={filterNumber} onChange={setFilterNumber} />
      <SearchInput value={searchQuery} onChange={setSearchQuery} />
      {hasAnyFilter && (
        <div className="clear-filters-row">
          <span className="active-filters-hint">
            🔍 已应用筛选
          </span>
          <button
            type="button"
            className="pager-btn pager-btn-sm clear-filters-btn"
            onClick={clearAllFilters}
            title="清除所有筛选条件"
          >
            清除全部
          </button>
        </div>
      )}
      <div className="tags-filter-row">
        <button
          type="button"
          className={`tag-filter-btn ${filterTagId === null ? 'active' : ''}`}
          onClick={() => setFilterTagId(null)}
        >
          全部 ({messages.length})
        </button>
        <button
          type="button"
          className={`tag-filter-btn ${filterTagId === FILTER_NO_TAG ? 'active' : ''}`}
          onClick={() => setFilterTagId(FILTER_NO_TAG)}
        >
          无标签 ({getTagCount(FILTER_NO_TAG)})
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
        <span className="pinned-count-hint">
          📌 置顶 ({pinnedCount})
        </span>
        <span className="action-hint">
          {showFavoritesOnly ? '点击显示全部消息' : '点击只显示收藏消息'}
        </span>
      </div>
      <MessageList
        messages={filteredMessages}
        selectedId={selectedId}
        onSelect={handleSelect}
        onToggleFavorite={handleToggleFavorite}
        onTogglePin={togglePin}
        showFavoritesOnly={showFavoritesOnly}
        filterNumber={filterNumber}
        filterTagId={filterTagId}
        searchQuery={searchQuery}
        getTagById={getTagById}
        getContactByNumber={getContactByNumber}
        getThreadForMessage={getThreadForMessage}
      />
      <MessageDetail
        message={selectedMessage}
        searchQuery={searchQuery}
        onToggleFavorite={handleToggleFavorite}
        onTogglePin={togglePin}
        getTagById={getTagById}
        setMessageTag={setMessageTag}
        getContactByNumber={getContactByNumber}
        getMessageById={getMessageById}
        getThreadForMessage={getThreadForMessage}
        onStartReply={startReply}
        onSelectMessage={handleSelect}
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
