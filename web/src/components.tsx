import type { ReactNode } from 'react'
import { ratioValue } from './data'

export function AppHeader({ where, trailing }: { where: string; trailing?: ReactNode }) {
  return (
    <header className="app-header">
      <div>
        <h1 className="wordmark">MOMENTS</h1>
        <div className="app-header__where">{where}</div>
      </div>
      {trailing}
    </header>
  )
}

export function FilmFrame({ aspect }: { aspect: string }) {
  return (
    <div className="frame">
      <div
        className="frame__image"
        style={{ aspectRatio: String(ratioValue(aspect)) }}
        role="img"
        aria-label={`Frame placeholder at ${aspect}`}
      >
        <span className="frame__ratio">{aspect}</span>
      </div>
    </div>
  )
}

export function Fields({ rows }: { rows: { label: string; value: string; title?: boolean }[] }) {
  return (
    <dl className="fields">
      {rows.map((r) => (
        <div key={r.label} className={r.title ? 'field field--title' : 'field'}>
          <dt>{r.label}</dt>
          <dd>{r.value}</dd>
        </div>
      ))}
    </dl>
  )
}

export type Tab = 'today' | 'saved'

export function TabBar({ active, savedCount = 0 }: { active: Tab; savedCount?: number }) {
  return (
    <nav className="tabbar" aria-label="Main">
      <button type="button" className="tab" aria-current={active === 'today' ? 'page' : undefined}>
        <span className="tab__dot" aria-hidden="true" />
        Today
      </button>
      {/* Saved is built in the next milestone. */}
      <button
        type="button"
        className="tab"
        aria-current={active === 'saved' ? 'page' : undefined}
        disabled
        title="Saved comes next"
      >
        <span className="tab__dot" aria-hidden="true">
          {savedCount > 0 ? savedCount : null}
        </span>
        Saved
      </button>
    </nav>
  )
}
