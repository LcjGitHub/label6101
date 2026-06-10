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
      <MessageList
        messages={filteredMessages}
        selectedId={selectedId}
        onSelect={handleSelect}
      />
      <MessageDetail message={selectedMessage} />
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
