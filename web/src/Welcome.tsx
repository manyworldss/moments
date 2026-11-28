import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import { CityMap } from './CityMap'
import { WorldDrift } from './WorldDrift'

/**
 * First-run welcome. One idea per screen, each one showing the thing it
 * describes: the daily moment, the map, the frame. Ends on a film-leader
 * countdown into today's trip.
 */

const MAP_DEMO = 'in-the-mood-for-love-hong-kong-2000'
const RATIOS = ['1.37:1', '1.66:1', '1.85:1', '2.39:1', '2.76:1']
const stagger = (n: number) => ({ '--n': n }) as CSSProperties

type Step = {
  eyebrow: string
  title: ReactNode
  body: string
  visual?: ReactNode
  cta: string
}

const steps: Step[] = [
  {
    eyebrow: 'One a day',
    title: <>One film.<br />One city.<br />One year.</>,
    body: 'Every day Moments opens one film at the place and time it happens. Everyone gets the same one, the same day.',
    visual: <DayCounter />,
    cta: 'Next',
  },
  {
    eyebrow: 'Every film has a place',
    title: <>Find where<br />it happens.</>,
    body: 'Each moment is pinned to its real city, its streets and its shoreline, down to the coordinates.',
    visual: <CityMap momentId={MAP_DEMO} label="Hong Kong, 1962" />,
    cta: 'Next',
  },
  {
    eyebrow: 'See it as it was shot',
    title: <>The shape<br />of the frame.</>,
    body: 'Every film keeps its real aspect ratio, from Academy to Ultra Panavision. How it was shot comes with it.',
    visual: <RatioMorph />,
    cta: 'Next',
  },
  {
    eyebrow: 'Yours alone',
    title: <>Nothing to<br />sign up for.</>,
    body: 'No account. No tracking. The trips you save stay on this phone and nowhere else.',
    visual: <Ticket />,
    cta: 'Take me there',
  },
]

export function Welcome({ onDone, start = -1 }: { onDone: () => void; start?: number }) {
  // -1 is the title card; 0.. are the steps.
  const [i, setI] = useState(Math.min(start, steps.length - 1))
  const next = () => (i < steps.length - 1 ? setI(i + 1) : onDone())

  if (i === -1) {
    return (
      <div className="welcome welcome--title" key="title">
        <WorldDrift />
        <div className="welcome__center">
          <h1 className="welcome__wordmark">MOMENTS</h1>
          <p className="welcome__tagline">Take a trip through cinema, one moment at a time.</p>
        </div>
        <div className="welcome__foot">
          <button type="button" className="pill welcome__begin" onClick={next}>
            Begin
          </button>
        </div>
      </div>
    )
  }

  const step = steps[i]
  return (
    <div className="welcome" key={i}>
      <div className="welcome__top">
        <span className="label">
          {String(i + 1).padStart(2, '0')} / {String(steps.length).padStart(2, '0')}
        </span>
        <button type="button" className="welcome__skip label" onClick={onDone}>
          Skip
        </button>
      </div>

      <div className="welcome__body">
        <span className="label label--red welcome__in" style={stagger(0)}>
          {step.eyebrow}
        </span>
        <h2 className="welcome__title welcome__in" style={stagger(1)}>
          {step.title}
        </h2>
        {step.visual && (
          <div className="welcome__visual welcome__in" style={stagger(2)}>
            {step.visual}
          </div>
        )}
        <p className="welcome__text welcome__in" style={stagger(3)}>
          {step.body}
        </p>
      </div>

      <div className="welcome__foot">
        <div className="welcome__ticks" aria-hidden="true">
          {steps.map((_, k) => (
            <span key={k} className={k <= i ? 'is-on' : undefined} />
          ))}
        </div>
        <button type="button" className={`pill${i === steps.length - 1 ? ' pill--filled' : ''}`} onClick={next}>
          {step.cta}
        </button>
      </div>
    </div>
  )
}

/** Today's date, and the dates around it, on a strip like a reel counter. */
function DayCounter() {
  const [days] = useState(() => {
    const today = new Date()
    return [-2, -1, 0, 1, 2].map((d) => {
      const x = new Date(today)
      x.setDate(today.getDate() + d)
      return { d, label: x.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }
    })
  })
  return (
    <div className="daystrip" role="img" aria-label="A new moment every day">
      {days.map(({ d, label }) => (
        <div key={d} className={`daystrip__day${d === 0 ? ' is-today' : ''}`}>
          <span className="daystrip__date">{label}</span>
          <span className="daystrip__cell" />
          <span className="daystrip__tag">{d === 0 ? 'Today' : d < 0 ? 'Gone' : 'Soon'}</span>
        </div>
      ))}
    </div>
  )
}

/** One frame cycling through real ratios, letterboxed the way a projector would. */
function RatioMorph() {
  const [k, setK] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setK((v) => (v + 1) % RATIOS.length), 1600)
    return () => clearInterval(t)
  }, [])
  const ratio = RATIOS[k]
  const r = parseFloat(ratio)
  const base = 1.37
  const bar = (Math.max(0, 1 - base / r) / 2) * 100
  return (
    <div className="ratiomorph" role="img" aria-label="A frame changing between aspect ratios">
      <div className="ratiomorph__screen" style={{ clipPath: `inset(${bar}% 0 ${bar}% 0)` }} />
      <span className="frame__ratio ratiomorph__label" style={{ bottom: `calc(${bar}% + 8px)` }}>
        {ratio}
      </span>
    </div>
  )
}

/** Academy leader: 3, 2, 1, then the moment. Tap to skip. */
export function Countdown({ onDone }: { onDone: () => void }) {
  const [n, setN] = useState(3)
  useEffect(() => {
    if (n === 0) {
      onDone()
      return
    }
    const t = setTimeout(() => setN(n - 1), 800)
    return () => clearTimeout(t)
  }, [n, onDone])

  return (
    <button type="button" className="leader" onClick={onDone} aria-label="Skip countdown">
      <svg className="leader__svg" viewBox="0 0 200 200" aria-hidden="true">
        <line x1="0" y1="100" x2="200" y2="100" />
        <line x1="100" y1="0" x2="100" y2="200" />
        <circle cx="100" cy="100" r="78" />
        <circle cx="100" cy="100" r="66" />
        <circle className="leader__sweep" key={n} cx="100" cy="100" r="33" pathLength="100" />
      </svg>
      <span className="leader__n" key={`n${n}`}>
        {n}
      </span>
    </button>
  )
}

/** A cinema ticket stub for the privacy promise. */
function Ticket() {
  return (
    <div className="ticket" role="img" aria-label="Admit one. No account, no tracking.">
      <span className="ticket__admit">Admit one</span>
      <span className="ticket__terms">No account · No tracking</span>
      <span className="ticket__no">No. 000001</span>
    </div>
  )
}
