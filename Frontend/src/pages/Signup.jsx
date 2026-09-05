import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Cloud, Mail, Lock, User } from 'lucide-react'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import { registerUser } from '../api/auth'

export default function Signup() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const validate = () => {
    const next = {}
    if (!form.username.trim()) next.username = 'Choose a username.'
    if (!form.email.trim()) next.email = 'Enter a valid email.'
    else if (!/\S+@\S+\.\S+/.test(form.email)) next.email = 'Enter a valid email.'
    if (!form.password) next.password = 'Choose a password.'
    else if (form.password.length < 8) next.password = 'Use at least 8 characters.'
    if (form.confirm !== form.password) next.confirm = 'Passwords don\u2019t match.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    setErrors({})
    try {
      await registerUser({
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
      })
      navigate('/login', { replace: true, state: { registered: true } })
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
            <h1 className="font-display text-xl font-bold tracking-tight">Create your account</h1>
            <p className="mt-1 text-sm text-ink-500">Start storing files with CloudX</p>
          </div>
        </div>

        <div className="rounded-card border border-border bg-surface p-6 shadow-card">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            <Input
              label="Username"
              name="username"
              icon={User}
              placeholder="janedoe"
              value={form.username}
              onChange={update('username')}
              error={errors.username}
              autoComplete="username"
              autoFocus
            />
            <Input
              label="Email"
              type="email"
              name="email"
              icon={Mail}
              placeholder="you@example.com"
              value={form.email}
              onChange={update('email')}
              error={errors.email}
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              name="password"
              icon={Lock}
              placeholder="At least 8 characters"
              value={form.password}
              onChange={update('password')}
              error={errors.password}
              autoComplete="new-password"
            />
            <Input
              label="Confirm password"
              type="password"
              name="confirm"
              icon={Lock}
              placeholder="Repeat your password"
              value={form.confirm}
              onChange={update('confirm')}
              error={errors.confirm}
              autoComplete="new-password"
            />

            {errors.form && (
              <div className="rounded-control bg-danger-50 px-3 py-2.5 text-xs text-danger-600">
                {errors.form}
              </div>
            )}

            <Button type="submit" className="mt-1 w-full" loading={submitting}>
              Create account
            </Button>
          </form>
        </div>

        <p className="mt-5 text-center text-sm text-ink-500">
          Already have an account?{' '}
          <Link to="/login" className="focus-ring rounded font-medium text-accent-600 hover:text-accent-700">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
