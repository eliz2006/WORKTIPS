import { useEffect, useState } from 'react'

const css = `
@keyframes dk-grow{from{transform:scaleX(0)}to{transform:scaleX(1)}}
@keyframes dk-shimmer{0%{background-position:-300px 0}100%{background-position:300px 0}}
@keyframes dk-flow{to{stroke-dashoffset:-48}}
.dk-grow{transform-origin:left;animation:dk-grow .9s cubic-bezier(.2,.7,.2,1) both}
.dk-skel{background:linear-gradient(90deg,#eadfce 0,#f6efe6 150px,#eadfce 300px);background-size:600px 100%;animation:dk-shimmer 1.4s linear infinite}
.dk-flow{stroke-dasharray:10 8;animation:dk-flow 2.4s linear infinite}
.dk-row{transition:transform .2s,background .2s,box-shadow .2s}
.dk-row:hover{transform:translateX(4px);background:#fff;box-shadow:0 6px 16px rgba(44,33,24,.08)}
.dk-kpi{transition:transform .25s,box-shadow .25s}
.dk-kpi:hover{transform:translateY(-3px);box-shadow:0 12px 26px rgba(44,33,24,.12)}
@media (prefers-reduced-motion:reduce){.dk-grow,.dk-skel,.dk-flow{animation:none}.dk-row,.dk-kpi{transition:none}.dk-row:hover,.dk-kpi:hover{transform:none}}
`

export function DashStyles() {
  return <style>{css}</style>
}

function useCountUp(target) {
  const [v, setV] = useState(0)
  useEffect(() => {
    const n = Number(target) || 0
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return setV(n)
    let raf
    let start
    const tick = (t) => {
      start ??= t
      const p = Math.min((t - start) / 900, 1)
      setV(n * (1 - Math.pow(1 - p, 3)))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target])
  return v
}

export function PageHeading({ title, sub, action }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl font-semibold sm:text-4xl">{title}</h1>
        <svg width="110" height="8" viewBox="0 0 110 8" className="mt-2" aria-hidden="true">
          <path className="dk-flow" d="M3 4H107" stroke="#e0b46a" strokeWidth="3" strokeLinecap="round" fill="none" />
        </svg>
        {sub && <p className="mt-3 max-w-xl text-[#6b5a4c]">{sub}</p>}
      </div>
      {action}
    </div>
  )
}

export function Kpi({ label, value, format = (n) => Math.round(n), hint, icon }) {
  const num = typeof value === 'number'
  const animated = useCountUp(num ? value : 0)
  return (
    <div className="dk-kpi rounded-3xl border border-[#e0d2c2] bg-[#fbf7f2] p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-[#6b5a4c]">{label}</span>
        <span className="grid h-9 w-9 place-items-center rounded-full bg-[#e0b46a]/30 text-[#7a5539]" aria-hidden="true">{icon}</span>
      </div>
      <div className="mt-3 text-3xl font-semibold" style={{ fontFamily: "'Fraunces',Georgia,serif" }}>
        {num ? format(animated) : value}
      </div>
      {hint && <div className="mt-1 text-sm text-[#8a7b6d]">{hint}</div>}
    </div>
  )
}

export function Panel({ title, children, className = '' }) {
  return (
    <section className={`rounded-3xl border border-[#e0d2c2] bg-[#fbf7f2] p-6 ${className}`}>
      <h3 className="mb-4 text-xl font-semibold">{title}</h3>
      {children}
    </section>
  )
}

export function Empty({ children }) {
  return <p className="rounded-xl bg-[#f3ebe0] p-4 text-sm text-[#6b5a4c]">{children}</p>
}

export function Pill({ tone = 'amber', children }) {
  const tones = {
    amber: 'bg-amber-100 text-amber-900',
    green: 'bg-green-100 text-green-900',
    red: 'bg-rose-100 text-rose-800',
    brown: 'bg-[#e0b46a]/30 text-[#5c3f27]',
  }
  return <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${tones[tone]}`}>{children}</span>
}

export function RankList({ items, fmt = (v) => v, empty = 'Nothing to show yet.' }) {
  if (!items.length) return <Empty>{empty}</Empty>
  const max = Math.max(...items.map((i) => Number(i.value) || 0), 1)
  return (
    <ol className="space-y-4">
      {items.map((i, idx) => (
        <li key={`${i.label}-${idx}`}>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="truncate">{i.label}</span>
            <span className="font-semibold">{fmt(i.value)}</span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#eadfce]">
            <div
              className="dk-grow h-full rounded-full bg-gradient-to-r from-[#7a5539] to-[#e0b46a]"
              style={{ width: `${((Number(i.value) || 0) / max) * 100}%`, animationDelay: `${idx * 0.08}s` }}
            />
          </div>
        </li>
      ))}
    </ol>
  )
}

export function DashSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading">
      <div className="dk-skel h-10 w-72 rounded-xl" />
      <div className="mt-8 grid gap-4 md:grid-cols-4">
        {[0, 1, 2, 3].map((i) => <div key={i} className="dk-skel h-32 rounded-3xl" />)}
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="dk-skel h-80 rounded-3xl" />
        <div className="dk-skel h-80 rounded-3xl" />
      </div>
    </div>
  )
}