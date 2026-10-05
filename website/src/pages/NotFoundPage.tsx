import { HeroElevation } from '../components/art/Elevations'
import { ButtonLink } from '../components/ui/Button'
import { Container } from '../components/ui/Layout'

type NotFoundPageProps = { title?: string; message?: string }

export default function NotFoundPage({ title = 'This page isn’t on the drawings.', message = 'The page you’re looking for may have moved, or the link may be incorrect.' }: NotFoundPageProps) {
  return (
    <section className="relative isolate flex min-h-[85svh] items-center overflow-hidden bg-ink pb-20 pt-36 text-paper">
      <title>Page not found — BRIGHTHOMES Construction Service</title>
      <div className="blueprint-grid absolute inset-0 -z-20" aria-hidden="true" />
      <HeroElevation className="absolute inset-0 -z-10 size-full opacity-25" />
      <Container>
        <p className="eyebrow text-bronze-light">Error 404</p>
        <h1 className="mt-6 max-w-3xl animate-rise font-display text-[3rem] leading-[0.98] sm:text-7xl">{title}</h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-stone-300">{message}</p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:gap-4">
          <ButtonLink to="/" variant="accent" size="lg" arrow>
            Back to home
          </ButtonLink>
          <ButtonLink to="/projects" variant="inverse" size="lg">
            Explore projects
          </ButtonLink>
          <ButtonLink to="/contact" variant="inverse" size="lg">
            Contact us
          </ButtonLink>
        </div>
      </Container>
    </section>
  )
}
