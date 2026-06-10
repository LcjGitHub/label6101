import { Link, useLocation } from 'react-router-dom'
import { usePager } from '../context/PagerContext'

export function NavButtons() {
  const location = useLocation()
  const { scheduledMessages } = usePager()
  const isHome = location.pathname === '/'
  const isSend = location.pathname === '/send'
  const isContacts = location.pathname === '/contacts'
  const isScheduled = location.pathname === '/scheduled'

  const pendingCount = scheduledMessages.filter((m) => m.status === 'pending').length

  return (
    <nav className="nav-buttons">
      <Link to="/" className={`pager-btn ${isHome ? 'active' : ''}`}>
        ◀ 收件箱
      </Link>
      <Link to="/scheduled" className={`pager-btn ${isScheduled ? 'active' : ''}`}>
        定时 {pendingCount > 0 && `(${pendingCount})`}
      </Link>
      <Link to="/contacts" className={`pager-btn ${isContacts ? 'active' : ''}`}>
        通讯录
      </Link>
      <Link to="/send" className={`pager-btn ${isSend ? 'active' : ''}`}>
        发送 ▶
      </Link>
    </nav>
  )
}
