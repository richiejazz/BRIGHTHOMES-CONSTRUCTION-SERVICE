import { ArrowLeft, Mail } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { Link, Navigate, NavLink, useLocation, useNavigate, useParams, type Location } from 'react-router-dom'

import { authApi } from '../../api/account'
import { toApiError } from '../../api/errors'
import type { PendingSave } from '../../components/content/SaveButton'
import { contactRules } from '../../lib/forms'
import { Button } from '../../components/ui/Button'
import { FormAlert, TextField } from '../../components/ui/FormField'
import { Em } from '../../components/ui/Layout'
import { useToast } from '../../components/ui/toast-context'
import { editorial, type EditorialImage } from '../../content/media'
import { useAuth } from '../../context/useAuth'
import { routes } from '../../lib/routes'

const EMAIL_RULES = contactRules.email
const PASSWORD_RULES = { required: 'Please choose a password.', minLength: { value: 8, message: 'Use at least 8 characters.' } }

type AuthState = { from?: Location; pendingSave?: PendingSave } | null

/** Where to go after signing in: back to the page that required it (with any pending save), or the account. */
function useReturn() {
  const location = useLocation()
  const state = location.state as AuthState
  const from = state?.from
  return {
    path: from ? `${from.pathname}${from.search}${from.hash}` : routes.account.overview,
    state: state?.pendingSave ? { pendingSave: state.pendingSave } : undefined,
    passOn: location.state,
  }
}

/** W-13 split layout: architecture image with a caption, form on the right; stacks below 980px. */
function AuthShell({ image, caption, children }: { image: EditorialImage; caption: string; children: ReactNode }) {
  return (
    <div className="grid min-h-[100svh] desk:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-band desk:block">
        <img src={image.src} alt={image.alt} className="absolute inset-0 size-full object-cover" />
        <div aria-hidden="true" className="scrim-auth absolute inset-0" />
        <p className="label absolute top-[104px] left-[var(--gutter)] flex items-center gap-3 text-photo-ink">
          <span aria-hidden="true" className="h-px w-8 bg-current" /> Client account
        </p>
        <p className="absolute right-[var(--gutter)] bottom-[clamp(40px,5vw,72px)] left-[var(--gutter)] max-w-[22ch] font-display text-[clamp(30px,2.8vw,40px)] leading-[1.1] text-photo-ink">{caption}</p>
        {image.illustrative && <span className="label absolute right-4 bottom-3 text-[10px] text-photo-ink/75">Illustrative image</span>}
      </div>
      <div className="flex items-center px-[var(--gutter)] pt-[calc(72px+40px)] pb-16 desk:px-[clamp(40px,6vw,104px)]">
        <div className="w-full max-w-[440px]">{children}</div>
      </div>
    </div>
  )
}

function AuthTabs() {
  const location = useLocation()
  const tab = 'label inline-flex min-h-11 items-center border-b pb-1 text-[11px] transition-colors'
  return (
    <nav aria-label="Account" className="mb-10 flex gap-8">
      <NavLink to={routes.login} state={location.state} className={({ isActive }) => `${tab} ${isActive ? 'border-ink text-ink' : 'border-transparent text-ink2 hover:text-ink'}`}>
        Sign in
      </NavLink>
      <NavLink to={routes.register} state={location.state} className={({ isActive }) => `${tab} ${isActive ? 'border-ink text-ink' : 'border-transparent text-ink2 hover:text-ink'}`}>
        Create account
      </NavLink>
    </nav>
  )
}

export function LoginPage() {
  const { login, status } = useAuth()
  const navigate = useNavigate()
  const back = useReturn()
  const notify = useToast()
  const [formError, setFormError] = useState<{ title?: string; message: string }>()
  const { register, handleSubmit, formState } = useForm<{ email: string; password: string }>({ defaultValues: { email: '', password: '' } })

  if (status === 'authenticated' && !formState.isSubmitting) return <Navigate to={back.path} replace state={back.state} />

  const onSubmit = handleSubmit(async ({ email, password }) => {
    setFormError(undefined)
    try {
      const user = await login(email.trim(), password)
      notify({ tone: 'success', title: `Welcome back${user.first_name ? `, ${user.first_name}` : ''}.` })
      navigate(back.path, { replace: true, state: back.state })
    } catch (error) {
      const apiError = toApiError(error)
      // §21: never reveal whether it was the email or the password.
      setFormError(apiError.kind === 'unauthorized' ? { title: 'That email and password don’t match.', message: 'Check them and try again, or reset your password.' } : { message: apiError.message })
    }
  })

  return (
    <AuthShell image={editorial.realEstate} caption="Your projects, properties and requests — in one place.">
      <title>Sign in — BRIGHTHOMES Construction Service</title>
      <AuthTabs />
      <h1 className="font-display text-[clamp(40px,4vw,56px)] leading-[1] font-medium">
        Welcome <Em>back.</Em>
      </h1>
      <p className="mt-3 text-[14px] leading-[1.6] text-ink2">Sign in to see your saved items, enquiries and consultation requests.</p>
      <form noValidate onSubmit={onSubmit} className="mt-9 space-y-7" aria-label="Sign in">
        {formError && <FormAlert title={formError.title} message={formError.message} />}
        <TextField label="Email" type="email" autoComplete="email" error={formState.errors.email?.message} registration={register('email', EMAIL_RULES)} />
        <TextField label="Password" type="password" autoComplete="current-password" error={formState.errors.password?.message} registration={register('password', { required: 'Please enter your password.' })} />
        <div className="flex justify-end">
          <Link to={routes.forgotPassword} className="text-[13px] text-bronze underline decoration-control-line underline-offset-4 hover:decoration-bronze">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" loading={formState.isSubmitting} className="w-full">
          {formState.isSubmitting ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </AuthShell>
  )
}

type RegisterValues = { first_name: string; last_name: string; email: string; phone: string; password: string; confirm: string }

export function RegisterPage() {
  const { register: createAccount, status } = useAuth()
  const navigate = useNavigate()
  const back = useReturn()
  const notify = useToast()
  const [formError, setFormError] = useState<string>()
  const { register, handleSubmit, formState, setError, getValues } = useForm<RegisterValues>({ defaultValues: { first_name: '', last_name: '', email: '', phone: '', password: '', confirm: '' } })

  if (status === 'authenticated' && !formState.isSubmitting) return <Navigate to={back.path} replace state={back.state} />

  const onSubmit = handleSubmit(async ({ confirm: _confirm, ...values }) => {
    setFormError(undefined)
    try {
      await createAccount({ ...values, email: values.email.trim(), first_name: values.first_name.trim(), last_name: values.last_name.trim(), phone: values.phone.trim() })
      notify({ tone: 'success', title: 'Your account is ready.', description: 'You’re now signed in.' })
      navigate(back.path, { replace: true, state: back.state })
    } catch (error) {
      const apiError = toApiError(error)
      const fields: (keyof RegisterValues)[] = ['first_name', 'last_name', 'email', 'phone', 'password']
      let matched = false
      for (const [field, message] of Object.entries(apiError.fieldErrors)) {
        if (fields.includes(field as keyof RegisterValues)) {
          setError(field as keyof RegisterValues, { type: 'server', message })
          matched = true
        }
      }
      setFormError(matched && apiError.kind === 'validation' ? 'Please complete the highlighted fields.' : apiError.message)
    }
  })

  return (
    <AuthShell image={editorial.facade} caption="Save properties and projects, and follow every request.">
      <title>Create an account — BRIGHTHOMES Construction Service</title>
      <AuthTabs />
      <h1 className="font-display text-[clamp(40px,4vw,56px)] leading-[1] font-medium">
        Create your <Em>account.</Em>
      </h1>
      <p className="mt-3 text-[14px] leading-[1.6] text-ink2">Free for BRIGHTHOMES clients and anyone planning to build or buy.</p>
      <form noValidate onSubmit={onSubmit} className="mt-9 space-y-7" aria-label="Create an account">
        <div className="grid gap-7 phone:grid-cols-2">
          <TextField label="First name" autoComplete="given-name" error={formState.errors.first_name?.message} registration={register('first_name', { required: 'Enter your first name.', maxLength: { value: 150, message: 'Use 150 characters or fewer.' } })} />
          <TextField label="Last name" autoComplete="family-name" error={formState.errors.last_name?.message} registration={register('last_name', { required: 'Enter your last name.', maxLength: { value: 150, message: 'Use 150 characters or fewer.' } })} />
        </div>
        <TextField label="Email" type="email" autoComplete="email" placeholder="you@example.com" error={formState.errors.email?.message} registration={register('email', EMAIL_RULES)} />
        <TextField label="Phone" type="tel" autoComplete="tel" placeholder="+234 or international number" optional error={formState.errors.phone?.message} registration={register('phone', contactRules.phone)} />
        <TextField label="Password" type="password" autoComplete="new-password" placeholder="At least 8 characters" error={formState.errors.password?.message} registration={register('password', PASSWORD_RULES)} />
        <TextField label="Confirm password" type="password" autoComplete="new-password" error={formState.errors.confirm?.message} registration={register('confirm', { required: 'Please confirm your password.', validate: (value) => value === getValues('password') || 'The passwords don’t match.' })} />
        <FormAlert message={formError} />
        <Button type="submit" loading={formState.isSubmitting} className="w-full">
          {formState.isSubmitting ? 'Creating account…' : 'Create account'}
        </Button>
      </form>
    </AuthShell>
  )
}

export function ForgotPasswordPage() {
  const notify = useToast()
  const [sentTo, setSentTo] = useState<string>()
  const [formError, setFormError] = useState<string>()
  const { register, handleSubmit, formState } = useForm<{ email: string }>({ defaultValues: { email: '' } })

  const send = async (email: string) => {
    setFormError(undefined)
    try {
      await authApi.requestPasswordReset(email)
      setSentTo(email)
    } catch (error) {
      const apiError = toApiError(error)
      setFormError(apiError.status === 429 ? 'Too many reset requests. Please wait a while and try again.' : apiError.message)
    }
  }

  return (
    <AuthShell image={editorial.cranes} caption="Locked out? It happens. Let’s get you back in.">
      <title>Reset your password — BRIGHTHOMES Construction Service</title>
      <Link to={routes.login} className="text-link mb-10 no-underline">
        <ArrowLeft aria-hidden="true" className="size-4" strokeWidth={1.5} /> Back to sign in
      </Link>
      {sentTo ? (
        <div role="status">
          <span className="flex size-14 items-center justify-center rounded-full bg-stone">
            <Mail aria-hidden="true" className="size-5 text-bronze" strokeWidth={1.5} />
          </span>
          <h1 className="mt-6 font-display text-[clamp(40px,4vw,56px)] leading-[1] font-medium">
            Check your <Em>inbox.</Em>
          </h1>
          {/* §21: the confirmation never reveals whether an account exists. */}
          <p className="mt-4 text-[14px] leading-[1.6] text-ink2">
            If an account exists for <strong className="font-semibold text-ink">{sentTo}</strong>, a reset link is on its way. It’s a one-time link and it expires in 30 minutes.
          </p>
          <FormAlert message={formError} />
          <div className="mt-8 flex flex-col gap-3 phone:flex-row">
            <Link to={routes.login} className="btn btn-primary btn-compact">
              Return to sign in
            </Link>
            <Button
              variant="secondary"
              size="compact"
              onClick={() => {
                void send(sentTo).then(() => notify({ tone: 'info', title: 'If the account exists, another link is on its way.' }))
              }}
            >
              Resend link
            </Button>
          </div>
        </div>
      ) : (
        <>
          <h1 className="font-display text-[clamp(40px,4vw,56px)] leading-[1] font-medium">
            Reset your <Em>password.</Em>
          </h1>
          <p className="mt-3 text-[14px] leading-[1.6] text-ink2">Enter the email for your account and we’ll send a reset link.</p>
          <form noValidate onSubmit={handleSubmit(({ email }) => send(email.trim()))} className="mt-9 space-y-7" aria-label="Reset your password">
            <TextField label="Email" type="email" autoComplete="email" error={formState.errors.email?.message} registration={register('email', EMAIL_RULES)} />
            <FormAlert message={formError} />
            <Button type="submit" loading={formState.isSubmitting} className="w-full">
              {formState.isSubmitting ? 'Sending…' : 'Send reset link'}
            </Button>
          </form>
        </>
      )}
    </AuthShell>
  )
}

export function ResetPasswordPage() {
  const { uid = '', token = '' } = useParams()
  const [done, setDone] = useState(false)
  const [formError, setFormError] = useState<{ message: string; expired: boolean }>()
  const { register, handleSubmit, formState, getValues, setError } = useForm<{ password: string; confirm: string }>({ defaultValues: { password: '', confirm: '' } })

  const onSubmit = handleSubmit(async ({ password }) => {
    setFormError(undefined)
    try {
      await authApi.confirmPasswordReset({ uid, token, password })
      setDone(true)
    } catch (error) {
      const apiError = toApiError(error)
      if (apiError.fieldErrors.password) setError('password', { type: 'server', message: apiError.fieldErrors.password })
      else setFormError({ message: apiError.message, expired: apiError.kind === 'validation' })
    }
  })

  return (
    <AuthShell image={editorial.cranes} caption="Choose a new password and you’re back in.">
      <title>Choose a new password — BRIGHTHOMES Construction Service</title>
      {done ? (
        <div role="status">
          <h1 className="font-display text-[clamp(40px,4vw,56px)] leading-[1] font-medium">
            Password <Em>updated.</Em>
          </h1>
          <p className="mt-4 text-[14px] leading-[1.6] text-ink2">Your password has been reset. Sign in with your new password.</p>
          <Link to={routes.login} className="btn btn-primary mt-8 w-full">
            Sign in
          </Link>
        </div>
      ) : (
        <>
          <h1 className="font-display text-[clamp(40px,4vw,56px)] leading-[1] font-medium">
            Choose a new <Em>password.</Em>
          </h1>
          <p className="mt-3 text-[14px] leading-[1.6] text-ink2">Use at least 8 characters. Avoid common or entirely numeric passwords.</p>
          <form noValidate onSubmit={onSubmit} className="mt-9 space-y-7" aria-label="Choose a new password">
            <TextField label="New password" type="password" autoComplete="new-password" error={formState.errors.password?.message} registration={register('password', PASSWORD_RULES)} />
            <TextField label="Confirm new password" type="password" autoComplete="new-password" error={formState.errors.confirm?.message} registration={register('confirm', { required: 'Please confirm your password.', validate: (value) => value === getValues('password') || 'The passwords don’t match.' })} />
            {formError && (
              <div className="space-y-3">
                <FormAlert message={formError.message} />
                {formError.expired && (
                  <Link to={routes.forgotPassword} className="text-link">
                    Request a new link
                  </Link>
                )}
              </div>
            )}
            <Button type="submit" loading={formState.isSubmitting} className="w-full">
              {formState.isSubmitting ? 'Saving…' : 'Set new password'}
            </Button>
          </form>
        </>
      )}
    </AuthShell>
  )
}
