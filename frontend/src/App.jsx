import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import LoadingSpinner from './components/LoadingSpinner'

// Public pages
import Home from './pages/Home'
import About from './pages/About'
import Contact from './pages/Contact'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'

// User pages
import Dashboard from './pages/Dashboard'
import PermitApplication from './pages/PermitApplication'
import PermitStatus from './pages/PermitStatus'
import Profile from './pages/Profile'

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminPermits from './pages/admin/AdminPermits'
import AdminUsers from './pages/admin/AdminUsers'
import AdminChatLogs from './pages/admin/AdminChatLogs'
import AdminSettings from './pages/admin/AdminSettings'
import AdminAuditLogs from './pages/admin/AdminAuditLogs'
import AdminDocumentRequirements from './pages/admin/AdminDocumentRequirements'

// Agency pages
import AgencyReviewQueue from './pages/agency/AgencyReviewQueue'

// Components
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import AgencyRoute from './components/AgencyRoute'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading application...</p>
        </div>
      </div>
    )
  }

  const getDashboardRedirect = () => {
    if (!user) return <Login />
    if (user.role === 'fire_reviewer' || user.role === 'sanitation_reviewer') {
      return <Navigate to="/agency/queue" replace />
    }
    if (user.role === 'admin' || user.role === 'superadmin') {
      return <Navigate to="/admin" replace />
    }
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="App">
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="login" element={getDashboardRedirect()} />
          <Route path="register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          
          {/* Protected user routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="apply-permit" element={<PermitApplication />} />
            <Route path="permit-status/:id" element={<PermitStatus />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* Protected agency reviewer routes */}
          <Route element={<AgencyRoute />}>
            <Route path="agency/queue" element={<AgencyReviewQueue />} />
          </Route>
          
          {/* Protected admin routes */}
          <Route element={<AdminRoute />}>
            <Route path="admin" element={<AdminDashboard />} />
            <Route path="admin/permits" element={<AdminPermits />} />
            <Route path="admin/users" element={<AdminUsers />} />
            <Route path="admin/chat-logs" element={<AdminChatLogs />} />
            <Route path="admin/settings" element={<AdminSettings />} />
            <Route path="admin/audit-logs" element={<AdminAuditLogs />} />
            <Route path="admin/document-requirements" element={<AdminDocumentRequirements />} />
          </Route>
          
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </div>
  )
}

export default App
