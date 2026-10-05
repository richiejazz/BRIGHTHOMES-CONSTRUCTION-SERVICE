import { useState, type ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { Link, Navigate, useLocation, useNavigate, type Location } from 'react-router-dom'

import { toApiError } from '../../api/errors'
import { Button } from '../../components/ui/Button'
import { FormAlert, TextField } from '../../components/ui/FormField'
import { Container } from '../../components/ui/Layout'
import { useToast } from '../../components/ui/toast-context'
import { useAuth } from '../../context/useAuth'

const EMAIL_RULES = { required: 'Please enter your email address.', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Please enter a valid email address.' } }

/** Where to go after signing in: back to the page that required it, or the account area. */
function useReturnPath() {
  const location = useLocation()
  const from = (location.state as { from?: Location } | null)?.from
  return from ? `${from.pathname}${from.search}${from.hash}` : '/account'
}

function AuthShell({ eyebrow, title, intro, children, aside }: { eyebrow: string; title: string; intro: string; children: ReactNode; aside: ReactNode }) {
  return (
    <>
      <div className="blueprint-grid bg-ink pb-14 pt-36 text-paper sm:pt-40">
        <Container>
          <p className="eyebrow flex items-center gap-3 text-bronze-light">
            <span aria-hidden="true" className="h-px w-8 bg-current" />
            {eyebrow}
          </p>
          <h1 className="mt-5 animate-rise font-display text-5xl leading-none sm:text-7xl">{title}</h1>
          <p className="mt-5 max-w-lg text-stone-300">{intro}</p>
        </Container>
      </div>
      <Container className="grid gap-14 py-16 sm:py-20 lg:grid-cols-12">
        <div className="lg:col-span-6">{children}</div>
        <aside className="border-t border-stone-300 pt-8 text-stone-600 lg:col-span-4 lg:col-start-9 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">{aside}</aside>
      </Container>
    </>
  )
}

export function LoginPage() {
  const { login, status } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const returnPath = useReturnPath()
  const notify = useToast()
  const [formError, setFormError] = useState<string>()
  const { register, handleSubmit, formState } = useForm<{ email: string; password: string }>({ defaultValues: { email: '', password: '' } })

  if (status === 'authenticated' && !formState.isSubmitting) return <Navigate to={returnPath} replace />

  const onSubmit = handleSubmit(async ({ email, password }) => {
    setFormError(undefined)
    try {
      const user = await login(email.trim(), password)
      notify({ tone: 'success', title: `Welcome back${user.first_name ? `, ${user.first_name}` : ''}.` })
      navigate(returnPath, { replace: true })
    } catch (error) {
      const apiError = toApiError(error)
      setFormError(apiError.kind === 'unauthorized' ? 'That email and password combination isn’t recognised.' : apiError.message)
    }
  })

  return (
    <AuthShell
      eyebrow="Client account"
      title="Sign in"
      intro="Access your saved projects, enquiries and consultation requests."
      aside={
        <>
          <p className="font-display text-3xl text-ink">New to BRIGHTHOMES?</p>
          <p className="mt-3 leading-relaxed">Create an account to save projects and keep track of your enquiries and consultation requests.</p>
          <Link to="/register" state={location.state} className="mt-6 inline-flex min-h-11 items-center text-sm font-semibold text-ink underline decoration-bronze underline-offset-8">
            Create an account
          </Link>
        </>
      }
    >
      <title>Sign in — BRIGHTHOMES Construction Service</title>
      <form noValidate onSubmit={onSubmit} className="space-y-8" aria-label="Sign in">
        <TextField label="Email address" type="email" autoComplete="email" error={formState.errors.email?.message} registration={register('email', EMAIL_RULES)} />
        <TextField label="Password" type="password" autoComplete="current-password" error={formState.errors.password?.message} registration={register('password', { required: 'Please enter your password.' })} />
        <FormAlert message={formError} />
        <Button type="submit" size="lg" arrow loading={formState.isSubmitting} className="w-full sm:w-auto">
          {formState.isSubmitting ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </AuthShell>
  )
}

type RegisterValues = { first_name: string; last_name: string; email: string; password: string; confirm: string }

export function RegisterPage() {
  const { register: createAccount, status } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const returnPath = useReturnPath()
  const notify = useToast()
  const [formError, setFormError] = useState<string>()
  const { register, handleSubmit, formState, setError, getValues } = useForm<RegisterValues>({ defaultValues: { first_name: '', last_name: '', email: '', password: '', confirm: '' } })

  if (status === 'authenticated' && !formState.isSubmitting) return <Navigate to={returnPath} replace />

  const onSubmit = handleSubmit(async ({ confirm: _confirm, ...values }) => {
    setFormError(undefined)
    try {
      await createAccount({ ...values, email: values.email.trim(), first_name: values.first_name.trim(), last_name: values.last_name.trim() })
      notify({ tone: 'success', title: 'Your account is ready.', description: 'You’re now signed in.' })
      navigate(returnPath, { replace: true })
    } catch (error) {
      const apiError = toApiError(error)
      const fields: (keyof RegisterValues)[] = ['first_name', 'last_name', 'email', 'password']
      let matched = false
      for (const [field, message] of Object.entries(apiError.fieldErrors)) {
        if (fields.includes(field as keyof RegisterValues)) {
          setError(field as keyof RegisterValues, { type: 'server', message })
          matched = true
        }
      }
      if (!matched || apiError.kind !== 'validation') setFormError(apiError.message)
    }
  })

  return (
    <AuthShell
      eyebrow="Client account"
      title="Create an account"
      intro="Save projects you admire and follow up on your enquiries and consultation requests in one place."
      aside={
        <>
          <p className="font-display text-3xl text-ink">Already registered?</p>
          <p className="mt-3 leading-relaxed">Sign in to see your saved projects and requests.</p>
          <Link to="/login" state={location.state} className="mt-6 inline-flex min-h-11 items-center text-sm font-semibold text-ink underline decoration-bronze underline-offset-8">
            Sign in
          </Link>
        </>
      }
    >
      <title>Create an account — BRIGHTHOMES Construction Service</title>
      <form noValidate onSubmit={onSubmit} className="space-y-8" aria-label="Create an account">
        <div className="grid gap-8 sm:grid-cols-2">
          <TextField label="First name" autoComplete="given-name" error={formState.errors.first_name?.message} registration={register('first_name', { required: 'Please enter your first name.', maxLength: { value: 150, message: 'Please use 150 characters or fewer.' } })} />
          <TextField label="Last name" autoComplete="family-name" error={formState.errors.last_name?.message} registration={register('last_name', { required: 'Please enter your last name.', maxLength: { value: 150, message: 'Please use 150 characters or fewer.' } })} />
        </div>
        <TextField label="Email address" type="email" autoComplete="email" error={formState.errors.email?.message} registration={register('email', EMAIL_RULES)} />
        <TextField
          label="Password"
          type="password"
          autoComplete="new-password"
          hint="At least 8 characters. Avoid common or entirely numeric passwords."
          error={formState.errors.password?.message}
          registration={register('password', { required: 'Please choose a password.', minLength: { value: 8, message: 'Your password must be at least 8 characters.' } })}
        />
        <TextField label="Confirm password" type="password" autoComplete="new-password" error={formState.errors.confirm?.message} registration={register('confirm', { required: 'Please confirm your password.', validate: (value) => value === getValues('password') || 'Passwords don’t match.' })} />
        <FormAlert message={formError} />
        <Button type="submit" size="lg" arrow loading={formState.isSubmitting} className="w-full sm:w-auto">
          {formState.isSubmitting ? 'Creating account…' : 'Create account'}
        </Button>
      </form>
    </AuthShell>
  )
}
