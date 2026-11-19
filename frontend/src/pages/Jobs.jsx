import { useEffect, useState } from 'react'
import api from '../api/client'
import Modal from '../components/Modal'
import FilterBar, { fmtDate, inPeriod, periodParams } from '../components/FilterBar'
import SalesSummary from '../components/SalesSummary'
import JobsChart from '../components/JobsChart'
import { useAuth } from '../context/AuthContext'

function money(n) {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(n || 0)
}

export default function Jobs() {
  const { canWrite } = useAuth()
  const [rows, setRows] = useState([])
  const [printers, setPrinters] = useState([])
  const [inks, setInks] = useState([])
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState({ month: '', year: '' })
  const [refreshKey, setRefreshKey] = useState(0)
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

  const load = () =>
    api
      .get('/jobs', { params: { ...periodParams(filter), per_page: 500 } })
      .then(({ data }) => setRows(data.data || []))

  useEffect(() => {
    load()
  }, [filter])

  useEffect(() => {
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
    setRefreshKey((k) => k + 1)
  }

  const shown = rows.filter((r) => inPeriod(r.job_date, filter))
  const shownTotal = shown.reduce((sum, r) => sum + Number(r.total_amount || 0), 0)

  return (
    <div>
      <div className="mb-5 flex justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Printing Jobs / Sales</h1>
          <p className="text-[#7a6a5c]">Each completed job feeds total sales, type mix, and monthly trend charts.</p>
        </div>
        {canWrite && (
          <button className="rounded-xl bg-[#7a5539] px-4 py-2 text-white" onClick={() => setOpen(true)}>
            Record job
          </button>
        )}
      </div>

      <FilterBar value={filter} onChange={setFilter}>
        <span className="text-sm text-[#6b5a4c]">
          {shown.length} {shown.length === 1 ? 'job' : 'jobs'}, <strong>{money(shownTotal)}</strong>
        </span>
      </FilterBar>

      <div className="mb-6 grid gap-6">
        <SalesSummary filter={filter} refreshKey={refreshKey} />
        <JobsChart rows={shown} />
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
            {shown.map((j) => (
              <tr key={j.id} className="border-t">
                <td className="p-3">
                  <strong>{j.product_name}</strong>
                  <div className="text-xs text-[#7a6a5c]">{j.job_number}</div>
                </td>
                <td>{j.printing_type}</td>
                <td>{j.printer?.name}</td>
                <td>{j.quantity}</td>
                <td>{money(j.total_amount)}</td>
                <td>{fmtDate(j.job_date)}</td>
              </tr>
            ))}
            {shown.length === 0 && (
              <tr>
                <td colSpan="6" className="p-6 text-center text-[#6b5a4c]">
                  No jobs were recorded in this period.
                </td>
              </tr>
            )}
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
            <button className="rounded-xl bg-[#7a5539] py-2 text-white">Save job</button>
          </form>
        </Modal>
      )}
    </div>
  )
}