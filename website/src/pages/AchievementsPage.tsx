import { useAchievements } from '../api/content'
import { Media } from '../components/media/Media'
import { ConsultationCta } from '../components/sections/ConsultationCta'
import { BAR_OFFSET, Em } from '../components/ui/Layout'
import { Reveal } from '../components/ui/Reveal'
import { EmptyState, ErrorState, LoadingAnnouncement, Skeleton } from '../components/ui/States'
import { editorial, type EditorialImage } from '../content/media'
import { splitFigure } from '../lib/format'

const IMAGES: EditorialImage[] = [editorial.realEstate, editorial.cranes, editorial.drafting]

/** W-10: each verified figure paired with an image, alternating sides. Figures come only from the API. */
export default function AchievementsPage() {
  const achievements = useAchievements()
  return (
    <>
      <title>Achievements — BRIGHTHOMES Construction Service</title>
      <header className={`container-page ${BAR_OFFSET} pb-[clamp(32px,4vw,64px)]`}>
        <p className="label text-mute">BRIGHTHOMES / Achievements</p>
        <h1 className="mt-6 border-b border-line pb-[clamp(32px,4vw,56px)] font-display text-page-title font-medium">
          Track <Em>record</Em>
        </h1>
      </header>

      <section className="container-page pb-section" aria-busy={achievements.isPending}>
        {achievements.isPending ? (
          <div className="space-y-16">
            <LoadingAnnouncement label="Loading achievements" />
            {[0, 1].map((index) => (
              <div key={index} className="grid-editorial items-end">
                <Skeleton className="h-40 desk:col-span-5" />
                <Skeleton className="aspect-[4/3] desk:col-span-6 desk:col-start-7" />
              </div>
            ))}
          </div>
        ) : achievements.isError ? (
          <ErrorState title="We couldn’t load our track record." error={achievements.error} onRetry={() => void achievements.refetch()} />
        ) : achievements.data.length === 0 ? (
          <EmptyState title="Our track record is being updated." />
        ) : (
          <ol className="space-y-[clamp(72px,9vw,144px)]">
            {achievements.data.map((achievement, index) => {
              const [number, suffix] = splitFigure(achievement.value)
              const image = IMAGES[index % IMAGES.length]
              const flip = index % 2 === 1
              return (
                <li key={achievement.id} className="grid-editorial items-end gap-y-8">
                  <Reveal className={`desk:col-span-5 ${flip ? 'desk:order-2 desk:col-start-8' : ''}`}>
                    <p className="font-display text-figure font-medium [font-variant-numeric:lining-nums]">
                      {number}
                      <span className="text-bronze">{suffix}</span>
                    </p>
                    <p className="mt-5 max-w-[18rem] text-[16px] font-medium">{achievement.label}</p>
                    {achievement.description && <p className="mt-3 max-w-sm text-[14px] leading-[1.6] text-ink2">{achievement.description}</p>}
                  </Reveal>
                  <Reveal className={`desk:col-span-6 ${flip ? 'desk:order-1 desk:col-start-1' : 'desk:col-start-7'}`} delay={120}>
                    <Media src={image.src} alt={image.alt} aspect="aspect-[4/3]" illustrative sizes="(min-width: 980px) 50vw, 100vw" />
                  </Reveal>
                </li>
              )
            })}
          </ol>
        )}
      </section>
      <ConsultationCta />
    </>
  )
}
