import { ArrowRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { useAchievements } from '../../api/content'
import { splitFigure } from '../../lib/format'
import { routes } from '../../lib/routes'
import { Em } from '../ui/Layout'

/** W-01 (06) track record: verified figures only, set at 176px on the charcoal band. */
export function FiguresBand({ number, label = 'Track record', heading, link = true }: { number?: string; label?: string; heading?: ReactNode; link?: boolean }) {
  const achievements = useAchievements()
  if (achievements.isSuccess && achievements.data.length === 0) return null
  return (
    <section className="bg-band py-section text-band-ink" aria-labelledby="record-title">
      <div className="container-page">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="label text-band-mute">
              {number && <span className="text-band-accent">({number}) </span>}
              {label}
            </p>
            <h2 id="record-title" className="mt-5 font-display text-section font-medium">
              {heading ?? (
                <>
                  Measured in <Em>buildings.</Em>
                </>
              )}
            </h2>
          </div>
          {link && (
            <Link to={routes.achievements} className="text-link decoration-band-ink/40 hover:text-band-accent">
              Achievements <ArrowRight aria-hidden="true" className="arrow size-4" strokeWidth={1.5} />
            </Link>
          )}
        </div>
        <dl className="mt-[clamp(48px,6vw,88px)] grid border-t border-band-ink/15 desk:grid-cols-3">
          {achievements.data
            ? achievements.data.map((achievement, index) => {
                const [number, suffix] = splitFigure(achievement.value)
                return (
                  <div key={achievement.id} className={`flex flex-col-reverse border-b border-band-ink/15 py-10 desk:border-b-0 desk:pr-8 ${index ? 'desk:border-l desk:pl-8' : ''}`}>
                    <dt className="mt-4 text-[13px] text-band-mute">{achievement.label}</dt>
                    <dd className="font-display text-figure font-medium [font-variant-numeric:lining-nums]">
                      {number}
                      <span className="text-band-accent">{suffix}</span>
                    </dd>
                  </div>
                )
              })
            : [0, 1, 2].map((index) => <div key={index} className="py-10"><div className="h-32 bg-band-ink/10" /></div>)}
        </dl>
      </div>
    </section>
  )
}
