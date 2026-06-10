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
import type { Contact, Group, NewMessageInput, PagerMessage, RepeatType, ScheduledMessage, Tag } from '../types/pager'
import { DEFAULT_TAGS, DEFAULT_GROUPS } from '../types/pager'

const FAVORITES_STORAGE_KEY = 'pager_favorites'
const PINS_STORAGE_KEY = 'pager_pins'
const SHOW_FAVORITES_STORAGE_KEY = 'pager_show_favorites_only'
const TAGS_STORAGE_KEY = 'pager_tags'
const FILTER_TAG_STORAGE_KEY = 'pager_filter_tag'
const CONTACTS_STORAGE_KEY = 'pager_contacts'
const SCHEDULED_MESSAGES_STORAGE_KEY = 'pager_scheduled_messages'
const GROUPS_STORAGE_KEY = 'pager_groups'
const FILTER_GROUP_STORAGE_KEY = 'pager_filter_group'

export const FILTER_NO_TAG = '__no_tag__'
export const FILTER_NO_GROUP = '__no_group__'

interface PagerContextValue {
  messages: PagerMessage[]
  favoriteMessages: PagerMessage[]
  pinnedMessages: PagerMessage[]
  tags: Tag[]
  groups: Group[]
  contacts: Contact[]
  filterNumber: string
  setFilterNumber: (value: string) => void
  showFavoritesOnly: boolean
  setShowFavoritesOnly: (value: boolean) => void
  filterTagId: string | null
  setFilterTagId: (tagId: string | null) => void
  filterGroupId: string | null
  setFilterGroupId: (groupId: string | null) => void
  filteredMessages: PagerMessage[]
  favoriteCount: number
  pinnedCount: number
  unreadCount: number
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  sendMessage: (input: NewMessageInput) => void
  addFavorite: (id: string) => void
  removeFavorite: (id: string) => void
  togglePin: (id: string) => void
  addTag: (name: string, color?: string) => void
  removeTag: (tagId: string) => void
  setMessageTag: (messageId: string, tagId: string | null) => void
  getTagById: (tagId: string | null) => Tag | undefined
  addGroup: (name: string, color?: string) => void
  updateGroup: (id: string, name: string, color?: string) => void
  removeGroup: (groupId: string) => void
  getGroupById: (groupId: string | null) => Group | undefined
  setContactGroup: (contactId: string, groupId: string | null) => void
  setContactGroupBatch: (contactIds: string[], groupId: string | null) => void
  getContactsByGroup: (groupId: string | null) => Contact[]
  searchContacts: (query: string, groupId?: string | null) => Contact[]
  selectedId: string | null
  setSelectedId: (id: string | null) => void
  selectedMessage: PagerMessage | null
  addContact: (name: string, number: string, groupId?: string | null) => void
  updateContact: (id: string, name: string, number: string, groupId?: string | null) => void
  removeContact: (id: string) => void
  removeContactBatch: (ids: string[]) => void
  getContactByNumber: (number: string) => Contact | undefined
  getContactById: (id: string) => Contact | undefined
  replyingTo: PagerMessage | null
  startReply: (messageId: string) => void
  cancelReply: () => void
  getRepliesForMessage: (messageId: string) => PagerMessage[]
  getMessageById: (id: string | null) => PagerMessage | null
  getThreadForMessage: (messageId: string) => PagerMessage[]
  scheduledMessages: ScheduledMessage[]
  addScheduledMessage: (input: NewMessageInput & { scheduledTime: string; repeatType: RepeatType }) => void
  cancelScheduledMessage: (id: string) => void
  updateScheduledMessage: (id: string, updates: Partial<ScheduledMessage>) => void
  getScheduledMessageById: (id: string) => ScheduledMessage | undefined
  getNextScheduledTime: (baseTime: string, repeatType: RepeatType) => string | null
}

const PagerContext = createContext<PagerContextValue | null>(null)

function formatNow(): string {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`
}

function calculateNextTime(baseTimeStr: string, repeatType: RepeatType): string | null {
  if (repeatType === 'none') return null
  const d = new Date(baseTimeStr.replace(' ', 'T'))
  const pad = (n: number) => String(n).padStart(2, '0')

  switch (repeatType) {
    case 'daily':
      d.setDate(d.getDate() + 1)
      break
    case 'weekly':
      d.setDate(d.getDate() + 7)
      break
    case 'monthly':
      d.setMonth(d.getMonth() + 1)
      break
  }

  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function cleanupRepeatSeries(messages: ScheduledMessage[]): ScheduledMessage[] {
  const bySeries = new Map<string, ScheduledMessage[]>()

  for (const msg of messages) {
    if (!msg.repeatType || msg.repeatType === 'none') continue
    const seriesId = msg.parentId || msg.id
    if (!bySeries.has(seriesId)) bySeries.set(seriesId, [])
    bySeries.get(seriesId)!.push(msg)
  }

  const keepIds = new Set<string>(messages.map((m) => m.id))

  for (const [, seriesMsgs] of bySeries) {
    const pending = seriesMsgs
      .filter((m) => m.status === 'pending')
      .sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime))
    const sent = seriesMsgs
      .filter((m) => m.status === 'sent')
      .sort((a, b) => b.scheduledTime.localeCompare(a.scheduledTime))

    if (pending.length > 1) {
      for (let i = 1; i < pending.length; i++) {
        keepIds.delete(pending[i].id)
      }
    }
    if (sent.length > 1) {
      for (let i = 1; i < sent.length; i++) {
        keepIds.delete(sent[i].id)
      }
    }
  }

  return messages.filter((m) => keepIds.has(m.id))
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

interface PinRecord {
  id: string
  pinnedAt: string
}

function loadPinRecords(): Map<string, string> {
  try {
    const stored = localStorage.getItem(PINS_STORAGE_KEY)
    if (stored) {
      const records = JSON.parse(stored)
      if (Array.isArray(records)) {
        const map = new Map<string, string>()
        for (const r of records) {
          if (r && typeof r.id === 'string' && typeof r.pinnedAt === 'string') {
            map.set(r.id, r.pinnedAt)
          }
        }
        return map
      }
    }
  } catch {
    // ignore parse errors
  }
  return new Map()
}

function savePinRecords(records: Map<string, string>) {
  try {
    const arr: PinRecord[] = []
    records.forEach((pinnedAt, id) => arr.push({ id, pinnedAt }))
    localStorage.setItem(PINS_STORAGE_KEY, JSON.stringify(arr))
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

function loadGroups(): Group[] {
  try {
    const stored = localStorage.getItem(GROUPS_STORAGE_KEY)
    if (stored) {
      const groups = JSON.parse(stored)
      if (Array.isArray(groups) && groups.length > 0) return groups
    }
  } catch {
    // ignore parse errors
  }
  return DEFAULT_GROUPS
}

function saveGroups(groups: Group[]) {
  try {
    localStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(groups))
  } catch {
    // ignore storage errors
  }
}

function loadScheduledMessages(): ScheduledMessage[] {
  try {
    const stored = localStorage.getItem(SCHEDULED_MESSAGES_STORAGE_KEY)
    if (stored) {
      const msgs = JSON.parse(stored)
      if (Array.isArray(msgs)) {
        const normalized = msgs.map((msg) => ({
          ...msg,
          repeatType: msg.repeatType || 'none',
          parentId: msg.parentId ?? null,
          sentMessageId: msg.sentMessageId ?? null,
        }))
        return cleanupRepeatSeries(normalized)
      }
    }
  } catch {
    // ignore parse errors
  }
  return []
}

function saveScheduledMessages(messages: ScheduledMessage[]) {
  try {
    localStorage.setItem(SCHEDULED_MESSAGES_STORAGE_KEY, JSON.stringify(messages))
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
  const initialPinRecords = useMemo(() => loadPinRecords(), [])
  const initialShowFavorites = useMemo(() => {
    try {
      const stored = localStorage.getItem(SHOW_FAVORITES_STORAGE_KEY)
      return stored === 'true'
    } catch {
      return false
    }
  }, [])
  const initialTags = useMemo(() => loadTags(), [])
  const initialGroups = useMemo(() => loadGroups(), [])
  const initialContacts = useMemo(() => loadContacts(), [])
  const initialScheduledMessages = useMemo(() => loadScheduledMessages(), [])
  const initialFilterTagId = useMemo(() => {
    try {
      const stored = localStorage.getItem(FILTER_TAG_STORAGE_KEY)
      return stored === 'null' ? null : stored || null
    } catch {
      return null
    }
  }, [])
  const initialFilterGroupId = useMemo(() => {
    try {
      const stored = localStorage.getItem(FILTER_GROUP_STORAGE_KEY)
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
        pinned: initialPinRecords.has(msg.id),
        pinnedAt: initialPinRecords.get(msg.id) ?? null,
      })),
    [initialFavoriteIds, initialPinRecords],
  )

  const [messages, setMessages] = useState<PagerMessage[]>(initialMessages)
  const [tags, setTags] = useState<Tag[]>(initialTags)
  const [groups, setGroups] = useState<Group[]>(initialGroups)
  const [contacts, setContacts] = useState<Contact[]>(initialContacts)
  const [scheduledMessages, setScheduledMessages] = useState<ScheduledMessage[]>(initialScheduledMessages)
  const [filterNumber, setFilterNumber] = useState('')
  const [showFavoritesOnly, setShowFavoritesOnlyState] = useState(initialShowFavorites)
  const [filterTagId, setFilterTagIdState] = useState<string | null>(initialFilterTagId)
  const [filterGroupId, setFilterGroupIdState] = useState<string | null>(initialFilterGroupId)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [replyingToId, setReplyingToId] = useState<string | null>(null)

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

  const setFilterGroupId = useCallback((groupId: string | null) => {
    setFilterGroupIdState(groupId)
    try {
      localStorage.setItem(FILTER_GROUP_STORAGE_KEY, groupId ?? 'null')
    } catch {
      // ignore storage errors
    }
  }, [])

  useEffect(() => {
    saveTags(tags)
  }, [tags])

  useEffect(() => {
    saveGroups(groups)
  }, [groups])

  useEffect(() => {
    saveContacts(contacts)
  }, [contacts])

  useEffect(() => {
    saveScheduledMessages(scheduledMessages)
  }, [scheduledMessages])

  const favoriteMessages = useMemo(
    () => messages.filter((msg) => msg.favorite),
    [messages],
  )

  const pinnedMessages = useMemo(
    () =>
      messages
        .filter((msg) => msg.pinned)
        .sort((a, b) => {
          if (!a.pinnedAt && !b.pinnedAt) return 0
          if (!a.pinnedAt) return 1
          if (!b.pinnedAt) return -1
          return b.pinnedAt.localeCompare(a.pinnedAt)
        }),
    [messages],
  )

  const favoriteIds = useMemo(
    () => new Set(favoriteMessages.map((msg) => msg.id)),
    [favoriteMessages],
  )

  const pinRecords = useMemo(() => {
    const map = new Map<string, string>()
    for (const msg of messages) {
      if (msg.pinned && msg.pinnedAt) {
        map.set(msg.id, msg.pinnedAt)
      }
    }
    return map
  }, [messages])

  useEffect(() => {
    saveFavoriteIds(favoriteIds)
  }, [favoriteIds])

  useEffect(() => {
    savePinRecords(pinRecords)
  }, [pinRecords])

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
    return [...result].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1
      if (!a.pinned && b.pinned) return 1
      if (a.pinned && b.pinned) {
        if (!a.pinnedAt && !b.pinnedAt) return 0
        if (!a.pinnedAt) return 1
        if (!b.pinnedAt) return -1
        const pinCompare = b.pinnedAt.localeCompare(a.pinnedAt)
        if (pinCompare !== 0) return pinCompare
      }
      return b.time.localeCompare(a.time)
    })
  }, [messages, showFavoritesOnly, filterNumber, filterTagId])

  const unreadCount = useMemo(
    () => messages.filter((msg) => !msg.read).length,
    [messages],
  )

  const favoriteCount = useMemo(
    () => favoriteMessages.length,
    [favoriteMessages],
  )

  const pinnedCount = useMemo(
    () => pinnedMessages.length,
    [pinnedMessages],
  )

  const selectedMessage = useMemo(
    () => messages.find((msg) => msg.id === selectedId) ?? null,
    [messages, selectedId],
  )

  const replyingTo = useMemo(
    () => messages.find((msg) => msg.id === replyingToId) ?? null,
    [messages, replyingToId],
  )

  const getMessageById = useCallback(
    (id: string | null) => messages.find((msg) => msg.id === id) ?? null,
    [messages],
  )

  const getRepliesForMessage = useCallback(
    (messageId: string) => messages.filter((msg) => msg.replyToId === messageId),
    [messages],
  )

  const getThreadForMessage = useCallback(
    (messageId: string): PagerMessage[] => {
      const currentMsg = messages.find((m) => m.id === messageId)
      if (!currentMsg) return []

      let rootMsg = currentMsg
      while (rootMsg.replyToId) {
        const parent = messages.find((m) => m.id === rootMsg.replyToId)
        if (parent) {
          rootMsg = parent
        } else {
          break
        }
      }

      const collectAllDescendants = (parentId: string): PagerMessage[] => {
        const directReplies = messages.filter((m) => m.replyToId === parentId)
        const result: PagerMessage[] = [...directReplies]
        for (const reply of directReplies) {
          result.push(...collectAllDescendants(reply.id))
        }
        return result
      }

      const allDescendants = collectAllDescendants(rootMsg.id)
      const threadMessages = [rootMsg, ...allDescendants]

      return threadMessages.sort((a, b) => a.time.localeCompare(b.time))
    },
    [messages],
  )

  const startReply = useCallback((messageId: string) => {
    setReplyingToId(messageId)
  }, [])

  const cancelReply = useCallback(() => {
    setReplyingToId(null)
  }, [])

  const getTagById = useCallback(
    (tagId: string | null) => tags.find((t) => t.id === tagId),
    [tags],
  )

  const getGroupById = useCallback(
    (groupId: string | null) => groups.find((g) => g.id === groupId),
    [groups],
  )

  const addGroup = useCallback((name: string, color?: string) => {
    const trimmedName = name.trim()
    if (!trimmedName) return
    setGroups((prev) => {
      if (prev.some((g) => g.name === trimmedName)) return prev
      const id = `group_${Date.now()}`
      const groupColor = color || TAG_COLORS[prev.length % TAG_COLORS.length]
      return [...prev, { id, name: trimmedName, color: groupColor }]
    })
  }, [])

  const updateGroup = useCallback((id: string, name: string, color?: string) => {
    const trimmedName = name.trim()
    if (!trimmedName) return
    setGroups((prev) =>
      prev.map((g) =>
        g.id === id ? { ...g, name: trimmedName, color: color || g.color } : g,
      ),
    )
  }, [])

  const removeGroup = useCallback((groupId: string) => {
    setGroups((prev) => prev.filter((g) => g.id !== groupId))
    setContacts((prev) =>
      prev.map((c) => (c.groupId === groupId ? { ...c, groupId: null } : c)),
    )
    setFilterGroupIdState((prev) => (prev === groupId ? null : prev))
  }, [])

  const setContactGroup = useCallback((contactId: string, groupId: string | null) => {
    setContacts((prev) =>
      prev.map((c) =>
        c.id === contactId ? { ...c, groupId } : c,
      ),
    )
  }, [])

  const setContactGroupBatch = useCallback((contactIds: string[], groupId: string | null) => {
    const idSet = new Set(contactIds)
    setContacts((prev) =>
      prev.map((c) =>
        idSet.has(c.id) ? { ...c, groupId } : c,
      ),
    )
  }, [])

  const getContactsByGroup = useCallback(
    (groupId: string | null) => {
      if (groupId === FILTER_NO_GROUP) {
        return contacts.filter((c) => c.groupId === null)
      }
      if (groupId === null) return contacts
      return contacts.filter((c) => c.groupId === groupId)
    },
    [contacts],
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
    (query: string, groupId?: string | null) => {
      const q = query.trim().toLowerCase()
      let result = contacts
      if (groupId !== undefined && groupId !== null) {
        if (groupId === FILTER_NO_GROUP) {
          result = result.filter((c) => c.groupId === null)
        } else {
          result = result.filter((c) => c.groupId === groupId)
        }
      }
      if (!q) return result
      return result.filter(
        (c) => c.name.toLowerCase().includes(q) || c.number.includes(q),
      )
    },
    [contacts],
  )

  const addContact = useCallback((name: string, number: string, groupId: string | null = null) => {
    const trimmedName = name.trim()
    const trimmedNumber = number.trim()
    if (!trimmedName || !trimmedNumber) return
    setContacts((prev) => {
      if (prev.some((c) => c.number === trimmedNumber)) return prev
      const id = `contact_${Date.now()}`
      return [...prev, { id, name: trimmedName, number: trimmedNumber, groupId }]
    })
  }, [])

  const updateContact = useCallback((id: string, name: string, number: string, groupId?: string | null) => {
    const trimmedName = name.trim()
    const trimmedNumber = number.trim()
    if (!trimmedName || !trimmedNumber) return
    setContacts((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, name: trimmedName, number: trimmedNumber, groupId: groupId ?? c.groupId }
          : c,
      ),
    )
  }, [])

  const removeContact = useCallback((id: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== id))
  }, [])

  const removeContactBatch = useCallback((ids: string[]) => {
    const idSet = new Set(ids)
    setContacts((prev) => prev.filter((c) => !idSet.has(c.id)))
  }, [])

  const markAsRead = useCallback((id: string) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === id ? { ...msg, read: true } : msg)),
    )
  }, [])

  const markAllAsRead = useCallback(() => {
    setMessages((prev) => prev.map((msg) => ({ ...msg, read: true })))
  }, [])

  const sendMessage = useCallback((input: NewMessageInput): string => {
    const id = String(Date.now()).slice(-6)
    const newMsg: PagerMessage = {
      id,
      number: input.number.trim(),
      content: input.content.trim(),
      time: formatNow(),
      read: true,
      favorite: false,
      pinned: false,
      pinnedAt: null,
      tagId: input.tagId ?? null,
      replyToId: input.replyToId ?? null,
    }
    setMessages((prev) => [newMsg, ...prev])
    setSelectedId(id)
    setReplyingToId(null)
    setShowFavoritesOnlyState(false)
    setFilterTagIdState(input.tagId ?? null)
    try {
      localStorage.setItem(SHOW_FAVORITES_STORAGE_KEY, 'false')
      localStorage.setItem(FILTER_TAG_STORAGE_KEY, input.tagId ?? 'null')
    } catch {
      // ignore storage errors
    }
    return id
  }, [])

  const addScheduledMessage = useCallback(
    (input: NewMessageInput & { scheduledTime: string; repeatType: RepeatType }) => {
      const id = `sched_${Date.now()}`
      const newMsg: ScheduledMessage = {
        id,
        number: input.number.trim(),
        content: input.content.trim(),
        tagId: input.tagId ?? null,
        replyToId: input.replyToId ?? null,
        scheduledTime: input.scheduledTime,
        createdAt: formatNow(),
        status: 'pending',
        sentMessageId: null,
        repeatType: input.repeatType,
        parentId: null,
      }
      setScheduledMessages((prev) => [newMsg, ...prev])
    },
    [],
  )

  const cancelScheduledMessage = useCallback((id: string) => {
    setScheduledMessages((prev) => {
      const target = prev.find((m) => m.id === id)
      if (!target) return prev
      const isRepeating = target.repeatType && target.repeatType !== 'none'
      if (!isRepeating) {
        return prev.map((msg) =>
          msg.id === id ? { ...msg, status: 'cancelled' } : msg,
        )
      }
      const seriesId = target.parentId || target.id
      return prev.map((msg) => {
        const msgSeriesId = msg.parentId || msg.id
        if (msgSeriesId === seriesId && msg.status === 'pending') {
          return { ...msg, status: 'cancelled' }
        }
        return msg
      })
    })
  }, [])

  const updateScheduledMessage = useCallback(
    (id: string, updates: Partial<ScheduledMessage>) => {
      setScheduledMessages((prev) =>
        prev.map((msg) => (msg.id === id ? { ...msg, ...updates } : msg)),
      )
    },
    [],
  )

  const getScheduledMessageById = useCallback(
    (id: string) => scheduledMessages.find((msg) => msg.id === id),
    [scheduledMessages],
  )

  const getNextScheduledTime = useCallback(
    (baseTime: string, repeatType: RepeatType) => {
      return calculateNextTime(baseTime, repeatType)
    },
    [],
  )

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setScheduledMessages((prev) => {
      const now = formatNow()
      const currentMessageIds = new Set(messages.map((m) => m.id))
      let changed = false
      const updatedMap = new Map<string, ScheduledMessage>()
      const newMessages: ScheduledMessage[] = []

      for (const msg of prev) {
        if (msg.status === 'sent') {
          if (msg.sentMessageId && !currentMessageIds.has(msg.sentMessageId)) {
            const sentId = sendMessage({
              number: msg.number,
              content: msg.content,
              tagId: msg.tagId,
              replyToId: msg.replyToId,
            })
            changed = true
            updatedMap.set(msg.id, { ...msg, sentMessageId: sentId })
          }
        } else if (msg.status === 'pending' && msg.scheduledTime <= now) {
          const sentId = sendMessage({
            number: msg.number,
            content: msg.content,
            tagId: msg.tagId,
            replyToId: msg.replyToId,
          })
          changed = true
          updatedMap.set(msg.id, { ...msg, status: 'sent', sentMessageId: sentId })

          if (msg.repeatType && msg.repeatType !== 'none') {
            const nextTime = calculateNextTime(msg.scheduledTime, msg.repeatType)
            if (nextTime && nextTime > now) {
              const nextId = `sched_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
              const nextMsg: ScheduledMessage = {
                id: nextId,
                number: msg.number,
                content: msg.content,
                tagId: msg.tagId,
                replyToId: msg.replyToId,
                scheduledTime: nextTime,
                createdAt: formatNow(),
                status: 'pending',
                sentMessageId: null,
                repeatType: msg.repeatType,
                parentId: msg.parentId || msg.id,
              }
              newMessages.push(nextMsg)
            }
          }
        }
      }

      if (!changed && newMessages.length === 0) return prev
      const updated = prev.map((orig) => {
        const upd = updatedMap.get(orig.id)
        return upd ?? orig
      })
      return cleanupRepeatSeries([...newMessages, ...updated])
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const timeouts: ReturnType<typeof setTimeout>[] = []
    const nowMs = Date.now()

    for (const msg of scheduledMessages) {
      if (msg.status !== 'pending') continue
      const scheduledMs = new Date(msg.scheduledTime.replace(' ', 'T')).getTime()
      const delay = scheduledMs - nowMs

      if (delay > 0 && delay <= 2_147_483_647) {
        const t = setTimeout(() => {
          setScheduledMessages((prev) => {
            const target = prev.find((m) => m.id === msg.id)
            if (!target || target.status !== 'pending') return prev
            const sentId = sendMessage({
              number: target.number,
              content: target.content,
              tagId: target.tagId,
              replyToId: target.replyToId,
            })

            let result = prev.map((m) =>
              m.id === msg.id
                ? { ...m, status: 'sent' as const, sentMessageId: sentId }
                : m,
            )

            if (target.repeatType && target.repeatType !== 'none') {
              const nextTime = calculateNextTime(target.scheduledTime, target.repeatType)
              if (nextTime) {
                const nextId = `sched_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
                const nextMsg: ScheduledMessage = {
                  id: nextId,
                  number: target.number,
                  content: target.content,
                  tagId: target.tagId,
                  replyToId: target.replyToId,
                  scheduledTime: nextTime,
                  createdAt: formatNow(),
                  status: 'pending',
                  sentMessageId: null,
                  repeatType: target.repeatType,
                  parentId: target.parentId || target.id,
                }
                result = [nextMsg, ...result]
              }
            }

            return cleanupRepeatSeries(result)
          })
        }, delay)
        timeouts.push(t)
      }
    }

    return () => {
      for (const t of timeouts) clearTimeout(t)
    }
  }, [scheduledMessages, sendMessage])

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

  const togglePin = useCallback((id: string) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id !== id) return msg
        if (msg.pinned) {
          return { ...msg, pinned: false, pinnedAt: null }
        } else {
          return { ...msg, pinned: true, pinnedAt: new Date().toISOString() }
        }
      }),
    )
  }, [])

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
      pinnedMessages,
      tags,
      groups,
      contacts,
      filterNumber,
      setFilterNumber,
      showFavoritesOnly,
      setShowFavoritesOnly,
      filterTagId,
      setFilterTagId,
      filterGroupId,
      setFilterGroupId,
      filteredMessages,
      favoriteCount,
      pinnedCount,
      unreadCount,
      markAsRead,
      markAllAsRead,
      sendMessage,
      addFavorite,
      removeFavorite,
      togglePin,
      addTag,
      removeTag,
      setMessageTag,
      getTagById,
      addGroup,
      updateGroup,
      removeGroup,
      getGroupById,
      setContactGroup,
      setContactGroupBatch,
      getContactsByGroup,
      selectedId,
      setSelectedId,
      selectedMessage,
      addContact,
      updateContact,
      removeContact,
      removeContactBatch,
      getContactByNumber,
      getContactById,
      searchContacts,
      replyingTo,
      startReply,
      cancelReply,
      getRepliesForMessage,
      getMessageById,
      getThreadForMessage,
      scheduledMessages,
      addScheduledMessage,
      cancelScheduledMessage,
      updateScheduledMessage,
      getScheduledMessageById,
      getNextScheduledTime,
    }),
    [
      messages,
      favoriteMessages,
      pinnedMessages,
      tags,
      groups,
      contacts,
      scheduledMessages,
      filterNumber,
      showFavoritesOnly,
      setShowFavoritesOnly,
      filterTagId,
      setFilterTagId,
      filterGroupId,
      setFilterGroupId,
      filteredMessages,
      favoriteCount,
      pinnedCount,
      unreadCount,
      markAsRead,
      markAllAsRead,
      sendMessage,
      addFavorite,
      removeFavorite,
      togglePin,
      addTag,
      removeTag,
      setMessageTag,
      getTagById,
      addGroup,
      updateGroup,
      removeGroup,
      getGroupById,
      setContactGroup,
      setContactGroupBatch,
      getContactsByGroup,
      selectedId,
      selectedMessage,
      addContact,
      updateContact,
      removeContact,
      removeContactBatch,
      getContactByNumber,
      getContactById,
      searchContacts,
      replyingTo,
      startReply,
      cancelReply,
      getRepliesForMessage,
      getMessageById,
      getThreadForMessage,
      addScheduledMessage,
      cancelScheduledMessage,
      updateScheduledMessage,
      getScheduledMessageById,
      getNextScheduledTime,
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
