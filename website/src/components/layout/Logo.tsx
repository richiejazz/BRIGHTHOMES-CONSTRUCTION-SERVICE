import { Link } from 'react-router-dom'

/**
 * Working wordmark (spec §01): a single-line house mark with a 1.4px stroke beside BRIGHTHOMES in
 * Manrope 700, tracked 0.28em. It is a placeholder that respects the brand name until a final logo
 * is supplied. Both parts use currentColor, so the mark follows the bar it sits on.
 */
export function LogoMark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 28" className={className} aria-hidden="true" focusable="false">
      <path
        d="M3.5 12.2 14 3.6l10.5 8.6V25H3.5V12.2ZM9 25v-8.5h10V25M14 16.5V25"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="miter"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

export function Logo({ onNavigate, className = '' }: { onNavigate?: () => void; className?: string }) {
  return (
    <Link to="/" onClick={onNavigate} className={`inline-flex min-h-11 items-center gap-3 ${className}`} aria-label="BRIGHTHOMES Construction Service — home">
      <LogoMark className="size-7 shrink-0" />
      <span className="flex flex-col leading-none whitespace-nowrap">
        <span className="text-[13px] font-bold tracking-[0.28em]">BRIGHTHOMES</span>
        <span className="mt-[5px] text-[7.5px] font-medium tracking-[0.32em] whitespace-nowrap opacity-75">CONSTRUCTION SERVICE</span>
      </span>
    </Link>
  )
}
