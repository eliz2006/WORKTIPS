import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import api from '../api/client'
import Badge from '../components/Badge'
import Modal from '../components/Modal'
import { REPORT_REASONS } from '../lib/reportReasons'
import { useAuth } from '../context/AuthContext'

export default function KnowledgeDetail() {
  const { canWrite } = useAuth()
  const { id } = useParams()
  const location = useLocation()
  const [item, setItem] = useState(null)
  const [comment, setComment] = useState('')
  const [score, setScore] = useState(5)
  const [reportOpen, setReportOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [details, setDetails] = useState('')
  const [reportBusy, setReportBusy] = useState(false)
  const [reportError, setReportError] = useState('')
  const [reportDone, setReportDone] = useState(false)

  const closeReport = () => {
    setReportOpen(false)
    setReason('')
    setDetails('')
    setReportError('')
    setReportDone(false)
  }

  const sendReport = async (e) => {
    e.preventDefault()
    setReportError('')
    setReportBusy(true)
    try {
      await api.post(`/knowledge/${id}/report`, { reason, details: details.trim() || null })
      setReportDone(true)
    } catch (err) {
      const fields = err.response?.data?.errors
      setReportError((fields && Object.values(fields).flat()[0]) || err.response?.data?.message || 'Could not send the report. Please try again.')
    } finally {
      setReportBusy(false)
    }
  }

  // back to the list the visitor came from (keeps the search and type filter)
  const backTo = location.state?.from || '/app/knowledge'

  const load = () => api.get(`/knowledge/${id}`).then(({ data }) => setItem(data))

  useEffect(() => {
    load()
  }, [id])

  const back = (
    <Link
      to={backTo}
      className="mb-5 inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-[#5c4a3d] transition hover:-translate-x-0.5 hover:bg-white motion-reduce:transition-none motion-reduce:hover:translate-x-0"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M10 3L5 8l5 5" />
      </svg>
      Back to Knowledge Base
    </Link>
  )

  if (!item) return <div className="mx-auto max-w-3xl">{back}</div>

  const video = item.media?.find((m) => m.kind === 'video')

  return (
    <div className="mx-auto max-w-3xl">
      {back}
      <div className="mb-3 flex gap-2">
        <Badge>{item.type}</Badge>
        <Badge>{item.status}</Badge>
      </div>
      <h1 className="text-3xl font-semibold">{item.title}</h1>
      <p className="mt-1 text-sm text-[#7a6a5c]">
        By {item.author?.name} · {item.views} views · {item.average_rating || 0}/5
      </p>
      {video && (
        <video className="mt-5 w-full rounded-2xl" controls src={video.url}>
          <track kind="captions" />
        </video>
      )}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {item.media
          ?.filter((m) => m.kind === 'photo')
          .map((m) => (
            <img key={m.id} src={m.url} alt={m.original_name} className="rounded-2xl" />
          ))}
      </div>
      <div className="card mt-5 whitespace-pre-wrap p-5 leading-7">{item.body}</div>
      {item.printer && (
        <div className="card mt-4 p-4 text-sm">
          Compatible printer: <strong>{item.printer.name}</strong>
          <div className="mt-2">Ink: {item.printer.ink_types?.map((i) => `${i.color} (${i.brand})`).join(', ') || '—'}</div>
        </div>
      )}
      {canWrite && (
        <div className="mt-4 flex flex-wrap gap-2">
          <button className="rounded-xl border border-[#e5d8c8] px-3 py-2" onClick={() => api.post(`/knowledge/${id}/save`).then(load)}>
            {item.is_saved ? 'Saved' : 'Save'}
          </button>
          <form
            className="flex gap-2"
            onSubmit={async (e) => {
              e.preventDefault()
              await api.post(`/knowledge/${id}/rate`, { score })
              load()
            }}
          >
            <select value={score} onChange={(e) => setScore(e.target.value)} className="rounded-xl border px-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
            <button className="rounded-xl bg-[#7a5539] px-3 py-2 text-white">Rate</button>
          </form>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl border border-rose-200 px-3 py-2 text-rose-700 transition hover:bg-rose-50"
            onClick={() => setReportOpen(true)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 22V4M4 4h13l-2 4 2 4H4" />
            </svg>
            Report
          </button>
        </div>
      )}
      <section className="mt-8">
        <h3 className="mb-3 font-semibold">Comments</h3>
        {item.comments?.map((c) => (
          <div key={c.id} className="mb-2 rounded-xl bg-white p-3 text-sm">
            <strong>{c.user?.name}</strong>
            <p>{c.body}</p>
          </div>
        ))}
        {canWrite && (
          <form
            className="mt-3 flex gap-2"
            onSubmit={async (e) => {
              e.preventDefault()
              await api.post(`/knowledge/${id}/comments`, { body: comment })
              setComment('')
              load()
            }}
          >
            <input className="flex-1 rounded-xl border px-3 py-2" value={comment} onChange={(e) => setComment(e.target.value)} />
            <button className="rounded-xl bg-[#7a5539] px-4 text-white">Post</button>
          </form>
        )}
      </section>

      {reportOpen && (
        <Modal title="Report this content" onClose={closeReport}>
          {reportDone ? (
            <div className="space-y-4 text-center">
              <p role="status" className="rounded-xl border border-green-300 bg-green-100 p-4 text-sm font-medium text-green-900">
                Thank you. An administrator will review this content.
              </p>
              <button type="button" onClick={closeReport} className="rounded-xl bg-[#7a5539] px-5 py-2.5 font-semibold text-white">
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={sendReport} className="space-y-3">
              <p className="text-sm text-[#6b5a4c]">What is wrong with this content?</p>
              <div role="radiogroup" aria-label="Reason for the report" className="grid gap-2">
                {REPORT_REASONS.map((r) => {
                  const on = reason === r.value
                  return (
                    <button
                      key={r.value}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      onClick={() => setReason(r.value)}
                      className={`rounded-xl border p-3 text-left transition ${on ? 'border-[#7a5539] bg-white shadow-[0_0_0_3px_rgba(224,180,106,.45)]' : 'border-[#e0d2c2] bg-[#f6efe6] hover:bg-white'}`}
                    >
                      <div className="font-semibold">{r.label}</div>
                      <div className="text-xs text-[#6b5a4c]">{r.hint}</div>
                    </button>
                  )
                })}
              </div>
              <textarea
                rows="3"
                maxLength={1000}
                required={reason === 'other'}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder={reason === 'other' ? 'Tell us what is wrong (required)' : 'More details (optional)'}
                className="w-full rounded-xl border border-[#e0d2c2] px-3 py-2 outline-none focus:border-[#7a5539]"
              />
              {reportError && (
                <p role="alert" className="rounded-xl border border-rose-300 bg-rose-100 p-3 text-sm font-medium text-rose-800">{reportError}</p>
              )}
              <button disabled={!reason || reportBusy} className="w-full rounded-xl bg-[#7a5539] py-2.5 font-semibold text-white disabled:opacity-50">
                {reportBusy ? 'Sending...' : 'Send report'}
              </button>
            </form>
          )}
        </Modal>
      )}
    </div>
  )
}