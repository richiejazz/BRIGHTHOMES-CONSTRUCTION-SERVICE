import { ArrowRight, Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'

import { primaryNav } from '../../content/company'
import { useAuth } from '../../context/useAuth'
import { routes } from '../../lib/routes'
import { Modal } from '../ui/Modal'
import { Logo } from './Logo'
import { ThemeToggle } from './ThemeToggle'

function useAccountLink() {
  const { status } = useAuth()
  return status === 'authenticated' ? { to: routes.account.overview, label: 'My account' } : { to: routes.login, label: 'Sign in' }
}

/**
 * Site top bar (spec §05).
 * - On the home hero the bar is transparent over the photograph with ivory text and an ivory CTA;
 *   once the hero has scrolled away, and on every other page, it is solid --bg with a 1px --line rule.
 * - At 980px and wider: five section links, then theme toggle · Sign in / My account · Request
 *   consultation. Below 980px the links move into a full-screen menu.
 */
export function Header({ overHero = false }: { overHero?: boolean }) {
  const [pastHero, setPastHero] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { pathname } = useLocation()
  const account = useAccountLink()

  useEffect(() => {
    if (!overHero) return
    // The bar turns solid as soon as the page scrolls: transparent ivory text is only legible over the
    // scrim at the top of the hero, not over the brighter parts of the photo below it.
    const onScroll = () => setPastHero(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [overHero])

  // Close the menu whenever the route changes (including browser back/forward).
  const [lastPath, setLastPath] = useState(pathname)
  if (pathname !== lastPath) {
    setLastPath(pathname)
    setMenuOpen(false)
  }

  const transparent = overHero && !pastHero
  const close = () => setMenuOpen(false)

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color,color] duration-[450ms] ${
        transparent ? 'border-transparent bg-transparent text-[#EEE8DD]' : 'border-line bg-bg text-ink'
      }`}
    >
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-10 focus:bg-ink focus:px-4 focus:py-3 focus:text-bg">
        Skip to content
      </a>
      <div className="container-page flex h-[72px] items-center justify-between gap-3 wide:gap-6">
        <Logo />

        <nav aria-label="Primary" className="hidden desk:block">
          <ul className="flex items-center gap-[clamp(12px,calc(2.2vw-8px),36px)]">
            {primaryNav.map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} className="nav-link">
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex shrink-0 items-center gap-1 desk:gap-3 wide:gap-4">
          <ThemeToggle />
          <Link to={account.to} className="nav-link hidden desk:inline-flex">
            {account.label}
          </Link>
          <Link to={routes.consultation()} className={`btn btn-compact hidden px-4 desk:inline-flex wide:px-5 ${transparent ? 'btn-on-photo' : 'btn-primary'}`}>
            Request consultation
          </Link>
          <button type="button" className="icon-btn -mr-2.5 desk:hidden" aria-label="Open menu" aria-expanded={menuOpen} aria-haspopup="dialog" onClick={() => setMenuOpen(true)}>
            <Menu aria-hidden="true" className="size-5" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <MobileMenu open={menuOpen} onClose={close} account={account} />
    </header>
  )
}

/** §05 below 980px: full-screen menu set in 44px Cormorant, with the CTA pinned at the bottom. */
function MobileMenu({ open, onClose, account }: { open: boolean; onClose: () => void; account: { to: string; label: string } }) {
  const items = [...primaryNav, account]
  return (
    <Modal open={open} onClose={onClose} label="Menu" className="h-dvh w-full bg-bg text-ink">
      <div className="container-page flex min-h-dvh flex-col pb-[max(24px,env(safe-area-inset-bottom))]">
        <div className="flex h-[72px] items-center justify-between">
          <p className="label text-mute">Menu</p>
          <button type="button" className="icon-btn -mr-2.5" aria-label="Close menu" onClick={onClose}>
            <X aria-hidden="true" className="size-5" strokeWidth={1.5} />
          </button>
        </div>
        <nav aria-label="Primary" className="mt-4 flex-1">
          <ul>
            {items.map((item, index) => (
              <li key={item.to} className="animate-rise border-b border-line" style={{ animationDelay: `${40 + index * 40}ms` }}>
                <NavLink
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) => `flex min-h-[64px] items-center font-display text-[44px] leading-none font-medium tracking-[-0.015em] ${isActive ? 'text-bronze' : ''}`}
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <Link to={routes.consultation()} onClick={onClose} className="btn btn-primary mt-10 w-full">
          Request consultation
          <ArrowRight aria-hidden="true" className="size-4" strokeWidth={1.5} />
        </Link>
      </div>
    </Modal>
  )
}
