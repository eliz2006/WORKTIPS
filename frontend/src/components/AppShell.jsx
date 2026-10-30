import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const employeeNav = [
  ['/app', 'Dashboard'],
  ['/app/knowledge', 'Knowledge Base'],
  ['/app/tutorials', 'Tutorials & Videos'],
  ['/app/troubleshooting', 'Troubleshooting'],
  ['/app/equipment', 'Equipment'],
  ['/app/tips', 'My Tips'],
  ['/app/saved', 'Saved Items'],
  ['/app/issues', 'Issue Reports'],
  ['/app/jobs', 'Printing Jobs'],
]

const adminNav = [
  ['/app', 'Dashboard'],
  ['/app/analytics', 'Analytics'],
  ['/app/knowledge', 'Knowledge Base'],
  ['/app/content', 'Content Review'],
  ['/app/equipment', 'Printers'],
  ['/app/parts', 'Parts Catalog'],
  ['/app/issues', 'Issue Reports'],
  ['/app/maintenance', 'Maintenance'],
  ['/app/jobs', 'Sales / Jobs'],
  ['/app/ink', 'Ink Usage'],
]

export default function AppShell() {
  const { user, isAdmin, logout } = useAuth()
  const navigate = useNavigate()
  const nav = isAdmin ? adminNav : employeeNav
  const initials = user?.name
    ?.split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="min-h-screen bg-[#efe6db] text-ink">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-[#e0d2c2] bg-[#2c2118] text-[#f6efe6] md:flex md:flex-col">
        <div className="px-5 py-6">
          <div className="text-xs tracking-[0.2em] text-gold">WORKTIPS</div>
          <div className="mt-1 text-lg font-semibold">Press Knowledge</div>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {nav.map(([to, label]) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/app'}
              className={({ isActive }) =>
                `block rounded-xl px-3 py-2.5 text-sm ${isActive ? 'bg-press text-white' : 'text-[#e8dccf] hover:bg-white/10'}`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-press text-sm font-semibold">{initials}</div>
            <div>
              <div className="text-sm font-medium">{user?.name}</div>
              <div className="text-xs text-gold">{isAdmin ? 'Administrator' : 'Employee'}</div>
            </div>
          </div>
          <button
            className="mt-3 w-full rounded-xl border border-white/15 px-3 py-2 text-sm"
            onClick={async () => {
              await logout()
              navigate('/login')
            }}
          >
            Log out
          </button>
        </div>
      </aside>
      <main className="md:pl-64">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-[#e5d8c8] bg-[#fbf7f2]/90 px-6 py-4 backdrop-blur">
          <div>
            <div className="text-[11px] tracking-[0.18em] text-[#8a7b6d]">
              {isAdmin ? 'ADMINISTRATOR WORKSPACE' : 'EMPLOYEE WORKSPACE'}
            </div>
            <div className="font-medium">{user?.name}</div>
          </div>
        </header>
        <nav className="flex gap-2 overflow-auto border-b border-[#e5d8c8] bg-[#fbf7f2] px-4 py-2 md:hidden">
          {nav.map(([to, label]) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/app'}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-full px-3 py-1 text-sm ${isActive ? 'bg-press text-white' : 'bg-white text-[#5c4a3d]'}`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
