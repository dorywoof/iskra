import { NavLink, Outlet } from 'react-router-dom'
import { SparkMark } from './SparkMark'
import { useTheme } from '../hooks/useTheme'

const navItems = [
  { to: '/', label: 'Колоды', end: true },
  { to: '/stats', label: 'Статистика', end: false }
]

export function Layout() {
  const [theme, toggle] = useTheme()

  return (
    <div className="grain min-h-full">
      <header className="border-b-2 border-ink dark:border-cream/70">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <NavLink to="/" className="flex items-center gap-3">
            <SparkMark size={34} />
            <span className="font-display text-2xl font-black uppercase tracking-tight text-ink dark:text-cream">
              Искра
            </span>
          </NavLink>

          <div className="flex items-center gap-1 sm:gap-3">
            <nav className="flex items-center gap-1 sm:gap-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `px-3 py-1.5 font-grotesk text-xs font-bold uppercase tracking-widest transition-colors sm:text-sm ${
                      isActive
                        ? 'bg-ink text-paper dark:bg-cream dark:text-night'
                        : 'text-ink-soft hover:text-spark dark:text-cream-soft'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <button
              onClick={toggle}
              className="border-2 border-ink px-2.5 py-1.5 font-grotesk text-sm text-ink hover:bg-ink hover:text-paper dark:border-cream/70 dark:text-cream dark:hover:bg-cream dark:hover:text-night"
              aria-label="Сменить тему"
            >
              {theme === 'dark' ? '☀' : '☾'}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <Outlet />
      </main>

      <footer className="mx-auto max-w-4xl px-4 pb-10 pt-4 sm:px-6">
        <p className="border-t border-ink/30 pt-4 font-grotesk text-xs uppercase tracking-widest text-ink-soft dark:border-cream/20 dark:text-cream-soft">
          Искра · интервальное повторение · данные хранятся только у вас
        </p>
      </footer>
    </div>
  )
}
