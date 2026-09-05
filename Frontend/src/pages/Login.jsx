import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Cloud, Mail, Lock, CheckCircle2 } from 'lucide-react'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import { useSession } from '../context/SessionContext'
import { loginUser } from '../api/auth'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useSession()

  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const justRegistered = location.state?.registered
  const redirectTo = location.state?.from?.pathname || '/'

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const validate = () => {
    const next = {}
    if (!form.email.trim()) next.email = 'Enter your email.'
    if (!form.password) next.password = 'Enter your password.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    setErrors({})
    try {
      const data = await loginUser({ email: form.email.trim(), password: form.password })
      await login(data)
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setErrors({ form: err.message })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-[10px] bg-accent-600 text-white shadow-card">
            <Cloud size={22} strokeWidth={2.2} />
          </span>
          <div>
            <h1 className="font-display text-xl font-bold tracking-tight">CloudX</h1>
            <p className="mt-1 text-sm text-ink-500">Secure storage at your fingertips</p>
          </div>
        </div>

        {justRegistered && (
          <div className="mb-4 flex items-center gap-2 rounded-control border border-accent-100 bg-accent-50 px-3 py-2.5 text-[13px] text-accent-700">
            <CheckCircle2 size={15} className="shrink-0" />
            Account created successfully. Sign in below.
          </div>
        )}

        <div className="rounded-card border border-border bg-surface p-6 shadow-card">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            <Input
              label="Email"
              type="email"
              name="email"
              icon={Mail}
              placeholder="you@example.com"
              value={form.email}
              onChange={update('email')}
              error={errors.email}
              autoComplete="username"
              autoFocus
            />
            <div>
              <Input
                label="Password"
                type="password"
                name="password"
                icon={Lock}
                placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
                value={form.password}
                onChange={update('password')}
                error={errors.password}
                autoComplete="current-password"
              />
            </div>

            {errors.form && (
              <div className="rounded-control bg-danger-50 px-3 py-2.5 text-xs text-danger-600">
                {errors.form}
              </div>
            )}

            <Button type="submit" className="mt-1 w-full" loading={submitting}>
              Sign in
            </Button>
          </form>
        </div>

        <p className="mt-5 text-center text-sm text-ink-500">
          Don&rsquo;t have an account?{' '}
          <Link to="/signup" className="focus-ring rounded font-medium text-accent-600 hover:text-accent-700">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
