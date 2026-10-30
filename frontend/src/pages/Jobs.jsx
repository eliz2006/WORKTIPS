import { useEffect, useState } from 'react'
import api from '../api/client'
import Modal from '../components/Modal'

function money(n) {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(n || 0)
}

export default function Jobs() {
  const [rows, setRows] = useState([])
  const [printers, setPrinters] = useState([])
  const [inks, setInks] = useState([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    printer_id: '',
    customer_name: '',
    printing_type: 'tarpaulin',
    product_name: '',
    quantity: 1,
    unit_price: 0,
    job_date: new Date().toISOString().slice(0, 10),
    ink_type_id: '',
    ink_qty: '',
  })

  const load = () => api.get('/jobs').then(({ data }) => setRows(data.data || []))
  useEffect(() => {
    load()
    api.get('/printers').then(({ data }) => setPrinters(data))
    api.get('/ink-types').then(({ data }) => setInks(data))
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    const payload = {
      ...form,
      ink: form.ink_type_id && form.ink_qty ? [{ ink_type_id: form.ink_type_id, quantity: form.ink_qty, unit: 'ml' }] : [],
    }
    await api.post('/jobs', payload)
    setOpen(false)
    load()
  }

  return (
    <div>
      <div className="mb-5 flex justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Printing Jobs / Sales</h1>
          <p className="text-[#7a6a5c]">Each completed job feeds total sales, type mix, and monthly trend charts.</p>
        </div>
        <button className="rounded-xl bg-press px-4 py-2 text-white" onClick={() => setOpen(true)}>
          Record job
        </button>
      </div>
      <div className="card overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#f6efe6] text-left">
            <tr>
              <th className="p-3">Job</th>
              <th>Type</th>
              <th>Printer</th>
              <th>Qty</th>
              <th>Amount</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((j) => (
              <tr key={j.id} className="border-t">
                <td className="p-3">
                  <strong>{j.product_name}</strong>
                  <div className="text-xs text-[#7a6a5c]">{j.job_number}</div>
                </td>
                <td>{j.printing_type}</td>
                <td>{j.printer?.name}</td>
                <td>{j.quantity}</td>
                <td>{money(j.total_amount)}</td>
                <td>{j.job_date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {open && (
        <Modal title="Record printing job" onClose={() => setOpen(false)}>
          <form onSubmit={submit} className="grid gap-3">
            <input className="rounded-xl border px-3 py-2" placeholder="Customer name" value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} />
            <input className="rounded-xl border px-3 py-2" placeholder="Product name" value={form.product_name} onChange={(e) => setForm({ ...form, product_name: e.target.value })} required />
            <select className="rounded-xl border px-3 py-2" value={form.printing_type} onChange={(e) => setForm({ ...form, printing_type: e.target.value })}>
              {['tarpaulin', 'sticker', 'sublimation', 'digital', 'other'].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
            <select className="rounded-xl border px-3 py-2" value={form.printer_id} onChange={(e) => setForm({ ...form, printer_id: e.target.value })}>
              <option value="">Printer (optional)</option>
              {printers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <input type="number" className="rounded-xl border px-3 py-2" placeholder="Quantity" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
            <input type="number" step="0.01" className="rounded-xl border px-3 py-2" placeholder="Unit price" value={form.unit_price} onChange={(e) => setForm({ ...form, unit_price: e.target.value })} />
            <input type="date" className="rounded-xl border px-3 py-2" value={form.job_date} onChange={(e) => setForm({ ...form, job_date: e.target.value })} />
            <select className="rounded-xl border px-3 py-2" value={form.ink_type_id} onChange={(e) => setForm({ ...form, ink_type_id: e.target.value })}>
              <option value="">Ink used (optional — feeds ink analytics)</option>
              {inks.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.color} {i.brand}
                </option>
              ))}
            </select>
            <input className="rounded-xl border px-3 py-2" placeholder="Ink quantity (ml)" value={form.ink_qty} onChange={(e) => setForm({ ...form, ink_qty: e.target.value })} />
            <button className="rounded-xl bg-press py-2 text-white">Save job</button>
          </form>
        </Modal>
      )}
    </div>
  )
}
