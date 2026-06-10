import type { ReactNode } from 'react'

interface PagerShellProps {
  children: ReactNode
  title?: string
}

export function PagerShell({ children, title = 'MOTOROLA BP' }: PagerShellProps) {
  return (
    <div className="pager-device">
      <div className="pager-antenna" />
      <div className="pager-body">
        <div className="pager-brand">
          <span className="brand-logo">◈</span>
          <span className="brand-name">{title}</span>
          <span className="brand-model">BRAVO 中文机</span>
        </div>
        <div className="pager-screen-frame">
          <div className="pager-screen">{children}</div>
        </div>
        <div className="pager-led-row">
          <span className="led led-signal" title="信号" />
          <span className="led led-power on" title="电源" />
        </div>
        <div className="pager-keypad-deco">
          {Array.from({ length: 12 }).map((_, i) => (
            <span key={i} className="key-cap" />
          ))}
        </div>
      </div>
      <div className="pager-clip" />
    </div>
  )
}
