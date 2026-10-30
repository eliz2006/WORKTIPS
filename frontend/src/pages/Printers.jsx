import { useEffect, useState } from 'react'
import api from '../api/client'
import Badge from '../components/Badge'
import Modal from '../components/Modal'
import { useAuth } from '../context/AuthContext'

const empty = {
  name: '',
  brand: '',
  model: '',
  type: 'inkjet',
  serial_number: '',
  printing_category: 'tarpaulin',
  condition: 'active',
  maintenance_interval_days: 30,
  location: '',
  notes: '',
  ink_type_ids: [],
  common_problems: [{ title: '', description: '', recommended_solution: '' }],
}

export default function Printers() {
  const { isAdmin } = useAuth()
  const [rows, setRows] = useState([])
  const [inks, setInks] = useState([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [detail, setDetail] = useState(null)
  const [form, setForm] = useState(empty)

  const load = () => api.get('/printers').then(({ data }) => setRows(data))
  useEffect(() => {
    load()
    api.get('/ink-types').then(({ data }) => setInks(data))
  }, [])

  const startCreate = () => {
    setEditing(null)
    setForm(empty)
    setOpen(true)
  }

  const startEdit = (printer) => {
    setEditing(printer)
    setForm({
      ...empty,
      ...printer,
      ink_type_ids: printer.ink_types?.map((i) => i.id) || [],
      common_problems: printer.common_problems?.length
        ? printer.common_problems.map((p) => ({
            title: p.title,
            description: p.description || '',
            recommended_solution: p.recommended_solution,
          }))
        : [{ title: '', description: '', recommended_solution: '' }],
    })
    setOpen(true)
  }

  const submit = async (e) => {
    e.preventDefault()
    const payload = {
      ...form,
      common_problems: form.common_problems.filter((p) => p.title && p.recommended_solution),
    }
    if (editing) await api.put(`/printers/${editing.id}`, payload)
    else await api.post('/printers', payload)
    setOpen(false)
    load()
  }

  const remove = async (printer) => {
    if (!confirm(`Remove ${printer.name}?`)) return
    await api.delete(`/printers/${printer.id}`)
    load()
  }

  const openDetail = async (printer) => {
    const { data } = await api.get(`/printers/${printer.id}`)
    setDetail(data)
  }

  return (
    <div>
      <div className="mb-5 flex justify-between">
        <div>
          <h1 className="text-3xl font-semibold">{isAdmin ? 'Printer Management' : 'Equipment'}</h1>
          <p className="text-[#7a6a5c]">Models, compatible ink, condition, common problems, and maintenance dates.</p>
        </div>
        {isAdmin && (
          <button className="rounded-xl bg-press px-4 py-2 text-white" onClick={startCreate}>
            Add printer
          </button>
        )}
      </div>
      <div className="card overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#f6efe6] text-left">
            <tr>
              <th className="p-3">Printer</th>
              <th>Serial</th>
              <th>Type</th>
              <th>Category</th>
              <th>Ink</th>
              <th>Status</th>
              <th>Next service</th>
              {isAdmin && <th></th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="p-3">
                  <button className="text-left" onClick={() => openDetail(p)}>
                    <strong>{p.name}</strong>
                    <div className="text-xs text-[#7a6a5c]">
                      {p.brand} {p.model}
                    </div>
                  </button>
                </td>
                <td>{p.serial_number}</td>
                <td>{p.type}</td>
                <td>{p.printing_category}</td>
                <td>{p.ink_types?.map((i) => i.color).join(', ') || '—'}</td>
                <td>
                  <Badge>{p.condition}</Badge>
                </td>
                <td>{p.next_maintenance_at || '—'}</td>
                {isAdmin && (
                  <td className="space-x-2 p-3 whitespace-nowrap">
                    <button className="rounded-lg border px-2 py-1" onClick={() => startEdit(p)}>
                      Edit
                    </button>
                    <button className="rounded-lg border border-rose-200 px-2 py-1 text-rose-700" onClick={() => remove(p)}>
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {detail && (
        <Modal title={detail.name} onClose={() => setDetail(null)}>
          <div className="space-y-3 text-sm">
            <p>
              {detail.brand} {detail.model} · {detail.serial_number}
            </p>
            <p>Location: {detail.location || '—'} · Interval {detail.maintenance_interval_days} days</p>
            <div>
              <strong>Compatible ink</strong>
              <p>{detail.ink_types?.map((i) => `${i.color} (${i.brand})`).join(', ') || '—'}</p>
            </div>
            <div>
              <strong>Parts</strong>
              <p>{detail.parts?.map((p) => p.name).join(', ') || 'None catalogued'}</p>
            </div>
            <div>
              <strong>Common problems</strong>
              {detail.common_problems?.map((c) => (
                <div key={c.id} className="mt-2 rounded-xl bg-[#fbf7f2] p-3">
                  <div className="font-medium">{c.title}</div>
                  <p className="text-[#5c4a3d]">{c.recommended_solution}</p>
                </div>
              ))}
            </div>
            <div>
              <strong>Recent maintenance</strong>
              {detail.maintenance_records?.slice(0, 5).map((m) => (
                <div key={m.id} className="mt-1 text-[#7a6a5c]">
                  {m.work_type} · {m.performed_at}
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}

      {open && (
        <Modal title={editing ? 'Edit printer' : 'Add printer'} onClose={() => setOpen(false)}>
          <form onSubmit={submit} className="grid gap-3">
            {['name', 'brand', 'model', 'serial_number', 'location'].map((k) => (
              <input
                key={k}
                className="rounded-xl border px-3 py-2"
                placeholder={k.replaceAll('_', ' ')}
                value={form[k] || ''}
                onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                required={k !== 'location'}
              />
            ))}
            <select className="rounded-xl border px-3 py-2" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {['inkjet', 'laser', 'sublimation', 'digital', 'eco_solvent', 'uv'].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
            <select className="rounded-xl border px-3 py-2" value={form.printing_category} onChange={(e) => setForm({ ...form, printing_category: e.target.value })}>
              {['tarpaulin', 'sticker', 'sublimation', 'digital', 'other'].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
            <select className="rounded-xl border px-3 py-2" value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })}>
              {['active', 'maintenance', 'inactive', 'retired'].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
            <label className="text-sm">
              Maintenance interval (days)
              <input
                type="number"
                className="mt-1 w-full rounded-xl border px-3 py-2"
                value={form.maintenance_interval_days}
                onChange={(e) => setForm({ ...form, maintenance_interval_days: Number(e.target.value) })}
              />
            </label>
            <label className="text-sm">
              Compatible ink types
              <select
                multiple
                className="mt-1 h-28 w-full rounded-xl border px-3 py-2"
                value={form.ink_type_ids.map(String)}
                onChange={(e) => setForm({ ...form, ink_type_ids: [...e.target.selectedOptions].map((o) => Number(o.value)) })}
              >
                {inks.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.color} · {i.brand}
                  </option>
                ))}
              </select>
            </label>
            <div>
              <div className="mb-2 text-sm font-medium">Common problems & solutions</div>
              {form.common_problems.map((p, idx) => (
                <div key={idx} className="mb-2 grid gap-2 rounded-xl bg-[#fbf7f2] p-3">
                  <input
                    className="rounded-xl border px-3 py-2"
                    placeholder="Problem title"
                    value={p.title}
                    onChange={(e) => {
                      const next = [...form.common_problems]
                      next[idx] = { ...p, title: e.target.value }
                      setForm({ ...form, common_problems: next })
                    }}
                  />
                  <textarea
                    className="rounded-xl border px-3 py-2"
                    rows="2"
                    placeholder="Recommended solution"
                    value={p.recommended_solution}
                    onChange={(e) => {
                      const next = [...form.common_problems]
                      next[idx] = { ...p, recommended_solution: e.target.value }
                      setForm({ ...form, common_problems: next })
                    }}
                  />
                </div>
              ))}
              <button
                type="button"
                className="text-sm text-press"
                onClick={() => setForm({ ...form, common_problems: [...form.common_problems, { title: '', description: '', recommended_solution: '' }] })}
              >
                + Add problem
              </button>
            </div>
            <button className="rounded-xl bg-press py-2 text-white">{editing ? 'Update printer' : 'Save printer'}</button>
          </form>
        </Modal>
      )}
    </div>
  )
}
