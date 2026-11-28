// Builds the city maps from OpenStreetMap data.
//
//   npm run maps            build every moment listed in MAPS below
//   npm run maps -- <id>    build one
//
// Raw OSM responses are cached in scripts/.osm-cache/ so a rebuild doesn't
// hit the network. Delete a cache file to fetch fresh data.
//
// Output: src/maps/<moment-id>.json, one small file per moment, holding SVG
// path strings for land, water and streets. The app draws them in its own
// colours. No map service is ever called from the app itself.
//
// Map data © OpenStreetMap contributors, ODbL. The app shows that credit.

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..', '..')
const cacheDir = join(here, '.osm-cache')
const outDir = join(here, '..', 'src', 'maps')

// Per-moment framing. `center` defaults to the moment's coordinates; set it
// when the map reads better framed around something else (the red dot always
// sits on the moment's real coordinates). `span` is width × height in km.
const MAPS = {
  'in-the-mood-for-love-hong-kong-2000': { center: [22.3, 114.172], span: [8, 5.6] },
}

const W = 600 // viewBox width; height follows the span's aspect
const OVERPASS = 'https://overpass-api.de/api/interpreter'

const MAJOR = new Set(['motorway', 'trunk', 'primary', 'secondary', 'motorway_link', 'trunk_link', 'primary_link'])
const MINOR = new Set(['tertiary', 'secondary_link', 'tertiary_link', 'residential', 'unclassified', 'living_street', 'pedestrian'])

// ── Fetch ────────────────────────────────────────────────

async function overpass(id, bbox) {
  const file = join(cacheDir, `${id}.json`)
  if (existsSync(file)) return JSON.parse(await readFile(file, 'utf8'))

  const [s, w, n, e] = bbox.map((v) => v.toFixed(5))
  const query = `[out:json][timeout:180][bbox:${s},${w},${n},${e}];
(
  way["natural"="coastline"];
  way["natural"="water"]; relation["natural"="water"];
  way["waterway"="riverbank"]; relation["waterway"="riverbank"];
  way["highway"~"^(${[...MAJOR, ...MINOR].join('|')})$"];
  way["railway"="rail"];
);
out geom;`

  for (let attempt = 1, wait = 10; attempt <= 6; attempt++, wait *= 2) {
    const res = await fetch(OVERPASS, {
      method: 'POST',
      headers: { 'User-Agent': 'moments-map-build/0.1', 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ data: query }),
    })
    if (res.ok) {
      const json = await res.json()
      await mkdir(cacheDir, { recursive: true })
      await writeFile(file, JSON.stringify(json))
      return json
    }
    console.log(`  overpass ${res.status}, retrying in ${wait}s (${attempt}/6)`)
    await new Promise((r) => setTimeout(r, wait * 1000))
  }
  throw new Error('Overpass kept failing. Try again later.')
}

// ── Geometry helpers ─────────────────────────────────────

const key = (p) => `${p.lat},${p.lon}`

// Join ways that share endpoints into longer chains. Keeps direction when the
// ways agree (coastlines always do); flips a way when it must.
function joinWays(ways, { flip = true } = {}) {
  const chains = ways.map((w) => [...w])
  let merged = true
  while (merged) {
    merged = false
    outer: for (let i = 0; i < chains.length; i++) {
      const a = chains[i]
      if (key(a[0]) === key(a.at(-1))) continue
      for (let j = 0; j < chains.length; j++) {
        if (i === j) continue
        const b = chains[j]
        if (key(b[0]) === key(b.at(-1))) continue
        if (key(a.at(-1)) === key(b[0])) a.push(...b.slice(1))
        else if (key(b.at(-1)) === key(a[0])) a.unshift(...b.slice(0, -1))
        else if (flip && key(a.at(-1)) === key(b.at(-1))) a.push(...b.slice(0, -1).reverse())
        else if (flip && key(a[0]) === key(b[0])) a.unshift(...b.slice(1).reverse())
        else continue
        chains.splice(j, 1)
        merged = true
        break outer
      }
    }
  }
  return chains
}

// Liang–Barsky: clip a polyline to the rect, returning the pieces inside.
function clipPolyline(pts, w, h) {
  const pieces = []
  let cur = null
  for (let i = 0; i < pts.length - 1; i++) {
    const seg = clipSegment(pts[i], pts[i + 1], w, h)
    if (!seg) {
      if (cur) {
        pieces.push(cur)
        cur = null
      }
      continue
    }
    const [p, q, enteredMidway, leftMidway] = seg
    if (!cur || enteredMidway) {
      if (cur) pieces.push(cur)
      cur = [p]
    }
    cur.push(q)
    if (leftMidway) {
      pieces.push(cur)
      cur = null
    }
  }
  if (cur) pieces.push(cur)
  return pieces
}

function clipSegment([x0, y0], [x1, y1], w, h) {
  const dx = x1 - x0
  const dy = y1 - y0
  let t0 = 0
  let t1 = 1
  for (const [p, q] of [[-dx, x0], [dx, w - x0], [-dy, y0], [dy, h - y0]]) {
    if (p === 0) {
      if (q < 0) return null
      continue
    }
    const r = q / p
    if (p < 0) { if (r > t1) return null; if (r > t0) t0 = r }
    else { if (r < t0) return null; if (r < t1) t1 = r }
  }
  return [[x0 + t0 * dx, y0 + t0 * dy], [x0 + t1 * dx, y0 + t1 * dy], t0 > 0, t1 < 1]
}

// Douglas–Peucker simplification.
function simplify(pts, tol) {
  if (pts.length < 3) return pts
  const keep = new Uint8Array(pts.length)
  keep[0] = keep[pts.length - 1] = 1
  const stack = [[0, pts.length - 1]]
  while (stack.length) {
    const [a, b] = stack.pop()
    const [ax, ay] = pts[a]
    const [bx, by] = pts[b]
    const len = Math.hypot(bx - ax, by - ay) || 1
    let max = 0
    let idx = -1
    for (let i = a + 1; i < b; i++) {
      const d = Math.abs((bx - ax) * (ay - pts[i][1]) - (ax - pts[i][0]) * (by - ay)) / len
      if (d > max) {
        max = d
        idx = i
      }
    }
    if (max > tol) {
      keep[idx] = 1
      stack.push([a, idx], [idx, b])
    }
  }
  return pts.filter((_, i) => keep[i])
}

const r1 = (v) => Math.round(v * 10) / 10
function pathD(lines, close = false) {
  return lines
    .filter((l) => l.length > 1)
    .map((l) => 'M' + l.map(([x, y]) => `${r1(x)} ${r1(y)}`).join('L') + (close ? 'Z' : ''))
    .join('')
}

// Is a point on the rect's edge? Returns its clockwise perimeter position.
function perimeterT([x, y], w, h) {
  const e = 0.01
  if (y <= e) return x
  if (x >= w - e) return w + y
  if (y >= h - e) return w + h + (w - x)
  return 2 * w + h + (h - y)
}

// Coastline pieces run with land on the right (in screen space, y down).
// Close each into sea polygons by walking the frame clockwise.
function seaPolygons(pieces, w, h) {
  const P = 2 * (w + h)
  const corners = [[0, 0, 0], [w, w, 0], [w + h, w, h], [2 * w + h, 0, h]]
  const items = pieces.map((pts) => ({ pts, tin: perimeterT(pts[0], w, h), tout: perimeterT(pts.at(-1), w, h) }))
  const used = new Set()
  const polys = []
  for (const start of items) {
    if (used.has(start)) continue
    used.add(start)
    const ring = [...start.pts]
    let cur = start
    for (let guard = 0; guard < items.length + 1; guard++) {
      let best = null
      let bestD = Infinity
      for (const it of items) {
        if (used.has(it) && it !== start) continue
        const d = (((it.tin - cur.tout) % P) + P) % P
        if (d < bestD) {
          bestD = d
          best = it
        }
      }
      // Frame corners passed between cur.tout and best.tin, clockwise.
      corners
        .map(([ct, cx, cy]) => [(((ct - cur.tout) % P) + P) % P, cx, cy])
        .filter(([d]) => d > 0 && d < bestD)
        .sort((a, b) => a[0] - b[0])
        .forEach(([, cx, cy]) => ring.push([cx, cy]))
      if (best === start) break
      used.add(best)
      ring.push(...best.pts)
      cur = best
    }
    polys.push(ring)
  }
  return polys
}

// ── Build one map ────────────────────────────────────────

async function build(id, moments) {
  const moment = moments.find((m) => m.id === id)
  if (!moment) throw new Error(`No moment ${id}`)
  const cfg = MAPS[id] ?? {}
  const [dotLat, dotLon] = moment.primary_location.coordinates
  const [lat0, lon0] = cfg.center ?? [dotLat, dotLon]
  const [spanW, spanH] = cfg.span ?? [8, 5.6]
  const H = Math.round((W * spanH) / spanW)

  const kmPerDegLat = 110.574
  const kmPerDegLon = 111.32 * Math.cos((lat0 * Math.PI) / 180)
  const pxPerKm = W / spanW
  const project = (p) => [W / 2 + (p.lon - lon0) * kmPerDegLon * pxPerKm, H / 2 - (p.lat - lat0) * kmPerDegLat * pxPerKm]

  // Fetch a bit beyond the frame so coastlines reach its edges.
  const padLat = (spanH * 0.75) / kmPerDegLat
  const padLon = (spanW * 0.75) / kmPerDegLon
  const bbox = [lat0 - padLat, lon0 - padLon, lat0 + padLat, lon0 + padLon]
  console.log(`${id}: fetching`)
  const osm = await overpass(id, bbox)

  const coast = []
  const water = [] // [outerRings[], innerRings[]]
  const major = []
  const minor = []
  const rail = []

  for (const el of osm.elements) {
    const t = el.tags ?? {}
    if (el.type === 'way' && el.geometry) {
      if (t.natural === 'coastline') coast.push(el.geometry)
      else if (t.natural === 'water' || t.waterway === 'riverbank') water.push([[el.geometry], []])
      else if (MAJOR.has(t.highway)) major.push(el.geometry)
      else if (MINOR.has(t.highway)) minor.push(el.geometry)
      else if (t.railway === 'rail' && !t.tunnel) rail.push(el.geometry)
    } else if (el.type === 'relation' && el.members) {
      const outer = el.members.filter((m) => m.type === 'way' && m.role !== 'inner' && m.geometry).map((m) => m.geometry)
      const inner = el.members.filter((m) => m.type === 'way' && m.role === 'inner' && m.geometry).map((m) => m.geometry)
      water.push([joinWays(outer), joinWays(inner)])
    }
  }

  const tol = 0.35
  const inside = ([x, y]) => x >= 0 && x <= W && y >= 0 && y <= H

  // Coastline → sea polygons + islands.
  const coastChains = joinWays(coast, { flip: false })
  const pieces = []
  const islands = []
  for (const chain of coastChains) {
    const pts = chain.map(project)
    const closed = key(chain[0]) === key(chain.at(-1))
    if (closed && pts.every(inside)) {
      islands.push(simplify(pts, tol))
      continue
    }
    for (const piece of clipPolyline(pts, W, H)) {
      // A piece must start and end on the frame. If the data stops short
      // inside the frame, skip it rather than draw a wrong sea.
      const onEdge = (p) => p[0] <= 0.01 || p[0] >= W - 0.01 || p[1] <= 0.01 || p[1] >= H - 0.01
      if (onEdge(piece[0]) && onEdge(piece.at(-1))) pieces.push(simplify(piece, tol))
      else console.log('  skipped a coastline piece that ends inside the frame')
    }
  }
  const sea = seaPolygons(pieces, W, H)
  const baseIsSea = pieces.length === 0 && islands.length > 0

  // Lakes and rivers (drawn even-odd so inner rings punch holes).
  const lakeRings = []
  for (const [outers, inners] of water) {
    for (const ring of [...outers, ...inners]) {
      const pts = ring.map(project)
      if (pts.length < 4) continue
      const xs = pts.map((p) => p[0])
      const ys = pts.map((p) => p[1])
      if (Math.max(...xs) < 0 || Math.min(...xs) > W || Math.max(...ys) < 0 || Math.min(...ys) > H) continue
      lakeRings.push(simplify(pts, tol))
    }
  }

  const lines = (ways) => ways.flatMap((w) => clipPolyline(w.map(project), W, H)).map((l) => simplify(l, tol))

  const out = {
    id,
    width: W,
    height: H,
    base: baseIsSea ? 'sea' : 'land',
    sea: pathD(sea, true),
    land: pathD(islands, true),
    water: pathD(lakeRings, true),
    major: pathD(lines(major)),
    minor: pathD(lines(minor)),
    rail: pathD(lines(rail)),
    dot: project({ lat: dotLat, lon: dotLon }).map(r1),
    attribution: '© OpenStreetMap contributors',
  }

  await mkdir(outDir, { recursive: true })
  const file = join(outDir, `${id}.json`)
  const text = JSON.stringify(out)
  await writeFile(file, text + '\n')
  console.log(`  wrote src/maps/${id}.json (${(text.length / 1024).toFixed(0)} KB)`)
}

const moments = JSON.parse(await readFile(join(root, 'data', 'moments.json'), 'utf8'))
const only = process.argv[2]
for (const id of only ? [only] : Object.keys(MAPS)) await build(id, moments)
