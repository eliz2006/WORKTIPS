import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'
import Badge from '../components/Badge'
import Modal from '../components/Modal'

export default function MyTips() {
  const [items, setItems] = useState([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ title: '', type: 'tip', body: '' })
  const [files, setFiles] = useState([])

  const load = () => api.get('/knowledge', { params: { mine: 1 } }).then(({ data }) => setItems(data.data || []))

  useEffect(() => {
    load()
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    const payload = new FormData()
    Object.entries(form).forEach(([k, v]) => payload.append(k, v))
    ;[...files].forEach((f) => payload.append('media[]', f))
    await api.post('/knowledge', payload, { headers: { 'Content-Type': 'multipart/form-data' } })
    setOpen(false)
    setForm({ title: '', type: 'tip', body: '' })
    load()
  }

  return (
    <div>
      <div className="mb-5 flex justify-between">
        <h1 className="text-3xl font-semibold">My Tips</h1>
        <button className="rounded-xl bg-press px-4 py-2 text-white" onClick={() => setOpen(true)}>
          Share a tip
        </button>
      </div>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#f6efe6] text-left">
            <tr>
              <th className="p-3">Title</th>
              <th>Type</th>
              <th>Status</th>
              <th>Views</th>
            </tr>
          </thead>
          <tbody>
            {items.map((t) => (
              <tr key={t.id} className="border-t">
                <td className="p-3 font-medium">
                  <Link to={`/app/knowledge/${t.id}`}>{t.title}</Link>
                </td>
                <td>{t.type}</td>
                <td>
                  <Badge>{t.status}</Badge>
                </td>
                <td>{t.views}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {open && (
        <Modal title="Share workplace knowledge" onClose={() => setOpen(false)}>
          <form onSubmit={submit} className="space-y-3">
            <input className="w-full rounded-xl border px-3 py-2" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            <select className="w-full rounded-xl border px-3 py-2" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="tip">Tip</option>
              <option value="tutorial">Tutorial</option>
              <option value="documentation">Documentation</option>
              <option value="troubleshooting">Troubleshooting</option>
              <option value="procedure">Procedure</option>
            </select>
            <textarea className="w-full rounded-xl border px-3 py-2" rows="5" placeholder="Steps or guidance" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} required />
            <input type="file" multiple accept="image/*,video/*" onChange={(e) => setFiles(e.target.files)} />
            <button className="w-full rounded-xl bg-press py-2 text-white">Submit for review</button>
          </form>
        </Modal>
      )}
    </div>
  )
}
