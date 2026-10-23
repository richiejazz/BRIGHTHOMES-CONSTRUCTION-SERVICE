import { ButtonLink } from '../ui/Button'
import { Em } from '../ui/Layout'
import { Media } from '../media/Media'
import { company } from '../../content/company'
import { editorial } from '../../content/media'
import { routes } from '../../lib/routes'

/** W-01 (08) consultation call to action: drawing image half, ivory text half. */
export function ConsultationCta({ number, context }: { number?: string; context?: { service?: string; project?: string; property?: string } }) {
  return (
    <section className="grid border-t border-line desk:grid-cols-2" aria-labelledby="cta-title">
      <Media src={editorial.blueprints.src} alt={editorial.blueprints.alt} aspect="aspect-[16/10] desk:aspect-auto" className="desk:min-h-[560px]" illustrative />
      <div className="flex items-center bg-paper px-[var(--gutter)] py-[clamp(56px,7vw,112px)] desk:px-[clamp(40px,6vw,96px)]">
        <div className="max-w-[480px]">
          <p className="label text-mute">
            {number && <span className="text-bronze">({number}) </span>}
            Consultation
          </p>
          <h2 id="cta-title" className="mt-5 font-display text-section font-medium">
            Start with a <Em>conversation.</Em>
          </h2>
          <p className="mt-6 text-[15px] leading-[1.6] text-ink2">Tell us about your land, your drawings or your property search. We’ll get back to you to arrange a consultation — in person in Ibeju-Lekki, or remotely if you’re abroad.</p>
          <div className="mt-9 flex flex-col gap-3 phone:flex-row phone:flex-wrap">
            <ButtonLink to={routes.consultation(context)} arrow>
              Request a consultation
            </ButtonLink>
            <a href={company.phones[0].href} className="btn btn-secondary">
              Call {company.phones[0].display}
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
