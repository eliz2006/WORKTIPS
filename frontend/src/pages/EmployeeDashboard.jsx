import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import { DashStyles, Empty, Kpi, PageHeading, Panel, Pill } from '../components/DashKit'

function greeting() {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
}

const tone = (s) => (s === 'resolved' || s === 'closed' ? 'green' : s === 'open' ? 'amber' : 'brown')

export default function EmployeeDashboard() {
  const { user, canWrite, isRecipient } = useAuth()
  const [tips, setTips] = useState(null)
  const [issues, setIssues] = useState(null)
  const [saved, setSaved] = useState(0)

  useEffect(() => {
    api.get('/knowledge', { params: { per_page: 4 } }).then(({ data }) => setTips(data.data || data)).catch(() => setTips([]))
    api.get('/issues').then(({ data }) => setIssues(data.data || [])).catch(() => setIssues([]))
    api.get('/knowledge', { params: { saved: 1 } }).then(({ data }) => setSaved(data.total ?? (data.data || []).length)).catch(() => {})
  }, [])

  const openCount = (issues || []).filter((i) => i.status !== 'resolved').length

  return (
    <div>
      <DashStyles />
      <PageHeading
        title={`${greeting()}, ${user?.name?.split(' ')[0] || ''}`}
        sub={canWrite ? 'Find answers, share what you know, and keep the presses running.' : 'You have view-only access. Browse knowledge, printers, jobs and issue reports.'}
        action={
          canWrite && (
            <Link to="/app/tips" className="rounded-xl bg-[#7a5539] px-5 py-3 font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-lg">
              Share a tip
            </Link>
          )
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Kpi label="Published tips" value={(tips || []).length} icon="✎" hint="Latest approved" />
        <Kpi label="Open issues" value={openCount} icon="⚑" />
        <Kpi label="Saved items" value={saved} icon="♡" />
        <Kpi label="Your role" value={isRecipient ? 'Recipient' : 'Employee'} icon="⌂" hint={user?.department} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Panel title="Recent workplace tips">
          {tips === null ? (
            <div className="space-y-3">{[0, 1, 2].map((i) => <div key={i} className="dk-skel h-16 rounded-2xl" />)}</div>
          ) : tips.length ? (
            <div className="space-y-3">
              {tips.map((t) => (
                <Link key={t.id} to={`/app/knowledge/${t.id}`} className="dk-row block rounded-2xl bg-[#f3ebe0] p-4">
                  <div className="font-semibold">{t.title}</div>
                  <div className="mt-1 text-sm text-[#6b5a4c]">
                    {t.type}, {t.views} views{t.author?.name ? `, by ${t.author.name}` : ''}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <Empty>No tips have been published yet.{canWrite && ' Be the first to share one.'}</Empty>
          )}
        </Panel>

        <Panel title="Your issue reports">
          {issues === null ? (
            <div className="space-y-3">{[0, 1, 2].map((i) => <div key={i} className="dk-skel h-16 rounded-2xl" />)}</div>
          ) : issues.length ? (
            <div className="space-y-3">
              {issues.slice(0, 5).map((i) => (
                <div key={i.id} className="dk-row flex items-center justify-between gap-3 rounded-2xl bg-[#f3ebe0] p-4">
                  <div className="min-w-0">
                    <div className="truncate font-semibold">{i.title}</div>
                    <div className="text-sm text-[#6b5a4c]">{i.printer?.name}</div>
                  </div>
                  <Pill tone={tone(i.status)}>{i.status}</Pill>
                </div>
              ))}
            </div>
          ) : (
            <Empty>No issues reported. If a machine acts up, report it from Issue Reports.</Empty>
          )}
        </Panel>
      </div>
    </div>
  )
}