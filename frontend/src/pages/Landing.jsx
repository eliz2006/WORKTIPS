import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const modules = [
  ['Knowledge base', 'Search tutorials, videos and procedures. Comment, rate, save, and flag guides that are out of date.'],
  ['Issue reports', 'Log a machine problem by printer. If it matches a known fault, the fix is attached for you.'],
  ['Printers and parts', 'Brand, model, compatible ink, condition, and parts like printheads and wiper blades in one catalog.'],
  ['Sales', 'Record tarpaulin, sticker, sublimation and digital jobs. Add the ink used and the charts update.'],
  ['Maintenance', 'Log service work and parts replaced. Each printer shows when its next service is due.'],
  ['Analytics', 'Administrators see sales, ink by printer, open issues, and the most useful tips as they happen.'],
]

const steps = [
  ['Share what you know', 'Post a tip with a photo or video. A supervisor approves it before the floor sees it.'],
  ['Fix a problem', 'Search the knowledge base or report a jam. Matching procedures show up next to the report.'],
  ['Record the job', 'When a print finishes, save the type, printer, amount and ink used.'],
  ['Read the floor', 'The dashboard reads those records live. There is nothing extra to update.'],
]

const jobs = ['Tarpaulin', 'Stickers', 'Sublimation', 'Digital prints', 'Banners', 'Invitations', 'Mugs and shirts', 'Signage']

const grain =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='2'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")"

const css = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Figtree:wght@400;500;600&display=swap');
.wt{font-family:'Figtree',system-ui,sans-serif;color:#2c2118}
.wt-serif{font-family:'Fraunces',Georgia,serif;letter-spacing:-0.02em}
.wt a:focus-visible{outline:3px solid #e0b46a;outline-offset:3px;border-radius:12px}

/* headline: each line rises out of a mask, once */
@keyframes wt-up{to{transform:none}}
@keyframes wt-rise{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}
.wt-mask{display:block;overflow:hidden;padding-bottom:.14em}
.wt-mask>span{display:block;transform:translateY(105%);animation:wt-up 1s cubic-bezier(.2,.7,.2,1) forwards}
.wt-in{opacity:0;animation:wt-rise .8s cubic-bezier(.2,.7,.2,1) forwards}

/* mouse parallax (set from JS as --mx / --my in -1..1) */
.wt-par{transition:transform .5s ease-out;will-change:transform}
.wt-p1{transform:translate3d(calc(var(--mx,0)*-16px),calc(var(--my,0)*-10px),0)}
.wt-p2{transform:translate3d(calc(var(--mx,0)*26px),calc(var(--my,0)*18px),0)}
.wt-p3{transform:translate3d(calc(var(--mx,0)*-30px),calc(var(--my,0)*-22px),0)}

/* the press */
@keyframes wt-roll{0%{transform:translateX(0)}55%,85%{transform:translateX(340px)}100%{transform:translateX(0)}}
@keyframes wt-print{0%{transform:scaleX(0)}55%,100%{transform:scaleX(1)}}
@keyframes wt-fade{0%,85%{opacity:1}100%{opacity:0}}
@keyframes wt-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
@keyframes wt-drop{0%{transform:translateY(-8px);opacity:0}15%{opacity:1}70%{opacity:1}100%{transform:translateY(56px);opacity:0}}
@keyframes wt-flow{to{stroke-dashoffset:-48}}
@keyframes wt-draw{0%,10%{stroke-dashoffset:420}55%,100%{stroke-dashoffset:0}}
@keyframes wt-drift{0%,100%{transform:translate(0,0)}50%{transform:translate(28px,-20px)}}
.wt-roller{animation:wt-roll 9s cubic-bezier(.45,0,.35,1) infinite}
.wt-reveal{transform-box:fill-box;transform-origin:left center;animation:wt-print 9s cubic-bezier(.45,0,.35,1) infinite}
.wt-ink{animation:wt-fade 9s linear infinite}
.wt-press{animation:wt-bob 7s ease-in-out infinite}
.wt-drop{animation:wt-drop 3.2s ease-in infinite}
.wt-flow{stroke-dasharray:14 10;animation:wt-flow 2.4s linear infinite}
.wt-trend{stroke-dasharray:420;animation:wt-draw 9s cubic-bezier(.45,0,.35,1) infinite}
.wt-drift{animation:wt-drift 14s ease-in-out infinite}
.wt-drift-b{animation:wt-drift 18s ease-in-out infinite reverse}

/* band of job types */
@keyframes wt-marquee{to{transform:translateX(-50%)}}
.wt-band{display:flex;width:max-content;animation:wt-marquee 38s linear infinite}
.wt-band:hover{animation-play-state:paused}

/* timeline */
@keyframes wt-travel{0%{left:0;opacity:0}8%{opacity:1}92%{opacity:1}100%{left:calc(100% - 14px);opacity:0}}
.wt-line{transform-origin:left;transform:scaleX(0);transition:transform 1.6s cubic-bezier(.4,0,.2,1)}
.wt-seen .wt-line{transform:scaleX(1)}
.wt-dot{opacity:0;transform:scale(.6);transition:opacity .4s,transform .4s}
.wt-seen .wt-dot{opacity:1;transform:none}
.wt-travel{opacity:0}
.wt-seen .wt-travel{animation:wt-travel 6s ease-in-out 1.8s infinite}

/* hover */
.wt-lift{transition:transform .25s ease,box-shadow .25s ease}
.wt-lift:hover{transform:translateY(-3px);box-shadow:0 12px 26px rgba(44,33,24,.18)}
.wt-item{transition:border-color .25s ease,transform .25s ease}
.wt-item:hover{border-color:#c6a786;transform:translateX(4px)}

/* cinematic intro: 3D wordmark, doors open sideways */
@keyframes wt-wordin{from{transform:rotateY(-95deg) rotateX(25deg) translateZ(-320px) scale(.7)}to{transform:none}}
@keyframes wt-float{0%,100%{transform:translateY(0) rotateY(-16deg) rotateX(4deg)}50%{transform:translateY(-14px) rotateY(16deg) rotateX(-4deg)}}
@keyframes wt-glint{0%,100%{opacity:.35}50%{opacity:1}}
.wt-door{transition:transform 1.3s cubic-bezier(.77,0,.18,1)}
.wt-open .wt-dl{transform:translateX(-101%)}
.wt-open .wt-dr{transform:translateX(101%)}
.wt-stage{perspective:1100px}
.wt-3d{transform-style:preserve-3d}
.wt-tilt{transform-style:preserve-3d;transform:rotateY(calc(var(--mx,0)*30deg)) rotateX(calc(var(--my,0)*-20deg));transition:transform .25s ease-out}
.wt-float{transform-style:preserve-3d;animation:wt-float 7s ease-in-out infinite}
.wt-wordin{transform-style:preserve-3d;animation:wt-wordin 1.8s cubic-bezier(.2,.7,.2,1) both}
.wt-hint{animation:wt-glint 2.2s ease-in-out infinite}
.wt-hold .wt-mask>span,.wt-hold .wt-in{animation-play-state:paused}

@media (prefers-reduced-motion:reduce){
  .wt *,.wt *::before{animation:none!important;transition:none!important}
  .wt-mask>span,.wt-in{transform:none;opacity:1}
  .wt-reveal{transform:none}.wt-roller{transform:translateX(340px)}
  .wt-trend{stroke-dashoffset:0}.wt-line,.wt-dot{transform:none;opacity:1}
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

const heights = [30, 52, 40, 74, 60, 92]
const barColors = ['#1f9bd1', '#d6336c', '#f2c230', '#2c2118', '#1f9bd1', '#d6336c']

function PressArt() {
  return (
    <svg viewBox="0 0 480 400" role="img" aria-label="A printing press roller printing a sheet that turns into a sales chart" className="wt-press h-auto w-full">
      <defs>
        <linearGradient id="wt-roll" x1="0" x2="1">
          <stop offset="0" stopColor="#8a6a4a" />
          <stop offset=".45" stopColor="#f0dcb8" />
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
          <rect x="96" y="170" width="130" height="12" rx="3" fill="#2c2118" />
          <rect x="96" y="190" width="190" height="6" rx="3" fill="#c6a786" />
          <path d="M96 308H384" stroke="#e0d2c2" strokeWidth="2" />
          {heights.map((h, i) => (
            <rect key={i} x={96 + i * 51} y={306 - h} width="34" height={h} rx="4" fill={barColors[i]} />
          ))}
          <path className="wt-trend" d="M113 262L164 244L215 252L266 224L317 232L368 206" fill="none" stroke="#7a5539" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          {[[113, 262], [164, 244], [215, 252], [266, 224], [317, 232], [368, 206]].map(([x, y]) => (
            <circle key={x} cx={x} cy={y} r="5" fill="#fbf7f2" stroke="#7a5539" strokeWidth="3" />
          ))}
        </g>
      </g>

      {[[70, 150, 1, 1], [410, 150, -1, 1], [70, 330, 1, -1], [410, 330, -1, -1]].map(([x, y, sx, sy]) => (
        <path key={`${x}${y}`} d={`M${x - 14 * sx} ${y}h8M${x} ${y - 14 * sy}v8`} stroke="#c6a786" strokeWidth="1.5" fill="none" />
      ))}

      <g transform="translate(70 0)">
        <g className="wt-roller">
          <ellipse cx="0" cy="348" rx="22" ry="5" fill="#000" opacity=".25" />
          <rect x="-15" y="128" width="30" height="220" rx="15" fill="url(#wt-roll)" />
          <rect x="-9" y="140" width="4" height="196" rx="2" fill="#fff" opacity=".4" />
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

const depth = Array.from({ length: 26 })

function Scene() {
  return (
    <div className="absolute inset-0 grid place-items-center">
      <div aria-hidden="true" className="absolute inset-0" style={{ background: 'radial-gradient(60% 50% at 50% 50%, rgba(122,85,57,.55), transparent 70%)' }} />
      <div className="wt-stage relative">
        <div className="wt-tilt">
          <div className="wt-float">
            <div className="wt-wordin wt-serif relative font-semibold leading-none" style={{ fontSize: 'clamp(3.2rem,14vw,10rem)' }}>
              <span className="invisible">PrinTour</span>
              {[...depth].reverse().map((_, r) => {
                const i = depth.length - 1 - r
                const front = i === 0
                return (
                  <span
                    key={i}
                    aria-hidden="true"
                    className="absolute inset-0"
                    style={{
                      transform: `translateZ(${-i * 4}px)`,
                      ...(front
                        ? { backgroundImage: 'linear-gradient(180deg,#fff0c2 5%,#e8bf74 45%,#c48a3c 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', color: 'transparent' }
                        : { color: `hsl(30 55% ${44 - i * 1.4}%)` }),
                    }}
                  >
                    PrinTour
                  </span>
                )
              })}
            </div>
          </div>
        </div>
        <div aria-hidden="true" className="absolute left-1/2 top-[118%] h-6 w-[80%] -translate-x-1/2 rounded-full bg-black/50 blur-xl" />
      </div>
      <p className="wt-in absolute left-0 right-0 top-[66%] text-center text-lg tracking-wide text-[#c6a786]" style={{ animationDelay: '1.4s' }}>
        Print. Share. Track.
      </p>
      <p className="wt-hint absolute bottom-10 left-0 right-0 text-center text-sm text-[#e8dccf]">Click anywhere to enter</p>
    </div>
  )
}

function Intro({ onOpen, onDone }) {
  const [open, setOpen] = useState(false)
  const opened = useRef(false)
  const root = useRef(null)

  const go = () => {
    if (opened.current) return
    opened.current = true
    setOpen(true)
    onOpen()
    setTimeout(onDone, 1500)
  }

  useEffect(() => {
    const t = setTimeout(go, 4200)
    const key = () => go()
    window.addEventListener('keydown', key)
    document.body.style.overflow = 'hidden'
    return () => {
      clearTimeout(t)
      window.removeEventListener('keydown', key)
      document.body.style.overflow = ''
    }
  }, [])

  const move = (e) => {
    const el = root.current
    el.style.setProperty('--mx', (e.clientX / window.innerWidth - 0.5) * 2)
    el.style.setProperty('--my', (e.clientY / window.innerHeight - 0.5) * 2)
  }

  return (
    <div
      ref={root}
      role="button"
      tabIndex={0}
      aria-label="Enter PrinTour"
      onClick={go}
      onPointerMove={move}
      className={`fixed inset-0 z-[100] cursor-pointer ${open ? 'wt-open' : ''}`}
    >
      <div className="wt-door wt-dl absolute left-0 top-0 h-full w-1/2 overflow-hidden bg-[#2c2118]">
        <div className="absolute left-0 top-0 h-full w-screen"><Scene /></div>
      </div>
      <div className="wt-door wt-dr absolute right-0 top-0 h-full w-1/2 overflow-hidden bg-[#2c2118]">
        <div className="absolute right-0 top-0 h-full w-screen"><Scene /></div>
      </div>
    </div>
  )
}

export default function Landing() {
  const { user } = useAuth()
  const enterTo = user ? '/app' : '/login'
  const [flowRef, flowSeen] = useSeen()
  const [intro, setIntro] = useState(() => {
    try {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      return !reduced && sessionStorage.getItem('printour_intro') !== '1'
    } catch {
      return false
    }
  })
  const [holding, setHolding] = useState(intro)

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--mx', ((e.clientX - r.left) / r.width - 0.5) * 2)
    e.currentTarget.style.setProperty('--my', ((e.clientY - r.top) / r.height - 0.5) * 2)
  }
  const onLeave = (e) => {
    e.currentTarget.style.setProperty('--mx', 0)
    e.currentTarget.style.setProperty('--my', 0)
  }

  return (
    <div className={`wt min-h-screen bg-[#f3ebe0] ${holding ? 'wt-hold' : ''}`}>
      <style>{css}</style>
      {intro && (
        <Intro
          onOpen={() => {
            setHolding(false)
            try { sessionStorage.setItem('printour_intro', '1') } catch {}
          }}
          onDone={() => setIntro(false)}
        />
      )}

      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#2c2118]/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
          <a href="#top" className="block" aria-label="PrinTour home">
            <span className="wt-serif block text-2xl font-semibold text-[#e8bf74]">PrinTour</span>
            <svg width="120" height="8" viewBox="0 0 120 8" className="mt-1" aria-hidden="true">
              <path className="wt-flow" d="M3 4H117" stroke="#e0b46a" strokeWidth="3" strokeLinecap="round" fill="none" />
            </svg>
          </a>
          <nav className="hidden items-center gap-7 text-sm text-[#e8dccf] md:flex">
            <a href="#modules" className="hover:text-white">What you get</a>
            <a href="#flow" className="hover:text-white">How it works</a>
            <a href="#roles" className="hover:text-white">Who it is for</a>
          </nav>
          <div className="flex items-center gap-2">
            {user ? (
              <Link to="/app" className="rounded-xl bg-[#e0b46a] px-4 py-2 text-sm font-semibold text-[#2c2118]">Open workspace</Link>
            ) : (
              <>
                <Link to="/login" className="rounded-xl px-3 py-2 text-sm text-[#e8dccf] hover:text-white">Sign in</Link>
                <Link to="/register" className="rounded-xl bg-[#e0b46a] px-4 py-2 text-sm font-semibold text-[#2c2118]">Create account</Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main id="top">
        <section onMouseMove={onMove} onMouseLeave={onLeave} className="relative overflow-hidden bg-[#2c2118] text-[#f6efe6]">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[.09] mix-blend-overlay" style={{ backgroundImage: grain }} />
          <div aria-hidden="true" className="wt-par wt-p2 pointer-events-none absolute -right-20 -top-24">
            <div className="wt-drift h-96 w-96 rounded-full bg-[#7a5539]/55 blur-3xl" />
          </div>
          <div aria-hidden="true" className="wt-par wt-p3 pointer-events-none absolute bottom-0 left-1/4">
            <div className="wt-drift-b h-64 w-64 rounded-full bg-[#e0b46a]/20 blur-3xl" />
          </div>

          <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 lg:grid-cols-2 lg:py-28">
            <div>
              <h1 className="wt-serif text-5xl font-semibold leading-[1.05] sm:text-7xl">
                <span className="wt-mask"><span>Every solution</span></span>
                <span className="wt-mask"><span style={{ animationDelay: '.15s' }}>starts with</span></span>
                <span className="wt-mask"><span style={{ animationDelay: '.3s' }} className="text-[#e0b46a]">sharing.</span></span>
              </h1>
              <p className="wt-in mt-6 max-w-md text-lg leading-8 text-[#e8dccf]" style={{ animationDelay: '.7s' }}>
                Keep your press floor&rsquo;s know-how, jobs and machine problems in one place, and watch sales and ink use update as work gets done.
              </p>
              <div className="wt-in mt-8 flex flex-wrap gap-3" style={{ animationDelay: '.9s' }}>
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
            <div className="wt-in mx-auto w-full max-w-md lg:max-w-none" style={{ animationDelay: '.4s' }}>
              <div className="wt-par wt-p1">
                <PressArt />
              </div>
            </div>
          </div>
        </section>

        <div aria-hidden="true" className="overflow-hidden bg-[#e0b46a] py-4 text-[#2c2118]">
          <div className="wt-band">
            {[...jobs, ...jobs].map((j, i) => (
              <span key={i} className="wt-serif flex items-center whitespace-nowrap text-xl font-semibold">
                <span className="px-8">{j}</span>
                <svg width="10" height="10" viewBox="0 0 10 10"><rect x="1" y="1" width="8" height="8" transform="rotate(45 5 5)" fill="#7a5539" /></svg>
              </span>
            ))}
          </div>
        </div>

        <section id="modules" className="mx-auto max-w-6xl px-5 py-24">
          <h2 className="wt-serif max-w-xl text-3xl font-semibold sm:text-5xl">One place for what your shop knows and what it prints.</h2>
          <p className="mt-4 max-w-xl text-lg text-[#6b5a4c]">
            Made for shops that still keep procedures in notebooks and sales in spreadsheets.
          </p>
          <dl className="mt-14 grid gap-x-12 gap-y-10 md:grid-cols-2">
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
          <div ref={flowRef} className={`mx-auto max-w-6xl px-5 py-24 ${flowSeen ? 'wt-seen' : ''}`}>
            <h2 className="wt-serif max-w-xl text-3xl font-semibold sm:text-5xl">Jobs and issues feed the dashboard on their own.</h2>
            <div className="relative mt-16">
              <div className="absolute left-0 right-0 top-5 hidden h-0.5 bg-[#e0d2c2] md:block" />
              <div className="wt-line absolute left-0 right-0 top-5 hidden h-0.5 bg-[#7a5539] md:block" />
              <div className="relative hidden md:block"><span className="wt-travel absolute top-[14px] h-3.5 w-3.5 rounded-full bg-[#e0b46a] shadow-[0_0_14px_#e0b46a]" /></div>
              <ol className="relative grid gap-8 md:grid-cols-4">
                {steps.map(([title, text], i) => (
                  <li key={title}>
                    <span className="wt-dot grid h-10 w-10 place-items-center rounded-full bg-[#7a5539] font-semibold text-white" style={{ transitionDelay: `${i * 0.4}s` }}>
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

        <section id="roles" className="mx-auto max-w-6xl px-5 py-24">
          <h2 className="wt-serif text-3xl font-semibold sm:text-5xl">Pick the access you need.</h2>
          <p className="mt-3 text-lg text-[#6b5a4c]">Recipient accounts can sign in right away. Employee accounts are approved by an administrator first.</p>
          <div className="mt-12 grid gap-5 lg:grid-cols-2">
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

        <section className="px-5 pb-24">
          <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-[#7a5539] px-8 py-16 text-center text-white sm:px-16">
            <div aria-hidden="true" className="wt-drift pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-[#e0b46a]/30 blur-3xl" />
            <div className="relative">
              <h2 className="wt-serif text-3xl font-semibold sm:text-5xl">Ready for the press floor?</h2>
              <p className="mx-auto mt-3 max-w-md text-lg text-[#f1e3d0]">Create an account. Recipients can sign in right away, and employees are approved by an administrator.</p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link to="/register" className="wt-lift rounded-xl bg-[#fbf7f2] px-6 py-3 font-semibold text-[#2c2118]">Create account</Link>
                <Link to="/login" className="wt-lift rounded-xl border border-white/40 px-6 py-3 font-medium hover:bg-white/10">Sign in</Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#e0d2c2] bg-[#fbf7f2] px-5 py-8 text-center text-sm text-[#8a7b6d]">
        PrinTour for ACES Tagum College, Inc. A.Y. 2026&ndash;2027
      </footer>
    </div>
  )
}