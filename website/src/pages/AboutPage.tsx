import { ElevationPlaceholder } from '../components/art/Elevations'
import { ConsultationCta, ObjectivesSection, TrustSection } from '../components/sections/CompanySections'
import { ButtonLink } from '../components/ui/Button'
import { Container, PageHeader } from '../components/ui/Layout'
import { Reveal } from '../components/ui/Reveal'
import { company } from '../content/company'
import { padIndex } from '../lib/format'

const approach = [
  { title: 'Engineering', body: 'Architectural and structural drawings, survey plans and building approvals establish a sound technical basis before work begins.' },
  { title: 'Design', body: 'Modern design that responds to how each residential or commercial building will be used.' },
  { title: 'Project management', body: 'Site supervision and construction management keep the build coordinated and aligned with the approved drawings.' },
] as const

export default function AboutPage() {
  return (
    <>
      <title>About — BRIGHTHOMES Construction Service</title>
      <PageHeader eyebrow="About BRIGHTHOMES" title={<>Construction, done <em className="text-bronze-light">properly.</em></>} intro={company.tagline} />

      <section aria-labelledby="what-title" className="py-24 sm:py-32">
        <Container className="grid gap-14 lg:grid-cols-12 lg:gap-10">
          <Reveal className="lg:col-span-7">
            <h2 id="what-title" className="eyebrow flex items-center gap-3 text-bronze-dark">
              <span aria-hidden="true" className="h-px w-8 bg-current" />
              What we do
            </h2>
            <p className="mt-8 font-display text-[2rem] leading-[1.15] sm:text-[2.8rem] sm:leading-[1.1]">{company.description}</p>
            <div className="mt-12 grid gap-8 border-t border-stone-300 pt-8 sm:grid-cols-2">
              <div>
                <h3 className="font-display text-3xl">Residential</h3>
                <p className="mt-3 leading-relaxed text-stone-600">Homes designed, approved, built and supervised with the care a family investment deserves.</p>
              </div>
              <div>
                <h3 className="font-display text-3xl">Commercial</h3>
                <p className="mt-3 leading-relaxed text-stone-600">Commercial buildings delivered with the coordination, compliance and quality that businesses depend on.</p>
              </div>
            </div>
          </Reveal>
          <Reveal className="lg:col-span-5" delay={150}>
            <figure>
              <ElevationPlaceholder seed={2} tone="light" className="aspect-[4/5] w-full" />
              <figcaption className="mt-3 text-xs uppercase tracking-[0.18em] text-stone-500">Illustrative drawing</figcaption>
            </figure>
          </Reveal>
        </Container>
      </section>

      <section aria-labelledby="approach-title" className="bg-bone py-24 sm:py-32">
        <Container>
          <h2 id="approach-title" className="max-w-3xl font-display text-[2.6rem] leading-[1.02] sm:text-6xl">An integrated approach: engineering, design and management.</h2>
          <ol className="mt-16 grid border-t border-stone-300 md:grid-cols-3">
            {approach.map((item, index) => (
              <Reveal as="li" key={item.title} delay={index * 100} className="border-b border-stone-300 py-10 md:border-b-0 md:border-r md:px-8 md:first:pl-0 md:last:border-r-0">
                <span className="text-xs font-semibold tracking-[0.2em] text-stone-500">{padIndex(index)}</span>
                <h3 className="mt-6 font-display text-4xl">{item.title}</h3>
                <p className="mt-4 leading-relaxed text-stone-600">{item.body}</p>
              </Reveal>
            ))}
          </ol>
          <div className="mt-14 flex flex-wrap gap-4">
            <ButtonLink to="/services" arrow>
              Our services
            </ButtonLink>
            <ButtonLink to="/projects" variant="secondary">
              View projects
            </ButtonLink>
          </div>
        </Container>
      </section>

      <TrustSection />
      <ObjectivesSection />
      <ConsultationCta />
    </>
  )
}
