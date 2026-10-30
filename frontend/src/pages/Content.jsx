import { useEffect, useState } from 'react'
import api from '../api/client'
import Badge from '../components/Badge'

export default function Content() {
  const [items, setItems] = useState([])
  const [status, setStatus] = useState('pending')
  const [categories, setCategories] = useState([])
  const [reports, setReports] = useState([])
  const [catName, setCatName] = useState('')

  const load = () => api.get('/knowledge', { params: { status } }).then(({ data }) => setItems(data.data || []))
  const loadMeta = () => {
    api.get('/categories').then(({ data }) => setCategories(data))
    api.get('/content-reports', { params: { status: 'open' } }).then(({ data }) => setReports(data.data || data))
  }

  useEffect(() => {
    load()
  }, [status])

  useEffect(() => {
    loadMeta()
  }, [])

  const moderate = async (id, next) => {
    await api.patch(`/knowledge/${id}/moderate`, { status: next, rejection_reason: next === 'rejected' ? 'Needs revision' : null })
    load()
  }

  const addCategory = async (e) => {
    e.preventDefault()
    await api.post('/categories', { name: catName, scope: 'knowledge' })
    setCatName('')
    loadMeta()
  }

  return (
    <div>
      <h1 className="mb-4 text-3xl font-semibold">Content management</h1>
      <p className="mb-6 text-[#7a6a5c]">Approve employee tips, maintain categories, and close outdated-content reports.</p>

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <section className="card p-5">
          <h3 className="mb-3 font-semibold">Categories</h3>
          <form className="mb-3 flex gap-2" onSubmit={addCategory}>
            <input className="flex-1 rounded-xl border px-3 py-2" placeholder="New category" value={catName} onChange={(e) => setCatName(e.target.value)} required />
            <button className="rounded-xl bg-press px-3 py-2 text-white">Add</button>
          </form>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <Badge key={c.id}>{c.name}</Badge>
            ))}
          </div>
        </section>
        <section className="card p-5">
          <h3 className="mb-3 font-semibold">Open content reports</h3>
          {reports.length === 0 && <p className="text-sm text-[#7a6a5c]">No open reports.</p>}
          {reports.map((r) => (
            <div key={r.id} className="mb-2 flex items-center justify-between rounded-xl bg-[#fbf7f2] p-3 text-sm">
              <div>
                <div className="font-medium">{r.item?.title}</div>
                <div className="text-[#7a6a5c]">
                  {r.reason} · {r.reporter?.name}
                </div>
              </div>
              <button className="rounded-lg border px-2 py-1" onClick={() => api.patch(`/content-reports/${r.id}`).then(loadMeta)}>
                Resolve
              </button>
            </div>
          ))}
        </section>
      </div>

      <select className="mb-4 rounded-xl border px-3 py-2" value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="pending">Pending</option>
        <option value="approved">Approved</option>
        <option value="rejected">Rejected</option>
      </select>
      <div className="card overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#f6efe6] text-left">
            <tr>
              <th className="p-3">Title</th>
              <th>Author</th>
              <th>Type</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((t) => (
              <tr key={t.id} className="border-t">
                <td className="p-3">{t.title}</td>
                <td>{t.author?.name}</td>
                <td>{t.type}</td>
                <td>
                  <Badge>{t.status}</Badge>
                </td>
                <td className="space-x-2 p-3">
                  <button className="rounded-lg border px-2 py-1" onClick={() => moderate(t.id, 'approved')}>
                    Approve
                  </button>
                  <button className="rounded-lg border border-rose-200 px-2 py-1 text-rose-700" onClick={() => moderate(t.id, 'rejected')}>
                    Reject
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
