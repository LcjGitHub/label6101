export interface PagerMessage {
  id: string
  number: string
  time: string
  content: string
  read: boolean
  favorite: boolean
}

export interface NewMessageInput {
  number: string
  content: string
}
