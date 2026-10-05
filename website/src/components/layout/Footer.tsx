import { Link } from 'react-router-dom'

import { company, primaryNav } from '../../content/company'
import { Container } from '../ui/Layout'
import { Logo } from './Logo'

export function Footer() {
  return (
    <footer className="bg-ink text-paper">
      <Container>
        <div className="grid gap-14 border-b border-graphite py-16 sm:py-20 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <Logo />
            <p className="mt-8 max-w-sm font-display text-3xl leading-tight text-paper">{company.tagline}</p>
          </div>
          <nav aria-label="Footer" className="lg:col-span-2">
            <p className="eyebrow text-stone-500">Explore</p>
            <ul className="mt-5 space-y-1">
              {primaryNav.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="inline-block py-1.5 text-stone-300 transition-colors hover:text-paper">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <address className="not-italic lg:col-span-5">
            <p className="eyebrow text-stone-500">Contact</p>
            <div className="mt-5 grid gap-8 sm:grid-cols-2">
              <div className="space-y-1">
                {company.phones.map((phone) => (
                  <a key={phone.href} href={phone.href} className="block py-1 text-lg text-paper transition-colors hover:text-bronze-light">
                    {phone.display}
                  </a>
                ))}
                <a href={`mailto:${company.email}`} className="block break-all py-1 text-stone-300 transition-colors hover:text-paper">
                  {company.email}
                </a>
              </div>
              <a href={company.address.mapUrl} target="_blank" rel="noreferrer" className="block leading-relaxed text-stone-300 transition-colors hover:text-paper">
                {company.address.lines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
                <span className="mt-2 block text-sm text-bronze-light">
                  View on map <span className="sr-only">(opens in a new tab)</span>
                </span>
              </a>
            </div>
          </address>
        </div>
        <div className="flex flex-col gap-3 py-8 text-xs tracking-[0.08em] text-stone-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {company.name}
          </p>
          <p>Architectural drawings on this site are illustrative.</p>
        </div>
      </Container>
    </footer>
  )
}
