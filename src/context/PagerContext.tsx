import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { mockMessages } from '../data/mockMessages'
import type { NewMessageInput, PagerMessage } from '../types/pager'

interface PagerContextValue {
  messages: PagerMessage[]
  filterNumber: string
  setFilterNumber: (value: string) => void
  filteredMessages: PagerMessage[]
  unreadCount: number
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  sendMessage: (input: NewMessageInput) => void
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

export function PagerProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<PagerMessage[]>(mockMessages)
  const [filterNumber, setFilterNumber] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const filteredMessages = useMemo(() => {
    const query = filterNumber.trim()
    if (!query) return messages
    return messages.filter((msg) => msg.number.includes(query))
  }, [messages, filterNumber])

  const unreadCount = useMemo(
    () => messages.filter((msg) => !msg.read).length,
    [messages],
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
    }
    setMessages((prev) => [newMsg, ...prev])
    setSelectedId(id)
  }, [])

  const value = useMemo(
    () => ({
      messages,
      filterNumber,
      setFilterNumber,
      filteredMessages,
      unreadCount,
      markAsRead,
      markAllAsRead,
      sendMessage,
      selectedId,
      setSelectedId,
      selectedMessage,
    }),
    [
      messages,
      filterNumber,
      filteredMessages,
      unreadCount,
      markAsRead,
      markAllAsRead,
      sendMessage,
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
