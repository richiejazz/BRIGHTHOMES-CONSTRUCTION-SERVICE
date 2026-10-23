import { ArrowUpRight } from 'lucide-react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'

import { useProject } from '../api/content'
import { EnquiryForm } from '../components/forms/RequestForms'
import { BAR_OFFSET, Em } from '../components/ui/Layout'
import { company } from '../content/company'
import { routes } from '../lib/routes'

function Details() {
  return (
    <address className="not-italic">
      <div className="border-t border-line py-6">
        <p className="label text-[10px] text-mute">Call</p>
        {company.phones.map((phone) => (
          <a key={phone.href} href={phone.href} className="mt-2 block font-display text-[26px] leading-[1.2] transition-colors hover:text-bronze">
            {phone.display}
          </a>
        ))}
      </div>
      <div className="border-t border-line py-6">
        <p className="label text-[10px] text-mute">Email</p>
        <a href={`mailto:${company.email}`} className="mt-2 block text-[15px] transition-colors hover:text-bronze">
          {company.email.split('@')[0]}
          <wbr />@{company.email.split('@')[1]}
        </a>
      </div>
      <div className="border-t border-line py-6">
        <p className="label text-[10px] text-mute">Office</p>
        <p className="mt-2 text-[15px] leading-[1.6]">
          {company.address.lines.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </p>
        <a href={company.address.mapUrl} target="_blank" rel="noreferrer" className="text-link mt-3">
          Open in Google Maps <ArrowUpRight aria-hidden="true" className="size-4" strokeWidth={1.5} />
          <span className="sr-only">(opens in a new tab)</span>
        </a>
      </div>
    </address>
  )
}

/** W-11: call / email / office column and the enquiry form, with an inline "Message sent" state. */
export default function ContactPage() {
  const [params] = useSearchParams()
  const projectSlug = params.get('project') ?? ''
  const project = useProject(projectSlug, { enabled: Boolean(projectSlug) })

  // Old consultation links (/contact?type=consultation&…) now live on /consultation.
  if (params.get('type') === 'consultation') {
    const next = new URLSearchParams(params)
    next.delete('type')
    const search = next.toString()
    return <Navigate to={`/consultation${search ? `?${search}` : ''}`} replace />
  }

  const formReady = !projectSlug || !project.isPending
  return (
    <>
      <title>Contact — BRIGHTHOMES Construction Service</title>
      <section className={`container-page ${BAR_OFFSET} pb-section`}>
        <p className="label text-mute">BRIGHTHOMES / Contact</p>
        <h1 className="mt-6 font-display text-page-title font-medium">
          Let’s <Em>talk.</Em>
        </h1>
        <div className="grid-editorial mt-[clamp(40px,5vw,80px)] gap-y-12">
          <div className="desk:col-span-4">
            <Details />
          </div>
          <div className="border-t border-line pt-8 desk:col-span-7 desk:col-start-6">
            <p className="mb-8 max-w-md text-[15px] leading-[1.6] text-ink2">
              Send a message about a build, a property or a question. For a full consultation, use the <Link to={routes.consultation()} className="underline decoration-control-line underline-offset-4 hover:text-bronze">consultation request</Link>.
            </p>
            {formReady ? (
              <EnquiryForm showService context={{ serviceSlug: params.get('service') ?? undefined, project: project.data ? { id: project.data.id, title: project.data.title } : undefined }} defaultMessage={project.data ? `Hello, I’d like to discuss a project similar to ${project.data.title}.` : ''} />
            ) : (
              <p role="status" className="text-[13px] text-ink2">
                Loading project details…
              </p>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
