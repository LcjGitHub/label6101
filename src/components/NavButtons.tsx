import { Link, useLocation } from 'react-router-dom'

export function NavButtons() {
  const location = useLocation()
  const isHome = location.pathname === '/'
  const isSend = location.pathname === '/send'

  return (
    <nav className="nav-buttons">
      <Link to="/" className={`pager-btn ${isHome ? 'active' : ''}`}>
        ◀ 收件箱
      </Link>
      <Link to="/send" className={`pager-btn ${isSend ? 'active' : ''}`}>
        发送 ▶
      </Link>
    </nav>
  )
}
