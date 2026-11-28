import rawMoments from '../../data/moments.json'
import rotation from '../../data/rotation.json'

export type Location = {
  city: string
  country: string
  region?: string
  coordinates: [number, number]
  role?: string
}

export type Moment = {
  id: string
  primary_location: Location
  additional_locations: Location[]
  year_set: number | null
  year_released: number
  location_thesis: string
  film: {
    title: string
    director: string
    runtime_minutes: number
    language: string
    aspect_ratio: string
    poster_url: string | null
    still_urls: string[]
  }
  category: 'cultural_classic' | 'hidden_gem'
  facts: {
    historical_context: string
    cultural_moment: string
    why_it_matters: string
    formal_innovation: string
  }
}

const all = rawMoments as unknown as Moment[]
const byId = new Map(all.map((m) => [m.id, m]))

/** Moments in editorial order. Only complete ones (with a year and a thesis) make the rotation. */
export const schedule: Moment[] = rotation.order
  .map((id) => byId.get(id))
  .filter((m): m is Moment => !!m && m.year_set !== null && m.location_thesis.trim() !== '')

/** Whole days between the rotation's start date and the viewer's local today. */
function daysSinceStart(today: Date): number {
  const [y, mo, d] = rotation.start_date.split('-').map(Number)
  const start = Date.UTC(y, mo - 1, d)
  const now = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())
  return Math.floor((now - start) / 86_400_000)
}

/** Index into the schedule for today's moment, plus any steps taken with Another. */
export function momentIndex(today: Date, offset = 0): number {
  const n = schedule.length
  return (((daysSinceStart(today) + offset) % n) + n) % n
}

export const categoryLabel: Record<Moment['category'], string> = {
  cultural_classic: 'Cultural classic',
  hidden_gem: 'Hidden gem',
}

/** [22.3193, 114.1694] → "22.319°N 114.169°E" */
export function formatCoords([lat, lon]: [number, number]): string {
  const f = (v: number, pos: string, neg: string) => `${Math.abs(v).toFixed(3)}°${v >= 0 ? pos : neg}`
  return `${f(lat, 'N', 'S')} ${f(lon, 'E', 'W')}`
}

/** "2.35:1" → 2.35 */
export function ratioValue(aspect: string): number {
  const [w, h = '1'] = aspect.split(':')
  const r = Number(w) / Number(h)
  return Number.isFinite(r) && r > 0 ? r : 1.85
}

/** The city as shown: notes in brackets dropped; empty when the data has no real city ("(Unnamed)"). */
export function cityName(loc: Location): string {
  return loc.city.replace(/\s*\(.*\)/, '').trim()
}

/** "Clarksdale, USA", or just "West Africa" when there's no city. */
export function placeLabel(loc: Location, sep = ', '): string {
  const city = cityName(loc)
  return city ? `${city}${sep}${loc.country}` : loc.country
}
