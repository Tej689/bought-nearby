import { NavLink, useNavigate } from 'react-router-dom'

export function TabBar() {
  const navigate = useNavigate()

  return (
    <nav
      className="border-line bg-surface fixed inset-x-0 bottom-0 z-500 mx-auto flex max-w-md items-stretch border-t"
      /* Keeps the bar clear of the iPhone home indicator. */
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <TabLink to="/" label="Feed" icon="📰" />
      <TabLink to="/map" label="Nearby" icon="📍" />

      <div className="grid w-16 shrink-0 place-items-center">
        <button
          onClick={() => navigate('/log')}
          aria-label="Log a purchase"
          className="bg-accent grid h-12 w-12 -translate-y-3 place-items-center rounded-full pb-0.5 text-3xl leading-none font-light text-white shadow-lg active:scale-95"
        >
          +
        </button>
      </div>

      <TabLink to="/shelves" label="Shelves" icon="🗄️" />
    </nav>
  )
}

function TabLink({ to, label, icon }: { to: string; label: string; icon: string }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        `flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium ${
          isActive ? 'text-accent' : 'text-muted'
        }`
      }
    >
      <span className="text-lg leading-none">{icon}</span>
      {label}
    </NavLink>
  )
}
