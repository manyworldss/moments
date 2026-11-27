import { useState } from 'react'
import { momentIndex, schedule } from './data'
import { TodayScreen } from './Today'

export default function App() {
  const [today] = useState(() => new Date())
  const [offset, setOffset] = useState(0)
  const moment = schedule[momentIndex(today, offset)]

  return (
    <div className="shell dots">
      <TodayScreen moment={moment} isToday={offset === 0} onAnother={() => setOffset((o) => o + 1)} />
    </div>
  )
}
