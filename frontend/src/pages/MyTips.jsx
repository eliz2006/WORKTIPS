import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'
import Badge from '../components/Badge'
import Modal from '../components/Modal'
import FileDropzone from '../components/FileDropzone'
import { useAuth } from '../context/AuthContext'

export default function MyTips() {
  const { canWrite } = useAuth()
  const [items, setItems] = useState([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ title: '', type: 'tip', body: '' })
  const [files, setFiles] = useState([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const load = () => api.get('/knowledge', { params: { mine: 1 } }).then(({ data }) => setItems(data.data || []))

  useEffect(() => {
    load()
  }, [])

  const close = () => {
    setOpen(false)
    setFiles([])
    setError('')
  }

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const payload = new FormData()
      Object.entries(form).forEach(([k, v]) => payload.append(k, v))
      files.forEach((f) => payload.append('media[]', f))
      await api.post('/knowledge', payload, { headers: { 'Content-Type': 'multipart/form-data' } })
      close()
      setForm({ title: '', type: 'tip', body: '' })
      load()
    } catch (err) {
      const fields = err.response?.data?.errors
      const text = (fields && Object.values(fields).flat()[0]) || err.response?.data?.message || 'Could not submit your tip. Please try again.'
      setError(/failed to upload/i.test(text) ? 'The file could not be uploaded. It may be too large. Try a smaller photo or video (under 50 MB).' : text)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <div className="mb-5 flex justify-between">
        <h1 className="text-3xl font-semibold">My Tips</h1>
        {canWrite && (
          <button className="rounded-xl bg-[#7a5539] px-4 py-2 text-white" onClick={() => setOpen(true)}>
            Share a tip
          </button>
        )}
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
        <Modal title="Share workplace knowledge" onClose={close}>
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

            <FileDropzone files={files} onChange={setFiles} hint="JPG, PNG or MP4, up to 50 MB" />

            {error && (
              <p role="alert" className="rounded-xl border border-rose-300 bg-rose-100 p-3 text-sm font-medium text-rose-800">
                {error}
              </p>
            )}
            <button disabled={busy} className="w-full rounded-xl bg-[#7a5539] py-2 text-white disabled:opacity-60">
              {busy ? 'Submitting...' : 'Submit for review'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  )
}