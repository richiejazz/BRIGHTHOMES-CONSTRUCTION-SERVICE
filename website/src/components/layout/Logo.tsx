import { Link } from 'react-router-dom'

export function LogoMark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true" focusable="false">
      <rect width="32" height="32" fill="none" stroke="currentColor" strokeOpacity="0.35" />
      <path d="M6.5 15.5 16 7l9.5 8.5M9 13.4V25h14V13.4M16 17.5V25" fill="none" stroke="#c9a46a" strokeWidth="1.6" strokeLinecap="square" />
    </svg>
  )
}

export function Logo({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Link to="/" onClick={onNavigate} className="flex items-center gap-3" aria-label="BRIGHTHOMES Construction Service — home">
      <LogoMark className="size-10 shrink-0" />
      <span className="flex flex-col leading-none">
        <span className="text-[1.05rem] font-bold tracking-[0.2em]">BRIGHTHOMES</span>
        <span className="mt-1.5 text-[0.56rem] font-semibold tracking-[0.34em] text-stone-400">CONSTRUCTION SERVICE</span>
      </span>
    </Link>
  )
}
