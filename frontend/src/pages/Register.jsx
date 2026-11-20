import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const css = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Figtree:wght@400;500;600&display=swap');
.rg{font-family:'Figtree',system-ui,sans-serif;color:#2c2118}
.rg-serif{font-family:'Fraunces',Georgia,serif;letter-spacing:-0.02em}
.rg a:focus-visible,.rg button:focus-visible,.rg input:focus-visible{outline:3px solid #e0b46a;outline-offset:2px}

@keyframes rg-rise{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
@keyframes rg-sway{0%,100%{transform:translateY(0) rotateY(-14deg) rotateX(3deg)}50%{transform:translateY(-10px) rotateY(14deg) rotateX(-3deg)}}
@keyframes rg-roll{0%{transform:translateX(0)}55%,85%{transform:translateX(300px)}100%{transform:translateX(0)}}
@keyframes rg-print{0%{transform:scaleX(0)}55%,100%{transform:scaleX(1)}}
@keyframes rg-fade{0%,85%{opacity:1}100%{opacity:0}}
@keyframes rg-drop{0%{transform:translateY(-6px);opacity:0}15%{opacity:1}70%{opacity:1}100%{transform:translateY(40px);opacity:0}}
@keyframes rg-flow{to{stroke-dashoffset:-48}}
@keyframes rg-drift{0%,100%{transform:translate(0,0)}50%{transform:translate(26px,-18px)}}
@keyframes rg-shake{0%,100%{transform:none}20%,60%{transform:translateX(-6px)}40%,80%{transform:translateX(6px)}}

.rg-in{opacity:0;animation:rg-rise .8s cubic-bezier(.2,.7,.2,1) forwards}
.rg-stage{perspective:1000px}
.rg-sway{transform-style:preserve-3d;animation:rg-sway 7s ease-in-out infinite}
.rg-roller{animation:rg-roll 9s cubic-bezier(.45,0,.35,1) infinite}
.rg-reveal{transform-box:fill-box;transform-origin:left center;animation:rg-print 9s cubic-bezier(.45,0,.35,1) infinite}
.rg-ink{animation:rg-fade 9s linear infinite}
.rg-drop{animation:rg-drop 3.2s ease-in infinite}
.rg-flow{stroke-dasharray:14 10;animation:rg-flow 2.4s linear infinite}
.rg-drift{animation:rg-drift 14s ease-in-out infinite}
.rg-shake{animation:rg-shake .4s}
.rg-lift{transition:transform .25s ease,box-shadow .25s ease}
.rg-lift:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 10px 22px rgba(44,33,24,.22)}
.rg-field{transition:border-color .2s,box-shadow .2s}
.rg-field:focus-within{border-color:#7a5539;box-shadow:0 0 0 4px rgba(224,180,106,.35)}

@keyframes rg-check{to{stroke-dashoffset:0}}
.rg-check{stroke-dasharray:40;stroke-dashoffset:40;animation:rg-check .7s .3s ease-out forwards}
.rg-role{transition:transform .2s,border-color .2s,box-shadow .2s}
.rg-role:hover{transform:translateY(-2px)}

@media (prefers-reduced-motion:reduce){
  .rg *{animation:none!important;transition:none!important}
  .rg-in{opacity:1}.rg-check{stroke-dashoffset:0}.rg-reveal{transform:none}.rg-roller{transform:translateX(300px)}
}
`

const layers = Array.from({ length: 16 })
const heights = [26, 44, 34, 62, 50, 78]
const colors = ['#1f9bd1', '#d6336c', '#f2c230', '#2c2118', '#1f9bd1', '#d6336c']

function Brand() {
  return (
    <div className="rg-stage">
      <div className="rg-sway">
        <div className="rg-serif relative font-semibold leading-none" style={{ transformStyle: 'preserve-3d', fontSize: 'clamp(3rem,6vw,5rem)' }}>
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
        <linearGradient id="rg-roll" x1="0" x2="1">
          <stop offset="0" stopColor="#8a6a4a" />
          <stop offset=".45" stopColor="#f0dcb8" />
          <stop offset="1" stopColor="#6b4c33" />
        </linearGradient>
        <clipPath id="rg-clip"><rect className="rg-reveal" x="50" y="70" width="300" height="140" /></clipPath>
      </defs>
      <rect x="30" y="50" width="340" height="170" rx="16" fill="#3a2c20" stroke="#5a4533" strokeWidth="2" />
      <rect x="50" y="70" width="300" height="140" rx="6" fill="#fbf7f2" />
      <g clipPath="url(#rg-clip)">
        <g className="rg-ink">
          <rect x="70" y="84" width="100" height="10" rx="3" fill="#2c2118" />
          {heights.map((h, i) => (
            <rect key={i} x={72 + i * 44} y={196 - h} width="30" height={h} rx="4" fill={colors[i]} />
          ))}
        </g>
      </g>
      <g transform="translate(50 0)">
        <g className="rg-roller">
          <rect x="-12" y="58" width="24" height="164" rx="12" fill="url(#rg-roll)" />
          <rect x="-7" y="68" width="3" height="144" rx="1.5" fill="#fff" opacity=".4" />
        </g>
      </g>
      <rect x="110" y="22" width="180" height="22" rx="8" fill="#5a4533" />
      <path className="rg-flow" d="M120 33H280" stroke="#e0b46a" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      {[[140, '#1f9bd1', 0], [190, '#d6336c', 0.8], [240, '#f2c230', 1.6]].map(([x, c, d]) => (
        <circle key={x} className="rg-drop" cx={x} cy="48" r="4.5" fill={c} style={{ animationDelay: `${d}s` }} />
      ))}
    </svg>
  )
}


const departments = ['Machine Operator', 'Layout Artist', 'Cutter Operator']

const roles = [
  { id: 'recipient', title: 'Recipient', hint: 'View only. Browse knowledge, printers, jobs and issues. Cannot post or edit.' },
  { id: 'employee', title: 'Employee', hint: 'Full floor access. Post tips, report issues and record printing jobs.' },
]

function Field({ id, label, children }) {
  return (
    <div className="mt-5">
      <label htmlFor={id} className="block text-sm font-medium">{label}</label>
      <div className="rg-field mt-1.5 flex items-center rounded-xl border border-[#e0d2c2] bg-white">{children}</div>
    </div>
  )
}

const inputCls = 'w-full rounded-xl bg-transparent px-4 py-3 outline-none'

export default function Register() {
  const { register } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '', department: '', role: 'employee' })
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [shake, setShake] = useState(0)
  const [success, setSuccess] = useState('')
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const payload = form.role === 'recipient' ? { ...form, department: 'Not applicable' } : form
      const message = await register(payload)
      setSuccess(
        message ||
          (form.role === 'recipient'
            ? 'Account created. You can sign in now.'
            : 'Account created. Please wait for an administrator to approve it before you sign in.'),
      )
    } catch (err) {
      const fields = err.response?.data?.errors
      setError((fields && Object.values(fields).flat()[0]) || err.response?.data?.message || 'Could not create the account. Check the details and try again.')
      setShake((n) => n + 1)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="rg grid min-h-screen bg-[#f3ebe0] lg:grid-cols-[1.05fr_1fr]">
      <style>{css}</style>

      <aside className="relative hidden overflow-hidden bg-[#2c2118] text-[#f6efe6] lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:items-center lg:justify-center lg:gap-10 lg:p-12">
        <div aria-hidden="true" className="rg-drift pointer-events-none absolute -right-20 -top-24 h-96 w-96 rounded-full bg-[#7a5539]/55 blur-3xl" />
        <div aria-hidden="true" className="rg-drift pointer-events-none absolute -bottom-24 left-0 h-72 w-72 rounded-full bg-[#e0b46a]/20 blur-3xl" style={{ animationDirection: 'reverse' }} />
        <div className="relative"><Brand /></div>
        <div className="relative w-full max-w-sm"><PressArt /></div>
        <p className="rg-serif relative max-w-xs text-center text-2xl font-semibold text-[#e8dccf]">Join the press floor.</p>
      </aside>

      <main className="grid place-items-center p-6">
        <div className="w-full max-w-md py-6">
          <Link to="/" className="rg-in inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-[#5c4a3d] hover:bg-white/60">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3L5 8l5 5" /></svg>
            Back to home
          </Link>

          {success ? (
            <div className="rg-in mt-4 rounded-3xl border border-[#e0d2c2] bg-[#fbf7f2] p-8 text-center shadow-[0_20px_50px_rgba(44,33,24,.08)]">
              <svg width="72" height="72" viewBox="0 0 72 72" className="mx-auto" aria-hidden="true">
                <circle cx="36" cy="36" r="33" fill="#e0b46a" opacity=".25" />
                <path className="rg-check" d="M22 37l10 10 19-21" fill="none" stroke="#7a5539" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <h1 className="rg-serif mt-4 text-3xl font-semibold">Account created</h1>
              <p role="status" className={`mt-4 rounded-xl border p-4 text-sm font-medium ${form.role === 'recipient' ? 'border-green-300 bg-green-100 text-green-900' : 'border-amber-300 bg-amber-100 text-amber-900'}`}>{success}</p>
              <p className="mt-4 text-sm text-[#6b5a4c]">
                {form.role === 'recipient' ? 'Your view-only account is ready to use.' : 'You can sign in as soon as an administrator approves your account.'}
              </p>
              <Link to="/login" className="rg-lift mt-6 inline-block rounded-xl bg-[#7a5539] px-6 py-3 font-semibold text-white">Go to sign in</Link>
            </div>
          ) : (
            <form onSubmit={submit} className="rg-in mt-4 rounded-3xl border border-[#e0d2c2] bg-[#fbf7f2] p-8 shadow-[0_20px_50px_rgba(44,33,24,.08)]" style={{ animationDelay: '.1s' }}>
              <div className="rg-serif text-lg font-semibold text-[#7a5539] lg:hidden">PrinTour</div>
              <h1 className="rg-serif mt-1 text-4xl font-semibold">Create your account</h1>
              <p className="mt-2 text-[#6b5a4c]">{form.role === 'recipient' ? 'Recipient accounts can sign in right away.' : 'An administrator approves employee accounts before they can sign in.'}</p>

              {error && (
                <div key={shake} role="alert" className="rg-shake mt-5 rounded-xl border border-rose-300 bg-rose-100 p-4 text-sm font-medium text-rose-800">{error}</div>
              )}

              <div role="radiogroup" aria-label="Account type" className="mt-6 grid gap-3 sm:grid-cols-2">
                {roles.map((r) => {
                  const on = form.role === r.id
                  return (
                    <button
                      key={r.id}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      onClick={() => setForm({ ...form, role: r.id })}
                      className={`rg-role rounded-2xl border p-4 text-left ${on ? 'border-[#7a5539] bg-white shadow-[0_0_0_3px_rgba(224,180,106,.45)]' : 'border-[#e0d2c2] bg-[#f6efe6]'}`}
                    >
                      <div className="rg-serif text-lg font-semibold">{r.title}</div>
                      <p className="mt-1 text-xs leading-5 text-[#6b5a4c]">{r.hint}</p>
                    </button>
                  )
                })}
              </div>

              <Field id="rg-name" label="Full name">
                <input id="rg-name" required autoComplete="name" value={form.name} onChange={set('name')} className={inputCls} />
              </Field>
              <Field id="rg-email" label="Email">
                <input id="rg-email" type="email" required autoComplete="email" value={form.email} onChange={set('email')} className={inputCls} placeholder="you@example.com" />
              </Field>
              {form.role === 'employee' && (
                <Field id="rg-dept" label="Department">
                  <select id="rg-dept" required value={form.department} onChange={set('department')} className={`${inputCls} cursor-pointer`}>
                    <option value="" disabled>Choose your department</option>
                    {departments.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </Field>
              )}
              <Field id="rg-pass" label="Password">
                <input id="rg-pass" type={show ? 'text' : 'password'} required autoComplete="new-password" value={form.password} onChange={set('password')} className={inputCls} />
                <button type="button" onClick={() => setShow((v) => !v)} aria-pressed={show} aria-label={show ? 'Hide passwords' : 'Show passwords'} className="mr-2 rounded-lg px-3 py-1.5 text-sm text-[#7a5539] hover:bg-[#f3ebe0]">
                  {show ? 'Hide' : 'Show'}
                </button>
              </Field>
              <Field id="rg-pass2" label="Confirm password">
                <input id="rg-pass2" type={show ? 'text' : 'password'} required autoComplete="new-password" value={form.password_confirmation} onChange={set('password_confirmation')} className={inputCls} />
              </Field>

              <button type="submit" disabled={busy} className="rg-lift mt-7 w-full rounded-xl bg-[#7a5539] py-3.5 font-semibold text-white disabled:opacity-60">
                {busy ? 'Creating account...' : `Create ${form.role} account`}
              </button>

              <p className="mt-6 text-center text-sm text-[#6b5a4c]">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-[#7a5539] underline underline-offset-4">Sign in</Link>
              </p>
            </form>
          )}
        </div>
      </main>
    </div>
  )
}