import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    department: 'Press Floor',
    role: 'employee',
  })
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await register(form)
      navigate('/app')
    } catch (err) {
      const first = err.response?.data?.errors
      const fromFields = first ? Object.values(first).flat()[0] : null
      setError(fromFields || err.response?.data?.message || 'Registration failed.')
    }
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
        <p className="mt-2 text-sm text-[#7a6a5c]">Choose Recipient (view only) or Employee.</p>
        {error && <p className="mt-4 text-sm text-rose-700">{error}</p>}

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
          <PasswordInput value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        </label>
        <label className="mt-4 block text-sm">
          Confirm password
          <PasswordInput
            value={form.password_confirmation}
            onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
            required
          />
        </label>
        <button className="mt-6 w-full rounded-xl bg-press py-3 text-white">Register as {form.role}</button>
        <p className="mt-4 text-center text-sm">
          <Link to="/login" className="text-press underline">
            Back to login
          </Link>
        </p>
      </form>
    </div>
  )
}
