import { useCallback, useEffect, useState } from 'react'
import api from '../api/client'
import FilterBar, { periodParams } from '../components/FilterBar'
import { DashStyles, Empty, PageHeading, Pill } from '../components/DashKit'

const tone = { pending: 'amber', active: 'green', suspended: 'red' }
const roles = [['admin', 'Administrator'], ['employee', 'Employee'], ['recipient', 'Recipient']]

// What each action asks before it runs
const ACTIONS = {
  approve: (u) => ({
    title: `Approve ${u.name}?`,
    body: `${u.name} will be able to sign in as ${u.role}.`,
    cta: 'Yes, approve',
    danger: false,
    run: () => api.patch(`/admin/users/${u.id}/approve`),
  }),
  reactivate: (u) => ({
    title: `Reactivate ${u.name}?`,
    body: `${u.name} will be able to sign in again.`,
    cta: 'Yes, reactivate',
    danger: false,
    run: () => api.patch(`/admin/users/${u.id}/approve`),
  }),
  suspend: (u) => ({
    title: `Suspend ${u.name}?`,
    body: `${u.name} will be signed out and cannot sign in until you reactivate the account.`,
    cta: 'Yes, suspend',
    danger: true,
    run: () => api.patch(`/admin/users/${u.id}/suspend`),
  }),
  delete: (u) => ({
    title: `Delete ${u.name}?`,
    body: `This permanently removes the account for ${u.email}. This cannot be undone.`,
    cta: 'Yes, delete',
    danger: true,
    run: () => api.delete(`/admin/users/${u.id}`),
  }),
}

export default function UserApprovals() {
  const [users, setUsers] = useState(null)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState({ role: '', month: '', year: '' })
  const [ask, setAsk] = useState(null) // { kind, user }
  const [busy, setBusy] = useState(false)
  const [askError, setAskError] = useState('')

  const load = useCallback(() => {
    const params = { ...periodParams(filter), ...(filter.role ? { role: filter.role } : {}) }
    return api.get('/admin/users', { params }).then((r) => setUsers(r.data)).catch(() => setError('Could not load users.'))
  }, [filter])

  useEffect(() => { load() }, [load])

  // close the dialog with Escape
  useEffect(() => {
    if (!ask) return
    const onKey = (e) => e.key === 'Escape' && !busy && setAsk(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [ask, busy])

  const open = (kind, user) => {
    setAskError('')
    setAsk({ kind, user })
  }

  const confirm = async () => {
    setBusy(true)
    setAskError('')
    try {
      await ACTIONS[ask.kind](ask.user).run()
      setAsk(null)
      setError('')
      await load()
    } catch (e) {
      setAskError(e.response?.data?.message || 'Action failed. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  const btn = 'rounded-lg px-3 py-1.5 text-sm font-semibold transition hover:bg-[#f3ebe0]'
  const copy = ask ? ACTIONS[ask.kind](ask.user) : null

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
                      <button className={`${btn} text-[#7a5539]`} onClick={() => open(u.status === 'pending' ? 'approve' : 'reactivate', u)}>
                        {u.status === 'pending' ? 'Approve' : 'Reactivate'}
                      </button>
                    )}
                    {u.status === 'active' && (
                      <button className={`${btn} text-[#7a5539]`} onClick={() => open('suspend', u)}>Suspend</button>
                    )}
                    <button className={`${btn} text-rose-700`} onClick={() => open('delete', u)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {ask && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#2c2118]/60 p-4 backdrop-blur-sm" onClick={() => !busy && setAsk(null)}>
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="ua-title"
            aria-describedby="ua-body"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl border border-[#e0d2c2] bg-[#fbf7f2] p-7 shadow-2xl"
          >
            <h2 id="ua-title" className="text-2xl font-semibold">{copy.title}</h2>
            <p id="ua-body" className="mt-2 text-[#6b5a4c]">{copy.body}</p>
            {askError && <p role="alert" className="mt-4 rounded-xl bg-rose-100 p-3 text-sm font-medium text-rose-800">{askError}</p>}
            <div className="mt-6 flex justify-end gap-3">
              <button autoFocus type="button" disabled={busy} onClick={() => setAsk(null)} className="rounded-xl border border-[#e0d2c2] px-5 py-2.5 font-medium transition hover:bg-white disabled:opacity-60">
                Cancel
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={confirm}
                className={`rounded-xl px-5 py-2.5 font-semibold text-white transition hover:-translate-y-0.5 disabled:opacity-60 ${copy.danger ? 'bg-rose-700' : 'bg-[#7a5539]'}`}
              >
                {busy ? 'Please wait...' : copy.cta}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}