import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    department: 'Press Floor',
  })
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await register(form)
      navigate('/app')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.')
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-[#2c2118] p-6">
      <form onSubmit={submit} className="w-full max-w-md rounded-3xl bg-[#fbf7f2] p-8">
        <h1 className="text-3xl font-semibold">Create account</h1>
        {error && <p className="mt-4 text-sm text-rose-700">{error}</p>}
        {['name', 'email', 'department', 'password', 'password_confirmation'].map((key) => (
          <label key={key} className="mt-4 block text-sm capitalize">
            {key.replaceAll('_', ' ')}
            <input
              type={key.includes('password') ? 'password' : 'text'}
              className="mt-1 w-full rounded-xl border border-[#e5d8c8] px-3 py-2"
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              required
            />
          </label>
        ))}
        <button className="mt-6 w-full rounded-xl bg-press py-3 text-white">Register</button>
        <p className="mt-4 text-center text-sm">
          <Link to="/login" className="text-press underline">
            Back to login
          </Link>
        </p>
      </form>
    </div>
  )
}
