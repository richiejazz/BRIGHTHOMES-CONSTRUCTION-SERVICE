import { useTheme } from '../../context/useTheme'

// Development-only reference sheet for the Design Specification v1.0 website tokens. It is routed
// only when import.meta.env.DEV is true, so it never ships in a production build.

const swatches: Array<{ token: string; role: string }> = [
  { token: 'bg', role: 'Page background' },
  { token: 'paper', role: 'Raised panels, forms, aside' },
  { token: 'stone', role: 'Alternate sections, placeholders' },
  { token: 'line', role: 'Hairlines, dividers' },
  { token: 'line2', role: 'Input underline, outline buttons' },
  { token: 'ink', role: 'Text, primary button' },
  { token: 'ink2', role: 'Secondary text' },
  { token: 'mute', role: 'Metadata, captions' },
  { token: 'bronze', role: 'Section numbers, focus, saved' },
  { token: 'bronze2', role: 'Hero rule, accents on dark' },
  { token: 'band', role: 'Track record, footer, ribbon' },
  { token: 'band-ink', role: 'Text on band' },
  { token: 'ok', role: 'Available' },
  { token: 'danger', role: 'Errors' },
]

function Swatch({ token, role }: { token: string; role: string }) {
  const value = getComputedStyle(document.documentElement).getPropertyValue(`--${token}`).trim()
  return (
    <div>
      <div className="h-16 border border-line" style={{ background: `var(--${token})` }} />
      <p className="mt-2 text-[13px] font-semibold text-ink">--{token}</p>
      <p className="font-mono text-[12px] text-mute">{value}</p>
      <p className="text-[12px] text-mute">{role}</p>
    </div>
  )
}

export default function DesignTokensPage() {
  const { theme, toggleTheme } = useTheme()
  return (
    <div className="container-page py-16">
      <div className="flex flex-wrap items-end justify-between gap-6 border-b border-ink pb-6">
        <div>
          <p className="label text-bronze">Design system · v1.0 · {theme}</p>
          <h1 className="mt-3 font-display text-page-title font-medium">Tokens</h1>
        </div>
        <button type="button" onClick={toggleTheme} className="h-[54px] bg-ink px-[30px] text-button font-semibold uppercase text-bg">
          Switch to {theme === 'dark' ? 'light' : 'dark'}
        </button>
      </div>

      {/* key forces a re-read of computed values after the theme changes. */}
      <section key={theme} className="mt-12 grid grid-cols-2 gap-6 phone:grid-cols-4 desk:grid-cols-7">
        {swatches.map((swatch) => <Swatch key={swatch.token} {...swatch} />)}
      </section>

      <section className="mt-16 space-y-6 border-t border-line pt-10">
        <p className="label text-mute">(04) Typography</p>
        <p className="font-display text-hero font-medium">Building Dreams, <em className="font-normal text-bronze">Constructing Reality.</em></p>
        <p className="font-display text-section font-medium">Work, <em className="font-normal">in detail.</em></p>
        <p className="font-display text-statement font-medium text-ink">We design, approve, build and sell.</p>
        <p className="font-display text-figure font-medium">40<span className="text-bronze">+</span></p>
        <p className="font-display text-detail-price font-medium">Price on request</p>
        <p className="max-w-2xl text-lead text-ink2">Lead — Manrope 400, 16–19px, line-height 1.65. Introductions to pages and sections.</p>
        <p className="max-w-2xl text-body text-ink2">Body — Manrope 400, 15px, line-height 1.6. Descriptions and paragraphs.</p>
        <p className="label text-mute">(03) Services — label 11px / 600 / 0.20em</p>
      </section>

      <section className="mt-16 grid gap-6 border-t border-line pt-10 desk:grid-cols-3">
        <div className="bg-paper p-6">
          <p className="label text-mute">Paper band</p>
        </div>
        <div className="bg-stone p-6">
          <p className="label text-mute">Stone band</p>
        </div>
        <div className="bg-band p-6 text-band-ink">
          <p className="label">Charcoal band</p>
        </div>
        <div className="skeleton h-40 desk:col-span-2" aria-busy="true" aria-label="Loading example" />
        <a href="#focus" className="self-start text-button font-semibold uppercase underline decoration-line2 underline-offset-[7px]">
          Focus ring — tab to me
        </a>
      </section>
    </div>
  )
}
