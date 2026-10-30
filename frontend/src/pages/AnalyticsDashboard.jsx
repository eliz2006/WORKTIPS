import { useEffect, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import api from '../api/client'
import StatCard from '../components/StatCard'
import Badge from '../components/Badge'

const COLORS = ['#74543b', '#c6a786', '#e5c7a7', '#8d6e53', '#d4b896']

function money(n) {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(n || 0)
}

export default function AnalyticsDashboard() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get('/analytics')
      .then(({ data }) => setData(data))
      .catch((err) => {
        const message =
          err.response?.data?.message ||
          (err.code === 'ERR_NETWORK'
            ? 'Cannot reach the API. Start Laravel with php artisan serve on port 8000.'
            : err.message)
        setError(message)
      })
  }, [])

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-rose-800">
        <h2 className="font-semibold">Analytics could not load</h2>
        <p className="mt-2 text-sm">{error}</p>
      </div>
    )
  }

  if (!data) return <div>Loading analytics…</div>

  return (
    <div>
      <h1 className="text-3xl font-semibold">Business Analytics</h1>
      <p className="mb-6 text-[#7a6a5c]">Live totals from printing jobs, ink logs, issues, and maintenance.</p>
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Total sales" value={money(data.kpis.total_sales)} icon="₱" hint="Completed jobs in range" />
        <StatCard label="Total orders" value={data.kpis.total_orders} icon="▤" hint={`AOV ${money(data.kpis.average_order_value)}`} />
        <StatCard label="Ink consumed" value={`${(data.kpis.ink_consumed_ml / 1000).toFixed(1)} L`} icon="◉" />
        <StatCard label="Open issues" value={data.kpis.open_issues} icon="⚑" hint={`${data.kpis.pending_tips} tips pending`} />
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section className="card p-5">
          <h3 className="mb-4 font-semibold">Monthly sales trend</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.monthly_sales}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(v) => money(v)} />
                <Bar dataKey="total" fill="#74543b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section className="card p-5">
          <h3 className="mb-4 font-semibold">Sales by printing type</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.sales_by_type} dataKey="total" nameKey="printing_type" innerRadius={60} outerRadius={90}>
                  {data.sales_by_type.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => money(v)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section className="card p-5">
          <h3 className="mb-4 font-semibold">Ink consumption by printer</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.ink_by_printer} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={110} />
                <Tooltip formatter={(v) => `${(v / 1000).toFixed(2)} L`} />
                <Bar dataKey="ml" fill="#8d6e53" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section className="card p-5">
          <h3 className="mb-3 font-semibold">Ink usage</h3>
          <p className="mb-2 text-sm text-[#7a6a5c]">
            Most used: {data.most_used_ink ? `${data.most_used_ink.color} ${data.most_used_ink.brand}` : '—'}
          </p>
          <table className="w-full text-sm">
            <tbody>
              {(data.ink_by_type || []).slice(0, 6).map((row) => (
                <tr key={row.id} className="border-t border-[#f0e6da]">
                  <td className="py-2">
                    {row.color} · {row.brand}
                  </td>
                  <td className="text-right">{(row.ml / 1000).toFixed(2)} L</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <section className="card p-5">
          <h3 className="mb-3 font-semibold">Printers needing attention</h3>
          {(data.maintenance_due || []).map((p) => (
            <div key={p.id} className="mb-2 flex justify-between text-sm">
              <span>{p.name}</span>
              <Badge>due {p.next_maintenance_at}</Badge>
            </div>
          ))}
          {(data.printers_with_problems || []).map((p) => (
            <div key={`i-${p.id}`} className="mb-2 flex justify-between text-sm">
              <span>{p.name}</span>
              <Badge>{p.open_issues_count} issues</Badge>
            </div>
          ))}
        </section>
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <section className="card p-5">
          <h3 className="mb-2 font-semibold">Frequently replaced parts</h3>
          {(data.frequently_replaced_parts || []).map((p) => (
            <div key={p.id} className="flex justify-between py-1 text-sm">
              <span>{p.name}</span>
              <span>{p.replaced}</span>
            </div>
          ))}
        </section>
        <section className="card p-5">
          <h3 className="mb-2 font-semibold">Most useful tips</h3>
          {(data.most_useful_tips || []).map((t) => (
            <div key={t.id} className="flex justify-between py-1 text-sm">
              <span>{t.title}</span>
              <span>{Number(t.ratings_avg_score || 0).toFixed(1)}</span>
            </div>
          ))}
        </section>
        <section className="card p-5">
          <h3 className="mb-2 font-semibold">Most viewed tutorials</h3>
          {(data.most_viewed_tutorials || []).map((t) => (
            <div key={t.id} className="flex justify-between py-1 text-sm">
              <span>{t.title}</span>
              <span>{t.views}</span>
            </div>
          ))}
        </section>
        <section className="card p-5">
          <h3 className="mb-2 font-semibold">Most reported issues</h3>
          {(data.most_reported_issues || []).map((t) => (
            <div key={t.title} className="flex justify-between py-1 text-sm">
              <span>{t.title}</span>
              <span>{t.reports}</span>
            </div>
          ))}
        </section>
      </div>
    </div>
  )
}
