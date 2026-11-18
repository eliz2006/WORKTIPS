import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const modules = [
  ['Knowledge base', 'Search tutorials, videos and procedures. Comment, rate, save, and flag guides that are out of date.'],
  ['Issue reports', 'Log a machine problem by printer. If it matches a known fault, the fix is attached for you.'],
  ['Printers and parts', 'Brand, model, compatible ink, condition, and parts like printheads and wiper blades in one catalog.'],
  ['Jobs and ink', 'Record tarpaulin, sticker, sublimation and digital jobs. Add the ink used and the charts update.'],
  ['Maintenance', 'Log service work and parts replaced. Each printer shows when its next service is due.'],
  ['Analytics', 'Supervisors see sales, ink by printer, open issues, and the most useful tips as they happen.'],
]

const steps = [
  ['Share what you know', 'Post a tip with a photo or video. A supervisor approves it before the floor sees it.'],
  ['Fix a problem', 'Search the knowledge base or report a jam. Matching procedures show up next to the report.'],
  ['Record the job', 'When a print finishes, save the type, printer, amount and ink used.'],
  ['Read the floor', 'The dashboard reads those records live. There is nothing extra to update.'],
]

const css = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Figtree:wght@400;500;600&display=swap');
.wt{font-family:'Figtree',system-ui,sans-serif;color:#2c2118}
.wt-serif{font-family:'Fraunces',Georgia,serif;letter-spacing:-0.015em}
.wt a:focus-visible,.wt button:focus-visible{outline:3px solid #e0b46a;outline-offset:3px;border-radius:12px}

/* hero entrance: one sequence on load */
@keyframes wt-rise{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}
.wt-in{opacity:0;animation:wt-rise .8s cubic-bezier(.2,.7,.2,1) forwards}

/* the press: roller sweeps across the sheet and prints it */
@keyframes wt-roll{0%{transform:translateX(0)}55%,85%{transform:translateX(340px)}100%{transform:translateX(0)}}
@keyframes wt-print{0%{transform:scaleX(0)}55%,100%{transform:scaleX(1)}}
@keyframes wt-fade{0%,85%{opacity:1}100%{opacity:0}}
@keyframes wt-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
.wt-roller{animation:wt-roll 9s cubic-bezier(.45,0,.35,1) infinite}
.wt-reveal{transform-box:fill-box;transform-origin:left center;animation:wt-print 9s cubic-bezier(.45,0,.35,1) infinite}
.wt-ink{animation:wt-fade 9s linear infinite}
.wt-press{animation:wt-bob 7s ease-in-out infinite}

/* flowing ink and gently drifting shapes */
@keyframes wt-drop{0%{transform:translateY(-8px);opacity:0}15%{opacity:1}70%{opacity:1}100%{transform:translateY(56px);opacity:0}}
@keyframes wt-flow{to{stroke-dashoffset:-48}}
@keyframes wt-drift{0%,100%{transform:translate(0,0)}50%{transform:translate(28px,-20px)}}
.wt-drop{animation:wt-drop 3.2s ease-in infinite}
.wt-flow{stroke-dasharray:14 10;animation:wt-flow 2.4s linear infinite}
.wt-drift{animation:wt-drift 14s ease-in-out infinite}
.wt-drift-b{animation:wt-drift 18s ease-in-out infinite reverse}

/* soft hover motion */
.wt-lift{transition:transform .25s ease,box-shadow .25s ease}
.wt-lift:hover{transform:translateY(-3px);box-shadow:0 10px 24px rgba(44,33,24,.14)}
.wt-item{transition:border-color .25s ease,transform .25s ease}
.wt-item:hover{border-color:#c6a786;transform:translateX(4px)}

/* timeline line draws when scrolled into view */
.wt-line{transform-origin:left;transform:scaleX(0);transition:transform 1.6s cubic-bezier(.4,0,.2,1)}
.wt-seen .wt-line{transform:scaleX(1)}
.wt-dot{opacity:0;transform:scale(.6);transition:opacity .4s,transform .4s}
.wt-seen .wt-dot{opacity:1;transform:none}

@media (prefers-reduced-motion:reduce){
  .wt-in{animation:none;opacity:1}
  .wt-roller,.wt-reveal,.wt-ink,.wt-press,.wt-drop,.wt-flow,.wt-drift,.wt-drift-b{animation:none}
  .wt-lift:hover,.wt-item:hover{transform:none}
  .wt-reveal{transform:none}.wt-roller{transform:translateX(340px)}
  .wt-line,.wt-dot{transition:none;transform:none;opacity:1}
}
`

function useSeen() {
  const ref = useRef(null)
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return setSeen(true)
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setSeen(true), io.disconnect()), { threshold: 0.35 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return [ref, seen]
}

function PressArt() {
  const bars = ['#1f9bd1', '#d6336c', '#f2c230', '#2c2118']
  return (
    <svg viewBox="0 0 480 400" role="img" aria-label="A printing press roller printing a sheet with color bars" className="wt-press h-auto w-full">
      <defs>
        <linearGradient id="wt-roll" x1="0" x2="1">
          <stop offset="0" stopColor="#8a6a4a" />
          <stop offset=".45" stopColor="#e9d3ae" />
          <stop offset="1" stopColor="#6b4c33" />
        </linearGradient>
        <clipPath id="wt-clip">
          <rect className="wt-reveal" x="70" y="150" width="340" height="180" />
        </clipPath>
      </defs>

      <rect x="40" y="110" width="400" height="260" rx="20" fill="#3a2c20" stroke="#5a4533" strokeWidth="2" />
      <rect x="70" y="150" width="340" height="180" rx="6" fill="#fbf7f2" />

      <g clipPath="url(#wt-clip)">
        <g className="wt-ink">
          <rect x="96" y="172" width="150" height="12" rx="3" fill="#2c2118" />
          <rect x="96" y="196" width="230" height="6" rx="3" fill="#c6a786" />
          <rect x="96" y="210" width="190" height="6" rx="3" fill="#c6a786" />
          {bars.map((c, i) => (
            <rect key={c} x={96 + i * 74} y="250" width="66" height="50" rx="4" fill={c} />
          ))}
        </g>
      </g>

      {/* crop marks */}
      {[[70, 150, 1, 1], [410, 150, -1, 1], [70, 330, 1, -1], [410, 330, -1, -1]].map(([x, y, sx, sy]) => (
        <path key={`${x}${y}`} d={`M${x - 14 * sx} ${y}h8M${x} ${y - 14 * sy}v8`} stroke="#c6a786" strokeWidth="1.5" fill="none" />
      ))}

      <g transform="translate(70 0)">
        <g className="wt-roller">
          <ellipse cx="0" cy="348" rx="22" ry="5" fill="#000" opacity=".25" />
          <rect x="-15" y="128" width="30" height="220" rx="15" fill="url(#wt-roll)" />
          <rect x="-9" y="140" width="4" height="196" rx="2" fill="#fff" opacity=".35" />
        </g>
      </g>

      <rect x="120" y="58" width="240" height="30" rx="10" fill="#5a4533" />
      <path className="wt-flow" d="M134 73H346" stroke="#e0b46a" strokeWidth="4" strokeLinecap="round" fill="none" />
      {[[150, '#1f9bd1', 0], [215, '#d6336c', 0.8], [280, '#f2c230', 1.6], [335, '#e0b46a', 2.4]].map(([x, c, d]) => (
        <circle key={x} className="wt-drop" cx={x} cy="96" r="5" fill={c} style={{ animationDelay: `${d}s` }} />
      ))}
    </svg>
  )
}

export default function Landing() {
  const { user } = useAuth()
  const enterTo = user ? '/app' : '/login'
  const [flowRef, flowSeen] = useSeen()

  return (
    <div className="wt min-h-screen bg-[#f3ebe0]">
      <style>{css}</style>

      <header className="sticky top-0 z-30 border-b border-[#e0d2c2] bg-[#fbf7f2]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
          <a href="#top" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#7a5539] text-sm font-semibold text-white">WT</span>
            <span className="wt-serif text-lg font-semibold">WorkTips</span>
          </a>
          <nav className="hidden items-center gap-7 text-sm text-[#5c4a3d] md:flex">
            <a href="#modules" className="hover:text-[#2c2118]">What you get</a>
            <a href="#flow" className="hover:text-[#2c2118]">How it works</a>
            <a href="#roles" className="hover:text-[#2c2118]">Who it is for</a>
          </nav>
          <div className="flex items-center gap-2">
            {user ? (
              <Link to="/app" className="rounded-xl bg-[#7a5539] px-4 py-2 text-sm font-medium text-white">Open workspace</Link>
            ) : (
              <>
                <Link to="/login" className="rounded-xl px-3 py-2 text-sm text-[#5c4a3d]">Sign in</Link>
                <Link to="/register" className="rounded-xl bg-[#7a5539] px-4 py-2 text-sm font-medium text-white">Create account</Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main id="top">
        <section className="relative overflow-hidden bg-[#2c2118] text-[#f6efe6]">
          <div aria-hidden="true" className="wt-drift pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-[#7a5539]/50 blur-3xl" />
          <div aria-hidden="true" className="wt-drift-b pointer-events-none absolute bottom-0 left-1/4 h-56 w-56 rounded-full bg-[#e0b46a]/20 blur-3xl" />
          <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 lg:grid-cols-2 lg:py-24">
            <div>
              <h1 className="wt-serif wt-in text-4xl font-semibold leading-[1.1] sm:text-6xl">
                Every solution starts with sharing.
              </h1>
              <p className="wt-in mt-6 max-w-md text-lg leading-8 text-[#e8dccf]" style={{ animationDelay: '.15s' }}>
                Keep your press floor&rsquo;s know-how, jobs and machine problems in one place, and see sales and ink use update as work gets done.
              </p>
              <div className="wt-in mt-8 flex flex-wrap gap-3" style={{ animationDelay: '.3s' }}>
                <Link to={enterTo} className="wt-lift rounded-xl bg-[#e0b46a] px-6 py-3 font-semibold text-[#2c2118]">
                  {user ? 'Continue to workspace' : 'Sign in'}
                </Link>
                {!user && (
                  <Link to="/register" className="wt-lift rounded-xl border border-white/25 px-6 py-3 font-medium hover:bg-white/10">
                    Create account
                  </Link>
                )}
              </div>
            </div>
            <div className="wt-in mx-auto w-full max-w-md lg:max-w-none" style={{ animationDelay: '.25s' }}>
              <PressArt />
            </div>
          </div>
        </section>

        <section id="modules" className="mx-auto max-w-6xl px-5 py-20">
          <h2 className="wt-serif max-w-xl text-3xl font-semibold sm:text-4xl">One place for what your shop knows and what it prints.</h2>
          <p className="mt-4 max-w-xl text-[#6b5a4c]">
            Made for tarpaulin, sticker, sublimation and digital shops that still keep procedures in notebooks and sales in spreadsheets.
          </p>
          <dl className="mt-12 grid gap-x-12 gap-y-10 md:grid-cols-2">
            {modules.map(([title, body]) => (
              <div key={title} className="wt-item border-t-2 border-[#2c2118] pt-4">
                <dt className="wt-serif text-xl font-semibold">{title}</dt>
                <dd className="mt-2 max-w-md leading-7 text-[#6b5a4c]">{body}</dd>
              </div>
            ))}
          </dl>
          <Link to={enterTo} className="wt-lift mt-12 inline-block rounded-xl bg-[#7a5539] px-6 py-3 font-semibold text-white">
            {user ? 'Open the workspace' : 'Sign in to explore'}
          </Link>
        </section>

        <section id="flow" className="border-y border-[#e0d2c2] bg-[#fbf7f2]">
          <div ref={flowRef} className={`mx-auto max-w-6xl px-5 py-20 ${flowSeen ? 'wt-seen' : ''}`}>
            <h2 className="wt-serif max-w-xl text-3xl font-semibold sm:text-4xl">Jobs and issues feed the dashboard on their own.</h2>
            <div className="relative mt-14">
              <div className="absolute left-0 right-0 top-5 hidden h-0.5 bg-[#e0d2c2] md:block" />
              <div className="wt-line absolute left-0 right-0 top-5 hidden h-0.5 bg-[#7a5539] md:block" />
              <ol className="relative grid gap-8 md:grid-cols-4">
                {steps.map(([title, text], i) => (
                  <li key={title}>
                    <span
                      className="wt-dot grid h-10 w-10 place-items-center rounded-full bg-[#7a5539] font-semibold text-white"
                      style={{ transitionDelay: `${i * 0.4}s` }}
                    >
                      {i + 1}
                    </span>
                    <h3 className="wt-serif mt-4 text-xl font-semibold">{title}</h3>
                    <p className="mt-2 leading-7 text-[#6b5a4c]">{text}</p>
                  </li>
                ))}
              </ol>
            </div>
            <a href="#roles" className="wt-lift mt-12 inline-block rounded-xl border border-[#7a5539] px-6 py-3 font-semibold text-[#7a5539]">
              Choose your access
            </a>
          </div>
        </section>

        <section id="roles" className="mx-auto max-w-6xl px-5 py-20">
          <h2 className="wt-serif text-3xl font-semibold sm:text-4xl">Pick the access you need.</h2>
          <p className="mt-3 text-[#6b5a4c]">An administrator approves every new account before it can sign in.</p>
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            <article className="wt-lift rounded-3xl border border-[#e0d2c2] bg-[#fbf7f2] p-8">
              <h3 className="wt-serif text-2xl font-semibold">Recipient</h3>
              <p className="mt-1 text-[#6b5a4c]">View only</p>
              <ul className="mt-5 space-y-2 leading-7">
                <li>Browse tutorials, printers, jobs and issues</li>
                <li>No posting, commenting or reporting</li>
                <li>No changes to records</li>
              </ul>
            </article>
            <article className="wt-lift rounded-3xl bg-[#2c2118] p-8 text-[#f6efe6]">
              <h3 className="wt-serif text-2xl font-semibold">Employee</h3>
              <p className="mt-1 text-[#c6a786]">Operators and technicians</p>
              <ul className="mt-5 space-y-2 leading-7 text-[#e8dccf]">
                <li>Post tips with a photo or video</li>
                <li>Report machine problems</li>
                <li>Record printing jobs on the floor</li>
              </ul>
            </article>
          </div>
        </section>

        <section className="px-5 pb-20">
          <div className="mx-auto max-w-6xl rounded-3xl bg-[#7a5539] px-8 py-14 text-center text-white sm:px-16">
            <h2 className="wt-serif text-3xl font-semibold sm:text-4xl">Ready for the press floor?</h2>
            <p className="mx-auto mt-3 max-w-md text-[#f1e3d0]">
              Create an account, then wait for an administrator to approve it.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/register" className="wt-lift rounded-xl bg-[#fbf7f2] px-6 py-3 font-semibold text-[#2c2118]">Create account</Link>
              <Link to="/login" className="rounded-xl border border-white/40 px-6 py-3 font-medium transition hover:bg-white/10">Sign in</Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#e0d2c2] bg-[#fbf7f2] px-5 py-8 text-center text-sm text-[#8a7b6d]">
        WorkTips for ACES Tagum College, Inc. A.Y. 2026&ndash;2027
      </footer>
    </div>
  )
}