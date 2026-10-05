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
  BookOpen
} from 'lucide-react'
import ChatbotWidget from './ChatbotWidget'
import AdminChatAssistant from './chat/AdminChatAssistant'

export default function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const { user, logout } = useAuth()
  const location = useLocation()

  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin'
  const isAgencyReviewer = user?.role === 'fire_reviewer' || user?.role === 'sanitation_reviewer'

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
            
            {/* Logo & Municipality Title */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-sky-600 rounded-xl flex items-center justify-center text-white shadow-sm">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight leading-tight">
                  Municipality of Janiuay
                </h1>
                <p className="text-[11px] text-slate-500 font-medium">
                  Business Permit System
                </p>
              </div>
            </Link>

            {/* Desktop Navigation Links (Pill Style) */}
            <nav className="hidden md:flex items-center space-x-1.5">
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
                    to="/admin"
                    className={`inline-flex items-center px-4 py-1.5 rounded-xl text-xs font-bold transition ${
                      isActive('/admin')
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-700 bg-slate-100 hover:bg-slate-200'
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5 mr-1.5 text-sky-400" />
                    Admin Panel
                  </Link>
                </>
              )}
            </nav>

            {/* Auth Buttons / User Profile */}
            <div className="flex items-center space-x-3">
              {user ? (
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

                      {!isAgencyReviewer && (
                        <Link
                          to="/dashboard"
                          onClick={() => setProfileMenuOpen(false)}
                          className="flex items-center px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          <FileText className="w-3.5 h-3.5 mr-2 text-slate-400" />
                          My Dashboard
                        </Link>
                      )}

                      {(isAgencyReviewer || isAdmin) && (
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
                            to="/admin/audit-logs"
                            onClick={() => setProfileMenuOpen(false)}
                            className="flex items-center px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            <Shield className="w-3.5 h-3.5 mr-2 text-slate-400" />
                            Audit Logs
                          </Link>
                          <Link
                            to="/admin/document-requirements"
                            onClick={() => setProfileMenuOpen(false)}
                            className="flex items-center px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            <FileText className="w-3.5 h-3.5 mr-2 text-slate-400" />
                            Doc Requirements
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
                  to="/admin/audit-logs"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  <FileText className="w-4 h-4 text-slate-400" />
                  <span>Audit Logs</span>
                </Link>
              </>
            )}
          </div>
        )}
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* AI Assistant Chatbot */}
      {isAdmin ? <AdminChatAssistant /> : <ChatbotWidget />}
    </div>
  )
}
