import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { NavButtons } from '../components/NavButtons'
import { PagerShell } from '../components/PagerShell'
import { StatusBar } from '../components/StatusBar'
import { usePager } from '../context/PagerContext'
import type { RepeatType, ScheduledMessage } from '../types/pager'

type FilterStatus = 'all' | 'pending' | 'sent' | 'cancelled'

function getSeriesId(msg: ScheduledMessage): string {
  return msg.parentId || msg.id
}

export function ScheduledPage() {
  const navigate = useNavigate()
  const {
    scheduledMessages,
    cancelScheduledMessage,
    getTagById,
    getContactByNumber,
    unreadCount,
    messages,
  } = usePager()

  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')

  const nextPendingBySeries = useMemo(() => {
    const map = new Map<string, string>()
    for (const msg of scheduledMessages) {
      if (msg.status !== 'pending') continue
      if (!msg.repeatType || msg.repeatType === 'none') continue
      const seriesId = getSeriesId(msg)
      if (!map.has(seriesId) || msg.scheduledTime < map.get(seriesId)!) {
        map.set(seriesId, msg.scheduledTime)
      }
    }
    return map
  }, [scheduledMessages])

  const filteredMessages = useMemo(() => {
    if (filterStatus === 'all') return scheduledMessages
    return scheduledMessages.filter((msg) => msg.status === filterStatus)
  }, [scheduledMessages, filterStatus])

  const pendingCount = scheduledMessages.filter((m) => m.status === 'pending').length
  const sentCount = scheduledMessages.filter((m) => m.status === 'sent').length
  const cancelledCount = scheduledMessages.filter((m) => m.status === 'cancelled').length

  const handleCancel = (id: string) => {
    const ok = window.confirm('确定取消这条定时消息？')
    if (ok) {
      cancelScheduledMessage(id)
    }
  }

  const handleEdit = (id: string) => {
    navigate(`/send?edit=${encodeURIComponent(id)}`)
  }

  const getStatusLabel = (status: ScheduledMessage['status']) => {
    switch (status) {
      case 'pending':
        return '待发送'
      case 'sent':
        return '已发送'
      case 'cancelled':
        return '已取消'
    }
  }

  const getStatusClass = (status: ScheduledMessage['status']) => {
    switch (status) {
      case 'pending':
        return 'sched-status-pending'
      case 'sent':
        return 'sched-status-sent'
      case 'cancelled':
        return 'sched-status-cancelled'
    }
  }

  const getRepeatLabel = (repeatType: RepeatType) => {
    switch (repeatType) {
      case 'none':
        return ''
      case 'daily':
        return '每天'
      case 'weekly':
        return '每周'
      case 'monthly':
        return '每月'
    }
  }

  return (
    <PagerShell title="MOTOROLA BP">
      <StatusBar
        unreadCount={unreadCount}
        totalCount={messages.length}
        label="SCHEDULED"
      />

      <div className="sched-page-header">
        <div className="form-title">═══ 定时消息 ═══</div>
      </div>

      <div className="sched-filter-row">
        <button
          type="button"
          className={`sched-filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
          onClick={() => setFilterStatus('all')}
        >
          全部 ({scheduledMessages.length})
        </button>
        <button
          type="button"
          className={`sched-filter-btn ${filterStatus === 'pending' ? 'active' : ''}`}
          onClick={() => setFilterStatus('pending')}
        >
          待发送 ({pendingCount})
        </button>
        <button
          type="button"
          className={`sched-filter-btn ${filterStatus === 'sent' ? 'active' : ''}`}
          onClick={() => setFilterStatus('sent')}
        >
          已发送 ({sentCount})
        </button>
        <button
          type="button"
          className={`sched-filter-btn ${filterStatus === 'cancelled' ? 'active' : ''}`}
          onClick={() => setFilterStatus('cancelled')}
        >
          已取消 ({cancelledCount})
        </button>
      </div>

      <div className="sched-action-row">
        <button
          type="button"
          className="pager-btn pager-btn-primary pager-btn-sm"
          onClick={() => navigate('/send?mode=scheduled')}
        >
          + 新建定时
        </button>
        <span className="action-hint">
          共 {scheduledMessages.length} 条 · 显示 {filteredMessages.length} 条
        </span>
      </div>

      {filteredMessages.length === 0 ? (
        <div className="empty-list">
          {scheduledMessages.length === 0 ? '-- 暂无定时消息 --' : '-- 无匹配结果 --'}
        </div>
      ) : (
        <ul className="sched-list">
          {filteredMessages.map((msg) => {
            const tag = msg.tagId ? getTagById(msg.tagId) : undefined
            const contact = getContactByNumber(msg.number)
            const hasContact = !!contact
            const repeatLabel = getRepeatLabel(msg.repeatType || 'none')
            const isRepeating = msg.repeatType && msg.repeatType !== 'none'
            let nextTime: string | null = null
            if (isRepeating) {
              if (msg.status === 'sent') {
                const seriesId = getSeriesId(msg)
                nextTime = nextPendingBySeries.get(seriesId) || null
              }
            }

            return (
              <li key={msg.id} className={`sched-item sched-${msg.status} ${isRepeating ? 'sched-repeating' : ''}`}>
                <div className="sched-item-header">
                  <span className={`sched-status ${getStatusClass(msg.status)}`}>
                    {getStatusLabel(msg.status)}
                  </span>
                  {isRepeating && (
                    <span className="sched-repeat-badge">
                      🔁 {repeatLabel}
                    </span>
                  )}
                  <span className="sched-time">{msg.scheduledTime}</span>
                </div>
                <div className="sched-item-info">
                  <span className="sched-name">{contact?.name || msg.number}</span>
                  {hasContact && <span className="sched-number">{msg.number}</span>}
                </div>
                <div className="sched-item-content">{msg.content}</div>
                {tag && (
                  <span
                    className="msg-tag"
                    style={{ borderColor: tag.color, color: tag.color }}
                  >
                    <span className="tag-dot" style={{ background: tag.color }} />
                    {tag.name}
                  </span>
                )}
                {nextTime && (
                  <div className="sched-next-time">
                    下次发送：{nextTime}
                  </div>
                )}
                <div className="sched-item-actions">
                  <span className="sched-created">创建于 {msg.createdAt}</span>
                  {msg.status === 'pending' && (
                    <>
                      <button
                        type="button"
                        className="pager-btn pager-btn-sm"
                        onClick={() => handleEdit(msg.id)}
                      >
                        编辑
                      </button>
                      <button
                        type="button"
                        className="pager-btn pager-btn-sm"
                        onClick={() => handleCancel(msg.id)}
                      >
                        取消
                      </button>
                    </>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <NavButtons />
    </PagerShell>
  )
}
