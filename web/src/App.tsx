import { useCallback, useState } from 'react'
import { momentIndex, schedule } from './data'
import { TodayScreen } from './Today'
import { Countdown, Welcome } from './Welcome'

const WELCOMED = 'moments.welcomed'

/** `?moment=<id>` opens on that moment instead of today's, for previewing. */
function initialOffset(today: Date): number {
  const id = new URLSearchParams(window.location.search).get('moment')
  const target = schedule.findIndex((m) => m.id === id)
  if (target < 0) return 0
  const n = schedule.length
  return (((target - momentIndex(today)) % n) + n) % n
}

/** First visit (or `?welcome`) starts with the welcome; `?moment=` previews skip it. Stored on this device only. */
function firstPhase(): 'welcome' | 'app' {
  const q = new URLSearchParams(window.location.search)
  if (q.has('welcome')) return 'welcome'
  if (q.has('moment')) return 'app'
  try {
    return localStorage.getItem(WELCOMED) ? 'app' : 'welcome'
  } catch {
    return 'app'
  }
}

// `?welcome=2` opens the welcome at step 2 (1-based), for previewing.
function welcomeStart(): number {
  const v = Number(new URLSearchParams(window.location.search).get('welcome'))
  return Number.isInteger(v) && v > 0 ? v - 1 : -1
}

export default function App() {
  const [today] = useState(() => new Date())
  const [offset, setOffset] = useState(() => initialOffset(today))
  const [phase, setPhase] = useState<'welcome' | 'countdown' | 'app'>(firstPhase)
  const moment = schedule[momentIndex(today, offset)]

  const finishWelcome = useCallback(() => {
    try {
      localStorage.setItem(WELCOMED, '1')
    } catch {
      // Private mode: show the welcome again next time, nothing else breaks.
    }
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    setPhase(still ? 'app' : 'countdown')
  }, [])
  const finishCountdown = useCallback(() => setPhase('app'), [])

  return (
    <div className="shell dots">
      {phase === 'welcome' ? (
        <Welcome onDone={finishWelcome} start={welcomeStart()} />
      ) : (
        <>
          {phase === 'countdown' && <Countdown onDone={finishCountdown} />}
          <TodayScreen moment={moment} isToday={offset === 0} onAnother={() => setOffset((o) => o + 1)} date={today} />
        </>
      )}
    </div>
  )
}
