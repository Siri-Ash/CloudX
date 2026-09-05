import { Navigate, useLocation } from 'react-router-dom'
import { useSession } from '../../context/SessionContext'
import Spinner from '../ui/Spinner'

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useSession()
  const location = useLocation()

  // We're still validating a stored token against GET /users/me — don't
  // redirect yet, or a valid session gets bounced to /login on every refresh.
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <Spinner label="Loading your session..." />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children
}
