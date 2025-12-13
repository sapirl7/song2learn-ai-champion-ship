import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, Suspense, lazy } from 'react'
import { useUser } from './stores/useUser'

// Pages (lightweight - load immediately)
import Login from './pages/Login'
import Register from './pages/Register'
import Search from './pages/Search'
import Saved from './pages/Saved'

// Pages (heavy - lazy load)
const SongView = lazy(() => import('./pages/SongView'))
const Vocabulary = lazy(() => import('./pages/Vocabulary'))
const Exercises = lazy(() => import('./pages/Exercises'))

// Components
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'

// Loading fallback for lazy components
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="spinner w-8 h-8"></div>
  </div>
)

function App() {
  const { fetchUser, isLoading } = useUser()

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner w-8 h-8"></div>
      </div>
    )
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/search" replace />} />
          <Route path="/search" element={<Search />} />
          <Route path="/song/:id" element={<Suspense fallback={<PageLoader />}><SongView /></Suspense>} />
          <Route path="/saved" element={<Saved />} />
          <Route path="/vocabulary" element={<Suspense fallback={<PageLoader />}><Vocabulary /></Suspense>} />
          <Route path="/exercises" element={<Suspense fallback={<PageLoader />}><Exercises /></Suspense>} />
        </Route>
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
