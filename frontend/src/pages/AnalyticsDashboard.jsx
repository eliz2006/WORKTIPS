import { useCallback, useEffect, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import api from '../api/client'
import FilterBar, { periodLabel, periodRange } from '../components/FilterBar'
import { DashSkeleton, DashStyles, Empty, Kpi, PageHeading, Panel, Pill, RankList } from '../components/DashKit'

const COLORS = ['#7a5539', '#e0b46a', '#c6a786', '#a9805a', '#e5c7a7']
const tip = { borderRadius: 12, border: '1px solid #e0d2c2', background: '#fbf7f2', boxShadow: '0 8px 20px rgba(44,33,24,.12)' }
const tick = { fill: '#6b5a4c', fontSize: 12 }

function money(n) {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(n || 0)
}

export default function AnalyticsDashboard() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState({ month: '', year: String(new Date().getFullYear()) })
  const [refreshing, setRefreshing] = useState(false)
  const [pdfBusy, setPdfBusy] = useState(false)

  const load = useCallback(() => {
    setError('')
    setRefreshing(true)
    api
      .get('/analytics', { params: periodRange(filter) })
      .then(({ data }) => setData(data))
      .catch((err) => {
        setError(
          err.response?.data?.message ||
            (err.code === 'ERR_NETWORK' ? 'Cannot reach the server. Check your connection and try again. If the server was idle, wait a minute for it to wake up.' : err.message),
        )
      })
      .finally(() => setRefreshing(false))
  }, [filter])

  useEffect(load, [load])

  const downloadPdf = async () => {
    setPdfBusy(true)
    try {
      const { downloadAnalyticsPdf } = await import('../lib/analyticsPdf')
      downloadAnalyticsPdf(data, periodLabel(filter))
    } finally {
      setPdfBusy(false)
    }
  }

  if (error) {
    return (
      <div role="alert" className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-800">
        <h2 className="text-xl font-semibold">Analytics could not load</h2>
        <p className="mt-2 text-sm">{error}</p>
        <button onClick={load} className="mt-4 rounded-xl bg-[#7a5539] px-4 py-2 text-sm font-semibold text-white">Try again</button>
      </div>
    )
  }

  if (!data) return (<><DashStyles /><DashSkeleton /></>)

  const k = data.kpis
  const salesByType = (data.sales_by_type || []).map((r) => ({ ...r, total: Number(r.total), orders: Number(r.orders) }))
  const attention = [...(data.maintenance_due || []).map((p) => ({ id: `m${p.id}`, name: p.name, pill: <Pill tone="amber">Due {p.next_maintenance_at}</Pill> })), ...(data.printers_with_problems || []).map((p) => ({ id: `i${p.id}`, name: p.name, pill: <Pill tone="red">{p.open_issues_count} open issues</Pill> }))]

  return (
    <div className={refreshing ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
      <DashStyles />
      <PageHeading title="Business analytics" sub="Live totals from printing jobs, ink logs, issues and maintenance." />
      <FilterBar value={filter} onChange={setFilter}>
        <span className="text-sm text-[#6b5a4c]">Showing: <strong>{periodLabel(filter)}</strong></span>
        <button type="button" onClick={downloadPdf} disabled={pdfBusy} className="rounded-xl bg-[#7a5539] px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60">
          {pdfBusy ? 'Preparing PDF...' : 'Download PDF report'}
        </button>
      </FilterBar>

      <div className="grid gap-4 md:grid-cols-4">
        <Kpi label="Total sales" value={k.total_sales} format={money} icon="₱" hint="Completed jobs in range" />
        <Kpi label="Total orders" value={k.total_orders} icon="▤" hint={`Average ${money(k.average_order_value)}`} />
        <Kpi label="Ink consumed" value={k.ink_consumed_ml / 1000} format={(n) => `${n.toFixed(1)} L`} icon="◉" />
        <Kpi label="Open issues" value={k.open_issues} icon="⚑" hint={`${k.pending_tips} tips pending`} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Panel title="Monthly sales">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.monthly_sales}>
                <defs>
                  <linearGradient id="dk-bar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#c08a4c" />
                    <stop offset="1" stopColor="#7a5539" />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#eadfce" vertical={false} />
                <XAxis dataKey="month" tick={tick} axisLine={false} tickLine={false} />
                <YAxis tick={tick} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v) => money(v)} contentStyle={tip} cursor={{ fill: 'rgba(224,180,106,.18)' }} />
                <Bar dataKey="total" fill="url(#dk-bar)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Sales by printing type">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={salesByType} dataKey="total" nameKey="printing_type" innerRadius={62} outerRadius={96} paddingAngle={3} stroke="none">
                  {salesByType.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => money(v)} contentStyle={tip} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Panel title="Ink used by printer">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.ink_by_printer} layout="vertical">
                <defs>
                  <linearGradient id="dk-bar-h" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0" stopColor="#7a5539" />
                    <stop offset="1" stopColor="#d9a64e" />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#eadfce" horizontal={false} />
                <XAxis type="number" tick={tick} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" width={110} tick={tick} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v) => `${(v / 1000).toFixed(2)} L`} contentStyle={tip} cursor={{ fill: 'rgba(224,180,106,.18)' }} />
                <Bar dataKey="ml" fill="url(#dk-bar-h)" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Ink usage by type">
          <p className="mb-4 text-sm text-[#6b5a4c]">
            Most used: <strong>{data.most_used_ink ? `${data.most_used_ink.color} ${data.most_used_ink.brand}` : 'none yet'}</strong>
          </p>
          <RankList
            items={(data.ink_by_type || []).slice(0, 6).map((r) => ({ label: `${r.color} ${r.brand}`, value: r.ml }))}
            fmt={(v) => `${(v / 1000).toFixed(2)} L`}
            empty="No ink has been logged in this range."
          />
        </Panel>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Panel title="Printers needing attention" className="lg:col-span-1">
          {attention.length ? (
            <ul className="space-y-3">
              {attention.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3 text-sm">
                  <span className="truncate">{a.name}</span>
                  {a.pill}
                </li>
              ))}
            </ul>
          ) : (
            <Empty>All printers are in good shape.</Empty>
          )}
        </Panel>
        <Panel title="Frequently replaced parts">
          <RankList items={(data.frequently_replaced_parts || []).map((p) => ({ label: p.name, value: p.replaced }))} empty="No parts replaced yet." />
        </Panel>
        <Panel title="Most useful tips">
          <RankList items={(data.most_useful_tips || []).map((t) => ({ label: t.title, value: Number(t.ratings_avg_score || 0) }))} fmt={(v) => v.toFixed(1)} empty="No rated tips yet." />
        </Panel>
        <Panel title="Most viewed tutorials">
          <RankList items={(data.most_viewed_tutorials || []).map((t) => ({ label: t.title, value: t.views }))} fmt={(v) => `${v} views`} empty="No tutorials yet." />
        </Panel>
        <Panel title="Most reported issues" className="lg:col-span-2">
          <RankList items={(data.most_reported_issues || []).map((t) => ({ label: t.title, value: t.reports }))} fmt={(v) => `${v} reports`} empty="No issues reported yet." />
        </Panel>
      </div>
    </div>
  )
}