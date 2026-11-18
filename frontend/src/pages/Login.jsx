import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const css = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Figtree:wght@400;500;600&display=swap');
.lg{font-family:'Figtree',system-ui,sans-serif;color:#2c2118}
.lg-serif{font-family:'Fraunces',Georgia,serif;letter-spacing:-0.02em}
.lg a:focus-visible,.lg button:focus-visible,.lg input:focus-visible{outline:3px solid #e0b46a;outline-offset:2px}

@keyframes lg-rise{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
@keyframes lg-sway{0%,100%{transform:translateY(0) rotateY(-14deg) rotateX(3deg)}50%{transform:translateY(-10px) rotateY(14deg) rotateX(-3deg)}}
@keyframes lg-roll{0%{transform:translateX(0)}55%,85%{transform:translateX(300px)}100%{transform:translateX(0)}}
@keyframes lg-print{0%{transform:scaleX(0)}55%,100%{transform:scaleX(1)}}
@keyframes lg-fade{0%,85%{opacity:1}100%{opacity:0}}
@keyframes lg-drop{0%{transform:translateY(-6px);opacity:0}15%{opacity:1}70%{opacity:1}100%{transform:translateY(40px);opacity:0}}
@keyframes lg-flow{to{stroke-dashoffset:-48}}
@keyframes lg-drift{0%,100%{transform:translate(0,0)}50%{transform:translate(26px,-18px)}}
@keyframes lg-shake{0%,100%{transform:none}20%,60%{transform:translateX(-6px)}40%,80%{transform:translateX(6px)}}

.lg-in{opacity:0;animation:lg-rise .8s cubic-bezier(.2,.7,.2,1) forwards}
.lg-stage{perspective:1000px}
.lg-sway{transform-style:preserve-3d;animation:lg-sway 7s ease-in-out infinite}
.lg-roller{animation:lg-roll 9s cubic-bezier(.45,0,.35,1) infinite}
.lg-reveal{transform-box:fill-box;transform-origin:left center;animation:lg-print 9s cubic-bezier(.45,0,.35,1) infinite}
.lg-ink{animation:lg-fade 9s linear infinite}
.lg-drop{animation:lg-drop 3.2s ease-in infinite}
.lg-flow{stroke-dasharray:14 10;animation:lg-flow 2.4s linear infinite}
.lg-drift{animation:lg-drift 14s ease-in-out infinite}
.lg-shake{animation:lg-shake .4s}
.lg-lift{transition:transform .25s ease,box-shadow .25s ease}
.lg-lift:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 10px 22px rgba(44,33,24,.22)}
.lg-field{transition:border-color .2s,box-shadow .2s}
.lg-field:focus-within{border-color:#7a5539;box-shadow:0 0 0 4px rgba(224,180,106,.35)}

@media (prefers-reduced-motion:reduce){
  .lg *{animation:none!important;transition:none!important}
  .lg-in{opacity:1}.lg-reveal{transform:none}.lg-roller{transform:translateX(300px)}
}
`

const layers = Array.from({ length: 16 })
const heights = [26, 44, 34, 62, 50, 78]
const colors = ['#1f9bd1', '#d6336c', '#f2c230', '#2c2118', '#1f9bd1', '#d6336c']

function Brand() {
  return (
    <div className="lg-stage">
      <div className="lg-sway">
        <div className="lg-serif relative font-semibold leading-none" style={{ transformStyle: 'preserve-3d', fontSize: 'clamp(3rem,6vw,5rem)' }}>
          <span className="invisible">PrinTour</span>
          {[...layers].reverse().map((_, r) => {
            const i = layers.length - 1 - r
            return (
              <span
                key={i}
                aria-hidden="true"
                className="absolute inset-0"
                style={{
                  transform: `translateZ(${-i * 3}px)`,
                  ...(i === 0
                    ? { backgroundImage: 'linear-gradient(180deg,#fff0c2 5%,#e8bf74 45%,#c48a3c 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', color: 'transparent' }
                    : { color: `hsl(30 55% ${44 - i * 1.8}%)` }),
                }}
              >
                PrinTour
              </span>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function PressArt() {
  return (
    <svg viewBox="0 0 400 230" role="img" aria-label="A roller printing a sales chart" className="h-auto w-full max-w-sm">
      <defs>
        <linearGradient id="lg-roll" x1="0" x2="1">
          <stop offset="0" stopColor="#8a6a4a" />
          <stop offset=".45" stopColor="#f0dcb8" />
          <stop offset="1" stopColor="#6b4c33" />
        </linearGradient>
        <clipPath id="lg-clip"><rect className="lg-reveal" x="50" y="70" width="300" height="140" /></clipPath>
      </defs>
      <rect x="30" y="50" width="340" height="170" rx="16" fill="#3a2c20" stroke="#5a4533" strokeWidth="2" />
      <rect x="50" y="70" width="300" height="140" rx="6" fill="#fbf7f2" />
      <g clipPath="url(#lg-clip)">
        <g className="lg-ink">
          <rect x="70" y="84" width="100" height="10" rx="3" fill="#2c2118" />
          {heights.map((h, i) => (
            <rect key={i} x={72 + i * 44} y={196 - h} width="30" height={h} rx="4" fill={colors[i]} />
          ))}
        </g>
      </g>
      <g transform="translate(50 0)">
        <g className="lg-roller">
          <rect x="-12" y="58" width="24" height="164" rx="12" fill="url(#lg-roll)" />
          <rect x="-7" y="68" width="3" height="144" rx="1.5" fill="#fff" opacity=".4" />
        </g>
      </g>
      <rect x="110" y="22" width="180" height="22" rx="8" fill="#5a4533" />
      <path className="lg-flow" d="M120 33H280" stroke="#e0b46a" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      {[[140, '#1f9bd1', 0], [190, '#d6336c', 0.8], [240, '#f2c230', 1.6]].map(([x, c, d]) => (
        <circle key={x} className="lg-drop" cx={x} cy="48" r="4.5" fill={c} style={{ animationDelay: `${d}s` }} />
      ))}
    </svg>
  )
}

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [shake, setShake] = useState(0)
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await login(email.trim(), password)
      navigate('/app', { replace: true })
    } catch (err) {
      const fields = err.response?.data?.errors
      setError((fields && Object.values(fields).flat()[0]) || err.response?.data?.message || 'Could not sign in. Check your email and password, then try again.')
      setShake((n) => n + 1)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="lg grid min-h-screen bg-[#f3ebe0] lg:grid-cols-[1.05fr_1fr]">
      <style>{css}</style>

      <aside className="relative hidden overflow-hidden bg-[#2c2118] text-[#f6efe6] lg:flex lg:flex-col lg:items-center lg:justify-center lg:gap-10 lg:p-12">
        <div aria-hidden="true" className="lg-drift pointer-events-none absolute -right-20 -top-24 h-96 w-96 rounded-full bg-[#7a5539]/55 blur-3xl" />
        <div aria-hidden="true" className="lg-drift pointer-events-none absolute -bottom-24 left-0 h-72 w-72 rounded-full bg-[#e0b46a]/20 blur-3xl" style={{ animationDirection: 'reverse' }} />
        <div className="relative"><Brand /></div>
        <div className="relative w-full max-w-sm"><PressArt /></div>
        <p className="lg-serif relative max-w-xs text-center text-2xl font-semibold text-[#e8dccf]">Every solution starts with sharing.</p>
      </aside>

      <main className="grid place-items-center p-6">
        <div className="w-full max-w-md">
          <Link to="/" className="lg-in inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-[#5c4a3d] hover:bg-white/60">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3L5 8l5 5" /></svg>
            Back to home
          </Link>

          <form onSubmit={submit} className="lg-in mt-4 rounded-3xl border border-[#e0d2c2] bg-[#fbf7f2] p-8 shadow-[0_20px_50px_rgba(44,33,24,.08)]" style={{ animationDelay: '.1s' }}>
            <div className="lg-serif text-lg font-semibold text-[#7a5539] lg:hidden">PrinTour</div>
            <h1 className="lg-serif mt-1 text-4xl font-semibold">Welcome back</h1>
            <p className="mt-2 text-[#6b5a4c]">Sign in to your workspace.</p>

            {error && (
              <div key={shake} role="alert" className="lg-shake mt-5 rounded-xl border border-rose-300 bg-rose-100 p-4 text-sm font-medium text-rose-800">
                {error}
              </div>
            )}

            <label className="mt-6 block text-sm font-medium" htmlFor="lg-email">Email</label>
            <div className="lg-field mt-1.5 rounded-xl border border-[#e0d2c2] bg-white">
              <input
                id="lg-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl bg-transparent px-4 py-3 outline-none"
                placeholder="you@example.com"
              />
            </div>

            <label className="mt-5 block text-sm font-medium" htmlFor="lg-pass">Password</label>
            <div className="lg-field mt-1.5 flex items-center rounded-xl border border-[#e0d2c2] bg-white">
              <input
                id="lg-pass"
                type={show ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl bg-transparent px-4 py-3 outline-none"
                placeholder="Your password"
              />
              <button
                type="button"
                onClick={() => setShow((v) => !v)}
                aria-pressed={show}
                aria-label={show ? 'Hide password' : 'Show password'}
                className="mr-2 rounded-lg px-3 py-1.5 text-sm text-[#7a5539] hover:bg-[#f3ebe0]"
              >
                {show ? 'Hide' : 'Show'}
              </button>
            </div>

            <button
              type="submit"
              disabled={busy}
              className="lg-lift mt-7 w-full rounded-xl bg-[#7a5539] py-3.5 font-semibold text-white disabled:opacity-60"
            >
              {busy ? 'Signing in...' : 'Sign in'}
            </button>

            <p className="mt-6 text-center text-sm text-[#6b5a4c]">
              New here?{' '}
              <Link to="/register" className="font-semibold text-[#7a5539] underline underline-offset-4">Create an account</Link>
            </p>
            <p className="mt-3 text-center text-xs text-[#8a7b6d]">New accounts can sign in after an administrator approves them.</p>
          </form>
        </div>
      </main>
    </div>
  )
}