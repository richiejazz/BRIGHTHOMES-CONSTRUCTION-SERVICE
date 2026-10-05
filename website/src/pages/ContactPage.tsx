import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react'
import { useId, useRef, type KeyboardEvent } from 'react'
import { useSearchParams } from 'react-router-dom'

import { useProject } from '../api/content'
import { AppointmentForm, EnquiryForm, type ProjectContext } from '../components/forms/RequestForms'
import { Container, PageHeader } from '../components/ui/Layout'
import { company } from '../content/company'

const TABS = [
  { id: 'enquiry', label: 'Send an enquiry', intro: 'Tell us about your plans and we’ll respond with next steps.' },
  { id: 'consultation', label: 'Request a consultation', intro: 'Suggest a date that suits you and we’ll confirm a consultation.' },
] as const

type TabId = (typeof TABS)[number]['id']

function ContactDetails() {
  const item = 'flex gap-5 border-b border-stone-300 py-6'
  const icon = 'mt-1 size-5 shrink-0 text-bronze-dark'
  return (
    <address className="not-italic">
      <h2 className="eyebrow text-stone-500">Contact details</h2>
      <ul className="mt-4 border-t border-stone-300">
        <li className={item}>
          <Phone aria-hidden="true" strokeWidth={1.5} className={icon} />
          <div>
            <p className="text-sm text-stone-500">Call us</p>
            {company.phones.map((phone) => (
              <a key={phone.href} href={phone.href} className="block py-1 font-display text-3xl leading-tight transition-colors hover:text-bronze-dark">
                {phone.display}
              </a>
            ))}
          </div>
        </li>
        <li className={item}>
          <Mail aria-hidden="true" strokeWidth={1.5} className={icon} />
          <div className="min-w-0">
            <p className="text-sm text-stone-500">Email</p>
            <a href={`mailto:${company.email}`} className="mt-1 block break-all text-lg font-medium underline decoration-stone-300 underline-offset-4 transition-colors hover:decoration-bronze">
              {company.email}
            </a>
          </div>
        </li>
        <li className={item}>
          <MapPin aria-hidden="true" strokeWidth={1.5} className={icon} />
          <div>
            <p className="text-sm text-stone-500">Visit</p>
            <p className="mt-1 text-lg leading-relaxed">
              {company.address.lines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </p>
            <a href={company.address.mapUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex min-h-11 items-center text-sm font-semibold text-bronze-dark underline-offset-4 hover:underline">
              Open in Google Maps <span className="sr-only">(opens in a new tab)</span>
            </a>
          </div>
        </li>
        {company.whatsappUrl && (
          <li className={item}>
            <MessageCircle aria-hidden="true" strokeWidth={1.5} className={icon} />
            <a href={company.whatsappUrl} target="_blank" rel="noreferrer" className="text-lg font-medium hover:text-bronze-dark">
              Chat on WhatsApp <span className="sr-only">(opens in a new tab)</span>
            </a>
          </li>
        )}
      </ul>
    </address>
  )
}

export default function ContactPage() {
  const [params, setParams] = useSearchParams()
  const active: TabId = params.get('type') === 'consultation' ? 'consultation' : 'enquiry'
  const service = params.get('service') ?? ''
  const projectSlug = params.get('project') ?? ''
  const projectQuery = useProject(projectSlug, { enabled: Boolean(projectSlug) })
  const project: ProjectContext | undefined = projectQuery.data ? { id: projectQuery.data.id, title: projectQuery.data.title } : undefined
  const baseId = useId()
  const tabRefs = useRef<Record<TabId, HTMLButtonElement | null>>({ enquiry: null, consultation: null })

  const select = (id: TabId, focus = false) => {
    setParams(
      (current) => {
        const next = new URLSearchParams(current)
        if (id === 'consultation') next.set('type', 'consultation')
        else next.delete('type')
        return next
      },
      { replace: true },
    )
    if (focus) tabRefs.current[id]?.focus()
  }

  const onKeyDown = (event: KeyboardEvent) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
    event.preventDefault()
    const index = TABS.findIndex((tab) => tab.id === active)
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? TABS.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + TABS.length) % TABS.length
    select(TABS[next].id, true)
  }

  const activeTab = TABS.find((tab) => tab.id === active) ?? TABS[0]
  // Wait for project context before rendering the form so it is included in the submission.
  const formReady = !projectSlug || !projectQuery.isPending

  return (
    <>
      <title>Contact — BRIGHTHOMES Construction Service</title>
      <PageHeader eyebrow="Contact" title={<>Let’s talk about <em className="text-bronze-light">your project.</em></>} intro="Send an enquiry or request a consultation. You can also call or email us directly." />
      <section className="py-20 sm:py-28">
        <Container className="grid gap-16 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-4">
            <ContactDetails />
          </div>
          <div className="lg:col-span-7 lg:col-start-6">
            <div role="tablist" aria-label="How would you like to get in touch?" className="grid grid-cols-2 border-b border-stone-300" onKeyDown={onKeyDown}>
              {TABS.map((tab) => {
                const selected = tab.id === active
                return (
                  <button
                    key={tab.id}
                    ref={(node) => {
                      tabRefs.current[tab.id] = node
                    }}
                    type="button"
                    role="tab"
                    id={`${baseId}-${tab.id}-tab`}
                    aria-selected={selected}
                    aria-controls={`${baseId}-panel`}
                    tabIndex={selected ? 0 : -1}
                    onClick={() => select(tab.id)}
                    className={`relative -mb-px min-h-14 border-b-2 pb-4 text-left text-base font-semibold transition-colors sm:text-lg ${selected ? 'border-ink text-ink' : 'border-transparent text-stone-500 hover:text-ink'}`}
                  >
                    {tab.label}
                  </button>
                )
              })}
            </div>
            <div role="tabpanel" id={`${baseId}-panel`} aria-labelledby={`${baseId}-${active}-tab`} className="pt-10">
              <p className="mb-10 text-stone-600">{activeTab.intro}</p>
              {!formReady ? (
                <p role="status" className="text-sm text-stone-500">
                  Loading project details…
                </p>
              ) : active === 'enquiry' ? (
                <EnquiryForm key={`enquiry-${project?.id ?? 'none'}`} project={project} defaultService={service} />
              ) : (
                <AppointmentForm key={`consultation-${project?.id ?? 'none'}`} project={project} defaultService={service} />
              )}
            </div>
          </div>
        </Container>
      </section>
    </>
  )
}
