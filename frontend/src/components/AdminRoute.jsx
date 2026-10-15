import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import LoadingSpinner from './LoadingSpinner'

const AdminRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
    if (user?.role === 'fire_reviewer' || user?.role === 'sanitation_reviewer') {
      return <Navigate to="/agency/queue" replace />
    }
    return <Navigate to="/dashboard" replace />
  }

  return children ? children : <Outlet />
}

export default AdminRoute

