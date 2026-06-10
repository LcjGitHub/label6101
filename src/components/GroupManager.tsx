import { useState } from 'react'
import { usePager } from '../context/PagerContext'
import type { Group } from '../types/pager'

interface EditableGroup {
  id: string | null
  name: string
  color: string
}

const EMPTY_GROUP: EditableGroup = { id: null, name: '', color: '' }

const GROUP_COLORS = [
  '#33ff66',
  '#ff6699',
  '#66ccff',
  '#ffcc66',
  '#cc99ff',
  '#ff9966',
  '#66ffcc',
  '#ffff66',
]

export function GroupManager() {
  const { groups, addGroup, updateGroup, removeGroup, getContactsByGroup } = usePager()
  const [editing, setEditing] = useState<EditableGroup>(EMPTY_GROUP)
  const [showForm, setShowForm] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [status, setStatus] = useState('')

  const startAdd = () => {
    setEditing({ ...EMPTY_GROUP, color: GROUP_COLORS[groups.length % GROUP_COLORS.length] })
    setShowForm(true)
    setStatus('')
  }

  const startEdit = (group: Group) => {
    setEditing({ id: group.id, name: group.name, color: group.color })
    setShowForm(true)
    setStatus('')
  }

  const cancelEdit = () => {
    setEditing(EMPTY_GROUP)
    setShowForm(false)
    setStatus('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedName = editing.name.trim()

    if (!trimmedName) {
      setStatus('ERR: 分组名称不能为空')
      return
    }

    if (editing.id) {
      const existing = groups.find(
        (g) => g.name === trimmedName && g.id !== editing.id,
      )
      if (existing) {
        setStatus('ERR: 该分组名称已存在')
        return
      }
      updateGroup(editing.id, trimmedName, editing.color)
      setStatus('OK: 分组已更新')
    } else {
      const existing = groups.find((g) => g.name === trimmedName)
      if (existing) {
        setStatus('ERR: 该分组名称已存在')
        return
      }
      addGroup(trimmedName, editing.color)
      setStatus('OK: 分组已添加')
    }

    setTimeout(() => {
      setEditing(EMPTY_GROUP)
      setShowForm(false)
      setStatus('')
    }, 600)
  }

  const handleDelete = (id: string) => {
    const groupContacts = getContactsByGroup(id)
    const message = groupContacts.length > 0
      ? `确定删除该分组？该分组下的 ${groupContacts.length} 位联系人将被移至"未分组"。`
      : '确定删除该分组？'
    const ok = window.confirm(message)
    if (ok) {
      removeGroup(id)
    }
  }

  return (
    <div className="group-manager">
      <div className="group-manager-header">
        <button
          type="button"
          className={`group-toggle-btn ${expanded ? 'active' : ''}`}
          onClick={() => setExpanded(!expanded)}
        >
          分组管理 {expanded ? '▴' : '▾'}
        </button>
      </div>

      {expanded && (
        <div className="group-manager-panel">
          {!showForm ? (
            <>
              <div className="group-list-header">
                <span className="action-hint">共 {groups.length} 个分组</span>
                <button
                  type="button"
                  className="pager-btn pager-btn-sm pager-btn-primary"
                  onClick={startAdd}
                >
                  + 新增分组
                </button>
              </div>

              <ul className="group-list">
                {groups.map((group) => {
                  const count = getContactsByGroup(group.id).length
                  return (
                    <li key={group.id} className="group-list-item">
                      <div className="group-list-info">
                        <span
                          className="group-dot"
                          style={{ background: group.color }}
                        />
                        <span className="group-list-name">{group.name}</span>
                        <span className="group-list-count">{count} 人</span>
                      </div>
                      <div className="group-list-actions">
                        <button
                          type="button"
                          className="pager-btn pager-btn-sm"
                          onClick={() => startEdit(group)}
                        >
                          编辑
                        </button>
                        <button
                          type="button"
                          className="pager-btn pager-btn-sm"
                          onClick={() => handleDelete(group.id)}
                        >
                          删除
                        </button>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </>
          ) : (
            <form className="group-form" onSubmit={handleSubmit}>
              <div className="form-title">
                {editing.id ? '═══ 编辑分组 ═══' : '═══ 新增分组 ═══'}
              </div>

              <label className="form-label" htmlFor="group-name">
                分组名称
              </label>
              <input
                id="group-name"
                type="text"
                className="pager-input full"
                placeholder="如 同事、客户、亲友"
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                maxLength={10}
              />

              <label className="form-label">分组颜色</label>
              <div className="group-color-picker">
                {GROUP_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`group-color-btn ${editing.color === color ? 'active' : ''}`}
                    style={{ background: color }}
                    onClick={() => setEditing({ ...editing, color })}
                    aria-label={`选择颜色 ${color}`}
                  />
                ))}
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
        </div>
      )}
    </div>
  )
}
