import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { NavButtons } from '../components/NavButtons'
import { PagerShell } from '../components/PagerShell'
import { SendMessageForm } from '../components/SendMessageForm'
import { StatusBar } from '../components/StatusBar'
import { usePager } from '../context/PagerContext'

export function SendPage() {
  const { unreadCount, messages, replyingTo } = usePager()
  const [searchParams] = useSearchParams()

  const formKey = useMemo(() => {
    const edit = searchParams.get('edit') || ''
    const number = searchParams.get('number') || ''
    const replyId = replyingTo ? replyingTo.id : ''
    return `send-${edit}-${number}-${replyId}`
  }, [searchParams, replyingTo])

  return (
    <PagerShell title="MOTOROLA BP">
      <StatusBar
        unreadCount={unreadCount}
        totalCount={messages.length}
        label="COMPOSE"
      />
      <SendMessageForm key={formKey} />
      <NavButtons />
    </PagerShell>
  )
}
