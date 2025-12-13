import { Navigate, Outlet } from 'react-router-dom'
import { useUser } from '../stores/useUser'

function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useUser()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner w-8 h-8"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export default ProtectedRoute
