import { useEffect, useState } from 'react'
import api from '../api/client'
import Badge from '../components/Badge'
import Modal from '../components/Modal'
import { reasonLabel } from '../lib/reportReasons'

const ThumbUp = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M7 10v12" />
    <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" />
  </svg>
)
const ThumbDown = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M17 14V2" />
    <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z" />
  </svg>
)

export default function Content() {
  const [items, setItems] = useState([])
  const [status, setStatus] = useState('pending')
  const [categories, setCategories] = useState([])
  const [reports, setReports] = useState([])
  const [catName, setCatName] = useState('')

  // review window
  const [reviewId, setReviewId] = useState(null)
  const [detail, setDetail] = useState(null)
  const [rejecting, setRejecting] = useState(false)
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const load = () => api.get('/knowledge', { params: { status } }).then(({ data }) => setItems(data.data || []))
  const loadMeta = () => {
    api.get('/categories').then(({ data }) => setCategories(data))
    api.get('/content-reports', { params: { status: 'open' } }).then(({ data }) => setReports(data.data || data))
  }

  useEffect(() => {
    load()
  }, [status])

  useEffect(() => {
    loadMeta()
  }, [])

  // open the content so the admin can read it before deciding
  useEffect(() => {
    if (!reviewId) return
    setDetail(null)
    api
      .get(`/knowledge/${reviewId}`, { params: { review: 1 } })
      .then(({ data }) => setDetail(data))
      .catch(() => setError('Could not open this content.'))
  }, [reviewId])

  const itemReports = reports.filter((r) => (r.item?.id ?? r.knowledge_item_id) === reviewId)

  const openReview = (id) => {
    setReviewId(id)
    setRejecting(false)
    setNote('')
    setError('')
  }
  const closeReview = () => {
    setReviewId(null)
    setDetail(null)
    setRejecting(false)
    setError('')
  }

  // Like = the content is okay. Dislike = it is not okay and gets rejected.
  const decide = async (kind) => {
    setError('')
    setBusy(true)
    try {
      if (kind === 'like') {
        if (detail.status !== 'approved') await api.patch(`/knowledge/${detail.id}/moderate`, { status: 'approved', rejection_reason: null })
      } else {
        await api.patch(`/knowledge/${detail.id}/moderate`, { status: 'rejected', rejection_reason: note.trim() })
      }
      await Promise.all(itemReports.map((r) => api.patch(`/content-reports/${r.id}`)))
      closeReview()
      load()
      loadMeta()
    } catch (err) {
      const fields = err.response?.data?.errors
      setError((fields && Object.values(fields).flat()[0]) || err.response?.data?.message || 'Could not save your decision.')
    } finally {
      setBusy(false)
    }
  }

  const addCategory = async (e) => {
    e.preventDefault()
    await api.post('/categories', { name: catName, scope: 'knowledge' })
    setCatName('')
    loadMeta()
  }

  const reportCount = (id) => reports.filter((r) => (r.item?.id ?? r.knowledge_item_id) === id).length

  return (
    <div>
      <h1 className="mb-4 text-3xl font-semibold">Content management</h1>
      <p className="mb-6 text-[#7a6a5c]">Review employee tips and reported content, and maintain categories.</p>

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <section className="card p-5">
          <h3 className="mb-3 font-semibold">Categories</h3>
          <form className="mb-3 flex gap-2" onSubmit={addCategory}>
            <input className="flex-1 rounded-xl border px-3 py-2" placeholder="New category" value={catName} onChange={(e) => setCatName(e.target.value)} required />
            <button className="rounded-xl bg-[#7a5539] px-3 py-2 text-white">Add</button>
          </form>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <Badge key={c.id}>{c.name}</Badge>
            ))}
          </div>
        </section>

        <section className="card p-5">
          <h3 className="mb-3 font-semibold">Open content reports</h3>
          {reports.length === 0 && <p className="text-sm text-[#7a6a5c]">No open reports.</p>}
          {reports.map((r) => (
            <div key={r.id} className="mb-2 flex items-center justify-between gap-3 rounded-xl bg-[#fbf7f2] p-3 text-sm">
              <div className="min-w-0">
                <div className="truncate font-medium">{r.item?.title}</div>
                <div className="text-[#7a6a5c]">
                  {reasonLabel(r.reason)} · {r.reporter?.name}
                </div>
              </div>
              <button className="shrink-0 rounded-lg bg-[#7a5539] px-3 py-1.5 font-semibold text-white transition hover:-translate-y-0.5" onClick={() => openReview(r.item?.id ?? r.knowledge_item_id)}>
                View content
              </button>
            </div>
          ))}
        </section>
      </div>

      <select className="mb-4 rounded-xl border px-3 py-2" value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="pending">Pending</option>
        <option value="approved">Approved</option>
        <option value="rejected">Rejected</option>
      </select>
      <div className="card overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#f6efe6] text-left">
            <tr>
              <th className="p-3">Title</th>
              <th>Author</th>
              <th>Type</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((t) => (
              <tr key={t.id} className="cursor-pointer border-t transition hover:bg-[#fbf7f2]" onClick={() => openReview(t.id)}>
                <td className="p-3">
                  {t.title}
                  {reportCount(t.id) > 0 && <span className="ml-2 rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-700">{reportCount(t.id)} report{reportCount(t.id) > 1 ? 's' : ''}</span>}
                </td>
                <td>{t.author?.name}</td>
                <td>{t.type}</td>
                <td>
                  <Badge>{t.status}</Badge>
                </td>
                <td className="p-3">
                  <button className="rounded-lg border px-3 py-1.5 font-medium">View content</button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan="5" className="p-6 text-center text-[#6b5a4c]">Nothing here.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {reviewId && (
        <Modal title="Review content" onClose={closeReview}>
          {!detail ? (
            <p className="text-sm text-[#6b5a4c]">{error || 'Opening the content...'}</p>
          ) : (
            <div className="space-y-4">
              <div>
                <div className="mb-2 flex gap-2">
                  <Badge>{detail.type}</Badge>
                  <Badge>{detail.status}</Badge>
                </div>
                <h3 className="text-xl font-semibold">{detail.title}</h3>
                <p className="text-sm text-[#7a6a5c]">By {detail.author?.name}</p>
              </div>

              {itemReports.length > 0 && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm">
                  <div className="mb-1 font-semibold text-rose-800">Reported by users</div>
                  {itemReports.map((r) => (
                    <div key={r.id} className="mt-1 text-rose-900">
                      <strong>{reasonLabel(r.reason)}</strong> · {r.reporter?.name}
                      {r.details && <div className="text-rose-800">“{r.details}”</div>}
                    </div>
                  ))}
                </div>
              )}

              {detail.media?.find((m) => m.kind === 'video') && (
                <video className="w-full rounded-xl" controls src={detail.media.find((m) => m.kind === 'video').url} />
              )}
              <div className="grid gap-2 sm:grid-cols-2">
                {detail.media?.filter((m) => m.kind === 'photo').map((m) => (
                  <img key={m.id} src={m.url} alt={m.original_name} className="rounded-xl" />
                ))}
              </div>
              <div className="max-h-56 overflow-y-auto whitespace-pre-wrap rounded-xl bg-white p-4 text-sm leading-6">{detail.body}</div>

              {rejecting ? (
                <div className="space-y-2">
                  <label htmlFor="rv-note" className="block text-sm font-medium">Why is this content not okay?</label>
                  <textarea id="rv-note" rows="3" value={note} onChange={(e) => setNote(e.target.value)} placeholder="This reason is saved with the rejection" className="w-full rounded-xl border border-[#e0d2c2] px-3 py-2 outline-none focus:border-rose-400" />
                  {error && <p role="alert" className="text-sm font-medium text-rose-700">{error}</p>}
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setRejecting(false)} className="rounded-xl border px-4 py-2 font-medium">Back</button>
                    <button type="button" disabled={busy || !note.trim()} onClick={() => decide('dislike')} className="flex-1 rounded-xl bg-rose-700 px-4 py-2 font-semibold text-white disabled:opacity-50">
                      {busy ? 'Saving...' : 'Confirm: reject this content'}
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  {error && <p role="alert" className="mb-2 text-sm font-medium text-rose-700">{error}</p>}
                  <p className="mb-2 text-sm text-[#6b5a4c]">Is this content okay?</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button type="button" disabled={busy} onClick={() => decide('like')} className="group flex items-center justify-center gap-2 rounded-xl border border-green-300 bg-green-50 px-4 py-3 font-semibold text-green-800 transition hover:-translate-y-0.5 hover:bg-green-100 disabled:opacity-50">
                      <span className="transition-transform duration-200 group-hover:-rotate-12 group-hover:scale-110"><ThumbUp /></span>
                      Like, it is okay
                    </button>
                    <button type="button" disabled={busy} onClick={() => setRejecting(true)} className="group flex items-center justify-center gap-2 rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 font-semibold text-rose-800 transition hover:-translate-y-0.5 hover:bg-rose-100 disabled:opacity-50">
                      <span className="transition-transform duration-200 group-hover:rotate-12 group-hover:scale-110"><ThumbDown /></span>
                      Dislike, not okay
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-[#8a7b6d]">Like approves the content and closes its reports. Dislike rejects it and hides it from users.</p>
                </div>
              )}
            </div>
          )}
        </Modal>
      )}
    </div>
  )
}