import { FilterBar } from '../components/FilterBar'
import { MessageDetail } from '../components/MessageDetail'
import { MessageList } from '../components/MessageList'
import { NavButtons } from '../components/NavButtons'
import { PagerShell } from '../components/PagerShell'
import { StatusBar } from '../components/StatusBar'
import { usePager } from '../context/PagerContext'

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
    toggleFavorite,
  } = usePager()

  const handleSelect = (id: string) => {
    setSelectedId(id)
    markAsRead(id)
  }

  return (
    <PagerShell>
      <StatusBar
        unreadCount={unreadCount}
        totalCount={filteredMessages.length}
      />
      <FilterBar value={filterNumber} onChange={setFilterNumber} />
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
          {showFavoritesOnly ? '显示收藏消息' : '显示全部消息'}
        </span>
      </div>
      <MessageList
        messages={filteredMessages}
        selectedId={selectedId}
        onSelect={handleSelect}
        onToggleFavorite={toggleFavorite}
      />
      <MessageDetail
        message={selectedMessage}
        onToggleFavorite={toggleFavorite}
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
