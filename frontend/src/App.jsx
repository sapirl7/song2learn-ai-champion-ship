import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useUser } from './stores/useUser'

// Pages
import Login from './pages/Login'
import Register from './pages/Register'
import Search from './pages/Search'
import SongView from './pages/SongView'
import Saved from './pages/Saved'
import Vocabulary from './pages/Vocabulary'
import Exercises from './pages/Exercises'

// Components
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'

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
          <Route path="/song/:id" element={<SongView />} />
          <Route path="/saved" element={<Saved />} />
          <Route path="/vocabulary" element={<Vocabulary />} />
          <Route path="/exercises" element={<Exercises />} />
        </Route>
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
