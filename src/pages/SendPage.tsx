import { NavButtons } from '../components/NavButtons'
import { PagerShell } from '../components/PagerShell'
import { SendMessageForm } from '../components/SendMessageForm'
import { StatusBar } from '../components/StatusBar'
import { usePager } from '../context/PagerContext'

export function SendPage() {
  const { unreadCount, messages } = usePager()

  return (
    <PagerShell title="MOTOROLA BP">
      <StatusBar
        unreadCount={unreadCount}
        totalCount={messages.length}
        label="COMPOSE"
      />
      <SendMessageForm />
      <NavButtons />
    </PagerShell>
  )
}
