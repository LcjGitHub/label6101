import { useMemo, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { NavButtons } from '../components/NavButtons'
import { PagerShell } from '../components/PagerShell'
import { StatusBar } from '../components/StatusBar'
import { usePager } from '../context/PagerContext'
import type { Contact } from '../types/pager'

interface EditableContact {
  id: string | null
  name: string
  number: string
}

const EMPTY_CONTACT: EditableContact = { id: null, name: '', number: '' }

export function ContactsPage() {
  const navigate = useNavigate()
  const {
    contacts,
    searchContacts,
    addContact,
    updateContact,
    removeContact,
    unreadCount,
    messages,
  } = usePager()

  const [searchQuery, setSearchQuery] = useState('')
  const [editing, setEditing] = useState<EditableContact>(EMPTY_CONTACT)
  const [showForm, setShowForm] = useState(false)
  const [status, setStatus] = useState('')

  const filteredContacts = useMemo(
    () => searchContacts(searchQuery),
    [searchContacts, searchQuery],
  )

  const startAdd = () => {
    setEditing(EMPTY_CONTACT)
    setShowForm(true)
    setStatus('')
  }

  const startEdit = (contact: Contact) => {
    setEditing({ id: contact.id, name: contact.name, number: contact.number })
    setShowForm(true)
    setStatus('')
  }

  const cancelEdit = () => {
    setEditing(EMPTY_CONTACT)
    setShowForm(false)
    setStatus('')
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const trimmedName = editing.name.trim()
    const trimmedNumber = editing.number.trim()

    if (!trimmedName || !trimmedNumber) {
      setStatus('ERR: 姓名和号码不能为空')
      return
    }

    if (editing.id) {
      const existing = contacts.find(
        (c) => c.number === trimmedNumber && c.id !== editing.id,
      )
      if (existing) {
        setStatus('ERR: 该号码已存在')
        return
      }
      updateContact(editing.id, trimmedName, trimmedNumber)
      setStatus('OK: 联系人已更新')
    } else {
      const existing = contacts.find((c) => c.number === trimmedNumber)
      if (existing) {
        setStatus('ERR: 该号码已存在')
        return
      }
      addContact(trimmedName, trimmedNumber)
      setStatus('OK: 联系人已添加')
    }

    setTimeout(() => {
      setEditing(EMPTY_CONTACT)
      setShowForm(false)
      setStatus('')
    }, 600)
  }

  const handleDelete = (id: string) => {
    const ok = window.confirm('确定删除该联系人？')
    if (ok) {
      removeContact(id)
    }
  }

  return (
    <PagerShell title="MOTOROLA BP">
      <StatusBar
        unreadCount={unreadCount}
        totalCount={messages.length}
        label="CONTACTS"
      />

      <div className="contacts-page-header">
        <div className="form-title">═══ 联系人 ═══</div>
      </div>

      {!showForm ? (
        <>
          <div className="contacts-search-row">
            <label className="form-label">搜索</label>
            <input
              type="text"
              className="pager-input"
              placeholder="姓名或号码..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="contacts-action-row">
            <button
              type="button"
              className="pager-btn pager-btn-primary pager-btn-sm"
              onClick={startAdd}
            >
              + 新增联系人
            </button>
            <span className="action-hint">
              共 {contacts.length} 位 · 匹配 {filteredContacts.length} 位
            </span>
          </div>

          {filteredContacts.length === 0 ? (
            <div className="empty-list">
              {contacts.length === 0 ? '-- 暂无联系人，请添加 --' : '-- 无匹配结果 --'}
            </div>
          ) : (
            <ul className="contact-list">
              {filteredContacts.map((contact) => (
                <li key={contact.id} className="contact-list-item">
                  <div className="contact-list-info">
                    <span className="contact-list-name">{contact.name}</span>
                    <span className="contact-list-number">{contact.number}</span>
                  </div>
                  <div className="contact-list-actions">
                    <button
                      type="button"
                      className="pager-btn pager-btn-sm"
                      onClick={() => startEdit(contact)}
                    >
                      编辑
                    </button>
                    <button
                      type="button"
                      className="pager-btn pager-btn-sm"
                      onClick={() => handleDelete(contact.id)}
                    >
                      删除
                    </button>
                    <button
                      type="button"
                      className="pager-btn pager-btn-sm pager-btn-primary"
                      onClick={() => navigate(`/send?number=${encodeURIComponent(contact.number)}`)}
                    >
                      发消息
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      ) : (
        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="form-title">
            {editing.id ? '═══ 编辑联系人 ═══' : '═══ 新增联系人 ═══'}
          </div>

          <label className="form-label" htmlFor="contact-name">
            姓名
          </label>
          <input
            id="contact-name"
            type="text"
            className="pager-input full"
            placeholder="联系人姓名"
            value={editing.name}
            onChange={(e) => setEditing({ ...editing, name: e.target.value })}
            maxLength={20}
          />

          <label className="form-label" htmlFor="contact-number">
            寻呼号码
          </label>
          <input
            id="contact-number"
            type="text"
            className="pager-input full"
            placeholder="如 13801234567"
            value={editing.number}
            onChange={(e) => setEditing({ ...editing, number: e.target.value })}
            maxLength={20}
          />

          {status && <div className="form-status">{status}</div>}

          <div className="form-actions">
            <button type="submit" className="pager-btn pager-btn-primary">
              {editing.id ? '保存 SAVE' : '添加 ADD'}
            </button>
            <button
              type="button"
              className="pager-btn"
              onClick={cancelEdit}
            >
              取消 ESC
            </button>
          </div>
        </form>
      )}

      <NavButtons />
    </PagerShell>
  )
}
