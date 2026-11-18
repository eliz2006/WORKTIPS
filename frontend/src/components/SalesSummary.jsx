import { useEffect, useState } from 'react'
import api from '../api/client'
import FilterBar, { periodParams } from './FilterBar'
import { Empty, Panel } from './DashKit'

const money = (n) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(n || 0)
const groups = [['day', 'By date'], ['month', 'By month'], ['year', 'By year']]
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function label(group, p) {
  if (group === 'day') { const [y, m, d] = p.split('-'); return `${MON[m - 1]} ${Number(d)}, ${y}` }
  if (group === 'month') { const [y, m] = p.split('-'); return `${MON[m - 1]} ${y}` }
  return p
}

export default function SalesSummary() {
  const [group, setGroup] = useState('month')
  const [filter, setFilter] = useState({ month: '', year: String(new Date().getFullYear()) })
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    setError('')
    api.get('/jobs/summary', { params: { group, ...periodParams(filter) } }).then((r) => setData(r.data)).catch(() => setError('Could not load the sales summary.'))
  }, [group, filter])

  return (
    <Panel title="Sales record">
      <FilterBar value={filter} onChange={setFilter}>
        <div role="group" aria-label="Group sales" className="inline-flex rounded-xl bg-[#f3ebe0] p-1">
          {groups.map(([v, l]) => (
            <button key={v} type="button" aria-pressed={group === v} onClick={() => setGroup(v)} className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${group === v ? 'bg-[#7a5539] text-white' : 'text-[#5c4a3d]'}`}>{l}</button>
          ))}
        </div>
      </FilterBar>
      {error && <p role="alert" className="mb-3 text-sm text-rose-700">{error}</p>}
      {!data ? (
        <div className="dk-skel h-40 rounded-2xl" />
      ) : data.rows.length === 0 ? (
        <Empty>No sales recorded for this period.</Empty>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-[#6b5a4c]"><tr><th className="py-2">Period</th><th className="text-right">Orders</th><th className="text-right">Sales</th></tr></thead>
            <tbody>
              {data.rows.map((r) => (
                <tr key={r.period} className="border-t border-[#f0e6da]">
                  <td className="py-2.5">{label(data.group, r.period)}</td>
                  <td className="text-right">{r.orders}</td>
                  <td className="text-right font-medium">{money(r.total)}</td>
                </tr>
              ))}
              <tr className="border-t-2 border-[#2c2118] font-semibold">
                <td className="py-3">Total</td><td className="text-right">{data.total_orders}</td><td className="text-right">{money(data.total_sales)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  )
}