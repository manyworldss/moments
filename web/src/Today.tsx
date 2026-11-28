import { CityMap, YearRoll } from './CityMap'
import { AppHeader, Fields, FilmFrame, TabBar } from './components'
import { categoryLabel, formatCoords, type Moment } from './data'

type Props = {
  moment: Moment
  isToday: boolean
  onAnother: () => void
}

export function TodayScreen({ moment, isToday, onAnother }: Props) {
  const { primary_location: place, film } = moment
  const year = moment.year_set ?? moment.year_released

  return (
    <div className="screen">
      <AppHeader where={`${place.city} / ${year}`} />

      <main className="today" key={moment.id}>
        <div className="today__eyebrow">
          <span className="label">{isToday ? "Today's trip" : 'Another trip'}</span>
          <span className="label label--red">{categoryLabel[moment.category]}</span>
        </div>

        {/* The place and the year lead. */}
        <section className="hero" aria-label="Where and when">
          <CityMap momentId={moment.id} label={`${place.city}, ${year}`} />
          <YearRoll year={year} />
        </section>
        <div className="hero__tags">
          <div>
            <span className="tag">Location</span>
            <p className="hero__value">
              {place.city} <span className="hero__sep">|</span> {place.country}
            </p>
            <p className="hero__sub">{formatCoords(place.coordinates)}</p>
          </div>
          <div className="hero__right">
            <span className="tag">Year set</span>
            <p className="hero__sub">Released {moment.year_released}</p>
          </div>
        </div>

        <FilmFrame aspect={film.aspect_ratio} />

        <Fields
          rows={[
            { label: 'Title', value: film.title, title: true },
            { label: 'Director', value: film.director },
            { label: 'Language', value: film.language },
            { label: 'Runtime', value: `${film.runtime_minutes} min` },
          ]}
        />

        <p className="thesis">{moment.location_thesis}</p>

        <div className="pill-row">
          <button type="button" className="pill" onClick={onAnother}>
            Another
          </button>
          {/* The trip (deep context) is built in the next milestone. */}
          <button type="button" className="pill pill--filled" aria-disabled="true" title="The trip comes next">
            Take the trip
          </button>
        </div>
      </main>

      <TabBar active="today" />
    </div>
  )
}
