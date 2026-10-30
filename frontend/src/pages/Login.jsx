import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: 'eliza@worktips.test', password: 'password' })
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const user = await login(form.email, form.password)
      navigate(user.role === 'admin' ? '/app/analytics' : '/app')
    } catch {
      setError('Invalid email or password.')
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-[#2c2118] p-6">
      <form onSubmit={submit} className="w-full max-w-md rounded-3xl bg-[#fbf7f2] p-8 shadow-xl">
        <div className="text-xs tracking-[0.22em] text-press">WORKTIPS</div>
        <h1 className="mt-2 text-3xl font-semibold">Sign in</h1>
        <p className="mt-2 text-sm text-[#7a6a5c]">Workplace knowledge and printing analytics.</p>
        {error && <p className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
        <label className="mt-6 block text-sm">
          Email
          <input
            className="mt-1 w-full rounded-xl border border-[#e5d8c8] px-3 py-2"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </label>
        <label className="mt-4 block text-sm">
          Password
          <input
            type="password"
            className="mt-1 w-full rounded-xl border border-[#e5d8c8] px-3 py-2"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </label>
        <button className="mt-6 w-full rounded-xl bg-press py-3 font-medium text-white">Enter workspace</button>
        <p className="mt-4 text-center text-sm text-[#7a6a5c]">
          New employee? <Link to="/register" className="text-press underline">Create an account</Link>
        </p>
        <p className="mt-4 text-xs text-[#8a7b6d]">Demo: eliza@worktips.test or admin@worktips.test / password</p>
      </form>
    </div>
  )
}
