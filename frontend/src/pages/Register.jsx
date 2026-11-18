import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import PasswordInput from '../components/PasswordInput'

const roles = [
  {
    id: 'recipient',
    title: 'Recipient',
    hint: 'View only. Browse knowledge, printers, jobs, and issues. Cannot post or edit.',
  },
  {
    id: 'employee',
    title: 'Employee',
    hint: 'Full floor access. Post tips, report issues, and record printing jobs.',
  },
]

export default function Register() {
  const { register } = useAuth()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    department: 'Press Floor',
    role: 'employee',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const message = await register(form)
      setSuccess(
        message ||
          'Account created. Please wait for an administrator to approve it before you log in.',
      )
    } catch (err) {
      const first = err.response?.data?.errors
      const fromFields = first ? Object.values(first).flat()[0] : null
      setError(fromFields || err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#2c2118] p-6">
        <div className="w-full max-w-lg rounded-3xl bg-[#fbf7f2] p-8 text-center">
          <div className="block text-xs tracking-[0.22em] text-press">WORKTIPS</div>
          <h1 className="mt-2 text-3xl font-semibold">Registration received</h1>
          <p className="mt-4 rounded-xl border border-amber-300 bg-amber-100 p-4 text-sm font-medium text-amber-900">
            {success}
          </p>
          <p className="mt-4 text-sm text-[#7a6a5c]">
            You will be able to log in once an administrator approves your account.
          </p>
          <Link to="/login" className="mt-6 inline-block rounded-xl bg-press px-6 py-3 text-white">
            Back to login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="grid min-h-screen place-items-center bg-[#2c2118] p-6">
      <form onSubmit={submit} className="w-full max-w-lg rounded-3xl bg-[#fbf7f2] p-8">
        <Link
          to="/"
          className="mb-4 inline-flex rounded-xl border border-[#e5d8c8] px-3 py-2 text-sm text-[#5c4a3d] hover:bg-white"
        >
          ← Back to landing page
        </Link>
        <div className="block text-xs tracking-[0.22em] text-press">WORKTIPS</div>
        <h1 className="mt-2 text-3xl font-semibold">Create account</h1>
        <p className="mt-2 text-sm text-[#7a6a5c]">
          Choose Recipient (view only) or Employee. An administrator must approve your account before you can log in.
        </p>

        {error && (
          <div className="mt-4 rounded-xl bg-rose-100 border border-rose-300 p-4 text-sm font-medium text-rose-800">
            {error}
          </div>
        )}

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {roles.map((role) => (
            <button
              key={role.id}
              type="button"
              onClick={() => setForm({ ...form, role: role.id })}
              className={`rounded-2xl border p-4 text-left ${
                form.role === role.id ? 'border-press bg-white shadow-md' : 'border-[#e5d8c8] bg-[#f6efe6]'
              }`}
            >
              <div className="text-[11px] tracking-[0.16em] text-press">{role.title.toUpperCase()}</div>
              <div className="mt-1 font-semibold">{role.title}</div>
              <p className="mt-2 text-xs leading-5 text-[#7a6a5c]">{role.hint}</p>
            </button>
          ))}
        </div>

        {['name', 'email', 'department'].map((key) => (
          <label key={key} className="mt-4 block text-sm capitalize">
            {key.replaceAll('_', ' ')}
            <input
              className="mt-1 w-full rounded-xl border border-[#e5d8c8] px-3 py-2"
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              required
            />
          </label>
        ))}

        <label className="mt-4 block text-sm">
          Password
          <PasswordInput
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
        </label>

        <label className="mt-4 block text-sm">
          Confirm password
          <PasswordInput
            value={form.password_confirmation}
            onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
            required
          />
        </label>

        <button disabled={submitting} className="mt-6 w-full rounded-xl bg-press py-3 text-white disabled:opacity-60">
          {submitting ? 'Creating account...' : `Register as ${form.role}`}
        </button>

        <p className="mt-4 text-center text-sm">
          <Link to="/login" className="text-press underline">
            Back to login
          </Link>
        </p>
      </form>
    </div>
  )
}