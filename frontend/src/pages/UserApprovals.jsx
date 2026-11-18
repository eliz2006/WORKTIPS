import { useCallback, useEffect, useState } from 'react'
import api from '../api/client'
import FilterBar, { periodParams } from '../components/FilterBar'
import { DashStyles, Empty, PageHeading, Pill } from '../components/DashKit'

const tone = { pending: 'amber', active: 'green', suspended: 'red' }
const roles = [['admin', 'Administrator'], ['employee', 'Employee'], ['recipient', 'Recipient']]

export default function UserApprovals() {
  const [users, setUsers] = useState(null)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState({ role: '', month: '', year: '' })

  const load = useCallback(() => {
    const params = { ...periodParams(filter), ...(filter.role ? { role: filter.role } : {}) }
    return api.get('/admin/users', { params }).then((r) => setUsers(r.data)).catch(() => setError('Could not load users.'))
  }, [filter])

  useEffect(() => { load() }, [load])

  const act = async (fn) => {
    setError('')
    try { await fn(); await load() } catch (e) { setError(e.response?.data?.message || 'Action failed.') }
  }

  const btn = 'rounded-lg px-3 py-1.5 text-sm font-semibold transition hover:bg-[#f3ebe0]'

  return (
    <div>
      <DashStyles />
      <PageHeading title="User approvals" sub="Approve new accounts, suspend access, or remove users." />
      <FilterBar value={filter} onChange={setFilter} roles={roles}>
        <span className="text-sm text-[#6b5a4c]">{users ? `${users.length} ${users.length === 1 ? 'user' : 'users'}` : ''}</span>
      </FilterBar>
      {error && <p role="alert" className="mb-4 rounded-xl bg-rose-100 p-3 text-sm font-medium text-rose-800">{error}</p>}

      {users === null ? (
        <div className="dk-skel h-64 rounded-3xl" />
      ) : users.length === 0 ? (
        <Empty>No users match these filters.</Empty>
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-[#e0d2c2] bg-[#fbf7f2]">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[#e0d2c2] text-[#6b5a4c]">
              <tr><th className="p-4">Name</th><th>Email</th><th>Role</th><th>Registered</th><th>Status</th><th className="pr-4">Actions</th></tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-[#f0e6da]">
                  <td className="p-4 font-medium">{u.name}</td>
                  <td>{u.email}</td>
                  <td className="capitalize">{u.role}</td>
                  <td>{u.created_at ? new Date(u.created_at).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' }) : ''}</td>
                  <td><Pill tone={tone[u.status] || 'brown'}>{u.status}</Pill></td>
                  <td className="whitespace-nowrap pr-4">
                    {u.status !== 'active' && (
                      <button className={`${btn} text-[#7a5539]`} onClick={() => act(() => api.patch(`/admin/users/${u.id}/approve`))}>
                        {u.status === 'pending' ? 'Approve' : 'Reactivate'}
                      </button>
                    )}
                    {u.status === 'active' && (
                      <button className={`${btn} text-[#7a5539]`} onClick={() => act(() => api.patch(`/admin/users/${u.id}/suspend`))}>Suspend</button>
                    )}
                    <button className={`${btn} text-rose-700`} onClick={() => window.confirm(`Delete ${u.name}?`) && act(() => api.delete(`/admin/users/${u.id}`))}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}