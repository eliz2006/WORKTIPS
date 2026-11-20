import { useEffect, useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import api from '../api/client'
import { periodParams } from './FilterBar'

const tip = { borderRadius: 12, border: '1px solid #e0d2c2', background: '#fbf7f2', boxShadow: '0 8px 20px rgba(44,33,24,.12)' }
const tick = { fill: '#6b5a4c', fontSize: 12 }
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const money = (n) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(n || 0)
const TITLES = { day: 'Sales by date', month: 'Sales by month', year: 'Sales by year' }
const MAX_BARS = 31

function label(group, p) {
  if (group === 'day') { const [, m, d] = p.split('-'); return `${MON[m - 1]} ${Number(d)}` }
  if (group === 'month') { const [y, m] = p.split('-'); return `${MON[m - 1]} ${y}` }
  return p
}

/** Number of sales per date, month or year. Follows the same filter and "View by" as the sales record. */
export default function JobsChart({ filter, group, refreshKey = 0 }) {
  const [rows, setRows] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    setError('')
    api
      .get('/jobs/summary', { params: { group, ...periodParams(filter) } })
      .then((r) => setRows(r.data.rows))
      .catch(() => setError('Could not load the sales chart.'))
  }, [group, filter.month, filter.year, refreshKey])

  const { data, cut } = useMemo(() => {
    const all = (rows || [])
      .map((r) => ({ name: label(group, r.period), jobs: Number(r.orders), sales: Number(r.total), key: r.period }))
      .sort((a, b) => a.key.localeCompare(b.key)) // oldest to newest
    return { data: all.slice(-MAX_BARS), cut: Math.max(all.length - MAX_BARS, 0) }
  }, [rows, group])

  return (
    <section className="rounded-3xl border border-[#e0d2c2] bg-[#fbf7f2] p-6">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-xl font-semibold">{TITLES[group]}</h3>
        {cut > 0 && <span className="text-xs text-[#8a7b6d]">Showing the latest {MAX_BARS}. Choose a month or year to see older ones.</span>}
      </div>
      {error && <p role="alert" className="mb-3 text-sm text-rose-700">{error}</p>}
      {!rows ? (
        <div className="h-64 animate-pulse rounded-2xl bg-[#eadfce]" />
      ) : data.length === 0 ? (
        <p className="rounded-xl bg-[#f3ebe0] p-4 text-sm text-[#6b5a4c]">No sales to chart for this period.</p>
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <defs>
                <linearGradient id="jb-bar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#e0b46a" />
                  <stop offset="1" stopColor="#7a5539" />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#eadfce" vertical={false} />
              <XAxis dataKey="name" tick={tick} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={tick} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={tip}
                cursor={{ fill: 'rgba(224,180,106,.18)' }}
                formatter={(v, n, p) => [`${v} ${v === 1 ? 'sale' : 'sales'}, ${money(p.payload.sales)}`, p.payload.name]}
                separator=": "
              />
              <Bar dataKey="jobs" fill="url(#jb-bar)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  )
}