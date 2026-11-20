import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Avatar from './Avatar'

const employeeNav = [
  ['/app', 'Dashboard'],
  ['/app/knowledge', 'Knowledge Base'],
  ['/app/equipment', 'Equipment'],
  ['/app/tips', 'My Tips'],
  ['/app/saved', 'Saved Items'],
  ['/app/issues', 'Issue Reports'],
  ['/app/jobs', 'Company Sales'],
]

const recipientNav = [
  ['/app', 'Dashboard'],
  ['/app/knowledge', 'Knowledge Base'],
  ['/app/equipment', 'Equipment'],
  ['/app/issues', 'Issue Reports'],
  ['/app/jobs', 'Company Sales'],
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
  ['/app/jobs', 'Company Sales'],
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

const ICON_BY_PATH = {
  '/app': 'dash',
  '/app/knowledge': 'book',
  '/app/equipment': 'printer',
  '/app/tips': 'bulb',
  '/app/saved': 'bookmark',
  '/app/issues': 'warn',
  '/app/jobs': 'bars',
  '/app/content': 'review',
  '/app/users': 'users',
  '/app/parts': 'gear',
  '/app/maintenance': 'wrench',
  '/app/ink': 'drop',
}

const ICONS = {
  dash: (<><rect className="p p1" x="3" y="3" width="8" height="8" rx="2" /><rect className="p p2" x="13" y="3" width="8" height="8" rx="2" /><rect className="p p3" x="3" y="13" width="8" height="8" rx="2" /><rect className="p p4" x="13" y="13" width="8" height="8" rx="2" /></>),
  book: (<><path d="M12 6c-1.5-1.3-3.7-2-7-2v13c3.3 0 5.5.7 7 2V6z" /><path className="pr" d="M12 6c1.5-1.3 3.7-2 7-2v13c-3.3 0-5.5.7-7 2V6z" /></>),
  review: (<><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5" /><path className="ck" pathLength="1" d="M9 14.5l2 2 4-4" /></>),
  users: (<><g className="person"><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c.6-3.6 3.2-5.5 6.5-5.5s5.9 1.9 6.5 5.5" /></g><path className="ck" pathLength="1" d="M16 9l2.2 2.2L22 7.4" /></>),
  printer: (<><path d="M7 9V4h10v5" /><rect x="3" y="9" width="18" height="8" rx="2" /><path className="paper" d="M7 14h10v6H7z" /></>),
  gear: (<g className="g"><circle cx="12" cy="12" r="3" /><circle cx="12" cy="12" r="6.5" /><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1" /></g>),
  warn: (<><path d="M12 3l10 18H2L12 3z" /><path d="M12 10v5M12 18.2v.01" /></>),
  wrench: (<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />),
  bars: (<><path d="M3 21h18" /><rect className="b b1" x="5" y="13" width="3.5" height="8" rx="1" /><rect className="b b2" x="10.2" y="6" width="3.5" height="15" rx="1" /><rect className="b b3" x="15.5" y="10" width="3.5" height="11" rx="1" /></>),
  drop: (<><path className="dp" d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z" /><path d="M9.5 15a2.5 2.5 0 0 0 2.5 2.5" /></>),
  bulb: (<><path d="M9 18h6M10 21h4" /><path className="bl" d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z" /></>),
  bookmark: (<path className="bm" d="M6 3h12v18l-6-4-6 4z" />),
}

function NavIcon({ to, size = 20 }) {
  const name = ICON_BY_PATH[to] || 'dash'
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={`sh-ic ic-${name}`} aria-hidden="true">
      {ICONS[name]}
    </svg>
  )
}

// Icons animate on hover, keyboard focus and touch (:active)
const T = '.sh :is(.sh-link,.sh-pill):is(:hover,:focus-visible,:active)'
const iconCss = `
.sh-ic{flex-shrink:0;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;overflow:visible;color:#c6a786;transition:color .2s}
.sh-ic *{transform-box:fill-box;transform-origin:center}
.sh-pill .sh-ic{color:currentColor}
.sh-bubble{display:grid;place-items:center;height:2rem;width:2rem;border-radius:.65rem;background:rgba(255,255,255,.06);transition:background .25s,transform .25s}
.sh-link:is(:hover,:focus-visible,:active) .sh-bubble{background:rgba(224,180,106,.22);transform:scale(1.1) rotate(-5deg)}
.sh-link:is(:hover,:focus-visible,:active) .sh-ic,.sh-active .sh-ic{color:#e8bf74}
.sh-active .sh-bubble{background:rgba(224,180,106,.28)}
.ic-review .ck,.ic-users .ck{stroke-dasharray:1}
.ic-book .pr{transform-origin:left center}
.ic-bars .b{transform-origin:50% 100%}
@keyframes ic-pop{0%,100%{transform:scale(1)}40%{transform:scale(.55)}}
@keyframes ic-flip{0%,100%{transform:scaleX(1)}50%{transform:scaleX(.12)}}
@keyframes ic-draw{from{stroke-dashoffset:1}to{stroke-dashoffset:0}}
@keyframes ic-feed{0%,100%{transform:translateY(0)}50%{transform:translateY(3px)}}
@keyframes ic-spin{to{transform:rotate(180deg)}}
@keyframes ic-wiggle{0%,100%{transform:rotate(0)}25%{transform:rotate(-14deg)}75%{transform:rotate(14deg)}}
@keyframes ic-swing{0%,100%{transform:rotate(0)}30%{transform:rotate(-28deg)}65%{transform:rotate(14deg)}}
@keyframes ic-grow{from{transform:scaleY(.2)}to{transform:scaleY(1)}}
@keyframes ic-drop{0%,100%{transform:translateY(0) scale(1)}35%{transform:translateY(-4px) scale(.95,1.08)}65%{transform:translateY(1px) scale(1.08,.9)}}
@keyframes ic-glow{0%,100%{transform:scale(1)}50%{transform:scale(1.2)}}
@keyframes ic-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(2.5px)}}
${T} .ic-dash .p{animation:ic-pop .55s ease}
${T} .ic-dash .p2{animation-delay:.08s}
${T} .ic-dash .p3{animation-delay:.16s}
${T} .ic-dash .p4{animation-delay:.24s}
${T} .ic-book .pr{animation:ic-flip .6s ease}
${T} .ic-review .ck,${T} .ic-users .ck{animation:ic-draw .6s ease}
${T} .ic-users .person{animation:ic-bob .6s ease}
${T} .ic-printer .paper{animation:ic-feed .7s ease}
${T} .ic-gear .g{animation:ic-spin .9s cubic-bezier(.4,0,.2,1)}
${T} .ic-warn{animation:ic-wiggle .55s ease}
${T} .ic-wrench{animation:ic-swing .7s ease}
${T} .ic-bars .b{animation:ic-grow .6s cubic-bezier(.2,.7,.2,1) both}
${T} .ic-bars .b2{animation-delay:.08s}
${T} .ic-bars .b3{animation-delay:.16s}
${T} .ic-drop .dp{animation:ic-drop .7s ease}
${T} .ic-bulb .bl{animation:ic-glow .6s ease}
${T} .ic-bookmark .bm{animation:ic-bob .5s ease}
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

  return (
    <div className="sh min-h-screen bg-[#f3ebe0]">
      <style>{css + iconCss}</style>

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
                `sh-link flex items-center gap-3 rounded-xl px-3 py-2 text-sm ${isActive ? 'sh-active bg-white/10 font-semibold text-white' : 'text-[#e8dccf] hover:bg-white/5'}`
              }
            >
              <span className="sh-bubble"><NavIcon to={to} /></span>
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="relative border-t border-white/10 p-4">
          <NavLink to="/app/profile" title="Edit your profile" className="flex items-center gap-3 rounded-xl p-1 transition hover:bg-white/10">
            <Avatar user={user} size={40} />
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">{user?.name}</div>
              <div className="text-xs text-[#c6a786]">{roleLabel} · Edit profile</div>
            </div>
          </NavLink>
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
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-[#e0b46a]/30 px-3 py-1 text-sm font-medium text-[#5c3f27]">{roleLabel}</span>
            <NavLink to="/app/profile" title="Edit your profile" aria-label="Edit your profile"><Avatar user={user} size={36} /></NavLink>
          </div>
        </header>

        <nav aria-label="Pages" className="flex gap-2 overflow-auto border-b border-[#e0d2c2] bg-[#fbf7f2] px-4 py-2 md:hidden">
          {nav.map(([to, label]) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/app'}
              className={({ isActive }) =>
                `sh-pill flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-sm transition ${isActive ? 'bg-[#7a5539] text-white' : 'bg-white text-[#5c4a3d]'}`
              }
            >
              <NavIcon to={to} size={16} />
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