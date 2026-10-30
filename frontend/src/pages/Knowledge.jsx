import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import api from '../api/client'
import Badge from '../components/Badge'

export default function Knowledge({ forcedType }) {
  const [params, setParams] = useSearchParams()
  const [items, setItems] = useState([])
  const q = params.get('q') || ''
  const type = forcedType || params.get('type') || ''

  useEffect(() => {
    api.get('/knowledge', { params: { q, type } }).then(({ data }) => setItems(data.data || []))
  }, [q, type])

  return (
    <div>
      <div className="mb-5 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Knowledge Base</h1>
          <p className="text-[#7a6a5c]">Tutorials, documentation, troubleshooting, and machine procedures.</p>
        </div>
        <Link to="/app/tips" className="rounded-xl bg-press px-4 py-2 text-white">
          Share a tip
        </Link>
      </div>
      <div className="mb-5 flex gap-3">
        <input
          className="flex-1 rounded-xl border border-[#e5d8c8] px-3 py-2"
          placeholder="Search tutorials, guides, procedures…"
          defaultValue={q}
          onKeyDown={(e) => {
            if (e.key === 'Enter') setParams({ q: e.target.value, type })
          }}
        />
        {!forcedType && (
          <select className="rounded-xl border border-[#e5d8c8] px-3 py-2" value={type} onChange={(e) => setParams({ q, type: e.target.value })}>
            <option value="">All types</option>
            <option value="tutorial">Tutorial</option>
            <option value="documentation">Documentation</option>
            <option value="troubleshooting">Troubleshooting</option>
            <option value="procedure">Procedure</option>
            <option value="tip">Tip</option>
          </select>
        )}
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((t) => (
          <article key={t.id} className="card overflow-hidden">
            <div className="h-28 overflow-hidden bg-[#efe0d0]">
              {t.media?.[0]?.url ? (
                t.media[0].kind === 'video' ? (
                  <video className="h-full w-full object-cover" src={t.media[0].url} muted />
                ) : (
                  <img className="h-full w-full object-cover" src={t.media[0].url} alt="" />
                )
              ) : null}
            </div>
            <div className="space-y-2 p-4">
              <div className="flex items-center justify-between text-xs text-[#7a6a5c]">
                <Badge>{t.type}</Badge>
                <span>{t.views} views</span>
              </div>
              <h3 className="font-semibold">{t.title}</h3>
              <p className="line-clamp-2 text-sm text-[#7a6a5c]">{t.body}</p>
              <Link to={`/app/knowledge/${t.id}`} className="inline-block text-sm text-press">
                View guide →
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
