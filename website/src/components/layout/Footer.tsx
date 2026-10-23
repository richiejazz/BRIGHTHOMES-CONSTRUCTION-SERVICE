import { Link } from 'react-router-dom'

import { company, footerNav } from '../../content/company'
import { routes } from '../../lib/routes'

/**
 * Footer (spec §05 and the W-01 footer frame): on the charcoal band, the tagline with its italic
 * completion and the consultation CTA; Explore links, both phone numbers, email and the office
 * address; closing with a full-width BRIGHTHOMES wordmark.
 */
export function Footer() {
  return (
    <footer className="bg-band text-band-ink">
      <div className="container-page">
        <div className="grid-editorial gap-y-14 pt-[clamp(64px,8vw,112px)] pb-14">
          <div className="desk:col-span-12 wide:col-span-4">
            <p className="font-display text-[clamp(32px,3vw,44px)] leading-[1.05] font-medium tracking-[-0.015em]">
              Building Dreams,
              <br />
              <em className="font-normal text-band-accent">Constructing Reality.</em>
            </p>
            <Link to={routes.consultation()} className="btn btn-on-band mt-9">
              Request a consultation
            </Link>
          </div>

          <nav aria-label="Footer" className="desk:col-span-4 wide:col-span-2 wide:col-start-6">
            <h2 className="label text-band-mute">Explore</h2>
            <ul className="mt-5">
              {footerNav.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="inline-flex min-h-9 items-center text-[14px] transition-colors hover:text-band-accent">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="desk:col-span-4 wide:col-span-3">
            <h2 className="label text-band-mute">Contact</h2>
            <ul className="mt-5">
              {company.phones.map((phone) => (
                <li key={phone.href}>
                  <a href={phone.href} className="inline-flex min-h-9 items-center text-[14px] transition-colors hover:text-band-accent">
                    {phone.display}
                  </a>
                </li>
              ))}
              <li>
                <a href={`mailto:${company.email}`} className="inline-block py-2 text-[14px] leading-[1.45] transition-colors hover:text-band-accent">
                  {/* Break before the @ (as in the W-01 footer) rather than mid-word. */}
                  {company.email.split('@')[0]}
                  <wbr />@{company.email.split('@')[1]}
                </a>
              </li>
            </ul>
          </div>

          <address className="not-italic desk:col-span-4 wide:col-span-2">
            <h2 className="label text-band-mute">Office</h2>
            <a href={company.address.mapUrl} target="_blank" rel="noreferrer" className="mt-5 block text-[14px] leading-[1.7] transition-colors hover:text-band-accent">
              {company.address.lines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
              <span className="sr-only">(opens a map in a new tab)</span>
            </a>
          </address>
        </div>

        <div className="border-t border-band-ink/15 pt-[clamp(32px,4vw,56px)]">
          <Wordmark />
        </div>

        <div className="flex flex-col gap-2 py-7 text-[12px] text-band-mute phone:flex-row phone:items-center phone:justify-between">
          <p>
            © {new Date().getFullYear()} BRIGHTHOMES Construction Service
          </p>
          <p>Images and listings marked “Illustrative” are placeholders.</p>
          <p>CAC &amp; regulatory compliant</p>
        </div>
      </div>
    </footer>
  )
}

/** Full-width wordmark: an SVG stretches the word to the container width at every breakpoint. */
function Wordmark() {
  return (
    <svg viewBox="0 0 1000 136" className="block h-auto w-full" aria-hidden="true" focusable="false">
      <text x="0" y="122" textLength="1000" lengthAdjust="spacingAndGlyphs" fill="currentColor" fontFamily="Manrope, system-ui, sans-serif" fontWeight="700" fontSize="166">
        BRIGHTHOMES
      </text>
    </svg>
  )
}
