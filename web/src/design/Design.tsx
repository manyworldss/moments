import { useEffect, useState, type ReactNode } from 'react'
import { Fields, FilmFrame, TabBar } from '../components'
import { momentIndex, schedule } from '../data'
import { TodayScreen } from '../Today'

type Mode = 'system' | 'light' | 'dark'
const MODE_KEY = 'moments.design.theme'

function readMode(): Mode {
  try {
    const v = localStorage.getItem(MODE_KEY)
    return v === 'light' || v === 'dark' ? v : 'system'
  } catch {
    return 'system'
  }
}

const palette = [
  { token: '--paper', role: 'Background', light: '#EFEAD9', dark: '#0A0907' },
  { token: '--paper-raised', role: 'Frames, active tab', light: '#E5DFCB', dark: '#14110E' },
  { token: '--ink', role: 'Text, filled buttons', light: '#1A1614', dark: '#EFEAD9' },
  { token: '--ink-mute', role: 'Secondary text', light: '#6B6258', dark: '#9C9484' },
  { token: '--line', role: 'Hairlines', light: '#CFC7B2', dark: '#2A241F' },
  { token: '--red', role: 'Labels, accents', light: '#B23A1B', dark: '#D9552F' },
]

const ratios = [
  { aspect: '1.33:1', name: 'Full frame', note: 'Silent era' },
  { aspect: '1.37:1', name: 'Academy', note: 'Classic Hollywood, 1932–1953' },
  { aspect: '1.66:1', name: 'European widescreen', note: 'In the Mood for Love, A Clockwork Orange' },
  { aspect: '1.85:1', name: 'Flat', note: 'The US theatrical standard' },
  { aspect: '2.35:1', name: 'Scope', note: 'Anamorphic, before 1970' },
  { aspect: '2.39:1', name: 'Scope', note: 'Anamorphic, from 1970 on' },
  { aspect: '2.76:1', name: 'Ultra Panavision 70', note: 'Sinners' },
]

function Section({ id, title, intro, children }: { id: string; title: string; intro: string; children: ReactNode }) {
  return (
    <section className="ds-section" aria-labelledby={id}>
      <div className="ds-section__head">
        <h2 id={id} className="label label--red">{title}</h2>
        <p>{intro}</p>
      </div>
      {children}
    </section>
  )
}

export function Design() {
  const [mode, setMode] = useState<Mode>(readMode)
  const [offset, setOffset] = useState(0)
  const [today] = useState(() => new Date())
  const moment = schedule[momentIndex(today, offset)]

  useEffect(() => {
    const root = document.documentElement
    if (mode === 'system') root.removeAttribute('data-theme')
    else root.setAttribute('data-theme', mode)
    try {
      localStorage.setItem(MODE_KEY, mode)
    } catch {
      /* storage unavailable: the choice lasts for this visit */
    }
  }, [mode])

  return (
    <div className="ds dots">
      <header className="ds-top">
        <div>
          <p className="label label--red">Design baseline · v0</p>
          <h1 className="headline">Moments,<br />on paper<br />and at night.</h1>
          <p className="ds-lede">
            The tokens, type and components every screen is built from. Grounded in the original prototype:
            paper and ink, one brick red, a heavy mono for everything that labels, and a quiet sans for
            everything that tells.
          </p>
        </div>
        <fieldset className="ds-mode">
          <legend className="label">Theme</legend>
          {(['system', 'light', 'dark'] as const).map((m) => (
            <label key={m} className="ds-mode__opt">
              <input type="radio" name="mode" id={`mode-${m}`} checked={mode === m} onChange={() => setMode(m)} />
              <span>{m}</span>
            </label>
          ))}
        </fieldset>
      </header>

      <Section id="s-screen" title="Today, both modes" intro="The real Today screen with real data. Another works in both.">
        <div className="ds-pair">
          {(['light', 'dark'] as const).map((t) => (
            <div key={t} data-theme={t} className="ds-phone dots">
              <TodayScreen moment={moment} isToday={offset === 0} onAnother={() => setOffset((o) => o + 1)} date={today} />
            </div>
          ))}
        </div>
      </Section>

      <Section id="s-color" title="Color" intro="Six tokens. Dark mode turns the ink into paper. The red darkens slightly on paper so small labels stay readable.">
        <div className="ds-pair">
          {(['light', 'dark'] as const).map((t) => (
            <div key={t} data-theme={t} className="ds-panel">
              <p className="label">{t}</p>
              <ul className="ds-swatches">
                {palette.map((c) => (
                  <li key={c.token}>
                    <span className="ds-chip" style={{ background: `var(${c.token})` }} />
                    <span className="ds-swatch__name">{c.token}</span>
                    <span className="ds-swatch__meta">{c.role} · {t === 'light' ? c.light : c.dark}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      <Section id="s-type" title="Type" intro="Mono: DejaVu Sans Mono, the open font Apple's Menlo is built from, self-hosted. Sans: Inter. Two families, nothing else.">
        <div className="ds-type">
          <div className="ds-type__row"><span className="ds-spec">Wordmark · mono bold 18</span><span className="wordmark">MOMENTS</span></div>
          <div className="ds-type__row"><span className="ds-spec">Headline · mono bold 40</span><span className="headline">Trips saved on this device.</span></div>
          <div className="ds-type__row"><span className="ds-spec">Title · mono bold 22</span><span className="ds-sample-title">Kill Bill: Vol. 1</span></div>
          <div className="ds-type__row"><span className="ds-spec">Field · mono bold 16</span><span className="ds-sample-field">Quentin Tarantino</span></div>
          <div className="ds-type__row"><span className="ds-spec">Label · mono bold 11, tracked</span><span className="label label--red">Cultural classic</span></div>
          <div className="ds-type__row"><span className="ds-spec">Meta · mono 13</span><span className="app-header__where">Hong Kong / 1962</span></div>
          <div className="ds-type__row"><span className="ds-spec">Quote · Inter medium 34</span><span className="quote">You are in a narrow Hong Kong hallway, close enough to hear rain on the walls.</span></div>
          <div className="ds-type__row"><span className="ds-spec">Body · Inter 16</span><span className="thesis ds-no-rule">Tokyo is the operatic center. The House of Blue Leaves is the gravitational core of the film.</span></div>
        </div>
      </Section>

      <Section id="s-frames" title="Frames" intro="Every moment's frame takes the film's real aspect ratio, so a scope picture reads wider than a flat one at a glance.">
        <div className="ds-frames">
          {ratios.map((r) => (
            <figure key={r.aspect} className="ds-frame">
              <FilmFrame aspect={r.aspect} />
              <figcaption>
                <span className="label">{r.name}</span>
                <span className="ds-swatch__meta">{r.note}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </Section>

      <Section id="s-components" title="Components" intro="Buttons, fields and navigation. Outlined is the secondary action, filled is the primary one.">
        <div className="ds-components">
          <div className="pill-row">
            <button type="button" className="pill">Another</button>
            <button type="button" className="pill pill--filled">Take the trip</button>
          </div>
          <Fields
            rows={[
              { label: 'City', value: 'Clarksdale, USA' },
              { label: 'Year', value: '1932' },
              { label: 'Title', value: 'Sinners', title: true },
            ]}
          />
          <div className="ds-tabbar">
            <TabBar active="today" savedCount={2} />
          </div>
        </div>
      </Section>
    </div>
  )
}
