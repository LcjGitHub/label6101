import { useMemo, useState } from 'react'
import { usePager } from '../context/PagerContext'
import type { Contact } from '../types/pager'

interface ContactSelectorProps {
  selectedContactId: string | null
  onSelect: (contact: Contact | null) => void
}

export function ContactSelector({ selectedContactId, onSelect }: ContactSelectorProps) {
  const { contacts, searchContacts } = usePager()
  const [query, setQuery] = useState('')
  const [expanded, setExpanded] = useState(false)

  const filteredContacts = useMemo(
    () => searchContacts(query),
    [searchContacts, query],
  )

  const selectedContact = useMemo(
    () => contacts.find((c) => c.id === selectedContactId) ?? null,
    [contacts, selectedContactId],
  )

  return (
    <div className="contact-selector">
      <div className="contact-selector-header">
        <button
          type="button"
          className={`contact-toggle-btn ${expanded ? 'active' : ''}`}
          onClick={() => setExpanded(!expanded)}
        >
          {selectedContact ? `已选: ${selectedContact.name} (${selectedContact.number})` : '选择联系人 ▾'}
        </button>
      </div>
      {expanded && (
        <div className="contact-selector-panel">
          <div className="contact-search-row">
            <input
              type="text"
              className="pager-input"
              placeholder="搜索姓名或号码..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          {filteredContacts.length === 0 ? (
            <div className="contact-empty">-- 无匹配联系人 --</div>
          ) : (
            <ul className="contact-options">
              <li>
                <button
                  type="button"
                  className={`contact-option ${!selectedContactId ? 'active' : ''}`}
                  onClick={() => {
                    onSelect(null)
                    setExpanded(false)
                  }}
                >
                  <span className="contact-option-name">不选择</span>
                  <span className="contact-option-number">手动输入号码</span>
                </button>
              </li>
              {filteredContacts.map((contact) => (
                <li key={contact.id}>
                  <button
                    type="button"
                    className={`contact-option ${contact.id === selectedContactId ? 'active' : ''}`}
                    onClick={() => {
                      onSelect(contact)
                      setExpanded(false)
                      setQuery('')
                    }}
                  >
                    <span className="contact-option-name">{contact.name}</span>
                    <span className="contact-option-number">{contact.number}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
