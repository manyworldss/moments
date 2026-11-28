// Builds the dotted world behind the welcome screen.
//
//   npm run world
//
// Samples Natural Earth's 1:110m land (public domain) on a lat/lon grid and
// writes one SVG path of small squares to src/world.json. Run once; the
// result is committed.

import { writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const SRC = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_land.geojson'

// Grid: one cell per STEP degrees, from 80°N to 58°S (no Antarctica).
export const STEP = 2
const NORTH = 80
const SOUTH = -58

const res = await fetch(SRC, { headers: { 'User-Agent': 'moments-map-build/0.1' } })
if (!res.ok) throw new Error(`Natural Earth fetch failed: ${res.status}`)
const geo = await res.json()

const polygons = geo.features.flatMap((f) =>
  f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates,
)

function inRing(lon, lat, ring) {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i]
    const [xj, yj] = ring[j]
    if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}
const onLand = (lon, lat) => polygons.some(([outer, ...holes]) => inRing(lon, lat, outer) && !holes.some((h) => inRing(lon, lat, h)))

const cols = 360 / STEP
const rows = (NORTH - SOUTH) / STEP
let d = ''
let count = 0
for (let r = 0; r < rows; r++) {
  for (let c = 0; c < cols; c++) {
    const lon = -180 + (c + 0.5) * STEP
    const lat = NORTH - (r + 0.5) * STEP
    if (onLand(lon, lat)) {
      d += `M${c + 0.3} ${r + 0.3}h.4v.4h-.4z`
      count++
    }
  }
}

const out = { step: STEP, north: NORTH, cols, rows, dots: d, source: 'Natural Earth (public domain)' }
await writeFile(join(here, '..', 'src', 'world.json'), JSON.stringify(out) + '\n')
console.log(`wrote src/world.json: ${count} land dots, ${(d.length / 1024).toFixed(0)} KB`)
