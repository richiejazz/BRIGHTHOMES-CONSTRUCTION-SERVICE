import { AchievementStats } from '../components/achievements/AchievementStats'
import { ConsultationCta, TrustSection } from '../components/sections/CompanySections'
import { ButtonLink } from '../components/ui/Button'
import { Container, PageHeader } from '../components/ui/Layout'

export default function AchievementsPage() {
  return (
    <>
      <title>Achievements — BRIGHTHOMES Construction Service</title>
      <PageHeader eyebrow="Achievements" title={<>A record measured in <em className="text-bronze-light">buildings delivered.</em></>} intro="Residential and commercial work completed with full CAC and regulatory compliance." />
      <section aria-label="Company achievements" className="py-24 sm:py-32">
        <Container>
          <AchievementStats tone="light" />
          <div className="mt-16 flex flex-wrap gap-4">
            <ButtonLink to="/projects" arrow>
              Explore projects
            </ButtonLink>
            <ButtonLink to="/about" variant="secondary">
              About BRIGHTHOMES
            </ButtonLink>
          </div>
        </Container>
      </section>
      <div className="bg-bone">
        <TrustSection />
      </div>
      <ConsultationCta />
    </>
  )
}
