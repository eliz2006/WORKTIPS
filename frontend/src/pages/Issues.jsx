import { useEffect, useState } from 'react'
import api from '../api/client'
import Badge from '../components/Badge'
import Modal from '../components/Modal'
import { useAuth } from '../context/AuthContext'

export default function Issues() {
  const { isAdmin } = useAuth()
  const [rows, setRows] = useState([])
  const [printers, setPrinters] = useState([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ printer_id: '', title: '', details: '', priority: 'medium' })
  const [solutions, setSolutions] = useState([])

  const load = () => api.get('/issues').then(({ data }) => setRows(data.data || []))
  useEffect(() => {
    load()
    api.get('/printers').then(({ data }) => setPrinters(data))
  }, [])

  useEffect(() => {
    if (!form.printer_id) return
    api.get(`/printers/${form.printer_id}/solutions`).then(({ data }) => setSolutions(data))
  }, [form.printer_id])

  const submit = async (e) => {
    e.preventDefault()
    await api.post('/issues', form)
    setOpen(false)
    load()
  }

  const cycle = async (issue) => {
    const next = issue.status === 'open' ? 'in_progress' : issue.status === 'in_progress' ? 'resolved' : 'open'
    await api.patch(`/issues/${issue.id}`, { status: next })
    load()
  }

  return (
    <div>
      <div className="mb-5 flex justify-between">
        <h1 className="text-3xl font-semibold">{isAdmin ? 'Issue Reports & Maintenance' : 'My Issue Reports'}</h1>
        <button className="rounded-xl bg-press px-4 py-2 text-white" onClick={() => setOpen(true)}>
          Report issue
        </button>
      </div>
      <div className="card overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#f6efe6] text-left">
            <tr>
              <th className="p-3">Issue</th>
              <th>Priority</th>
              <th>Status</th>
              {isAdmin && <th></th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((i) => (
              <tr key={i.id} className="border-t">
                <td className="p-3">
                  <strong>{i.title}</strong>
                  <div className="text-xs text-[#7a6a5c]">
                    {i.printer?.name} · {i.reporter?.name}
                  </div>
                  {i.recommended_solution && <p className="mt-2 whitespace-pre-wrap text-[#5c4a3d]">{i.recommended_solution}</p>}
                </td>
                <td>
                  <Badge>{i.priority}</Badge>
                </td>
                <td>
                  <Badge>{i.status}</Badge>
                </td>
                {isAdmin && (
                  <td>
                    <button className="rounded-lg border px-2 py-1" onClick={() => cycle(i)}>
                      Update
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {open && (
        <Modal title="Report a machine problem" onClose={() => setOpen(false)}>
          <form onSubmit={submit} className="grid gap-3">
            <select className="rounded-xl border px-3 py-2" value={form.printer_id} onChange={(e) => setForm({ ...form, printer_id: e.target.value })} required>
              <option value="">Select printer</option>
              {printers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <input className="rounded-xl border px-3 py-2" placeholder="Problem title" list="problems" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            <datalist id="problems">
              {solutions.map((s) => (
                <option key={s.id} value={s.title} />
              ))}
            </datalist>
            <select className="rounded-xl border px-3 py-2" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              {['low', 'medium', 'high', 'critical'].map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
            <textarea className="rounded-xl border px-3 py-2" rows="4" placeholder="What happened?" value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} required />
            {solutions[0] && <p className="text-xs text-[#7a6a5c]">A matching procedure will be attached automatically when possible.</p>}
            <button className="rounded-xl bg-press py-2 text-white">Submit report</button>
          </form>
        </Modal>
      )}
    </div>
  )
}
