import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import Badge from '../components/Badge'
import StatCard from '../components/StatCard'

export default function EmployeeDashboard() {
  const { user } = useAuth()
  const [tips, setTips] = useState([])
  const [issues, setIssues] = useState([])
  const [saved, setSaved] = useState(0)

  useEffect(() => {
    api.get('/knowledge', { params: { per_page: 4 } }).then(({ data }) => setTips(data.data || data))
    api.get('/issues').then(({ data }) => setIssues(data.data || []))
    api.get('/knowledge', { params: { saved: 1 } }).then(({ data }) => setSaved(data.total ?? (data.data || []).length))
  }, [])

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-[11px] tracking-[0.18em] text-[#8a7b6d]">WORKTIPS WORKSPACE</div>
          <h1 className="text-3xl font-semibold">Good day, {user?.name?.split(' ')[0]}</h1>
          <p className="text-[#7a6a5c]">Find answers, share knowledge, and keep the presses running.</p>
        </div>
        <Link to="/app/tips" className="rounded-xl bg-press px-4 py-2 text-white">
          Share a tip
        </Link>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Published tips" value={tips.length} icon="✎" hint="Latest approved knowledge" />
        <StatCard label="Open issues" value={issues.filter((i) => i.status !== 'resolved').length} icon="⚑" />
        <StatCard label="Saved items" value={saved} icon="♡" />
        <StatCard label="Your role" value="Employee" icon="⌂" hint={user?.department} />
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section className="card p-5">
          <h3 className="mb-3 font-semibold">Recent workplace tips</h3>
          <div className="space-y-3">
            {tips.map((t) => (
              <Link key={t.id} to={`/app/knowledge/${t.id}`} className="block rounded-xl bg-[#fbf7f2] p-3">
                <div className="font-medium">{t.title}</div>
                <div className="text-xs text-[#7a6a5c]">
                  {t.type} · {t.views} views · {t.author?.name}
                </div>
              </Link>
            ))}
          </div>
        </section>
        <section className="card p-5">
          <h3 className="mb-3 font-semibold">Your issue reports</h3>
          <div className="space-y-3">
            {issues.slice(0, 5).map((i) => (
              <div key={i.id} className="flex items-center justify-between rounded-xl bg-[#fbf7f2] p-3">
                <div>
                  <div className="font-medium">{i.title}</div>
                  <div className="text-xs text-[#7a6a5c]">{i.printer?.name}</div>
                </div>
                <Badge>{i.status}</Badge>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
