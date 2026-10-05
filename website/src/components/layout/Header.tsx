import { Menu, UserRound, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'

import { company, primaryNav } from '../../content/company'
import { useAuth } from '../../context/useAuth'
import { ButtonLink } from '../ui/Button'
import { Modal } from '../ui/Modal'
import { Logo } from './Logo'
import { padIndex } from '../../lib/format'

function AccountLink({ className = '', onNavigate }: { className?: string; onNavigate?: () => void }) {
  const { status } = useAuth()
  const signedIn = status === 'authenticated'
  return (
    <Link to={signedIn ? '/account' : '/login'} onClick={onNavigate} className={`inline-flex min-h-11 items-center gap-2 text-sm font-semibold tracking-[0.04em] text-stone-300 transition-colors hover:text-paper ${className}`}>
      <UserRound aria-hidden="true" className="size-4" />
      {signedIn ? 'My account' : 'Sign in'}
    </Link>
  )
}

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close the drawer whenever the route changes (including browser back/forward).
  const [lastPath, setLastPath] = useState(pathname)
  if (pathname !== lastPath) {
    setLastPath(pathname)
    setMenuOpen(false)
  }

  const close = () => setMenuOpen(false)

  return (
    <header className={`fixed inset-x-0 top-0 z-50 text-paper transition-[background-color,border-color] duration-500 ${scrolled ? 'border-b border-graphite/80 bg-ink/95 backdrop-blur-md' : 'border-b border-transparent bg-transparent'}`}>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:bg-paper focus:px-4 focus:py-3 focus:text-ink">
        Skip to content
      </a>
      <div className={`mx-auto flex max-w-[1360px] items-center justify-between gap-6 px-5 transition-[height] duration-500 sm:px-8 lg:px-12 ${scrolled ? 'h-18' : 'h-22'}`}>
        <Logo />
        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-8 xl:gap-10">
            {primaryNav.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `relative py-2 text-sm font-medium tracking-[0.06em] transition-colors after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:bg-bronze-light after:transition-transform after:duration-300 ${isActive ? 'text-paper after:scale-x-100' : 'text-stone-300 after:scale-x-0 hover:text-paper hover:after:scale-x-100'}`
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="hidden items-center gap-6 lg:flex">
          <AccountLink />
          <ButtonLink to="/contact" variant="accent">
            Start a project
          </ButtonLink>
        </div>
        <button type="button" className="-mr-2 inline-flex size-11 items-center justify-center lg:hidden" aria-label="Open menu" aria-expanded={menuOpen} aria-haspopup="dialog" onClick={() => setMenuOpen(true)}>
          <Menu aria-hidden="true" className="size-6" />
        </button>
      </div>

      <Modal open={menuOpen} onClose={close} label="Site menu" className="h-dvh w-full bg-ink text-paper">
        <div className="blueprint-grid flex min-h-dvh flex-col px-5 pb-10 sm:px-8">
          <div className="flex h-22 items-center justify-between">
            <Logo onNavigate={close} />
            <button type="button" className="-mr-2 inline-flex size-11 items-center justify-center" aria-label="Close menu" onClick={close}>
              <X aria-hidden="true" className="size-6" />
            </button>
          </div>
          <nav aria-label="Primary" className="mt-6 flex-1">
            <ol className="border-t border-graphite">
              {primaryNav.map((item, index) => (
                <li key={item.to} className="animate-rise border-b border-graphite" style={{ animationDelay: `${60 + index * 45}ms` }}>
                  <NavLink to={item.to} end={item.to === '/'} onClick={close} className={({ isActive }) => `flex items-baseline gap-5 py-4 font-display text-4xl sm:text-5xl ${isActive ? 'text-bronze-light' : 'text-paper'}`}>
                    <span className="font-sans text-xs tracking-[0.2em] text-stone-500">{padIndex(index)}</span>
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ol>
          </nav>
          <div className="mt-10 space-y-6">
            <ButtonLink to="/contact" variant="accent" size="lg" arrow className="w-full" onClick={close}>
              Start a project
            </ButtonLink>
            <AccountLink onNavigate={close} />
            <div className="space-y-1 text-sm text-stone-400">
              {company.phones.map((phone) => (
                <a key={phone.href} href={phone.href} className="block py-1 hover:text-paper">
                  {phone.display}
                </a>
              ))}
              <a href={`mailto:${company.email}`} className="block break-all py-1 hover:text-paper">
                {company.email}
              </a>
            </div>
          </div>
        </div>
      </Modal>
    </header>
  )
}
