import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Reveal from '../components/Reveal'

const modules = [
  {
    title: 'Knowledge base',
    body: 'Search tutorials, videos, procedures, and peer tips. Comment, rate, save, and report outdated guides.',
  },
  {
    title: 'Issue reports',
    body: 'Log machine problems by printer. Matching common faults attach a recommended solution automatically.',
  },
  {
    title: 'Printers & parts',
    body: 'Keep brand, model, serial, compatible ink, condition, and parts such as printheads and wiper blades in one catalog.',
  },
  {
    title: 'Jobs & ink',
    body: 'Record tarpaulin, sticker, sublimation, digital, and other jobs. Optional ink lines feed consumption charts.',
  },
  {
    title: 'Maintenance',
    body: 'Log service work and parts replaced. Next due dates update on each printer for the dashboard.',
  },
  {
    title: 'Analytics',
    body: 'Supervisors see live sales, ink by printer and type, open issues, maintenance due, and most useful tips.',
  },
]

const steps = [
  { n: '01', title: 'Share knowledge', text: 'Employees publish tips with photos or video. Supervisors approve what the floor can trust.' },
  { n: '02', title: 'Solve problems', text: 'Search the press, report a jam or missing nozzle, and follow the attached procedure.' },
  { n: '03', title: 'Record the job', text: 'When a print finishes, save type, printer, amount, and ink used.' },
  { n: '04', title: 'Read the floor', text: 'Analytics read those tables live. There is no separate warehouse of KPIs.' },
]

export default function Landing() {
  const { user } = useAuth()
  const enterTo = user ? '/app' : '/login'

  return (
    <div className="min-h-screen bg-[#efe6db] text-ink">
      <header className="landing-header sticky top-0 z-30 border-b border-[#e0d2c2] bg-[#fbf7f2]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
          <a href="#top" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-press text-sm font-semibold text-white">WT</span>
            <span>
              <span className="block text-[11px] tracking-[0.22em] text-press">WORKTIPS</span>
              <span className="block text-sm font-semibold">Press Knowledge</span>
            </span>
          </a>
          <nav className="hidden items-center gap-6 text-sm text-[#5c4a3d] md:flex">
            <a href="#modules">Modules</a>
            <a href="#flow">How it works</a>
            <a href="#roles">Roles</a>
          </nav>
          <div className="flex items-center gap-2">
            {user ? (
              <Link to="/app" className="rounded-xl bg-press px-4 py-2 text-sm font-medium text-white">
                Open workspace
              </Link>
            ) : (
              <>
                <Link to="/login" className="rounded-xl px-3 py-2 text-sm text-[#5c4a3d]">
                  Sign in
                </Link>
                <Link to="/register" className="btn-press rounded-xl bg-press px-4 py-2 text-sm font-medium text-white">
                  Create account
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main id="top">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[#2c2118]" />
          <div className="float-blob absolute -right-24 -top-24 h-80 w-80 rounded-full bg-press/40 blur-3xl" />
          <div className="float-blob-slow absolute bottom-0 left-1/3 h-56 w-56 rounded-full bg-gold/20 blur-3xl" />
          <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 lg:grid-cols-2 lg:py-28">
            <div className="text-[#f6efe6]">
              <p className="hero-copy text-[11px] tracking-[0.22em] text-gold">PRINTING OPERATIONS HUB</p>
              <h1 className="hero-copy-delay mt-4 text-4xl font-semibold leading-tight sm:text-5xl">
                Every solution
                <br />
                starts with sharing.
              </h1>
              <p className="hero-copy-later mt-5 max-w-lg text-base leading-7 text-[#e8dccf]">
                WorkTips is the workplace knowledge and business analytics platform for printing press operations.
                Employees share tips. The floor records jobs and issues. Supervisors see sales, ink, printers, and parts
                in one dashboard.
              </p>
              <div className="hero-copy-later mt-8 flex flex-wrap gap-3">
                <Link to={enterTo} className="btn-press rounded-xl bg-press px-5 py-3 text-sm font-medium text-white">
                  {user ? 'Continue to workspace' : 'Enter workspace'}
                </Link>
                <a href="#flow" className="rounded-xl border border-white/20 px-5 py-3 text-sm text-[#f6efe6]">
                  See how data flows
                </a>
              </div>
              <p className="mt-6 text-xs text-[#c6a786]">Knowledge · Operations · Analytics</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ['Sales & orders', 'Live totals from printing jobs'],
                ['Ink by printer', 'ml / L logged with each job'],
                ['Open issues', 'Problems still on the floor'],
                ['Maintenance due', 'Next service dates on each press'],
              ].map(([label, hint], i) => (
                <div
                  key={label}
                  className="hero-copy-later rounded-2xl border border-white/10 bg-white/5 p-5 transition duration-300 hover:-translate-y-1 hover:bg-white/10"
                  style={{ animationDelay: `${0.2 + i * 0.08}s` }}
                >
                  <div className="text-xs tracking-[0.16em] text-gold">{label.toUpperCase()}</div>
                  <p className="mt-2 text-sm text-[#e8dccf]">{hint}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="modules" className="mx-auto max-w-6xl px-5 py-16">
          <Reveal>
            <p className="text-[11px] tracking-[0.18em] text-[#8a7b6d]">WHAT THE FLOOR GETS</p>
            <h2 className="mt-2 text-3xl font-semibold">One system for knowledge and the press</h2>
            <p className="mt-3 max-w-2xl text-[#7a6a5c]">
              Built for tarpaulin, sticker, sublimation, and digital shops that still keep procedures in notebooks and
              sales in spreadsheets.
            </p>
          </Reveal>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {modules.map((m, i) => (
              <Reveal key={m.title} delay={i * 80}>
                <article className="card h-full p-5">
                  <h3 className="font-semibold">{m.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#7a6a5c]">{m.body}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        <section id="flow" className="border-y border-[#e0d2c2] bg-[#fbf7f2]">
          <div className="mx-auto max-w-6xl px-5 py-16">
            <Reveal>
              <p className="text-[11px] tracking-[0.18em] text-[#8a7b6d]">HOW IT WORKS</p>
              <h2 className="mt-2 text-3xl font-semibold">Jobs and issues feed analytics automatically</h2>
            </Reveal>
            <div className="mt-10 grid gap-6 md:grid-cols-4">
              {steps.map((s, i) => (
                <Reveal key={s.n} delay={i * 90}>
                  <div className="text-sm font-semibold text-press">{s.n}</div>
                  <h3 className="mt-2 font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#7a6a5c]">{s.text}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section id="roles" className="mx-auto max-w-6xl px-5 py-16">
          <Reveal>
            <p className="text-[11px] tracking-[0.18em] text-[#8a7b6d]">WHO SIGNS IN</p>
            <h2 className="mt-2 text-3xl font-semibold">Recipient or employee.</h2>
          </Reveal>
          <div className="mt-10 grid gap-4 lg:grid-cols-2">
            <Reveal>
              <article className="card h-full p-7">
                <div className="text-[11px] tracking-[0.18em] text-press">RECIPIENT</div>
                <h3 className="mt-2 text-xl font-semibold">View only</h3>
                <ul className="mt-4 space-y-2 text-sm text-[#5c4a3d]">
                  <li>Browse tutorials, printers, jobs, and issues</li>
                  <li>Cannot post tips, comments, or reports</li>
                  <li>Cannot record jobs or change records</li>
                </ul>
              </article>
            </Reveal>
            <Reveal delay={80}>
              <article className="card h-full border-press/20 bg-[#2c2118] p-7 text-[#f6efe6]">
                <div className="text-[11px] tracking-[0.18em] text-gold">EMPLOYEE</div>
                <h3 className="mt-2 text-xl font-semibold">Operators and technicians</h3>
                <ul className="mt-4 space-y-2 text-sm text-[#e8dccf]">
                  <li>Post tips with photo or video</li>
                  <li>Report machine problems</li>
                  <li>Record printing jobs on the floor</li>
                </ul>
              </article>
            </Reveal>
          </div>
        </section>

        <section className="px-5 pb-20">
          <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl bg-[#2c2118] px-8 py-12 text-center text-[#f6efe6] sm:px-16">
            <p className="text-[11px] tracking-[0.22em] text-gold">ACES TAGUM COLLEGE, INC.</p>
            <h2 className="mt-3 text-3xl font-semibold">Ready for the press floor.</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-[#e8dccf]">
              Register as a recipient to view the press, or as an employee to share tips, report issues, and record jobs.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/login" className="btn-press rounded-xl bg-press px-5 py-3 text-sm font-medium text-white">
                Sign in
              </Link>
              <Link to="/register" className="rounded-xl border border-white/20 px-5 py-3 text-sm transition hover:bg-white/10">
                Create an account
              </Link>
            </div>
            <p className="mt-6 text-xs text-[#c6a786]">Demo: eliza@worktips.test or admin@worktips.test / password</p>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#e0d2c2] bg-[#fbf7f2] px-5 py-8 text-center text-xs text-[#8a7b6d]">
        WorkTips · Workplace knowledge sharing and business analytics for printing press operations · A.Y. 2026–2027
      </footer>
    </div>
  )
}
