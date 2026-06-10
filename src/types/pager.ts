export interface PagerMessage {
  id: string
  number: string
  time: string
  content: string
  read: boolean
}

export interface NewMessageInput {
  number: string
  content: string
}
