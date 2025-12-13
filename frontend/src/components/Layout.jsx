import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useUser } from '../stores/useUser'
import { useLang } from '../stores/useLang'
import { t } from '../i18n/translations'
import { Search, Heart, BookOpen, GraduationCap, LogOut, Music, User } from 'lucide-react'
import { LearningLanguageSelector, UiLanguageSelector } from './LanguageSelector'

function Layout() {
  const { user, logout } = useUser()
  const { uiLang } = useLang()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navItems = [
    { to: '/search', icon: Search, labelKey: 'common.search' },
    { to: '/saved', icon: Heart, labelKey: 'common.saved' },
    { to: '/vocabulary', icon: BookOpen, labelKey: 'common.vocabulary' },
    { to: '/exercises', icon: GraduationCap, labelKey: 'common.exercises' },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            {/* Left: Logo + Language Selector */}
            <div className="flex items-center gap-4">
              <NavLink to="/search" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <Music className="w-7 h-7 text-primary-500" />
                <span className="text-lg font-bold text-gray-900 hidden sm:inline">Song2Learn</span>
              </NavLink>

              {/* Learning language pair - prominent position */}
              <LearningLanguageSelector user={user} />
            </div>

            {/* Center: Navigation (desktop) */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`
                  }
                >
                  <item.icon className="w-4 h-4" />
                  {t(item.labelKey, uiLang)}
                </NavLink>
              ))}
            </nav>

            {/* Right: User menu + UI language */}
            <div className="flex items-center gap-3">
              {/* UI Language - compact, in corner */}
              <UiLanguageSelector />

              {/* User dropdown-like area */}
              <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
                <div className="hidden sm:flex items-center gap-1.5 text-sm text-gray-600">
                  <User className="w-4 h-4" />
                  <span className="max-w-[120px] truncate">{user?.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-2 py-1.5 text-sm text-gray-500 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
                  title={t('common.logout', uiLang)}
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden lg:inline">{t('common.logout', uiLang)}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">
        <div className="flex justify-around py-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-3 py-1.5 text-xs rounded-lg transition-colors ${
                  isActive
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-500 hover:text-gray-700'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {t(item.labelKey, uiLang)}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-1 pb-16 md:pb-0">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
