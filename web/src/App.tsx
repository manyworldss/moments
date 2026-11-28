import { useState } from 'react'
import { momentIndex, schedule } from './data'
import { TodayScreen } from './Today'

/** `?moment=<id>` opens on that moment instead of today's, for previewing. */
function initialOffset(today: Date): number {
  const id = new URLSearchParams(window.location.search).get('moment')
  const target = schedule.findIndex((m) => m.id === id)
  if (target < 0) return 0
  const n = schedule.length
  return (((target - momentIndex(today)) % n) + n) % n
}

export default function App() {
  const [today] = useState(() => new Date())
  const [offset, setOffset] = useState(() => initialOffset(today))
  const moment = schedule[momentIndex(today, offset)]

  return (
    <div className="shell dots">
      <TodayScreen moment={moment} isToday={offset === 0} onAnother={() => setOffset((o) => o + 1)} />
    </div>
  )
}
