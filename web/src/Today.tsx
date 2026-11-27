import { AppHeader, Fields, FilmFrame, TabBar } from './components'
import { categoryLabel, type Moment } from './data'

type Props = {
  moment: Moment
  isToday: boolean
  onAnother: () => void
}

export function TodayScreen({ moment, isToday, onAnother }: Props) {
  const { primary_location: place, film } = moment
  const year = String(moment.year_set)

  return (
    <div className="screen">
      <AppHeader where={`${place.city} / ${year}`} />

      <main className="today" key={moment.id}>
        <div className="today__eyebrow">
          <span className="label">{isToday ? "Today's trip" : 'Another trip'}</span>
          <span className="label label--red">{categoryLabel[moment.category]}</span>
        </div>

        <FilmFrame aspect={film.aspect_ratio} />

        <Fields
          rows={[
            { label: 'City', value: `${place.city}, ${place.country}` },
            { label: 'Year', value: year },
            { label: 'Director', value: film.director },
            { label: 'Title', value: film.title, title: true },
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
