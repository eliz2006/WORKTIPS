import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../api/client'
import Badge from '../components/Badge'

export default function KnowledgeDetail() {
  const { id } = useParams()
  const [item, setItem] = useState(null)
  const [comment, setComment] = useState('')
  const [score, setScore] = useState(5)

  const load = () => api.get(`/knowledge/${id}`).then(({ data }) => setItem(data))

  useEffect(() => {
    load()
  }, [id])

  if (!item) return null

  const video = item.media?.find((m) => m.kind === 'video')

  return (
    <div className="mx-auto max-w-3xl">
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
          <button className="rounded-xl bg-press px-3 py-2 text-white">Rate</button>
        </form>
        <button
          className="rounded-xl border border-rose-200 px-3 py-2 text-rose-700"
          onClick={() => api.post(`/knowledge/${id}/report`, { reason: 'outdated', details: 'Flagged from workspace' })}
        >
          Report outdated
        </button>
      </div>
      <section className="mt-8">
        <h3 className="mb-3 font-semibold">Comments</h3>
        {item.comments?.map((c) => (
          <div key={c.id} className="mb-2 rounded-xl bg-white p-3 text-sm">
            <strong>{c.user?.name}</strong>
            <p>{c.body}</p>
          </div>
        ))}
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
          <button className="rounded-xl bg-press px-4 text-white">Post</button>
        </form>
      </section>
    </div>
  )
}
