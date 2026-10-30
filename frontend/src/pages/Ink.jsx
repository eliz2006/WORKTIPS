import { useEffect, useState } from 'react'
import api from '../api/client'
import Modal from '../components/Modal'

export default function Ink() {
  const [rows, setRows] = useState([])
  const [types, setTypes] = useState([])
  const [printers, setPrinters] = useState([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ ink_type_id: '', printer_id: '', quantity: '', unit: 'ml', consumed_on: new Date().toISOString().slice(0, 10) })

  const load = () => api.get('/ink-consumptions').then(({ data }) => setRows(data.data || []))
  useEffect(() => {
    load()
    api.get('/ink-types').then(({ data }) => setTypes(data))
    api.get('/printers').then(({ data }) => setPrinters(data))
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    await api.post('/ink-consumptions', form)
    setOpen(false)
    load()
  }

  return (
    <div>
      <div className="mb-5 flex justify-between">
        <h1 className="text-3xl font-semibold">Ink Consumption</h1>
        <button className="rounded-xl bg-press px-4 py-2 text-white" onClick={() => setOpen(true)}>
          Record usage
        </button>
      </div>
      <div className="card overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#f6efe6] text-left">
            <tr>
              <th className="p-3">Ink</th>
              <th>Printer</th>
              <th>Qty</th>
              <th>Job</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-3">
                  {r.ink_type?.color} · {r.ink_type?.brand}
                </td>
                <td>{r.printer?.name}</td>
                <td>
                  {r.quantity} {r.unit}
                </td>
                <td>{r.printing_job?.job_number || '—'}</td>
                <td>{r.consumed_on}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {open && (
        <Modal title="Record ink usage" onClose={() => setOpen(false)}>
          <form onSubmit={submit} className="grid gap-3">
            <select className="rounded-xl border px-3 py-2" value={form.ink_type_id} onChange={(e) => setForm({ ...form, ink_type_id: e.target.value })} required>
              <option value="">Ink type</option>
              {types.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.color} {t.brand}
                </option>
              ))}
            </select>
            <select className="rounded-xl border px-3 py-2" value={form.printer_id} onChange={(e) => setForm({ ...form, printer_id: e.target.value })} required>
              <option value="">Printer</option>
              {printers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <input type="number" step="0.001" className="rounded-xl border px-3 py-2" placeholder="Quantity" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} required />
            <select className="rounded-xl border px-3 py-2" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
              <option>ml</option>
              <option>L</option>
            </select>
            <input type="date" className="rounded-xl border px-3 py-2" value={form.consumed_on} onChange={(e) => setForm({ ...form, consumed_on: e.target.value })} />
            <button className="rounded-xl bg-press py-2 text-white">Save</button>
          </form>
        </Modal>
      )}
    </div>
  )
}
