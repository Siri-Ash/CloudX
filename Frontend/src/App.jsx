import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import BucketView from './pages/BucketView'
import SharedBucket from './pages/SharedBucket'
import ProtectedRoute from './components/layout/ProtectedRoute'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/buckets/:bucketId"
        element={
          <ProtectedRoute>
            <BucketView />
          </ProtectedRoute>
        }
      />

      {/* Public share link - no login required */}
      <Route
        path="/share/:token"
        element={<SharedBucket />}
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}