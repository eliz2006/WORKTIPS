import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import api from '../api/client'

const AuthContext = createContext(null)

function readSavedUser() {
  try {
    const raw = localStorage.getItem('worktips_user')
    return raw && raw !== 'undefined' ? JSON.parse(raw) : null
  } catch {
    localStorage.removeItem('worktips_user')
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readSavedUser)
  const [loading, setLoading] = useState(!!localStorage.getItem('worktips_token'))

  useEffect(() => {
    const token = localStorage.getItem('worktips_token')
    if (!token) {
      setLoading(false)
      return
    }
    api
      .get('/me')
      .then(({ data }) => {
        setUser(data)
        localStorage.setItem('worktips_user', JSON.stringify(data))
      })
      .catch(() => {
        setUser(null)
        localStorage.removeItem('worktips_token')
        localStorage.removeItem('worktips_user')
      })
      .finally(() => setLoading(false))
  }, [])

  const persist = (payload) => {
    localStorage.setItem('worktips_token', payload.token)
    localStorage.setItem('worktips_user', JSON.stringify(payload.user))
    setUser(payload.user)
  }

  const value = useMemo(
    () => ({
      user,
      loading,
      isAdmin: user?.role === 'admin',
      isRecipient: user?.role === 'recipient',
      canWrite: user?.role !== 'recipient',
      roleLabel: user?.role === 'admin' ? 'Administrator' : user?.role === 'recipient' ? 'Recipient' : 'Employee',
      login: async (email, password) => {
        const { data } = await api.post('/login', { email, password })
        persist(data)
        return data.user
      },
      // New accounts are "pending": no token, no auto login.
      register: async (payload) => {
        const { data } = await api.post('/register', payload)
        return data.message
      },
      logout: async () => {
        try {
          await api.post('/logout')
        } finally {
          localStorage.removeItem('worktips_token')
          localStorage.removeItem('worktips_user')
          setUser(null)
        }
      },
    }),
    [user, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}