import { useEffect, useState } from 'react'
import api from '../api/client'
import Modal from '../components/Modal'
import FilterBar, { fmtDate, inPeriod, periodParams } from '../components/FilterBar'

export default function Ink() {
  const [rows, setRows] = useState([])
  const [types, setTypes] = useState([])
  const [printers, setPrinters] = useState([])
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState({ month: '', year: '' })
  const [form, setForm] = useState({ ink_type_id: '', printer_id: '', quantity: '', unit: 'ml', consumed_on: new Date().toISOString().slice(0, 10) })

  const load = () =>
    api
      .get('/ink-consumptions', { params: { ...periodParams(filter), per_page: 500 } })
      .then(({ data }) => setRows(data.data || []))

  useEffect(() => {
    load()
  }, [filter])

  useEffect(() => {
    api.get('/ink-types').then(({ data }) => setTypes(data))
    api.get('/printers').then(({ data }) => setPrinters(data))
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    await api.post('/ink-consumptions', form)
    setOpen(false)
    load()
  }

  const shown = rows.filter((r) => inPeriod(r.consumed_on, filter))
  const totalMl = shown.reduce((sum, r) => sum + Number(r.quantity || 0) * (r.unit === 'L' ? 1000 : 1), 0)

  return (
    <div>
      <div className="mb-5 flex justify-between">
        <h1 className="text-3xl font-semibold">Ink Consumption</h1>
        <button className="rounded-xl bg-[#7a5539] px-4 py-2 text-white" onClick={() => setOpen(true)}>
          Record usage
        </button>
      </div>

      <FilterBar value={filter} onChange={setFilter}>
        <span className="text-sm text-[#6b5a4c]">
          {shown.length} {shown.length === 1 ? 'record' : 'records'}, <strong>{(totalMl / 1000).toFixed(2)} L</strong> used
        </span>
      </FilterBar>

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
            {shown.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-3">
                  {r.ink_type?.color} · {r.ink_type?.brand}
                </td>
                <td>{r.printer?.name}</td>
                <td>
                  {r.quantity} {r.unit}
                </td>
                <td>{r.printing_job?.job_number || '—'}</td>
                <td>{fmtDate(r.consumed_on)}</td>
              </tr>
            ))}
            {shown.length === 0 && (
              <tr>
                <td colSpan="5" className="p-6 text-center text-[#6b5a4c]">
                  No ink usage was recorded for this period.
                </td>
              </tr>
            )}
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
            <button className="rounded-xl bg-[#7a5539] py-2 text-white">Save</button>
          </form>
        </Modal>
      )}
    </div>
  )
}