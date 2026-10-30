export default function Badge({ children }) {
  const s = String(children).toLowerCase()
  let color = 'bg-sky-100 text-sky-800'
  if (['approved', 'active', 'resolved', 'completed', 'good'].some((x) => s.includes(x))) {
    color = 'bg-emerald-100 text-emerald-800'
  } else if (['pending', 'maintenance', 'progress', 'fair'].some((x) => s.includes(x))) {
    color = 'bg-amber-100 text-amber-800'
  } else if (['open', 'inactive', 'rejected', 'critical', 'high', 'low_stock'].some((x) => s.includes(x))) {
    color = 'bg-rose-100 text-rose-800'
  }
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${color}`}>
      {String(children).replaceAll('_', ' ')}
    </span>
  )
}
