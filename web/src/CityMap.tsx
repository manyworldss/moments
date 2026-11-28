import { useEffect, useId, useState, type CSSProperties } from 'react'

/** One city map, built by scripts/build-maps.mjs from OpenStreetMap data. */
export type MapData = {
  id: string
  width: number
  height: number
  base: 'land' | 'sea'
  sea: string
  land: string
  water: string
  major: string
  minor: string
  rail: string
  dot: [number, number]
  attribution: string
}

// Each map is its own chunk, fetched only when its moment is shown.
const maps = import.meta.glob<MapData>('./maps/*.json', { import: 'default' })
const W = 600
const H = 420

type Props = { momentId: string; label: string }

export function CityMap({ momentId, label }: Props) {
  const loader = maps[`./maps/${momentId}.json`]
  const gridId = `grid-${useId().replace(/:/g, '')}`
  const [loaded, setLoaded] = useState<MapData | null>(null)
  const data = loaded?.id === momentId ? loaded : null

  useEffect(() => {
    let live = true
    loader?.().then((d) => {
      if (live) setLoaded(d)
    })
    return () => {
      live = false
    }
  }, [loader])

  const w = data?.width ?? W
  const h = data?.height ?? H

  return (
    <figure className="citymap">
      <svg
        className={`citymap__svg${data ? ' is-drawn' : ''}`}
        viewBox={`0 0 ${w} ${h}`}
        role="img"
        aria-label={data ? `Map of ${label}` : `${label}, map not drawn yet`}
      >
        <defs>
          <pattern id={gridId} width="15" height="15" patternUnits="userSpaceOnUse">
            <path d="M15 0H0V15" className="citymap__gridline" />
          </pattern>
        </defs>

        {data ? (
          <g className="citymap__layers">
            {data.base === 'land' && <rect className="citymap__land" width={w} height={h} />}
            <path className="citymap__sea" d={data.sea} />
            <path className="citymap__land" d={data.land} />
            <path className="citymap__sea" d={data.water} fillRule="evenodd" />
            <rect width={w} height={h} fill={`url(#${gridId})`} />
            <path className="citymap__minor" d={data.minor} />
            <path className="citymap__rail" d={data.rail} />
            <path className="citymap__major" d={data.major} />
            <g className="citymap__pin" transform={`translate(${data.dot[0]} ${data.dot[1]})`}>
              <circle className="citymap__halo" r="16" />
              <circle className="citymap__dot" r="7" />
            </g>
          </g>
        ) : (
          <g>
            <rect width={w} height={h} fill={`url(#${gridId})`} className="citymap__empty" />
            {!loader && (
              <text x={w / 2} y={h / 2} className="citymap__note">
                MAP NOT DRAWN YET
              </text>
            )}
          </g>
        )}
      </svg>
      {data && <figcaption className="citymap__credit">{data.attribution}</figcaption>}
    </figure>
  )
}

/** The year as a film counter: two stacked pairs, each digit rolls into place. */
export function YearRoll({ year }: { year: number }) {
  const digits = String(year).padStart(4, '0').split('').map(Number)
  const strip = [...Array(20).keys()].map((n) => n % 10)
  return (
    <div className="yearroll" role="img" aria-label={`Set in ${year}`}>
      {[0, 2].map((start) => (
        <div className="yearroll__row" key={start} aria-hidden="true">
          {digits.slice(start, start + 2).map((d, i) => (
            <span className="yearroll__digit" key={i}>
              <span
                className="yearroll__strip"
                style={{ '--to': 10 + d, '--i': start + i } as CSSProperties}
              >
                {strip.map((n, k) => (
                  <span key={k}>{n}</span>
                ))}
              </span>
            </span>
          ))}
        </div>
      ))}
    </div>
  )
}
