import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const employeeNav = [
  ['/app', 'Dashboard'],
  ['/app/knowledge', 'Knowledge Base'],
  ['/app/equipment', 'Equipment'],
  ['/app/tips', 'My Tips'],
  ['/app/saved', 'Saved Items'],
  ['/app/issues', 'Issue Reports'],
  ['/app/jobs', 'Printing Jobs'],
]

const recipientNav = [
  ['/app', 'Dashboard'],
  ['/app/knowledge', 'Knowledge Base'],
  ['/app/equipment', 'Equipment'],
  ['/app/issues', 'Issue Reports'],
  ['/app/jobs', 'Printing Jobs'],
]

const adminNav = [
  ['/app', 'Dashboard'],
  ['/app/knowledge', 'Knowledge Base'],
  ['/app/content', 'Content Review'],
  ['/app/users', 'User Approvals'],
  ['/app/equipment', 'Printers'],
  ['/app/parts', 'Parts Catalog'],
  ['/app/issues', 'Issue Reports'],
  ['/app/maintenance', 'Maintenance'],
  ['/app/jobs', 'Sales / Jobs'],
  ['/app/ink', 'Ink Usage'],
]

const css = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Figtree:wght@400;500;600&display=swap');
.sh{font-family:'Figtree',system-ui,sans-serif;color:#2c2118}
.sh-serif{font-family:'Fraunces',Georgia,serif;letter-spacing:-0.02em}
.sh h1,.sh h2,.sh h3{font-family:'Fraunces',Georgia,serif;letter-spacing:-0.02em}
.sh a:focus-visible,.sh button:focus-visible{outline:3px solid #e0b46a;outline-offset:2px;border-radius:12px}
@keyframes sh-page{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@keyframes sh-drift{0%,100%{transform:translate(0,0)}50%{transform:translate(20px,-16px)}}
@keyframes sh-flow{to{stroke-dashoffset:-48}}
.sh-page{animation:sh-page .45s cubic-bezier(.2,.7,.2,1)}
@keyframes sh-pop{from{opacity:0;transform:scale(.95) translateY(8px)}to{opacity:1;transform:none}}
.sh-pop{animation:sh-pop .25s cubic-bezier(.2,.7,.2,1)}
.sh-drift{animation:sh-drift 14s ease-in-out infinite}
.sh-flow{stroke-dasharray:10 8;animation:sh-flow 2.4s linear infinite}
.sh-link{position:relative;transition:background .2s,color .2s,transform .2s}
.sh-link:hover{transform:translateX(3px)}
.sh-link::before{content:'';position:absolute;left:0;top:25%;bottom:25%;width:3px;border-radius:3px;background:#e0b46a;transform:scaleY(0);transition:transform .25s}
.sh-active::before{transform:scaleY(1)}
@media (prefers-reduced-motion:reduce){.sh *{animation:none!important;transition:none!important}}
`

export default function AppShell() {
  const { user, isAdmin, isRecipient, roleLabel, logout } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [confirmOut, setConfirmOut] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!confirmOut) return
    const onKey = (e) => e.key === 'Escape' && setConfirmOut(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [confirmOut])

  const doLogout = async () => {
    setBusy(true)
    try {
      await logout()
    } finally {
      setBusy(false)
      setConfirmOut(false)
      navigate('/login')
    }
  }
  const nav = isAdmin ? adminNav : isRecipient ? recipientNav : employeeNav
  const initials = user?.name
    ?.split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="sh min-h-screen bg-[#f3ebe0]">
      <style>{css}</style>

      <aside className="fixed inset-y-0 left-0 hidden w-64 overflow-hidden bg-[#2c2118] text-[#f6efe6] md:flex md:flex-col">
        <div aria-hidden="true" className="sh-drift pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-[#7a5539]/50 blur-3xl" />
        <div className="relative px-5 py-6">
          <div className="sh-serif text-2xl font-semibold text-[#e8bf74]">PrinTour</div>
          <svg width="120" height="8" viewBox="0 0 120 8" className="mt-2" aria-hidden="true">
            <path className="sh-flow" d="M3 4H117" stroke="#e0b46a" strokeWidth="3" strokeLinecap="round" fill="none" />
          </svg>
        </div>
        <nav className="relative flex-1 space-y-1 overflow-y-auto px-3 pb-3">
          {nav.map(([to, label]) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/app'}
              className={({ isActive }) =>
                `sh-link block rounded-xl px-4 py-2.5 text-sm ${isActive ? 'sh-active bg-white/10 font-semibold text-white' : 'text-[#e8dccf] hover:bg-white/5'}`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="relative border-t border-white/10 p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-[#e0b46a] text-sm font-semibold text-[#2c2118]">{initials}</div>
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">{user?.name}</div>
              <div className="text-xs text-[#c6a786]">{roleLabel}</div>
            </div>
          </div>
          <button
            className="mt-3 w-full rounded-xl border border-white/15 px-3 py-2 text-sm transition hover:bg-white/10"
            onClick={() => setConfirmOut(true)}
          >
            Log out
          </button>
        </div>
      </aside>

      <main className="md:pl-64">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-[#e0d2c2] bg-[#fbf7f2]/90 px-6 py-4 backdrop-blur">
          <div>
            <div className="text-sm text-[#8a7b6d]">
              {isAdmin ? 'Administrator workspace' : isRecipient ? 'Recipient workspace' : 'Employee workspace'}
            </div>
            <div className="sh-serif text-lg font-semibold">{user?.name}</div>
          </div>
          <span className="rounded-full bg-[#e0b46a]/30 px-3 py-1 text-sm font-medium text-[#5c3f27]">{roleLabel}</span>
        </header>

        <nav aria-label="Pages" className="flex gap-2 overflow-auto border-b border-[#e0d2c2] bg-[#fbf7f2] px-4 py-2 md:hidden">
          {nav.map(([to, label]) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/app'}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-full px-3 py-1.5 text-sm transition ${isActive ? 'bg-[#7a5539] text-white' : 'bg-white text-[#5c4a3d]'}`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div key={pathname} className="sh-page p-6">
          <Outlet />
        </div>
      </main>

      {confirmOut && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#2c2118]/60 p-4 backdrop-blur-sm" onClick={() => setConfirmOut(false)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="sh-out-title"
            onClick={(e) => e.stopPropagation()}
            className="sh-pop w-full max-w-sm rounded-3xl border border-[#e0d2c2] bg-[#fbf7f2] p-7 shadow-2xl"
          >
            <h2 id="sh-out-title" className="text-2xl font-semibold">Log out of PrinTour?</h2>
            <p className="mt-2 text-[#6b5a4c]">You will need to sign in again to continue.</p>
            <div className="mt-6 flex justify-end gap-3">
              <button autoFocus type="button" onClick={() => setConfirmOut(false)} className="rounded-xl border border-[#e0d2c2] px-5 py-2.5 font-medium transition hover:bg-white">
                Cancel
              </button>
              <button type="button" disabled={busy} onClick={doLogout} className="rounded-xl bg-[#7a5539] px-5 py-2.5 font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60">
                {busy ? 'Logging out...' : 'Log out'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}