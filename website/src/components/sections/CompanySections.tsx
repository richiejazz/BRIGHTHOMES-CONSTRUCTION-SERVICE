import { company, objectives, trustPillars } from '../../content/company'
import { ButtonLink } from '../ui/Button'
import { Container, SectionHeading } from '../ui/Layout'
import { Reveal } from '../ui/Reveal'
import { padIndex } from '../../lib/format'

/** Why clients trust BRIGHTHOMES — a sticky heading beside a ruled, numbered list. */
export function TrustSection() {
  return (
    <section aria-labelledby="trust-title" className="py-24 sm:py-32">
      <Container className="grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-32">
            <SectionHeading id="trust-title" eyebrow="Why BRIGHTHOMES" title="Why clients trust us with their build." />
          </div>
        </div>
        <ol className="border-t border-stone-300 lg:col-span-7">
          {trustPillars.map((pillar, index) => (
            <Reveal as="li" key={pillar.title} className="grid gap-4 border-b border-stone-300 py-10 sm:grid-cols-[5rem_1fr] sm:py-12">
              <span className="font-display text-2xl text-bronze-dark">{padIndex(index)}</span>
              <div>
                <h3 className="font-display text-4xl leading-[1.05] sm:text-5xl">{pillar.title}</h3>
                <p className="mt-4 max-w-lg leading-relaxed text-stone-600">{pillar.body}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </Container>
    </section>
  )
}

export function ObjectivesSection() {
  return (
    <section aria-labelledby="objectives-title" className="bg-charcoal py-24 text-paper sm:py-32">
      <Container>
        <SectionHeading id="objectives-title" tone="dark" eyebrow="Our objectives" title="What guides every project." className="max-w-3xl" />
        <ol className="mt-16 grid border-t border-graphite sm:grid-cols-2 lg:grid-cols-4">
          {objectives.map((objective, index) => (
            <Reveal as="li" key={objective.title} delay={index * 90} className="border-b border-graphite py-10 sm:pr-8 lg:border-b-0 lg:border-r lg:px-8 lg:first:pl-0 lg:last:border-r-0">
              <span aria-hidden="true" className="block h-px w-10 bg-bronze-light" />
              <h3 className="mt-8 font-display text-3xl leading-tight">{objective.title}</h3>
              <p className="mt-4 leading-relaxed text-stone-400">{objective.body}</p>
            </Reveal>
          ))}
        </ol>
      </Container>
    </section>
  )
}

export function ConsultationCta() {
  return (
    <section aria-labelledby="cta-title" className="relative overflow-hidden bg-paper py-24 sm:py-36">
      <Container>
        <Reveal className="grid gap-14 border-y border-stone-300 py-16 sm:py-20 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <p className="eyebrow flex items-center gap-3 text-bronze-dark">
              <span aria-hidden="true" className="h-px w-8 bg-current" />
              Have a project in mind?
            </p>
            <h2 id="cta-title" className="mt-6 font-display text-[3.2rem] leading-[0.95] tracking-[-0.02em] sm:text-[5.5rem] lg:text-[6.5rem]">
              Let’s build it <em className="text-bronze-dark">right.</em>
            </h2>
          </div>
          <div className="space-y-6 lg:col-span-4">
            <div className="flex flex-col gap-3">
              <ButtonLink to="/contact" size="lg" arrow>
                Start a conversation
              </ButtonLink>
              <ButtonLink to="/contact?type=consultation" variant="secondary" size="lg">
                Request a consultation
              </ButtonLink>
            </div>
            <p className="text-sm text-stone-600">
              Or call{' '}
              {company.phones.map((phone, index) => (
                <span key={phone.href}>
                  {index > 0 && ' / '}
                  <a href={phone.href} className="font-semibold text-ink underline decoration-bronze underline-offset-4">
                    {phone.display}
                  </a>
                </span>
              ))}
            </p>
          </div>
        </Reveal>
      </Container>
    </section>
  )
}
