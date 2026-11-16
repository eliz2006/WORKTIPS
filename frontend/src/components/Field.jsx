export default function Field({ label, error, hint, children }) {
  return (
    <label className="block text-sm">
      {label && <span className="mb-1 block font-medium text-[#5c4a3d]">{label}</span>}
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-[#8a7b6d]">{hint}</span>}
      {error && <span className="mt-1 block text-xs text-rose-700">{error}</span>}
    </label>
  )
}

export function inputClass(error) {
  return `mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:border-press ${
    error ? 'border-rose-400 bg-rose-50' : 'border-[#e5d8c8] bg-white'
  }`
}
