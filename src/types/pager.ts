export interface Tag {
  id: string
  name: string
  color: string
}

export interface PagerMessage {
  id: string
  number: string
  time: string
  content: string
  read: boolean
  favorite: boolean
  tagId: string | null
}

export interface NewMessageInput {
  number: string
  content: string
  tagId: string | null
}

export const DEFAULT_TAGS: Tag[] = [
  { id: 'work', name: '工作', color: '#33ff66' },
  { id: 'family', name: '家人', color: '#ff6699' },
  { id: 'friend', name: '朋友', color: '#66ccff' },
  { id: 'other', name: '其他', color: '#ffcc66' },
]

