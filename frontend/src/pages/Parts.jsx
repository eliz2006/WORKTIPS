import { useEffect, useState } from 'react'
import api from '../api/client'
import Badge from '../components/Badge'
import Modal from '../components/Modal'

const TYPES = [
  'printhead',
  'ink_tank',
  'cartridge',
  'pump',
  'maintenance_box',
  'capping_station',
  'wiper_blade',
  'rollers',
  'dampers',
  'encoder_strip',
  'waste_ink_system',
  'other',
]

const empty = {
  name: '',
  sku: '',
  part_type: 'printhead',
  quantity_on_hand: 0,
  condition: 'good',
  reorder_level: 1,
  printer_ids: [],
}

export default function Parts() {
  const [rows, setRows] = useState([])
  const [printers, setPrinters] = useState([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(empty)

  const load = () => {
    api.get('/parts').then(({ data }) => setRows(data))
    api.get('/printers').then(({ data }) => setPrinters(data))
  }
  useEffect(load, [])

  const startCreate = () => {
    setEditing(null)
    setForm(empty)
    setOpen(true)
  }

  const startEdit = (part) => {
    setEditing(part)
    setForm({
      name: part.name,
      sku: part.sku,
      part_type: part.part_type,
      quantity_on_hand: part.quantity_on_hand,
      condition: part.condition,
      reorder_level: part.reorder_level,
      printer_ids: part.printers?.map((p) => p.id) || [],
    })
    setOpen(true)
  }

  const submit = async (e) => {
    e.preventDefault()
    if (editing) await api.put(`/parts/${editing.id}`, form)
    else await api.post('/parts', form)
    setOpen(false)
    load()
  }

  const remove = async (part) => {
    if (!confirm(`Remove ${part.name}?`)) return
    await api.delete(`/parts/${part.id}`)
    load()
  }

  return (
    <div>
      <div className="mb-5 flex justify-between">
        <h1 className="text-3xl font-semibold">Printer Parts Catalog</h1>
        <button className="rounded-xl bg-press px-4 py-2 text-white" onClick={startCreate}>
          Add part
        </button>
      </div>
      <div className="card overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#f6efe6] text-left">
            <tr>
              <th className="p-3">Part</th>
              <th>SKU</th>
              <th>Type</th>
              <th>Qty</th>
              <th>Compatible</th>
              <th>Condition</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="p-3 font-medium">{p.name}</td>
                <td>{p.sku}</td>
                <td>{p.part_type}</td>
                <td>{p.quantity_on_hand}</td>
                <td>{p.printers?.map((x) => x.name).join(', ')}</td>
                <td>
                  <Badge>{p.condition}</Badge>
                </td>
                <td className="space-x-2 p-3 whitespace-nowrap">
                  <button className="rounded-lg border px-2 py-1" onClick={() => startEdit(p)}>
                    Edit
                  </button>
                  <button className="rounded-lg border border-rose-200 px-2 py-1 text-rose-700" onClick={() => remove(p)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {open && (
        <Modal title={editing ? 'Edit part' : 'Add part'} onClose={() => setOpen(false)}>
          <form onSubmit={submit} className="grid gap-3">
            <input className="rounded-xl border px-3 py-2" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <input className="rounded-xl border px-3 py-2" placeholder="SKU" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} required />
            <select className="rounded-xl border px-3 py-2" value={form.part_type} onChange={(e) => setForm({ ...form, part_type: e.target.value })}>
              {TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
            <input type="number" className="rounded-xl border px-3 py-2" value={form.quantity_on_hand} onChange={(e) => setForm({ ...form, quantity_on_hand: Number(e.target.value) })} />
            <select className="rounded-xl border px-3 py-2" value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })}>
              {['good', 'fair', 'low_stock', 'needs_replacement'].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <select
              className="h-28 rounded-xl border px-3 py-2"
              multiple
              value={form.printer_ids.map(String)}
              onChange={(e) => setForm({ ...form, printer_ids: [...e.target.selectedOptions].map((o) => Number(o.value)) })}
            >
              {printers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <button className="rounded-xl bg-press py-2 text-white">{editing ? 'Update' : 'Save'}</button>
          </form>
        </Modal>
      )}
    </div>
  )
}
