export interface Tag {
  id: string
  name: string
  color: string
}

export interface Group {
  id: string
  name: string
  color: string
}

export interface Contact {
  id: string
  name: string
  number: string
  groupId: string | null
}

export interface PagerMessage {
  id: string
  number: string
  time: string
  content: string
  read: boolean
  favorite: boolean
  pinned: boolean
  pinnedAt: string | null
  tagId: string | null
  replyToId: string | null
}

export interface NewMessageInput {
  number: string
  content: string
  tagId: string | null
  replyToId: string | null
}

export type RepeatType = 'none' | 'daily' | 'weekly' | 'monthly'

export interface ScheduledMessage {
  id: string
  number: string
  content: string
  tagId: string | null
  replyToId: string | null
  scheduledTime: string
  createdAt: string
  status: 'pending' | 'sent' | 'cancelled'
  sentMessageId?: string | null
  repeatType: RepeatType
  parentId?: string | null
}

export const DEFAULT_TAGS: Tag[] = [
  { id: 'work', name: '工作', color: '#33ff66' },
  { id: 'family', name: '家人', color: '#ff6699' },
  { id: 'friend', name: '朋友', color: '#66ccff' },
  { id: 'other', name: '其他', color: '#ffcc66' },
]

export const DEFAULT_GROUPS: Group[] = [
  { id: 'colleague', name: '同事', color: '#33ff66' },
  { id: 'client', name: '客户', color: '#ff6699' },
  { id: 'family', name: '亲友', color: '#66ccff' },
  { id: 'other', name: '其他', color: '#ffcc66' },
]

