import { ButtonLink } from '../components/ui/Button'
import { BAR_OFFSET } from '../components/ui/Layout'
import { routes } from '../lib/routes'

type NotFoundPageProps = { title?: string; message?: string }

export default function NotFoundPage({ title = 'This page isn’t on the drawings.', message = 'The page you’re looking for may have moved, or the link may be incorrect.' }: NotFoundPageProps) {
  return (
    <section className={`container-page min-h-[70svh] ${BAR_OFFSET} pb-section`}>
      <title>Page not found — BRIGHTHOMES Construction Service</title>
      <p className="label text-mute">Error 404</p>
      <h1 className="mt-6 max-w-[14ch] font-display text-[clamp(48px,7vw,104px)] leading-[0.98] font-medium tracking-[-0.015em]">{title}</h1>
      <p className="mt-6 max-w-xl text-[16px] leading-[1.65] text-ink2">{message}</p>
      <div className="mt-10 flex flex-col gap-3 phone:flex-row">
        <ButtonLink to={routes.home} arrow>
          Back to home
        </ButtonLink>
        <ButtonLink to={routes.construction} variant="secondary">
          Construction
        </ButtonLink>
        <ButtonLink to={routes.realEstate} variant="secondary">
          Real Estate
        </ButtonLink>
      </div>
    </section>
  )
}
