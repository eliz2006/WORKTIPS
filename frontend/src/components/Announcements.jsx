import { useCallback, useEffect, useRef, useState } from 'react'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'

const css = `
@keyframes an-ring{0%,100%{transform:rotate(0)}15%{transform:rotate(14deg)}30%{transform:rotate(-12deg)}45%{transform:rotate(8deg)}60%{transform:rotate(-6deg)}75%{transform:rotate(0)}}
@keyframes an-pop{from{opacity:0;transform:translateY(-6px) scale(.97)}to{opacity:1;transform:none}}
@keyframes an-ping{0%{transform:scale(1);opacity:.7}100%{transform:scale(2.2);opacity:0}}
.an-ring{transform-origin:50% 8%;animation:an-ring 1.6s ease-in-out 1}
.an-has .an-ring{animation:an-ring 1.6s ease-in-out infinite;animation-delay:2s}
.an-panel{animation:an-pop .2s cubic-bezier(.2,.7,.2,1)}
.an-ping{animation:an-ping 1.8s ease-out infinite}
@media (prefers-reduced-motion:reduce){.an-ring,.an-has .an-ring,.an-panel,.an-ping{animation:none}}
`

const when = (iso) =>
  new Date(iso).toLocaleString('en-PH', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })

export default function Announcements() {
  const { user, isAdmin } = useAuth()
  const [items, setItems] = useState([])
  const [open, setOpen] = useState(false)
  const [fresh, setFresh] = useState(new Set()) // marked "New" while the panel is open
  const [form, setForm] = useState({ title: '', body: '' })
  const [composing, setComposing] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const box = useRef(null)
  const seenKey = `printour_announcements_seen_${user?.id}`

  const readSeen = () => {
    try { return Number(localStorage.getItem(seenKey)) || 0 } catch { return 0 }
  }

  const load = useCallback(
    () => api.get('/announcements').then(({ data }) => setItems(Array.isArray(data) ? data : data.data || [])).catch(() => {}),
    [],
  )

  // load now, then check for new ones every minute
  useEffect(() => {
    load()
    const t = setInterval(load, 60000)
    return () => clearInterval(t)
  }, [load])

  // close on outside click or Escape
  useEffect(() => {
    if (!open) return
    const onDown = (e) => box.current && !box.current.contains(e.target) && setOpen(false)
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const seen = readSeen()
  const unread = items.filter((a) => new Date(a.created_at).getTime() > seen)

  const toggle = () => {
    if (open) return setOpen(false)
    setFresh(new Set(unread.map((a) => a.id)))
    setOpen(true)
    load()
    const newest = Math.max(0, ...items.map((a) => new Date(a.created_at).getTime()))
    try { localStorage.setItem(seenKey, String(Math.max(newest, Date.now() - 1000))) } catch {}
  }

  const post = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await api.post('/announcements', { title: form.title, body: form.body })
      setForm({ title: '', body: '' })
      setComposing(false)
      await load()
    } catch (err) {
      const fields = err.response?.data?.errors
      setError((fields && Object.values(fields).flat()[0]) || err.response?.data?.message || 'Could not post the announcement.')
    } finally {
      setBusy(false)
    }
  }

  const remove = async (a) => {
    if (!window.confirm(`Delete "${a.title}"?`)) return
    await api.delete(`/announcements/${a.id}`).catch(() => {})
    load()
  }

  return (
    <div ref={box} className={`relative ${unread.length ? 'an-has' : ''}`}>
      <style>{css}</style>
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={unread.length ? `Announcements, ${unread.length} new` : 'Announcements'}
        className="relative grid h-10 w-10 place-items-center rounded-full border border-[#e0d2c2] bg-white text-[#5c3f27] transition hover:-translate-y-0.5 hover:shadow-md"
      >
        <svg className="an-ring" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 8.5 3 8.5H3S6 15 6 8" />
          <path d="M10.3 20a1.9 1.9 0 0 0 3.4 0" />
        </svg>
        {unread.length > 0 && (
          <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-rose-600 px-1 text-[11px] font-bold text-white">
            <span className="an-ping absolute inset-0 rounded-full bg-rose-500" aria-hidden="true" />
            <span className="relative">{unread.length > 9 ? '9+' : unread.length}</span>
          </span>
        )}
      </button>

      {open && (
        <div role="dialog" aria-label="Announcements" className="an-panel absolute right-0 top-full z-40 mt-3 w-[24rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-3xl border border-[#e0d2c2] bg-[#fbf7f2] shadow-2xl">
          <div className="flex items-center justify-between border-b border-[#e0d2c2] px-5 py-4">
            <h2 className="text-lg font-semibold">Announcements</h2>
            {isAdmin && !composing && (
              <button type="button" onClick={() => setComposing(true)} className="rounded-xl bg-[#7a5539] px-3 py-1.5 text-sm font-semibold text-white transition hover:-translate-y-0.5">
                New
              </button>
            )}
          </div>

          {isAdmin && composing && (
            <form onSubmit={post} className="space-y-3 border-b border-[#e0d2c2] bg-white/60 p-4">
              <input required maxLength={150} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title" className="w-full rounded-xl border border-[#e0d2c2] bg-white px-3 py-2 text-sm outline-none focus:border-[#7a5539]" />
              <textarea required maxLength={2000} rows={3} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder="Message to all users" className="w-full rounded-xl border border-[#e0d2c2] bg-white px-3 py-2 text-sm outline-none focus:border-[#7a5539]" />
              {error && <p role="alert" className="text-sm font-medium text-rose-700">{error}</p>}
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => { setComposing(false); setError('') }} className="rounded-xl px-3 py-2 text-sm font-medium hover:bg-white">Cancel</button>
                <button disabled={busy} className="rounded-xl bg-[#7a5539] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{busy ? 'Posting...' : 'Post to everyone'}</button>
              </div>
            </form>
          )}

          <ul className="max-h-96 divide-y divide-[#eadfce] overflow-y-auto">
            {items.length === 0 && <li className="p-6 text-center text-sm text-[#6b5a4c]">No announcements yet.</li>}
            {items.map((a) => (
              <li key={a.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-semibold leading-snug">
                    {a.title}
                    {fresh.has(a.id) && <span className="ml-2 rounded-full bg-rose-100 px-2 py-0.5 align-middle text-[11px] font-bold text-rose-700">New</span>}
                  </h3>
                  {isAdmin && (
                    <button type="button" onClick={() => remove(a)} aria-label={`Delete ${a.title}`} className="rounded-lg px-2 py-1 text-xs text-rose-700 hover:bg-rose-50">Delete</button>
                  )}
                </div>
                <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-[#5c4a3d]">{a.body}</p>
                <p className="mt-2 text-xs text-[#8a7b6d]">{a.author?.name ? `${a.author.name}, ` : ''}{when(a.created_at)}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}