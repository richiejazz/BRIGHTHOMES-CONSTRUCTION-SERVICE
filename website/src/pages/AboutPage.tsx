import { ConsultationCta } from '../components/sections/ConsultationCta'
import { FiguresBand } from '../components/sections/FiguresBand'
import { Media } from '../components/media/Media'
import { BAR_OFFSET, Em } from '../components/ui/Layout'
import { Reveal } from '../components/ui/Reveal'
import { objectives, trustPillars } from '../content/company'
import { editorial } from '../content/media'

const NUMERALS = ['I.', 'II.', 'III.', 'IV.']

/** W-02: company description from verified facts only; material image, figures band, "What we stand on". */
export default function AboutPage() {
  return (
    <>
      <title>About — BRIGHTHOMES Construction Service</title>
      <header className={`container-page ${BAR_OFFSET} pb-[clamp(48px,6vw,96px)]`}>
        <p className="label text-mute">BRIGHTHOMES / About</p>
        <h1 className="mt-6 font-display text-[clamp(56px,8.4vw,136px)] leading-[0.96] font-medium tracking-[-0.015em]">
          Building dreams,
          <br />
          <Em>constructing reality.</Em>
        </h1>
      </header>

      <section className="container-page pb-section">
        <div className="grid-editorial items-end gap-y-10">
          <Reveal className="desk:col-span-7">
            <Media src={editorial.facade.src} alt={editorial.facade.alt} aspect="aspect-[4/3]" illustrative sizes="(min-width: 980px) 58vw, 100vw" />
          </Reveal>
          <Reveal className="space-y-5 desk:col-span-4 desk:col-start-9" delay={120}>
            <p className="text-[18px] leading-[1.6] text-ink">BRIGHTHOMES Construction Service is a construction and real estate company in Ibeju-Lekki, Lagos.</p>
            <p className="text-[15px] leading-[1.6] text-ink2">We provide architectural and structural drawings, survey plans, building approval, site supervision, construction management and renovation — and we help clients buy, rent and lease property.</p>
            <p className="text-[15px] leading-[1.6] text-ink2">Our clients deal with one team for the whole journey, whether they are in Lagos or managing their project from abroad.</p>
          </Reveal>
        </div>
      </section>

      <FiguresBand label="Track record" />

      <section className="container-page py-section" aria-labelledby="values-title">
        <div className="grid-editorial gap-y-12">
          <div className="desk:col-span-4">
            <p className="label text-mute">Our objectives</p>
            <h2 id="values-title" className="mt-5 font-display text-section font-medium">
              What we <Em>stand on.</Em>
            </h2>
          </div>
          <ol className="grid gap-10 phone:grid-cols-2 desk:col-span-8">
            {objectives.map((item, index) => (
              <li key={item.title} className="border-t border-ink pt-6">
                <p className="font-display text-[28px] text-bronze">{NUMERALS[index]}</p>
                <h3 className="mt-4 text-[15px] font-semibold">{item.title}</h3>
                <p className="mt-3 text-[14px] leading-[1.6] text-ink2">{item.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-t border-line bg-paper py-section" aria-labelledby="trust-title">
        <div className="container-page grid-editorial gap-y-12">
          <div className="desk:col-span-4">
            <p className="label text-mute">Why BRIGHTHOMES</p>
            <h2 id="trust-title" className="mt-5 font-display text-section font-medium">
              Why clients <Em>trust us.</Em>
            </h2>
          </div>
          <ol className="grid gap-10 phone:grid-cols-3 desk:col-span-8">
            {trustPillars.map((pillar, index) => (
              <li key={pillar.title} className="border-t border-ink pt-6">
                <p className="font-display text-[28px] text-bronze">{NUMERALS[index]}</p>
                <h3 className="mt-4 text-[15px] font-semibold">{pillar.title}</h3>
                <p className="mt-3 text-[14px] leading-[1.6] text-ink2">{pillar.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <ConsultationCta />
    </>
  )
}
