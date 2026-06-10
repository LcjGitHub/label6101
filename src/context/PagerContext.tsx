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
import type { NewMessageInput, PagerMessage } from '../types/pager'

const FAVORITES_STORAGE_KEY = 'pager_favorites'
const SHOW_FAVORITES_STORAGE_KEY = 'pager_show_favorites_only'

interface PagerContextValue {
  messages: PagerMessage[]
  favoriteMessages: PagerMessage[]
  filterNumber: string
  setFilterNumber: (value: string) => void
  showFavoritesOnly: boolean
  setShowFavoritesOnly: (value: boolean) => void
  filteredMessages: PagerMessage[]
  favoriteCount: number
  unreadCount: number
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  sendMessage: (input: NewMessageInput) => void
  addFavorite: (id: string) => void
  removeFavorite: (id: string) => void
  selectedId: string | null
  setSelectedId: (id: string | null) => void
  selectedMessage: PagerMessage | null
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

  const initialMessages = useMemo(
    () =>
      mockMessages.map((msg) => ({
        ...msg,
        favorite: initialFavoriteIds.has(msg.id),
      })),
    [initialFavoriteIds],
  )

  const [messages, setMessages] = useState<PagerMessage[]>(initialMessages)
  const [filterNumber, setFilterNumber] = useState('')
  const [showFavoritesOnly, setShowFavoritesOnlyState] = useState(initialShowFavorites)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const setShowFavoritesOnly = useCallback((value: boolean) => {
    setShowFavoritesOnlyState(value)
    try {
      localStorage.setItem(SHOW_FAVORITES_STORAGE_KEY, String(value))
    } catch {
      // ignore storage errors
    }
  }, [])

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
    if (query) {
      result = result.filter((msg) => msg.number.includes(query))
    }
    return result
  }, [messages, showFavoritesOnly, filterNumber])

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
    }
    setMessages((prev) => [newMsg, ...prev])
    setSelectedId(id)
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

  const value = useMemo(
    () => ({
      messages,
      favoriteMessages,
      filterNumber,
      setFilterNumber,
      showFavoritesOnly,
      setShowFavoritesOnly,
      filteredMessages,
      favoriteCount,
      unreadCount,
      markAsRead,
      markAllAsRead,
      sendMessage,
      addFavorite,
      removeFavorite,
      selectedId,
      setSelectedId,
      selectedMessage,
    }),
    [
      messages,
      favoriteMessages,
      filterNumber,
      showFavoritesOnly,
      setShowFavoritesOnly,
      filteredMessages,
      favoriteCount,
      unreadCount,
      markAsRead,
      markAllAsRead,
      sendMessage,
      addFavorite,
      removeFavorite,
      selectedId,
      selectedMessage,
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
