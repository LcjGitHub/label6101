import { useMemo, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { NavButtons } from '../components/NavButtons'
import { PagerShell } from '../components/PagerShell'
import { StatusBar } from '../components/StatusBar'
import { GroupManager } from '../components/GroupManager'
import { GroupSelector } from '../components/GroupSelector'
import { usePager } from '../context/PagerContext'
import { FILTER_NO_GROUP } from '../context/PagerContext'
import type { Contact } from '../types/pager'

interface EditableContact {
  id: string | null
  name: string
  number: string
  groupId: string | null
}

const EMPTY_CONTACT: EditableContact = { id: null, name: '', number: '', groupId: null }

export function ContactsPage() {
  const navigate = useNavigate()
  const {
    contacts,
    searchContacts,
    addContact,
    updateContact,
    removeContact,
    removeContactBatch,
    setContactGroupBatch,
    unreadCount,
    messages,
    getGroupById,
  } = usePager()

  const [searchQuery, setSearchQuery] = useState('')
  const [filterGroupId, setFilterGroupId] = useState<string | null>(null)
  const [editing, setEditing] = useState<EditableContact>(EMPTY_CONTACT)
  const [showForm, setShowForm] = useState(false)
  const [status, setStatus] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [batchMode, setBatchMode] = useState(false)
  const [showBatchGroupSelect, setShowBatchGroupSelect] = useState(false)

  const filteredContacts = useMemo(
    () => searchContacts(searchQuery, filterGroupId),
    [searchContacts, searchQuery, filterGroupId],
  )

  const allSelected = useMemo(() => {
    return filteredContacts.length > 0 && filteredContacts.every((c) => selectedIds.has(c.id))
  }, [filteredContacts, selectedIds])

  const startAdd = () => {
    setEditing({ ...EMPTY_CONTACT, groupId: filterGroupId && filterGroupId !== FILTER_NO_GROUP ? filterGroupId : null })
    setShowForm(true)
    setStatus('')
  }

  const startEdit = (contact: Contact) => {
    setEditing({
      id: contact.id,
      name: contact.name,
      number: contact.number,
      groupId: contact.groupId,
    })
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
      updateContact(editing.id, trimmedName, trimmedNumber, editing.groupId)
      setStatus('OK: 联系人已更新')
    } else {
      const existing = contacts.find((c) => c.number === trimmedNumber)
      if (existing) {
        setStatus('ERR: 该号码已存在')
        return
      }
      addContact(trimmedName, trimmedNumber, editing.groupId)
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
      setSelectedIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredContacts.map((c) => c.id)))
    }
  }

  const handleBatchDelete = () => {
    if (selectedIds.size === 0) return
    const ok = window.confirm(`确定删除选中的 ${selectedIds.size} 位联系人？`)
    if (ok) {
      removeContactBatch([...selectedIds])
      setSelectedIds(new Set())
      setBatchMode(false)
    }
  }

  const handleBatchMoveGroup = (groupId: string | null) => {
    if (selectedIds.size === 0) return
    const targetGroupId = groupId === FILTER_NO_GROUP ? null : groupId
    setContactGroupBatch([...selectedIds], targetGroupId)
    setSelectedIds(new Set())
    setShowBatchGroupSelect(false)
    setBatchMode(false)
  }

  const clearSelection = () => {
    setSelectedIds(new Set())
    setBatchMode(false)
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
          <GroupManager />

          <div className="group-filter-row">
            <GroupSelector
              selectedGroupId={filterGroupId}
              onSelect={setFilterGroupId}
              showGroupCounts={true}
            />
          </div>

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
            <button
              type="button"
              className={`pager-btn pager-btn-sm ${batchMode ? 'active' : ''}`}
              onClick={() => setBatchMode(!batchMode)}
            >
              {batchMode ? '退出批量' : '批量操作'}
            </button>
            <span className="action-hint">
              共 {contacts.length} 位 · 匹配 {filteredContacts.length} 位
            </span>
          </div>

          {batchMode && (
            <div className="batch-action-row">
              <button
                type="button"
                className="pager-btn pager-btn-sm"
                onClick={toggleSelectAll}
              >
                {allSelected ? '取消全选' : '全选'}
              </button>
              <button
                type="button"
                className="pager-btn pager-btn-sm"
                onClick={() => setShowBatchGroupSelect(!showBatchGroupSelect)}
                disabled={selectedIds.size === 0}
              >
                移动分组
              </button>
              <button
                type="button"
                className="pager-btn pager-btn-sm"
                onClick={handleBatchDelete}
                disabled={selectedIds.size === 0}
              >
                删除选中 ({selectedIds.size})
              </button>
              <button
                type="button"
                className="pager-btn pager-btn-sm"
                onClick={clearSelection}
              >
                清除选择
              </button>
            </div>
          )}

          {batchMode && showBatchGroupSelect && (
            <div className="batch-group-select">
              <div className="form-label">选择目标分组</div>
              <GroupSelector
                selectedGroupId={null}
                onSelect={handleBatchMoveGroup}
                showGroupCounts={false}
              />
            </div>
          )}

          {filteredContacts.length === 0 ? (
            <div className="empty-list">
              {contacts.length === 0 ? '-- 暂无联系人，请添加 --' : '-- 无匹配结果 --'}
            </div>
          ) : (
            <ul className="contact-list">
              {filteredContacts.map((contact) => {
                const group = getGroupById(contact.groupId)
                const isSelected = selectedIds.has(contact.id)
                return (
                  <li
                    key={contact.id}
                    className={`contact-list-item ${isSelected ? 'selected' : ''}`}
                  >
                    {batchMode && (
                      <input
                        type="checkbox"
                        className="contact-checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(contact.id)}
                      />
                    )}
                    <div className="contact-list-info">
                      <div className="contact-list-header">
                        <span className="contact-list-name">{contact.name}</span>
                        {group && (
                          <span
                            className="contact-group-tag"
                            style={{ borderColor: group.color, color: group.color }}
                          >
                            <span
                              className="group-dot"
                              style={{ background: group.color }}
                            />
                            {group.name}
                          </span>
                        )}
                      </div>
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
                )
              })}
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

          <label className="form-label">分组</label>
          <div className="contact-group-select">
            <GroupSelector
              selectedGroupId={editing.groupId ?? FILTER_NO_GROUP}
              onSelect={(id) => setEditing({ ...editing, groupId: id === FILTER_NO_GROUP ? null : id })}
              showAllOption={false}
              showGroupCounts={false}
            />
          </div>

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
