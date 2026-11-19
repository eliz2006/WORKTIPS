import { useEffect, useMemo, useState } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import api from '../api/client'
import FilterBar, { periodParams } from './FilterBar'

const money = (n) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(n || 0)
const groups = [['day', 'By date'], ['month', 'By month'], ['year', 'By year']]
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const COLORS = ['#7a5539', '#e0b46a', '#a9805a', '#c6a786', '#5c3f27', '#f0d9a8', '#8d6e53', '#d4b896', '#b8956a']
const tip = { borderRadius: 12, border: '1px solid #e0d2c2', background: '#fbf7f2', boxShadow: '0 8px 20px rgba(44,33,24,.12)' }

function label(group, p) {
  if (group === 'day') { const [y, m, d] = p.split('-'); return `${MON[m - 1]} ${Number(d)}, ${y}` }
  if (group === 'month') { const [y, m] = p.split('-'); return `${MON[m - 1]} ${y}` }
  return p
}

/**
 * Sales record as a donut chart (share of sales per date, month or year).
 * Pass `filter` ({month, year}) to share the page's filter bar; leave it out to show its own.
 * Change `refreshKey` to reload after a new job is saved.
 */
export default function SalesSummary({ filter: external, group: extGroup, refreshKey = 0 }) {
  const [ownGroup, setOwnGroup] = useState('month')
  const group = extGroup || ownGroup
  const [own, setOwn] = useState({ month: '', year: '' })
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const filter = external || own

  useEffect(() => {
    setError('')
    api
      .get('/jobs/summary', { params: { group, ...periodParams(filter) } })
      .then((r) => setData(r.data))
      .catch(() => setError('Could not load the sales record.'))
  }, [group, filter.month, filter.year, refreshKey])

  // biggest periods first, anything beyond 8 is grouped as "Others"
  const slices = useMemo(() => {
    if (!data) return []
    const rows = data.rows
      .map((r) => ({ name: label(data.group, r.period), total: Number(r.total), orders: Number(r.orders) }))
      .sort((a, b) => b.total - a.total)
    const top = rows.slice(0, 8)
    const rest = rows.slice(8)
    if (rest.length) top.push({ name: `Others (${rest.length})`, total: rest.reduce((s, r) => s + r.total, 0), orders: rest.reduce((s, r) => s + r.orders, 0) })
    return top
  }, [data])

  const sum = slices.reduce((s, r) => s + r.total, 0) || 1

  const toggle = (
    <div role="group" aria-label="Group sales" className="inline-flex rounded-xl bg-[#f3ebe0] p-1">
      {groups.map(([v, l]) => (
        <button key={v} type="button" aria-pressed={group === v} onClick={() => setOwnGroup(v)} className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${group === v ? 'bg-[#7a5539] text-white' : 'text-[#5c4a3d]'}`}>
          {l}
        </button>
      ))}
    </div>
  )

  return (
    <section className="rounded-3xl border border-[#e0d2c2] bg-[#fbf7f2] p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-xl font-semibold">Sales record</h3>
        {!extGroup && external && toggle}
      </div>
      {!external && <FilterBar value={own} onChange={setOwn}>{!extGroup && toggle}</FilterBar>}
      {error && <p role="alert" className="mb-3 text-sm text-rose-700">{error}</p>}

      {!data ? (
        <div className="h-64 animate-pulse rounded-2xl bg-[#eadfce]" />
      ) : slices.length === 0 ? (
        <p className="rounded-xl bg-[#f3ebe0] p-4 text-sm text-[#6b5a4c]">No sales recorded for this period.</p>
      ) : (
        <div className="grid items-center gap-6 md:grid-cols-2">
          <div className="relative h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={slices} dataKey="total" nameKey="name" innerRadius="58%" outerRadius="92%" paddingAngle={2} stroke="none">
                  {slices.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v, n, p) => [`${money(v)} (${p.payload.orders} orders)`, n]} contentStyle={tip} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
              <div>
                <div className="text-sm text-[#6b5a4c]">Total sales</div>
                <div className="text-2xl font-semibold" style={{ fontFamily: "'Fraunces',Georgia,serif" }}>{money(data.total_sales)}</div>
                <div className="text-xs text-[#8a7b6d]">{data.total_orders} orders</div>
              </div>
            </div>
          </div>

          <ul className="max-h-72 space-y-2 overflow-y-auto pr-1">
            {slices.map((r, i) => (
              <li key={r.name} className="flex items-center gap-3 rounded-xl bg-[#f3ebe0] px-3 py-2.5 text-sm">
                <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: COLORS[i % COLORS.length] }} aria-hidden="true" />
                <span className="min-w-0 flex-1 truncate font-medium">{r.name}</span>
                <span className="text-[#6b5a4c]">{r.orders} {r.orders === 1 ? 'order' : 'orders'}</span>
                <span className="w-24 text-right font-semibold">{money(r.total)}</span>
                <span className="w-10 text-right text-xs text-[#8a7b6d]">{Math.round((r.total / sum) * 100)}%</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}