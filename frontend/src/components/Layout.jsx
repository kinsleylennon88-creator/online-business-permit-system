import React, { useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { 
  Menu, 
  X, 
  Home, 
  FileText, 
  Phone, 
  User, 
  LogOut, 
  Shield, 
  ChevronDown, 
  Building2,
  BookOpen,
  Layers,
  Users
} from 'lucide-react'
import ChatbotWidget from './ChatbotWidget'
import AdminChatAssistant from './chat/AdminChatAssistant'
import NotificationBell from './NotificationBell'

export default function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const { user, logout } = useAuth()
  const location = useLocation()

  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin'
  const isAgencyReviewer = user?.role === 'fire_reviewer' || user?.role === 'sanitation_reviewer'
  const isStaff = isAdmin || isAgencyReviewer
  const isInAdminSection = location.pathname.startsWith('/admin') || location.pathname.startsWith('/agency')
  const showPublicLinks = !isStaff && !isInAdminSection

  const isActive = (href) => {
    if (href === '/') return location.pathname === '/'
    return location.pathname.startsWith(href)
  }

  const getAgencyTitle = () => {
    if (user?.role === 'fire_reviewer') return 'Bureau of Fire Queue'
    if (user?.role === 'sanitation_reviewer') return 'Bureau of Sanitation Queue'
    return 'Agency Review Queue'
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 font-sans">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo & Municipality / Agency Title */}
            <Link 
              to={isAdmin ? '/admin' : isAgencyReviewer ? '/agency/queue' : (user ? '/dashboard' : '/')} 
              className="flex items-center space-x-3 group"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center p-0.5 bg-white border border-slate-200 shadow-sm shrink-0 overflow-hidden group-hover:scale-105 transition-transform">
                <img 
                  src={
                    user?.role === 'fire_reviewer' 
                      ? '/bfp-logo.png' 
                      : user?.role === 'sanitation_reviewer' 
                      ? '/sanitation-logo.png' 
                      : '/janiuay-logo.png'
                  } 
                  alt="Official Seal" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center space-x-1.5">
                  <h1 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight leading-tight truncate">
                    {user?.role === 'fire_reviewer' 
                      ? 'Bureau of Fire Protection' 
                      : user?.role === 'sanitation_reviewer' 
                      ? 'Bureau of Sanitation' 
                      : 'Municipality of Janiuay'}
                  </h1>
                  {isAdmin && (
                    <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[9px] font-black uppercase rounded bg-amber-100 text-amber-800 border border-amber-200">
                      {user?.role === 'superadmin' ? 'Super Admin' : 'Admin'}
                    </span>
                  )}
                  {user?.role === 'fire_reviewer' && (
                    <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[9px] font-black uppercase rounded bg-red-100 text-red-800 border border-red-200">
                      BFP Inspector
                    </span>
                  )}
                  {user?.role === 'sanitation_reviewer' && (
                    <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[9px] font-black uppercase rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Health Office
                    </span>
                  )}
                </div>
                <p className="text-[10.5px] text-slate-500 font-medium truncate">
                  {isAdmin 
                    ? 'Super Admin & BPLO Command Center' 
                    : user?.role === 'fire_reviewer'
                    ? 'BFP Fire Safety Clearance Verification'
                    : user?.role === 'sanitation_reviewer'
                    ? 'Sanitary Clearance & Health Inspection'
                    : 'Business Permit & Licensing Portal'}
                </p>
              </div>
            </Link>

            {/* Desktop Navigation Links (Pill Style) */}
            <nav className="hidden md:flex items-center space-x-1.5">
              {/* Only show public links (Home, About, Contact) when NOT in admin/agency panels and not staff */}
              {showPublicLinks && (
                <>
                  <Link
                    to="/"
                    className={`inline-flex items-center px-4 py-1.5 rounded-xl text-xs font-bold transition ${
                      isActive('/') && location.pathname === '/'
                        ? 'bg-sky-50 text-sky-600 border border-sky-100 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Home className="w-3.5 h-3.5 mr-1.5" />
                    Home
                  </Link>

                  <Link
                    to="/about"
                    className={`inline-flex items-center px-4 py-1.5 rounded-xl text-xs font-bold transition ${
                      isActive('/about')
                        ? 'bg-sky-50 text-sky-600 border border-sky-100 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5 mr-1.5" />
                    About
                  </Link>

                  <Link
                    to="/contact"
                    className={`inline-flex items-center px-4 py-1.5 rounded-xl text-xs font-bold transition ${
                      isActive('/contact')
                        ? 'bg-sky-50 text-sky-600 border border-sky-100 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Phone className="w-3.5 h-3.5 mr-1.5" />
                    Contact
                  </Link>
                </>
              )}

              {user && !isAgencyReviewer && !isAdmin && (
                <Link
                  to="/dashboard"
                  className={`inline-flex items-center px-4 py-1.5 rounded-xl text-xs font-bold transition ${
                    isActive('/dashboard')
                      ? 'bg-sky-50 text-sky-600 border border-sky-100 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 mr-1.5" />
                  Dashboard
                </Link>
              )}

              {isAgencyReviewer && (
                <Link
                  to="/agency/queue"
                  className={`inline-flex items-center px-4 py-1.5 rounded-xl text-xs font-bold transition ${
                    isActive('/agency/queue')
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5 mr-1.5" />
                  {getAgencyTitle()}
                </Link>
              )}

              {isAdmin && (
                <>
                  <Link
                    to="/admin"
                    className={`inline-flex items-center px-4 py-1.5 rounded-xl text-xs font-bold transition ${
                      isActive('/admin') && location.pathname === '/admin'
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'text-slate-700 bg-slate-100 hover:bg-slate-200'
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5 mr-1.5 text-sky-400" />
                    Admin Panel
                  </Link>
                  <Link
                    to="/admin/permits"
                    className={`inline-flex items-center px-4 py-1.5 rounded-xl text-xs font-bold transition ${
                      isActive('/admin/permits')
                        ? 'bg-sky-50 text-sky-600 border border-sky-100 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5 mr-1.5" />
                    Permits
                  </Link>
                  <Link
                    to="/agency/queue"
                    className={`inline-flex items-center px-4 py-1.5 rounded-xl text-xs font-bold transition ${
                      isActive('/agency/queue')
                        ? 'bg-amber-50 text-amber-700 border border-amber-200 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    Agency Queues
                  </Link>
                  <Link
                    to="/admin/document-requirements"
                    className={`inline-flex items-center px-4 py-1.5 rounded-xl text-xs font-bold transition ${
                      isActive('/admin/document-requirements')
                        ? 'bg-sky-50 text-sky-600 border border-sky-100 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5 mr-1.5" />
                    Requirements
                  </Link>
                  <Link
                    to="/admin/audit-logs"
                    className={`inline-flex items-center px-4 py-1.5 rounded-xl text-xs font-bold transition ${
                      isActive('/admin/audit-logs')
                        ? 'bg-sky-50 text-sky-600 border border-sky-100 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5 mr-1.5" />
                    Audit Logs
                  </Link>
                  <Link
                    to="/admin/users"
                    className={`inline-flex items-center px-4 py-1.5 rounded-xl text-xs font-bold transition ${
                      isActive('/admin/users')
                        ? 'bg-sky-50 text-sky-600 border border-sky-100 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5 mr-1.5" />
                    Users
                  </Link>
                </>
              )}
            </nav>

            {/* Auth Buttons / User Profile */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {user ? (
                <>
                  <NotificationBell />
                  <div className="relative">
                    <button
                      onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                      className="flex items-center space-x-2 p-1.5 pr-3 rounded-full hover:bg-slate-100 border border-slate-200 transition focus:outline-none"
                    >
                    <div className="w-7 h-7 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-xs">
                      {user.firstName?.[0] || user.email?.[0]?.toUpperCase()}
                    </div>
                    <span className="hidden sm:inline text-xs font-bold text-slate-800">
                      {user.firstName || user.email?.split('@')[0]}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {profileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl py-2 border border-slate-100 z-50">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                        <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 uppercase">
                          {user.role}
                        </span>
                      </div>

                      {!isAgencyReviewer && !isAdmin && (
                        <Link
                          to="/dashboard"
                          onClick={() => setProfileMenuOpen(false)}
                          className="flex items-center px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          <FileText className="w-3.5 h-3.5 mr-2 text-slate-400" />
                          My Dashboard
                        </Link>
                      )}

                      {isAgencyReviewer && (
                        <Link
                          to="/agency/queue"
                          onClick={() => setProfileMenuOpen(false)}
                          className="flex items-center px-4 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-50"
                        >
                          <Shield className="w-3.5 h-3.5 mr-2 text-amber-500" />
                          Review Queue
                        </Link>
                      )}

                      {isAdmin && (
                        <>
                          <Link
                            to="/admin"
                            onClick={() => setProfileMenuOpen(false)}
                            className="flex items-center px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            <Shield className="w-3.5 h-3.5 mr-2 text-sky-500" />
                            Admin Dashboard
                          </Link>
                          <Link
                            to="/admin/permits"
                            onClick={() => setProfileMenuOpen(false)}
                            className="flex items-center px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            <FileText className="w-3.5 h-3.5 mr-2 text-slate-400" />
                            Manage Permits
                          </Link>
                          <Link
                            to="/agency/queue"
                            onClick={() => setProfileMenuOpen(false)}
                            className="flex items-center px-4 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-50"
                          >
                            <Shield className="w-3.5 h-3.5 mr-2 text-amber-500" />
                            Agency Queues
                          </Link>
                          <Link
                            to="/admin/document-requirements"
                            onClick={() => setProfileMenuOpen(false)}
                            className="flex items-center px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            <Layers className="w-3.5 h-3.5 mr-2 text-slate-400" />
                            Doc Requirements
                          </Link>
                          <Link
                            to="/admin/audit-logs"
                            onClick={() => setProfileMenuOpen(false)}
                            className="flex items-center px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            <Shield className="w-3.5 h-3.5 mr-2 text-slate-400" />
                            Audit Logs
                          </Link>
                          <Link
                            to="/admin/users"
                            onClick={() => setProfileMenuOpen(false)}
                            className="flex items-center px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            <Users className="w-3.5 h-3.5 mr-2 text-slate-400" />
                            User Management
                          </Link>
                        </>
                      )}

                      <Link
                        to="/profile"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <User className="w-3.5 h-3.5 mr-2 text-slate-400" />
                        Profile Settings
                      </Link>

                      <button
                        onClick={() => {
                          logout()
                          setProfileMenuOpen(false)
                        }}
                        className="w-full flex items-center px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                      >
                        <LogOut className="w-3.5 h-3.5 mr-2" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
                </>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link
                    to="/login"
                    className="text-xs font-bold text-slate-600 hover:text-slate-900 px-3 py-1.5"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="inline-flex items-center px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-xs transition"
                  >
                    Register
                  </Link>
                </div>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-1">
            {showPublicLinks && (
              <>
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  <Home className="w-4 h-4 text-slate-400" />
                  <span>Home</span>
                </Link>
                <Link
                  to="/about"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  <BookOpen className="w-4 h-4 text-slate-400" />
                  <span>About</span>
                </Link>
                <Link
                  to="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span>Contact</span>
                </Link>
              </>
            )}

            {user && !isAgencyReviewer && !isAdmin && (
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold text-sky-600 bg-sky-50"
              >
                <FileText className="w-4 h-4 text-sky-600" />
                <span>My Dashboard</span>
              </Link>
            )}

            {isAgencyReviewer && (
              <Link
                to="/agency/queue"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold text-amber-700 bg-amber-50"
              >
                <Shield className="w-4 h-4 text-amber-600" />
                <span>{getAgencyTitle()}</span>
              </Link>
            )}

            {isAdmin && (
              <>
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-900 bg-slate-100"
                >
                  <Shield className="w-4 h-4 text-sky-600" />
                  <span>Admin Panel</span>
                </Link>
                <Link
                  to="/admin/permits"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  <FileText className="w-4 h-4 text-slate-400" />
                  <span>Permits</span>
                </Link>
                <Link
                  to="/agency/queue"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold text-amber-700 hover:bg-amber-50"
                >
                  <Shield className="w-4 h-4 text-amber-500" />
                  <span>Agency Queues</span>
                </Link>
                <Link
                  to="/admin/document-requirements"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  <Layers className="w-4 h-4 text-slate-400" />
                  <span>Document Requirements</span>
                </Link>
                <Link
                  to="/admin/audit-logs"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  <Shield className="w-4 h-4 text-slate-400" />
                  <span>Audit Logs</span>
                </Link>
                <Link
                  to="/admin/users"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  <Users className="w-4 h-4 text-slate-400" />
                  <span>User Management</span>
                </Link>
              </>
            )}
          </div>
        )}
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1 relative bg-slate-50 min-h-[calc(100vh-4rem)]">
        {/* Single Central Background Watermark Seal */}
        <div className="fixed inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-0 select-none">
          <img 
            src={
              user?.role === 'fire_reviewer' 
                ? '/bfp-logo.png' 
                : user?.role === 'sanitation_reviewer' 
                ? '/sanitation-logo.png' 
                : '/janiuay-logo.png'
            } 
            alt="Official Seal Background" 
            className="w-[450px] sm:w-[580px] h-[450px] sm:h-[580px] max-w-[85vw] max-h-[85vh] object-contain opacity-[0.09] pointer-events-none select-none filter contrast-105" 
          />
        </div>
        <div className="relative z-10">
          <Outlet />
        </div>
      </main>

      {/* AI Assistant Chatbot */}
      {isAdmin ? <AdminChatAssistant /> : <ChatbotWidget />}
    </div>
  )
}
