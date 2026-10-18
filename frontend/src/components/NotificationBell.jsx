import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Flame, 
  ShieldCheck, 
  ShieldAlert, 
  CreditCard, 
  FileText, 
  AlertTriangle,
  ExternalLink,
  Sparkles,
  Info
} from 'lucide-react'
import { notificationService } from '../services/api'
import { useAuth } from '../contexts/AuthContext'

export default function NotificationBell() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef(null)

  const fetchNotifications = async () => {
    if (!user) return
    try {
      const res = await notificationService.getNotifications()
      if (res.data?.success) {
        setNotifications(res.data.data.notifications || [])
        setUnreadCount(res.data.data.unreadCount || 0)
      }
    } catch (err) {
      console.warn('Failed to fetch notifications:', err.message)
    }
  }

  useEffect(() => {
    fetchNotifications()
    // Poll for new notifications every 20 seconds
    const interval = setInterval(fetchNotifications, 20000)
    return () => clearInterval(interval)
  }, [user])

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch (err) {
      console.warn('Error marking all notifications as read:', err.message)
    }
  }

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      try {
        await notificationService.markAsRead(notif._id)
        setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, isRead: true } : n))
        setUnreadCount(prev => Math.max(0, prev - 1))
      } catch (err) {
        console.warn('Error marking notification as read:', err.message)
      }
    }
    setIsOpen(false)

    const isAgency = user?.role === 'fire_reviewer' || user?.role === 'sanitation_reviewer'
    const isAdmin = user?.role === 'admin' || user?.role === 'superadmin'

    if (isAgency) {
      const permitId = notif.relatedPermit || (notif.link?.includes('/agency/review/') ? notif.link.split('/').pop() : null)
      if (permitId) {
        navigate(`/agency/queue?permitId=${permitId}`)
      } else {
        navigate('/agency/queue')
      }
    } else if (isAdmin) {
      if (notif.relatedPermit) {
        navigate(`/permit-status/${notif.relatedPermit}`)
      } else if (notif.link) {
        navigate(notif.link)
      } else {
        navigate('/admin/permits')
      }
    } else {
      if (notif.relatedPermit) {
        navigate(`/permit-status/${notif.relatedPermit}`)
      } else if (notif.link) {
        navigate(notif.link)
      } else {
        navigate('/dashboard')
      }
    }
  }

  const getNotificationIcon = (notif) => {
    const titleLower = (notif.title || '').toLowerCase()
    const msgLower = (notif.message || '').toLowerCase()

    if (titleLower.includes('fire') || msgLower.includes('fire') || msgLower.includes('bfp')) {
      return (
        <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
          <Flame className="w-4 h-4" />
        </div>
      )
    }
    if (titleLower.includes('sanitation') || msgLower.includes('sanitary') || msgLower.includes('sanitation')) {
      return (
        <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-4 h-4" />
        </div>
      )
    }
    if (titleLower.includes('payment') || titleLower.includes('order of payment') || msgLower.includes('treasury')) {
      return (
        <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
          <CreditCard className="w-4 h-4" />
        </div>
      )
    }
    if (notif.type === 'success' || titleLower.includes('approved') || titleLower.includes('issued')) {
      return (
        <div className="w-8 h-8 rounded-xl bg-green-100 text-green-600 flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4" />
        </div>
      )
    }
    if (notif.type === 'warning' || notif.type === 'error' || titleLower.includes('correction') || titleLower.includes('reject')) {
      return (
        <div className="w-8 h-8 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-4 h-4" />
        </div>
      )
    }
    return (
      <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
        <Info className="w-4 h-4" />
      </div>
    )
  }

  const formatTime = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    const now = new Date()
    const diffMs = now - d
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays === 1) return 'Yesterday'
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  if (!user) return null

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen)
          if (!isOpen) fetchNotifications()
        }}
        aria-label="View notifications"
        className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-all focus:outline-none focus:ring-2 focus:ring-sky-500"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center px-1.5 py-0.5 min-w-[18px] h-[18px] text-[10px] font-black leading-none text-white bg-red-500 rounded-full shadow-sm animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-2xs z-40 sm:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="fixed sm:absolute inset-x-3 sm:inset-x-auto top-16 sm:top-full sm:right-0 sm:mt-2 w-auto sm:w-96 max-w-[calc(100vw-1.5rem)] sm:max-w-none bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-extrabold text-slate-900">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-100 text-red-700 border border-red-200">
                  {unreadCount} unread
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center space-x-1"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="py-10 px-4 text-center">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2">
                  <Bell className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-slate-700">No notifications yet</p>
                <p className="text-xs text-slate-400 mt-1">
                  Updates on your permit review from BPLO, Fire, and Sanitation will appear here.
                </p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif._id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-3.5 flex items-start space-x-3 cursor-pointer transition-colors ${
                    !notif.isRead 
                      ? 'bg-sky-50/60 hover:bg-sky-50' 
                      : 'hover:bg-slate-50'
                  }`}
                >
                  {getNotificationIcon(notif)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className={`text-xs truncate ${!notif.isRead ? 'font-black text-slate-900' : 'font-bold text-slate-800'}`}>
                        {notif.title}
                      </p>
                      <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                        {formatTime(notif.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>
                  </div>
                  {!notif.isRead && (
                    <span className="w-2 h-2 rounded-full bg-sky-500 shrink-0 mt-1.5" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-[11px] text-slate-500">Municipality of Janiuay BPLO</span>
            <Link
              to={
                user?.role === 'fire_reviewer' || user?.role === 'sanitation_reviewer'
                  ? '/agency/queue'
                  : user?.role === 'admin' || user?.role === 'superadmin'
                  ? '/admin'
                  : '/dashboard'
              }
              onClick={() => setIsOpen(false)}
              className="font-bold text-sky-600 hover:text-sky-700 flex items-center space-x-1"
            >
              <span>
                {user?.role === 'fire_reviewer' || user?.role === 'sanitation_reviewer'
                  ? 'Review Queue'
                  : user?.role === 'admin' || user?.role === 'superadmin'
                  ? 'Admin Center'
                  : 'Dashboard View'}
              </span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
