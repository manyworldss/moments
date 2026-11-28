import { CityMap, YearRoll } from './CityMap'
import { AppHeader, Fields, FilmFrame, TabBar } from './components'
import { categoryLabel, cityName, formatCoords, placeLabel, type Moment } from './data'

type Props = {
  moment: Moment
  isToday: boolean
  onAnother: () => void
  /** Shown in the header. Leave out to show nothing there. */
  date?: Date
}

/**
 * Film first: the film is the title, the place and year are where it takes
 * you. The map then shows that place.
 */
export function TodayScreen({ moment, isToday, onAnother, date }: Props) {
  const { primary_location: place, film } = moment
  const year = moment.year_set ?? moment.year_released
  const city = cityName(place) || place.country

  return (
    <div className="screen">
      <AppHeader
        where={date ? date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : ''}
      />

      <main className="today" key={moment.id}>
        <div className="today__eyebrow">
          <span className="label">{isToday ? "Today's trip" : 'Another trip'}</span>
          <span className="label label--red">{categoryLabel[moment.category]}</span>
        </div>

        <header className="film-head">
          <h2 className="film-head__title">{film.title}</h2>
          <p className="film-head__where">
            <span className="film-head__pin" aria-hidden="true" />
            {placeLabel(place)} <span className="hero__sep">/</span> {year}
          </p>
        </header>

        <FilmFrame aspect={film.aspect_ratio} />

        <section className="place" aria-label="The place">
          <span className="label">The place</span>
          <div className="hero">
            <CityMap momentId={moment.id} label={`${city}, ${year}`} />
            <YearRoll year={year} />
          </div>
          <div className="hero__tags">
            <div>
              <span className="tag">Location</span>
              <p className="hero__value">
                {placeLabel(place, ' | ')}
              </p>
              <p className="hero__sub">{formatCoords(place.coordinates)}</p>
            </div>
            <div className="hero__right">
              <span className="tag">Year set</span>
              <p className="hero__sub">Released {moment.year_released}</p>
            </div>
          </div>
        </section>

        <Fields
          rows={[
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
