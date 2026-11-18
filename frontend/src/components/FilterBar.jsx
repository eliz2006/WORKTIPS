const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const pad = (n) => String(n).padStart(2, '0')

/** {from,to} (YYYY-MM-DD) for endpoints that take a date range, such as /analytics */
export function periodRange({ month, year }) {
  const t = new Date()
  if (!year && !month) return { from: '2000-01-01', to: `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())}` }
  const y = Number(year) || t.getFullYear()
  if (month) {
    const m = Number(month)
    return { from: `${y}-${pad(m)}-01`, to: `${y}-${pad(m)}-${pad(new Date(y, m, 0).getDate())}` }
  }
  return { from: `${y}-01-01`, to: `${y}-12-31` }
}

/** {month,year} query params for list endpoints that use the Period helper */
export function periodParams({ month, year }) {
  const p = {}
  if (month) p.month = month
  if (year) p.year = year
  return p
}

export function periodLabel({ month, year }) {
  if (month && year) return `${MONTHS[month - 1]} ${year}`
  if (month) return `${MONTHS[month - 1]} ${new Date().getFullYear()}`
  if (year) return `Year ${year}`
  return 'All time'
}

function parseDate(v) {
  if (!v) return null
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v)
  const d = m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : new Date(v)
  return Number.isNaN(d.getTime()) ? null : d
}

/** "Dec 16, 2026" instead of 2026-12-15T16:00:00.000000Z */
export function fmtDate(v) {
  const d = parseDate(v)
  return d ? d.toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' }) : v || '—'
}

/** true when the date falls in the chosen month / year (blank = no filter) */
export function inPeriod(v, { month, year }) {
  if (!month && !year) return true
  const d = parseDate(v)
  if (!d) return false
  const y = year ? Number(year) : new Date().getFullYear()
  if (d.getFullYear() !== y) return false
  return !month || d.getMonth() + 1 === Number(month)
}

const sel = 'rounded-xl border border-[#e0d2c2] bg-white px-3 py-2 text-sm outline-none focus:border-[#7a5539] focus:ring-4 focus:ring-[#e0b46a]/35'

export default function FilterBar({ value, onChange, roles, children }) {
  const thisYear = new Date().getFullYear()
  const years = Array.from({ length: 6 }, (_, i) => thisYear - i)
  const set = (k) => (e) => onChange({ ...value, [k]: e.target.value })
  const dirty = value.month || value.year || value.role

  return (
    <div className="mb-6 flex flex-wrap items-end gap-3 rounded-2xl border border-[#e0d2c2] bg-[#fbf7f2] p-4">
      {roles && (
        <label className="text-sm">
          <span className="mb-1 block font-medium text-[#6b5a4c]">Role</span>
          <select className={sel} value={value.role || ''} onChange={set('role')}>
            <option value="">All roles</option>
            {roles.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </label>
      )}
      <label className="text-sm">
        <span className="mb-1 block font-medium text-[#6b5a4c]">Month</span>
        <select className={sel} value={value.month || ''} onChange={set('month')}>
          <option value="">All months</option>
          {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
        </select>
      </label>
      <label className="text-sm">
        <span className="mb-1 block font-medium text-[#6b5a4c]">Year</span>
        <select className={sel} value={value.year || ''} onChange={set('year')}>
          <option value="">All years</option>
          {years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </label>
      {dirty ? (
        <button type="button" onClick={() => onChange({ ...value, month: '', year: '', ...(roles ? { role: '' } : {}) })} className="rounded-xl px-3 py-2 text-sm font-medium text-[#7a5539] hover:bg-[#f3ebe0]">
          Clear filters
        </button>
      ) : null}
      <div className="ml-auto flex flex-wrap items-center gap-3">{children}</div>
    </div>
  )
}