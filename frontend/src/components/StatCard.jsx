export default function StatCard({ label, value, hint, icon }) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between text-sm text-[#7a6a5c]">
        <span>{label}</span>
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#f3e8dc] text-press">{icon}</span>
      </div>
      <div className="mt-3 text-2xl font-semibold tracking-tight">{value}</div>
      {hint && <div className="mt-1 text-xs text-[#8a7b6d]">{hint}</div>}
    </div>
  )
}
