import { useEffect, useState } from 'react'
import api from '../api/client'
import Modal from '../components/Modal'

export default function Maintenance() {
  const [rows, setRows] = useState([])
  const [printers, setPrinters] = useState([])
  const [parts, setParts] = useState([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    printer_id: '',
    performed_at: new Date().toISOString().slice(0, 16),
    work_type: 'routine',
    notes: '',
    printer_part_id: '',
    quantity: 1,
  })

  const load = () => api.get('/maintenance').then(({ data }) => setRows(data.data || []))
  useEffect(() => {
    load()
    api.get('/printers').then(({ data }) => setPrinters(data))
    api.get('/parts').then(({ data }) => setParts(data))
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    await api.post('/maintenance', {
      printer_id: form.printer_id,
      performed_at: form.performed_at,
      work_type: form.work_type,
      notes: form.notes,
      parts: form.printer_part_id ? [{ printer_part_id: form.printer_part_id, quantity: form.quantity }] : [],
    })
    setOpen(false)
    load()
  }

  return (
    <div>
      <div className="mb-5 flex justify-between">
        <h1 className="text-3xl font-semibold">Maintenance history</h1>
        <button className="rounded-xl bg-press px-4 py-2 text-white" onClick={() => setOpen(true)}>
          Record service
        </button>
      </div>
      <div className="space-y-3">
        {rows.map((r) => (
          <div key={r.id} className="card p-4">
            <div className="font-semibold">{r.printer?.name}</div>
            <div className="text-sm text-[#7a6a5c]">
              {r.work_type} · {r.performed_at} · next due {r.next_due_at}
            </div>
            <p className="mt-2 text-sm">{r.notes}</p>
            <div className="mt-2 text-xs">
              Parts: {r.parts?.map((p) => `${p.part?.name} ×${p.quantity}`).join(', ') || 'none'}
            </div>
          </div>
        ))}
      </div>
      {open && (
        <Modal title="Record maintenance" onClose={() => setOpen(false)}>
          <form onSubmit={submit} className="grid gap-3">
            <select className="rounded-xl border px-3 py-2" value={form.printer_id} onChange={(e) => setForm({ ...form, printer_id: e.target.value })} required>
              <option value="">Printer</option>
              {printers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <input type="datetime-local" className="rounded-xl border px-3 py-2" value={form.performed_at} onChange={(e) => setForm({ ...form, performed_at: e.target.value })} />
            <select className="rounded-xl border px-3 py-2" value={form.work_type} onChange={(e) => setForm({ ...form, work_type: e.target.value })}>
              {['routine', 'repair', 'cleaning', 'parts_replacement', 'inspection'].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
            <select className="rounded-xl border px-3 py-2" value={form.printer_part_id} onChange={(e) => setForm({ ...form, printer_part_id: e.target.value })}>
              <option value="">Part replaced (optional)</option>
              {parts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <textarea className="rounded-xl border px-3 py-2" rows="3" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            <button className="rounded-xl bg-press py-2 text-white">Save</button>
          </form>
        </Modal>
      )}
    </div>
  )
}
