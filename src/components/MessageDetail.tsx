import type { PagerMessage } from '../types/pager'

interface MessageDetailProps {
  message: PagerMessage | null
}

export function MessageDetail({ message }: MessageDetailProps) {
  if (!message) {
    return (
      <div className="message-detail empty">
        <p>↑ 选择一条消息查看</p>
      </div>
    )
  }

  return (
    <div className="message-detail">
      <div className="detail-row">
        <span className="detail-label">FROM</span>
        <span className="detail-value">{message.number}</span>
      </div>
      <div className="detail-row">
        <span className="detail-label">TIME</span>
        <span className="detail-value">{message.time}</span>
      </div>
      <div className="detail-row">
        <span className="detail-label">STAT</span>
        <span className="detail-value">{message.read ? '已读' : '未读'}</span>
      </div>
      <div className="detail-content">{message.content}</div>
    </div>
  )
}
