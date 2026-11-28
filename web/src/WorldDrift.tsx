import world from './world.json'
import { cityName, schedule } from './data'

/**
 * The welcome backdrop: a dotted world drifting past, with a flight path
 * through every moment's city in rotation order and a traveller moving along
 * it. Each city is labelled with the year it's set, so it reads as a trip
 * through places and time.
 */

const project = ([lat, lon]: [number, number]) =>
  [(lon + 180) / world.step, (world.north - lat) / world.step] as const

const stops = schedule.map((m) => {
  const [x, y] = project(m.primary_location.coordinates)
  return { id: m.id, x, y, label: `${cityName(m.primary_location) || m.primary_location.country} ${m.year_set}` }
})

// Gentle arcs between stops, lifted like flight paths, closing the loop.
const route = stops
  .map((s, i) => {
    const n = stops[(i + 1) % stops.length]
    const mx = (s.x + n.x) / 2
    const my = (s.y + n.y) / 2 - Math.min(14, Math.abs(n.x - s.x) * 0.22 + 3)
    return `${i === 0 ? `M${s.x} ${s.y}` : ''}Q${mx.toFixed(1)} ${my.toFixed(1)} ${n.x} ${n.y}`
  })
  .join('')

function WorldSheet({ traveller }: { traveller: boolean }) {
  return (
    <svg className="drift__sheet" viewBox={`0 0 ${world.cols} ${world.rows}`} aria-hidden="true">
      <path className="drift__land" d={world.dots} />
      <path className="drift__route" d={route} />
      {stops.map((s, i) => (
        <g key={s.id} transform={`translate(${s.x} ${s.y})`}>
          <circle className="drift__ring" r="1.6" />
          <circle className="drift__pin" r="0.55" />
          <text className="drift__label" x="1.6" y={i % 2 ? 2.4 : -1.2}>
            {s.label}
          </text>
        </g>
      ))}
      {traveller && (
        <circle className="drift__traveller" r="0.7">
          <animateMotion dur="36s" repeatCount="indefinite" path={route} rotate="auto" />
        </circle>
      )}
    </svg>
  )
}

export function WorldDrift() {
  return (
    <div className="drift" aria-hidden="true">
      <div className="drift__strip">
        <WorldSheet traveller />
        <WorldSheet traveller={false} />
      </div>
    </div>
  )
}
