import { useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { usePager } from '../context/PagerContext'
import { TagSelector } from './TagSelector'
import { ContactSelector } from './ContactSelector'
import type { Contact } from '../types/pager'

function parseDateTimeLocal(value: string): string {
  const d = new Date(value)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function SendMessageForm() {
  const {
    sendMessage,
    getContactByNumber,
    replyingTo,
    cancelReply,
    addScheduledMessage,
    getScheduledMessageById,
    updateScheduledMessage,
  } = usePager()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [minDateTime] = useState(() => {
    const now = new Date()
    now.setSeconds(0, 0)
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`
  })

  const [number, setNumber] = useState(() => {
    const editId = searchParams.get('edit')
    if (editId) {
      const msg = getScheduledMessageById(editId)
      if (msg) return msg.number
    }
    const prefillNumber = searchParams.get('number')
    if (prefillNumber) return prefillNumber
    if (replyingTo) return replyingTo.number
    return ''
  })

  const [content, setContent] = useState(() => {
    const editId = searchParams.get('edit')
    if (editId) {
      const msg = getScheduledMessageById(editId)
      if (msg) return msg.content
    }
    return ''
  })

  const [selectedTagId, setSelectedTagId] = useState<string | null>(() => {
    const editId = searchParams.get('edit')
    if (editId) {
      const msg = getScheduledMessageById(editId)
      if (msg) return msg.tagId
    }
    if (replyingTo) return replyingTo.tagId
    return null
  })

  const [selectedContactId, setSelectedContactId] = useState<string | null>(() => {
    const editId = searchParams.get('edit')
    if (editId) {
      const msg = getScheduledMessageById(editId)
      if (msg) {
        const contact = getContactByNumber(msg.number)
        return contact?.id ?? null
      }
    }
    const prefillNumber = searchParams.get('number')
    if (prefillNumber) {
      const contact = getContactByNumber(prefillNumber)
      return contact?.id ?? null
    }
    if (replyingTo) {
      const contact = getContactByNumber(replyingTo.number)
      return contact?.id ?? null
    }
    return null
  })

  const [sendMode, setSendMode] = useState<'instant' | 'scheduled'>(() => {
    const editId = searchParams.get('edit')
    if (editId) {
      const msg = getScheduledMessageById(editId)
      if (msg) return 'scheduled'
    }
    const modeParam = searchParams.get('mode')
    if (modeParam === 'scheduled') return 'scheduled'
    return 'instant'
  })

  const [replyToIdForSchedule, setReplyToIdForSchedule] = useState<string | null>(() => {
    const editId = searchParams.get('edit')
    if (editId) {
      const msg = getScheduledMessageById(editId)
      if (msg) return msg.replyToId
    }
    return null
  })

  const [scheduledDateTime, setScheduledDateTime] = useState(() => {
    const editId = searchParams.get('edit')
    if (editId) {
      const msg = getScheduledMessageById(editId)
      if (msg) return msg.scheduledTime.replace(' ', 'T')
    }
    return ''
  })

  const [editingId] = useState<string | null>(() => {
    const editId = searchParams.get('edit')
    if (editId) {
      const msg = getScheduledMessageById(editId)
      if (msg) return editId
    }
    return null
  })

  const [status, setStatus] = useState('')

  const handleContactSelect = (contact: Contact | null) => {
    if (contact) {
      setSelectedContactId(contact.id)
      setNumber(contact.number)
    } else {
      setSelectedContactId(null)
    }
  }

  const handleNumberChange = (value: string) => {
    setNumber(value)
    const contact = getContactByNumber(value)
    setSelectedContactId(contact ? contact.id : null)
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const trimmedNumber = number.trim()
    const trimmedContent = content.trim()

    if (!trimmedNumber || !trimmedContent) {
      setStatus('ERR: 号码和内容不能为空')
      return
    }

    if (trimmedContent.length > 80) {
      setStatus('ERR: 内容不超过80字')
      return
    }

    if (sendMode === 'scheduled') {
      if (!scheduledDateTime) {
        setStatus('ERR: 请选择定时时间')
        return
      }
      const scheduledTime = parseDateTimeLocal(scheduledDateTime)
      const now = new Date()
      const scheduled = new Date(scheduledDateTime)
      if (scheduled <= now) {
        setStatus('ERR: 定时时间必须在未来')
        return
      }

      if (editingId) {
        updateScheduledMessage(editingId, {
          number: trimmedNumber,
          content: trimmedContent,
          tagId: selectedTagId,
          scheduledTime,
          replyToId: replyToIdForSchedule,
        })
        setStatus('OK: 定时消息已更新')
      } else {
        addScheduledMessage({
          number: trimmedNumber,
          content: trimmedContent,
          tagId: selectedTagId,
          replyToId: replyingTo ? replyingTo.id : null,
          scheduledTime,
        })
        setStatus('OK: 定时消息已设置')
      }
      setTimeout(() => navigate('/scheduled'), 800)
    } else {
      sendMessage({
        number: trimmedNumber,
        content: trimmedContent,
        tagId: selectedTagId,
        replyToId: replyingTo ? replyingTo.id : null,
      })
      setStatus('OK: 消息已发送')
      setTimeout(() => navigate('/'), 800)
    }
  }

  const replyingToContact = replyingTo ? getContactByNumber(replyingTo.number) : null
  const replyingToName = replyingToContact ? replyingToContact.name : replyingTo?.number

  return (
    <form className="send-form" onSubmit={handleSubmit}>
      <div className="form-title">═══ {editingId ? '编辑定时消息' : '发送寻呼'} ═══</div>

      {replyingTo && !editingId && (
        <div className="reply-preview">
          <div className="reply-preview-header">
            <span className="reply-preview-label">↩ 正在回复</span>
            <button
              type="button"
              className="reply-preview-cancel"
              onClick={() => {
                cancelReply()
                setNumber('')
                setSelectedContactId(null)
                setSelectedTagId(null)
                setReplyToIdForSchedule(null)
              }}
            >
              ✕ 取消
            </button>
          </div>
          <div className="reply-preview-info">
            <span className="reply-preview-name">{replyingToName}</span>
            <span className="reply-preview-time">{replyingTo.time.slice(5)}</span>
          </div>
          <div className="reply-preview-content">{replyingTo.content}</div>
        </div>
      )}

      <label className="form-label">
        发送方式
      </label>
      <div className="send-mode-selector">
        <button
          type="button"
          className={`send-mode-btn ${sendMode === 'instant' ? 'active' : ''}`}
          onClick={() => setSendMode('instant')}
        >
          立即发送
        </button>
        <button
          type="button"
          className={`send-mode-btn ${sendMode === 'scheduled' ? 'active' : ''}`}
          onClick={() => setSendMode('scheduled')}
        >
          定时发送
        </button>
      </div>

      {sendMode === 'scheduled' && (
        <>
          <label className="form-label" htmlFor="scheduled-time">
            定时时间
          </label>
          <input
            id="scheduled-time"
            type="datetime-local"
            className="pager-input full"
            value={scheduledDateTime}
            min={minDateTime}
            onChange={(e) => setScheduledDateTime(e.target.value)}
          />
          <div className="form-hint">请选择未来的时间</div>
        </>
      )}

      <label className="form-label">
        选择联系人
      </label>
      <ContactSelector
        selectedContactId={selectedContactId}
        onSelect={handleContactSelect}
      />

      <label className="form-label" htmlFor="send-number">
        对方号码
      </label>
      <input
        id="send-number"
        type="text"
        className="pager-input full"
        placeholder="如 13801234567"
        value={number}
        onChange={(e) => handleNumberChange(e.target.value)}
        maxLength={20}
      />

      <label className="form-label">
        分类标签
      </label>
      <TagSelector
        selectedTagId={selectedTagId}
        onSelect={setSelectedTagId}
        showAddTag
      />

      <label className="form-label" htmlFor="send-content">
        消息内容
      </label>
      <textarea
        id="send-content"
        className="pager-textarea"
        placeholder="请输入寻呼内容..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        maxLength={80}
        rows={4}
      />
      <div className="char-count">{content.length}/80</div>

      {status && <div className="form-status">{status}</div>}

      <div className="form-actions">
        <button type="submit" className="pager-btn pager-btn-primary">
          {editingId ? '保存 SAVE' : sendMode === 'scheduled' ? '设置定时 SET' : '发送 SEND'}
        </button>
        <button
          type="button"
          className="pager-btn"
          onClick={() => {
            cancelReply()
            navigate(editingId ? '/scheduled' : '/')
          }}
        >
          取消 ESC
        </button>
      </div>
    </form>
  )
}
