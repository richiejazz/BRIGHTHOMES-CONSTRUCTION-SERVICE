import { useAchievements } from '../../api/content'
import { Reveal } from '../ui/Reveal'
import { EmptyState, ErrorState, LoadingAnnouncement, Skeleton } from '../ui/States'

/** The verified company achievements, served by the API and set as large editorial figures. */
export function AchievementStats({ tone = 'dark' }: { tone?: 'light' | 'dark' }) {
  const achievements = useAchievements()
  const dark = tone === 'dark'
  const rule = dark ? 'border-graphite' : 'border-stone-300'

  if (achievements.isPending) {
    return (
      <div className={`grid border-t md:grid-cols-3 ${rule}`}>
        <LoadingAnnouncement label="Loading achievements" />
        {[0, 1, 2].map((index) => (
          <div key={index} className={`border-b py-10 md:border-b-0 md:border-r md:px-8 md:first:pl-0 md:last:border-r-0 ${rule}`}>
            <Skeleton className={`h-24 w-40 ${dark ? 'bg-graphite' : ''}`} />
            <Skeleton className={`mt-6 h-4 w-48 ${dark ? 'bg-graphite' : ''}`} />
          </div>
        ))}
      </div>
    )
  }
  if (achievements.isError) return <ErrorState error={achievements.error} onRetry={() => void achievements.refetch()} tone={tone} />
  if (achievements.data.length === 0) return <EmptyState tone={tone} title="Achievements will be published soon." />

  return (
    <dl className={`grid border-t md:grid-cols-3 ${rule}`}>
      {achievements.data.map((achievement, index) => (
        <Reveal key={achievement.id} delay={index * 120} className={`flex flex-col-reverse border-b py-10 md:border-b-0 md:border-r md:px-8 md:py-4 md:first:pl-0 md:last:border-r-0 ${rule}`}>
          <dt className={`mt-5 max-w-[16rem] text-base font-medium leading-snug ${dark ? 'text-stone-300' : 'text-stone-600'}`}>
            {achievement.label}
            {achievement.description && <span className="mt-2 block text-sm font-normal text-stone-500">{achievement.description}</span>}
          </dt>
          <dd className={`font-display text-[5.5rem] leading-[0.85] tracking-[-0.03em] sm:text-[7rem] lg:text-[8.5rem] ${dark ? 'text-paper' : 'text-ink'}`}>
            {achievement.value}
          </dd>
        </Reveal>
      ))}
    </dl>
  )
}
