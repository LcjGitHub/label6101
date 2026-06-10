import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { usePager } from '../context/PagerContext'
import { TagSelector } from './TagSelector'
import { ContactSelector } from './ContactSelector'
import type { Contact } from '../types/pager'

export function SendMessageForm() {
  const { sendMessage, getContactByNumber } = usePager()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [number, setNumber] = useState('')
  const [content, setContent] = useState('')
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null)
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null)
  const [status, setStatus] = useState('')

  useEffect(() => {
    const prefillNumber = searchParams.get('number')
    if (prefillNumber) {
      setNumber(prefillNumber)
      const contact = getContactByNumber(prefillNumber)
      if (contact) {
        setSelectedContactId(contact.id)
      }
    }
  }, [searchParams, getContactByNumber])

  const handleContactSelect = (contact: Contact | null) => {
    if (contact) {
      setSelectedContactId(contact.id)
      setNumber(contact.number)
    } else {
      setSelectedContactId(null)
      setNumber('')
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

    sendMessage({ number: trimmedNumber, content: trimmedContent, tagId: selectedTagId })
    setStatus('OK: 消息已发送')
    setTimeout(() => navigate('/'), 800)
  }

  return (
    <form className="send-form" onSubmit={handleSubmit}>
      <div className="form-title">═══ 发送寻呼 ═══</div>

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
          发送 SEND
        </button>
        <button
          type="button"
          className="pager-btn"
          onClick={() => navigate('/')}
        >
          取消 ESC
        </button>
      </div>
    </form>
  )
}
