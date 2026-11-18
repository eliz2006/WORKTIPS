import { useEffect, useState } from 'react'
import api from '../api/client'
import FilterBar, { periodParams } from './FilterBar'

const money = (n) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(n || 0)
const groups = [['day', 'By date'], ['month', 'By month'], ['year', 'By year']]
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function label(group, p) {
  if (group === 'day') { const [y, m, d] = p.split('-'); return `${MON[m - 1]} ${Number(d)}, ${y}` }
  if (group === 'month') { const [y, m] = p.split('-'); return `${MON[m - 1]} ${y}` }
  return p
}

/**
 * Sales record grouped by date, month or year.
 * Pass `filter` ({month, year}) to share the page's filter bar; leave it out to show its own.
 * Change `refreshKey` to reload after a new job is saved.
 */
export default function SalesSummary({ filter: external, refreshKey = 0 }) {
  const [group, setGroup] = useState('month')
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

  const toggle = (
    <div role="group" aria-label="Group sales" className="inline-flex rounded-xl bg-[#f3ebe0] p-1">
      {groups.map(([v, l]) => (
        <button key={v} type="button" aria-pressed={group === v} onClick={() => setGroup(v)} className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${group === v ? 'bg-[#7a5539] text-white' : 'text-[#5c4a3d]'}`}>
          {l}
        </button>
      ))}
    </div>
  )

  return (
    <section className="rounded-3xl border border-[#e0d2c2] bg-[#fbf7f2] p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-xl font-semibold">Sales record</h3>
        {external && toggle}
      </div>
      {!external && <FilterBar value={own} onChange={setOwn}>{toggle}</FilterBar>}
      {error && <p role="alert" className="mb-3 text-sm text-rose-700">{error}</p>}
      {!data ? (
        <div className="h-32 animate-pulse rounded-2xl bg-[#eadfce]" />
      ) : data.rows.length === 0 ? (
        <p className="rounded-xl bg-[#f3ebe0] p-4 text-sm text-[#6b5a4c]">No sales recorded for this period.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-[#6b5a4c]">
              <tr><th className="py-2">Period</th><th className="text-right">Orders</th><th className="text-right">Sales</th></tr>
            </thead>
            <tbody>
              {data.rows.map((r) => (
                <tr key={r.period} className="border-t border-[#f0e6da]">
                  <td className="py-2.5">{label(data.group, r.period)}</td>
                  <td className="text-right">{r.orders}</td>
                  <td className="text-right font-medium">{money(r.total)}</td>
                </tr>
              ))}
              <tr className="border-t-2 border-[#2c2118] font-semibold">
                <td className="py-3">Total</td>
                <td className="text-right">{data.total_orders}</td>
                <td className="text-right">{money(data.total_sales)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}