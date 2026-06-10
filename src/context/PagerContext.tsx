import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { mockMessages } from '../data/mockMessages'
import type { Contact, NewMessageInput, PagerMessage, Tag } from '../types/pager'
import { DEFAULT_TAGS } from '../types/pager'

const FAVORITES_STORAGE_KEY = 'pager_favorites'
const SHOW_FAVORITES_STORAGE_KEY = 'pager_show_favorites_only'
const TAGS_STORAGE_KEY = 'pager_tags'
const FILTER_TAG_STORAGE_KEY = 'pager_filter_tag'
const CONTACTS_STORAGE_KEY = 'pager_contacts'

export const FILTER_NO_TAG = '__no_tag__'

interface PagerContextValue {
  messages: PagerMessage[]
  favoriteMessages: PagerMessage[]
  tags: Tag[]
  contacts: Contact[]
  filterNumber: string
  setFilterNumber: (value: string) => void
  showFavoritesOnly: boolean
  setShowFavoritesOnly: (value: boolean) => void
  filterTagId: string | null
  setFilterTagId: (tagId: string | null) => void
  filteredMessages: PagerMessage[]
  favoriteCount: number
  unreadCount: number
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  sendMessage: (input: NewMessageInput) => void
  addFavorite: (id: string) => void
  removeFavorite: (id: string) => void
  addTag: (name: string, color?: string) => void
  removeTag: (tagId: string) => void
  setMessageTag: (messageId: string, tagId: string | null) => void
  getTagById: (tagId: string | null) => Tag | undefined
  selectedId: string | null
  setSelectedId: (id: string | null) => void
  selectedMessage: PagerMessage | null
  addContact: (name: string, number: string) => void
  updateContact: (id: string, name: string, number: string) => void
  removeContact: (id: string) => void
  getContactByNumber: (number: string) => Contact | undefined
  getContactById: (id: string) => Contact | undefined
  searchContacts: (query: string) => Contact[]
}

const PagerContext = createContext<PagerContextValue | null>(null)

function formatNow(): string {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`
}

function loadFavoriteIds(): Set<string> {
  try {
    const stored = localStorage.getItem(FAVORITES_STORAGE_KEY)
    if (stored) {
      const ids = JSON.parse(stored)
      if (Array.isArray(ids)) return new Set(ids)
    }
  } catch {
    // ignore parse errors
  }
  return new Set()
}

function saveFavoriteIds(ids: Set<string>) {
  try {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify([...ids]))
  } catch {
    // ignore storage errors
  }
}

function loadTags(): Tag[] {
  try {
    const stored = localStorage.getItem(TAGS_STORAGE_KEY)
    if (stored) {
      const tags = JSON.parse(stored)
      if (Array.isArray(tags) && tags.length > 0) return tags
    }
  } catch {
    // ignore parse errors
  }
  return DEFAULT_TAGS
}

function saveTags(tags: Tag[]) {
  try {
    localStorage.setItem(TAGS_STORAGE_KEY, JSON.stringify(tags))
  } catch {
    // ignore storage errors
  }
}

function loadContacts(): Contact[] {
  try {
    const stored = localStorage.getItem(CONTACTS_STORAGE_KEY)
    if (stored) {
      const contacts = JSON.parse(stored)
      if (Array.isArray(contacts)) return contacts
    }
  } catch {
    // ignore parse errors
  }
  return []
}

function saveContacts(contacts: Contact[]) {
  try {
    localStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(contacts))
  } catch {
    // ignore storage errors
  }
}

const TAG_COLORS = [
  '#33ff66',
  '#ff6699',
  '#66ccff',
  '#ffcc66',
  '#cc99ff',
  '#ff9966',
  '#66ffcc',
  '#ffff66',
]

export function PagerProvider({ children }: { children: ReactNode }) {
  const initialFavoriteIds = useMemo(() => loadFavoriteIds(), [])
  const initialShowFavorites = useMemo(() => {
    try {
      const stored = localStorage.getItem(SHOW_FAVORITES_STORAGE_KEY)
      return stored === 'true'
    } catch {
      return false
    }
  }, [])
  const initialTags = useMemo(() => loadTags(), [])
  const initialContacts = useMemo(() => loadContacts(), [])
  const initialFilterTagId = useMemo(() => {
    try {
      const stored = localStorage.getItem(FILTER_TAG_STORAGE_KEY)
      return stored === 'null' ? null : stored || null
    } catch {
      return null
    }
  }, [])

  const initialMessages = useMemo(
    () =>
      mockMessages.map((msg) => ({
        ...msg,
        favorite: initialFavoriteIds.has(msg.id),
      })),
    [initialFavoriteIds],
  )

  const [messages, setMessages] = useState<PagerMessage[]>(initialMessages)
  const [tags, setTags] = useState<Tag[]>(initialTags)
  const [contacts, setContacts] = useState<Contact[]>(initialContacts)
  const [filterNumber, setFilterNumber] = useState('')
  const [showFavoritesOnly, setShowFavoritesOnlyState] = useState(initialShowFavorites)
  const [filterTagId, setFilterTagIdState] = useState<string | null>(initialFilterTagId)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const setShowFavoritesOnly = useCallback((value: boolean) => {
    setShowFavoritesOnlyState(value)
    try {
      localStorage.setItem(SHOW_FAVORITES_STORAGE_KEY, String(value))
    } catch {
      // ignore storage errors
    }
  }, [])

  const setFilterTagId = useCallback((tagId: string | null) => {
    setFilterTagIdState(tagId)
    try {
      localStorage.setItem(FILTER_TAG_STORAGE_KEY, tagId ?? 'null')
    } catch {
      // ignore storage errors
    }
  }, [])

  useEffect(() => {
    saveTags(tags)
  }, [tags])

  useEffect(() => {
    saveContacts(contacts)
  }, [contacts])

  const favoriteMessages = useMemo(
    () => messages.filter((msg) => msg.favorite),
    [messages],
  )

  const favoriteIds = useMemo(
    () => new Set(favoriteMessages.map((msg) => msg.id)),
    [favoriteMessages],
  )

  useEffect(() => {
    saveFavoriteIds(favoriteIds)
  }, [favoriteIds])

  const filteredMessages = useMemo(() => {
    const query = filterNumber.trim()
    let result = messages
    if (showFavoritesOnly) {
      result = result.filter((msg) => msg.favorite)
    }
    if (filterTagId) {
      if (filterTagId === FILTER_NO_TAG) {
        result = result.filter((msg) => msg.tagId === null)
      } else {
        result = result.filter((msg) => msg.tagId === filterTagId)
      }
    }
    if (query) {
      result = result.filter((msg) => msg.number.includes(query))
    }
    return result
  }, [messages, showFavoritesOnly, filterNumber, filterTagId])

  const unreadCount = useMemo(
    () => messages.filter((msg) => !msg.read).length,
    [messages],
  )

  const favoriteCount = useMemo(
    () => favoriteMessages.length,
    [favoriteMessages],
  )

  const selectedMessage = useMemo(
    () => messages.find((msg) => msg.id === selectedId) ?? null,
    [messages, selectedId],
  )

  const getTagById = useCallback(
    (tagId: string | null) => tags.find((t) => t.id === tagId),
    [tags],
  )

  const getContactByNumber = useCallback(
    (number: string) => contacts.find((c) => c.number === number.trim()),
    [contacts],
  )

  const getContactById = useCallback(
    (id: string) => contacts.find((c) => c.id === id),
    [contacts],
  )

  const searchContacts = useCallback(
    (query: string) => {
      const q = query.trim().toLowerCase()
      if (!q) return contacts
      return contacts.filter(
        (c) => c.name.toLowerCase().includes(q) || c.number.includes(q),
      )
    },
    [contacts],
  )

  const addContact = useCallback((name: string, number: string) => {
    const trimmedName = name.trim()
    const trimmedNumber = number.trim()
    if (!trimmedName || !trimmedNumber) return
    setContacts((prev) => {
      if (prev.some((c) => c.number === trimmedNumber)) return prev
      const id = `contact_${Date.now()}`
      return [...prev, { id, name: trimmedName, number: trimmedNumber }]
    })
  }, [])

  const updateContact = useCallback((id: string, name: string, number: string) => {
    const trimmedName = name.trim()
    const trimmedNumber = number.trim()
    if (!trimmedName || !trimmedNumber) return
    setContacts((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, name: trimmedName, number: trimmedNumber } : c,
      ),
    )
  }, [])

  const removeContact = useCallback((id: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== id))
  }, [])

  const markAsRead = useCallback((id: string) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === id ? { ...msg, read: true } : msg)),
    )
  }, [])

  const markAllAsRead = useCallback(() => {
    setMessages((prev) => prev.map((msg) => ({ ...msg, read: true })))
  }, [])

  const sendMessage = useCallback((input: NewMessageInput) => {
    const id = String(Date.now()).slice(-6)
    const newMsg: PagerMessage = {
      id,
      number: input.number.trim(),
      content: input.content.trim(),
      time: formatNow(),
      read: true,
      favorite: false,
      tagId: input.tagId ?? null,
    }
    setMessages((prev) => [newMsg, ...prev])
    setSelectedId(id)
    setShowFavoritesOnlyState(false)
    setFilterTagIdState(input.tagId ?? null)
    try {
      localStorage.setItem(SHOW_FAVORITES_STORAGE_KEY, 'false')
      localStorage.setItem(FILTER_TAG_STORAGE_KEY, input.tagId ?? 'null')
    } catch {
      // ignore storage errors
    }
  }, [])

  const addFavorite = useCallback((id: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === id ? { ...msg, favorite: true } : msg,
      ),
    )
  }, [])

  const removeFavorite = useCallback(
    (id: string) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === id ? { ...msg, favorite: false } : msg,
        ),
      )
      if (showFavoritesOnly && selectedId === id) {
        setSelectedId(null)
      }
    },
    [showFavoritesOnly, selectedId],
  )

  const addTag = useCallback((name: string, color?: string) => {
    const trimmedName = name.trim()
    if (!trimmedName) return
    setTags((prev) => {
      if (prev.some((t) => t.name === trimmedName)) return prev
      const id = `tag_${Date.now()}`
      const tagColor = color || TAG_COLORS[prev.length % TAG_COLORS.length]
      return [...prev, { id, name: trimmedName, color: tagColor }]
    })
  }, [])

  const removeTag = useCallback((tagId: string) => {
    setTags((prev) => prev.filter((t) => t.id !== tagId))
    setMessages((prev) =>
      prev.map((msg) => (msg.tagId === tagId ? { ...msg, tagId: null } : msg)),
    )
    setFilterTagIdState((prev) => (prev === tagId ? null : prev))
  }, [])

  const setMessageTag = useCallback((messageId: string, tagId: string | null) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, tagId } : msg,
      ),
    )
  }, [])

  const value = useMemo(
    () => ({
      messages,
      favoriteMessages,
      tags,
      contacts,
      filterNumber,
      setFilterNumber,
      showFavoritesOnly,
      setShowFavoritesOnly,
      filterTagId,
      setFilterTagId,
      filteredMessages,
      favoriteCount,
      unreadCount,
      markAsRead,
      markAllAsRead,
      sendMessage,
      addFavorite,
      removeFavorite,
      addTag,
      removeTag,
      setMessageTag,
      getTagById,
      selectedId,
      setSelectedId,
      selectedMessage,
      addContact,
      updateContact,
      removeContact,
      getContactByNumber,
      getContactById,
      searchContacts,
    }),
    [
      messages,
      favoriteMessages,
      tags,
      contacts,
      filterNumber,
      showFavoritesOnly,
      setShowFavoritesOnly,
      filterTagId,
      setFilterTagId,
      filteredMessages,
      favoriteCount,
      unreadCount,
      markAsRead,
      markAllAsRead,
      sendMessage,
      addFavorite,
      removeFavorite,
      addTag,
      removeTag,
      setMessageTag,
      getTagById,
      selectedId,
      selectedMessage,
      addContact,
      updateContact,
      removeContact,
      getContactByNumber,
      getContactById,
      searchContacts,
    ],
  )

  return (
    <PagerContext.Provider value={value}>{children}</PagerContext.Provider>
  )
}

export function usePager() {
  const ctx = useContext(PagerContext)
  if (!ctx) throw new Error('usePager must be used within PagerProvider')
  return ctx
}
