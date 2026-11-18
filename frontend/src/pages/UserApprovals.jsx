import { useEffect, useState } from 'react'
import api from '../api/client'

const badge = {
  pending: 'bg-amber-100 text-amber-800',
  active: 'bg-green-100 text-green-800',
  suspended: 'bg-red-100 text-red-800',
}

export default function UserApprovals() {
  const [users, setUsers] = useState([])
  const [error, setError] = useState('')

  const load = () =>
    api
      .get('/admin/users')
      .then((r) => setUsers(r.data))
      .catch(() => setError('Could not load users.'))

  useEffect(() => {
    load()
  }, [])

  const act = async (fn) => {
    setError('')
    try {
      await fn()
      await load()
    } catch (e) {
      setError(e.response?.data?.message || 'Action failed.')
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">User Approvals</h1>
      {error && <p className="mb-3 text-red-600">{error}</p>}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr>
              <th className="p-2">Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="p-2">{u.name}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>
                  <span className={`px-2 py-1 rounded text-sm ${badge[u.status]}`}>{u.status}</span>
                </td>
                <td className="space-x-3">
                  {u.status !== 'active' && (
                    <button
                      className="underline"
                      onClick={() => act(() => api.patch(`/admin/users/${u.id}/approve`))}
                    >
                      {u.status === 'pending' ? 'Approve' : 'Reactivate'}
                    </button>
                  )}
                  {u.status === 'active' && (
                    <button
                      className="underline"
                      onClick={() => act(() => api.patch(`/admin/users/${u.id}/suspend`))}
                    >
                      Suspend
                    </button>
                  )}
                  <button
                    className="underline text-red-600"
                    onClick={() =>
                      window.confirm(`Delete ${u.name}?`) &&
                      act(() => api.delete(`/admin/users/${u.id}`))
                    }
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}