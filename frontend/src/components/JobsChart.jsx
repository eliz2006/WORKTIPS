import { useMemo } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

const tip = { borderRadius: 12, border: '1px solid #e0d2c2', background: '#fbf7f2', boxShadow: '0 8px 20px rgba(44,33,24,.12)' }
const tick = { fill: '#6b5a4c', fontSize: 12 }
const money = (n) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(n || 0)

/** Bar chart of the jobs on screen, grouped by printing type. */
export default function JobsChart({ rows }) {
  const data = useMemo(() => {
    const map = {}
    rows.forEach((r) => {
      const k = r.printing_type || 'other'
      map[k] ??= { type: k, jobs: 0, sales: 0 }
      map[k].jobs += 1
      map[k].sales += Number(r.total_amount || 0)
    })
    return Object.values(map).sort((a, b) => b.jobs - a.jobs)
  }, [rows])

  return (
    <section className="rounded-3xl border border-[#e0d2c2] bg-[#fbf7f2] p-6">
      <h3 className="mb-4 text-xl font-semibold">Jobs by printing type</h3>
      {data.length === 0 ? (
        <p className="rounded-xl bg-[#f3ebe0] p-4 text-sm text-[#6b5a4c]">No jobs to chart for this period.</p>
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
              <XAxis dataKey="type" tick={tick} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={tick} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={tip}
                cursor={{ fill: 'rgba(224,180,106,.18)' }}
                formatter={(v, n, p) => [`${v} ${v === 1 ? 'job' : 'jobs'}, ${money(p.payload.sales)}`, p.payload.type]}
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