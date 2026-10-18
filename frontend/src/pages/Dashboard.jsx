import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  FileText, 
  Plus, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Eye,
  Calendar,
  ArrowUpRight,
  TrendingUp,
  AlertTriangle,
  Activity,
  CreditCard,
  ShieldCheck,
  ChevronRight,
  Building2,
  Upload,
  Sparkles,
  HelpCircle,
  AlertCircle,
  Bell,
  Flame,
  CheckCheck,
  Check
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { permitService, notificationService } from '../services/api'
import { Card, CardHeader, CardBody } from '../components/shared/Card'
import Button from '../components/shared/Button'
import Badge from '../components/shared/Badge'
import toast from 'react-hot-toast'

const Dashboard = () => {
  const { user } = useAuth()
  const [permits, setPermits] = useState([])
  const [notifications, setNotifications] = useState([])
  const [unreadNotifCount, setUnreadNotifCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('All')
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  })

  const navigate = useNavigate()

  useEffect(() => {
    if (user?.role === 'admin' || user?.role === 'superadmin') {
      navigate('/admin', { replace: true })
      return
    }
    if (user?.role === 'fire_reviewer' || user?.role === 'sanitation_reviewer') {
      navigate('/agency/queue', { replace: true })
      return
    }
    fetchPermits()
    fetchNotifications()

    // Poll updates every 20 seconds so changes from BFP/Sanitation/Admins show in real-time
    const interval = setInterval(() => {
      fetchPermits(false)
      fetchNotifications()
    }, 20000)
    return () => clearInterval(interval)
  }, [user])

  const fetchNotifications = async () => {
    try {
      const res = await notificationService.getNotifications()
      if (res.data?.success) {
        setNotifications(res.data.data.notifications || [])
        setUnreadNotifCount(res.data.data.unreadCount || 0)
      }
    } catch (e) {
      console.warn('Dashboard notifications sync warning:', e.message)
    }
  }

  const markNotificationAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id)
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n))
      setUnreadNotifCount(prev => Math.max(0, prev - 1))
    } catch (e) {
      console.warn('Error marking notification read:', e.message)
    }
  }

  const markAllNotificationsAsRead = async () => {
    try {
      await notificationService.markAllAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      setUnreadNotifCount(0)
      toast.success('All notifications marked as read')
    } catch (e) {
      toast.error('Unable to mark notifications read')
    }
  }

  const fetchPermits = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true)
      const response = await permitService.getPermits({ limit: 50 })
      const permitsData = response.data.data.permits || []
      setPermits(permitsData)
      
      setStats({
        total: permitsData.length,
        pending: permitsData.filter(p => ['submitted', 'under_review', 'under_admin_review', 'pending_fire_review', 'pending_sanitation_review', 'pending_payment', 'payment_under_review'].includes(p.status)).length,
        approved: permitsData.filter(p => p.status === 'approved' || p.status === 'issued').length,
        rejected: permitsData.filter(p => (p.status === 'rejected' || p.status === 'returned_for_correction') && ((p.missingRequirements && p.missingRequirements.length > 0) || p.status === 'returned_for_correction')).length
      })
    } catch (error) {
      toast.error('Unable to sync permit records')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status, missingCount = 0) => {
    if ((status === 'rejected' || status === 'returned_for_correction') && (missingCount > 0 || status === 'returned_for_correction')) {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-red-100 text-red-800 border border-red-200">
          <AlertCircle className="w-3 h-3 mr-1 text-red-600" /> Action Required (Missing Items)
        </span>
      )
    }

    switch (status) {
      case 'draft':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-700">Draft Application</span>
      case 'submitted':
      case 'under_review':
      case 'under_admin_review':
      case 'pending_fire_review':
      case 'pending_sanitation_review':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
            <Clock className="w-3 h-3 mr-1 text-amber-600" /> Under Review
          </span>
        )
      case 'pending_payment':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
            <CreditCard className="w-3 h-3 mr-1 text-amber-700" /> Payment Assessment Issued
          </span>
        )
      case 'payment_under_review':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-sky-100 text-sky-900 border border-sky-300">
            <Clock className="w-3 h-3 mr-1 text-sky-600" /> Receipt Under Treasury Audit
          </span>
        )
      case 'approved':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" /> Approved • Issuing
          </span>
        )
      case 'issued':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-600 text-white shadow-xs">
            <ShieldCheck className="w-3 h-3 mr-1" /> Active Permit Issued (Printable)
          </span>
        )
      default:
        return <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-800 capitalize">{status}</span>
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Not recorded'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Filtered permits based on tab selection
  const filteredPermits = permits.filter(permit => {
    if (activeFilter === 'All') return true
    if (activeFilter === 'In Review') return ['submitted', 'under_review', 'under_admin_review', 'pending_fire_review', 'pending_sanitation_review'].includes(permit.status)
    if (activeFilter === 'Payment Needed') return permit.status === 'pending_payment' || permit.status === 'payment_under_review'
    if (activeFilter === 'Approved / Issued') return permit.status === 'approved' || permit.status === 'issued'
    if (activeFilter === 'Missing Requirements') return (permit.status === 'rejected' || permit.status === 'returned_for_correction') && (permit.missingRequirements?.length > 0 || permit.status === 'returned_for_correction')
    if (activeFilter === 'Drafts') return permit.status === 'draft'
    return true
  })

  // Find any permit with missing requirements or deficiency remarks that is actively deficient
  const deficientPermits = permits.filter(p => (p.status === 'rejected' || p.status === 'returned_for_correction') && ((p.missingRequirements && p.missingRequirements.length > 0) || p.status === 'returned_for_correction'))

  return (
    <div className="min-h-screen bg-transparent pb-20">
      {/* Dashboard Top Header */}
      <div className="bg-white border-b border-slate-200 pt-8 pb-10">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center space-x-2 bg-primary-50 px-3 py-1 rounded-full text-xs font-bold text-primary-700 mb-3 border border-primary-100">
                <Building2 className="w-3.5 h-3.5" />
                <span>Citizen Portal • BPLO Registry</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                Welcome, {user?.firstName || 'Citizen'}
              </h1>
              <p className="text-slate-600 text-sm sm:text-base mt-1">
                Manage your business permit applications, track review status, and respond to evaluator comments.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <Link
                to="/apply-permit"
                className="inline-flex items-center justify-center px-6 py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-bold text-base rounded-xl shadow-md transition-all focus:ring-4 focus:ring-primary-200"
              >
                <Plus className="w-5 h-5 mr-2" />
                Apply for New Business Permit
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mt-8 space-y-8">
        {/* Metric Summary Cards (Clear & Senior-Friendly) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Applied</span>
              <div className="w-9 h-9 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600">
                <FileText className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">{stats.total}</p>
            <p className="text-xs text-slate-500 mt-1">Application portfolios</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Under Review</span>
              <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-amber-900">{stats.pending}</p>
            <p className="text-xs text-slate-500 mt-1">BPLO audit in progress</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Approved / Issued</span>
              <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-900">{stats.approved}</p>
            <p className="text-xs text-slate-500 mt-1">Ready for download</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-red-700 uppercase tracking-wider">Deficiencies</span>
              <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center text-red-600">
                <AlertCircle className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-red-900">{stats.rejected}</p>
            <p className="text-xs text-slate-500 mt-1">Missing requirements</p>
          </div>
        </div>

        {/* LATEST OFFICIAL AGENCY & BPLO REVIEW NOTIFICATIONS (Citizen Live Alert Feed) */}
        {notifications.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-extrabold text-slate-900">
                      Agency Review Decisions & Official Notifications
                    </h3>
                    {unreadNotifCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-black bg-red-100 text-red-700 border border-red-200">
                        {unreadNotifCount} New
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Clearance updates from BPLO Licensing Board, Bureau of Fire Protection (BFP), and Bureau of Sanitation
                  </p>
                </div>
              </div>
              {unreadNotifCount > 0 && (
                <button
                  onClick={markAllNotificationsAsRead}
                  className="self-start sm:self-auto inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Mark all read</span>
                </button>
              )}
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {notifications.slice(0, 6).map((notif) => {
                const text = (notif.title + ' ' + notif.message).toLowerCase()
                const isFire = text.includes('fire') || text.includes('bfp')
                const isSanitary = text.includes('sanit') || text.includes('health')
                const isApprove = notif.type === 'success' || text.includes('approved') || text.includes('issued')
                const isWarning = notif.type === 'warning' || notif.type === 'error' || text.includes('correction')

                return (
                  <div
                    key={notif._id}
                    onClick={() => {
                      if (!notif.isRead) markNotificationAsRead(notif._id)
                      if (notif.link) navigate(notif.link)
                      else if (notif.relatedPermit) navigate(`/permit-status/${notif.relatedPermit}`)
                    }}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                      !notif.isRead
                        ? isApprove 
                          ? 'bg-emerald-50/80 border-emerald-300 shadow-2xs' 
                          : isWarning 
                          ? 'bg-red-50/80 border-red-300 shadow-2xs' 
                          : 'bg-sky-50/80 border-sky-300 shadow-2xs'
                        : 'bg-slate-50 border-slate-200 hover:bg-white hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`inline-flex items-center text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          isFire 
                            ? 'bg-orange-100 text-orange-800 border border-orange-200' 
                            : isSanitary 
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                            : isApprove 
                            ? 'bg-green-100 text-green-800 border border-green-200' 
                            : isWarning 
                            ? 'bg-red-100 text-red-800 border border-red-200' 
                            : 'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}>
                          {isFire ? '🔥 Bureau of Fire' : isSanitary ? '🩺 Sanitation' : isApprove ? '🎉 Official Approval' : isWarning ? '⚠️ Action Required' : '🏛️ BPLO Notice'}
                        </span>
                        <span className="text-[10.5px] text-slate-400 font-medium">
                          {formatDate(notif.createdAt)}
                        </span>
                      </div>
                      <h4 className={`text-xs font-bold leading-tight ${!notif.isRead ? 'text-slate-900 font-black' : 'text-slate-800'}`}>
                        {notif.title}
                      </h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed line-clamp-3">
                        {notif.message}
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                      <span className="text-[11px] font-bold text-sky-700 hover:underline inline-flex items-center">
                        View Status <ChevronRight className="w-3 h-3 ml-0.5" />
                      </span>
                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* PROMINENT MISSING REQUIREMENTS ALERT BOX (Addresses Thesis Feedback #9) */}
        {deficientPermits.length > 0 && (
          <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-6 shadow-sm">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-red-700 flex-shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-lg font-extrabold text-red-950">
                    Action Required: Incomplete or Missing Clearance Documents
                  </h3>
                  <span className="text-xs font-bold text-red-800 bg-red-100 px-3 py-1 rounded-full">
                    {deficientPermits.length} Permit Application(s) Need Attention
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-red-900 mt-1 leading-relaxed">
                  The BPLO evaluator has reviewed your application and flagged missing clearances. Please upload the required documents below to proceed with final approval.
                </p>

                {/* List of deficient applications */}
                <div className="mt-4 space-y-3">
                  {deficientPermits.map((item) => (
                    <div key={item._id} className="bg-white p-4 rounded-xl border border-red-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-bold text-slate-900">{item.businessInfo?.businessName || 'Business Permit'}</span>
                          <span className="text-xs text-slate-500">
                            • Applied: <strong>{formatDate(item.appliedAt || item.createdAt)}</strong>
                          </span>
                        </div>

                        {/* Evaluator Notes */}
                        <div className="mt-1.5 p-2.5 bg-amber-50 rounded-lg border border-amber-200">
                          <p className="text-xs text-amber-950 font-medium">
                            <strong>BPLO Evaluator Remarks:</strong> "{item.adminComments || item.remarks || 'Please submit missing mandatory requirements.'}"
                          </p>
                        </div>

                        {/* Missing Requirements List */}
                        {item.missingRequirements && item.missingRequirements.length > 0 && (
                          <div className="mt-2 flex flex-wrap items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-700">Missing Clearances:</span>
                            {item.missingRequirements.map((req, rIdx) => (
                              <span key={rIdx} className="text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                                ⚠️ {req}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex-shrink-0">
                        <Link
                          to={`/permit-status/${item._id}`}
                          className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                        >
                          <Upload className="w-4 h-4 mr-1.5" />
                          Upload Missing Files
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Application Table & Filter Tabs */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Your Business Permit Portfolios</h3>
                <p className="text-xs text-slate-500">Displaying all submissions with explicit application dates and review stages</p>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
                {['All', 'In Review', 'Payment Needed', 'Approved / Issued', 'Missing Requirements', 'Drafts'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveFilter(tab)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                      activeFilter === tab
                        ? 'bg-primary-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Table Content */}
          {loading ? (
            <div className="p-16 text-center">
              <Clock className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-600">Loading permit applications...</p>
            </div>
          ) : filteredPermits.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400">
                <FileText className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-slate-800">No applications in this category</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {activeFilter === 'All'
                  ? 'You have not submitted any business permits yet. Click below to begin.'
                  : `No applications match the '${activeFilter}' filter.`}
              </p>
              {activeFilter === 'All' && (
                <Link
                  to="/apply-permit"
                  className="mt-5 inline-flex items-center px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl shadow-sm"
                >
                  <Plus className="w-4 h-4 mr-1.5" /> Start New Application
                </Link>
              )}
            </div>
          ) : (
            <div>
              {/* Mobile Card List (Visible on phones & small screens) */}
              <div className="block md:hidden divide-y divide-slate-100">
                {filteredPermits.map((permit) => {
                  const missingCount = permit.missingRequirements?.length || 0
                  const trackingNo = permit.trackingNumber || permit.applicationNumber || 'N/A'
                  const isRenewal = permit.permitType === 'renewal'
                  const fireReview = permit.agencyReviews?.fire || permit.agencyReviews?.bureau_of_fire || {}
                  const sanitationReview = permit.agencyReviews?.sanitation || permit.agencyReviews?.bureau_of_sanitation || {}
                  const fireStatus = fireReview.status || 'pending'
                  const sanitationStatus = sanitationReview.status || 'pending'

                  return (
                    <div key={`m-${permit._id}`} className="p-4 sm:p-5 space-y-3.5 hover:bg-slate-50/70 transition-colors">
                      {/* Top: Business Name & Type Badge */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center space-x-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-700 font-extrabold flex items-center justify-center text-sm shrink-0">
                            {permit.businessInfo?.businessName?.[0] || 'B'}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-sm font-bold text-slate-900 truncate">
                              {permit.businessInfo?.businessName || 'Untitled Application'}
                            </h4>
                            <p className="text-xs text-slate-500 truncate mt-0.5">
                              {permit.businessInfo?.businessNature || 'General Merchandise'} • {permit.businessInfo?.businessAddress?.barangay || 'Poblacion'}
                            </p>
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                          isRenewal ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' : 'bg-sky-100 text-sky-700 border border-sky-200'
                        }`}>
                          {isRenewal ? 'Renewal' : 'New Permit'}
                        </span>
                      </div>

                      {/* Reference Numbers & Dates */}
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-semibold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                            {trackingNo}
                          </span>
                          {permit.businessIdNumber && (
                            <span className="font-mono text-slate-500 text-[11px]">
                              BIN: {permit.businessIdNumber}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center text-[11px] text-slate-500 font-medium">
                          <Calendar className="w-3 h-3 mr-1 text-primary-600" />
                          {formatDate(permit.appliedAt || permit.createdAt)}
                        </div>
                      </div>

                      {/* Status Badges & Clearances */}
                      <div className="space-y-2">
                        <div>{getStatusBadge(permit.status, missingCount)}</div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className={`inline-flex items-center text-[10px] font-black px-2 py-0.5 rounded-md border ${
                            fireStatus === 'approved' 
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                              : fireStatus === 'rejected' 
                              ? 'bg-red-50 text-red-800 border-red-300' 
                              : fireStatus === 'correction_requested' || fireStatus === 'returned'
                              ? 'bg-amber-50 text-amber-800 border-amber-300' 
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}>
                            🔥 BFP Fire: {fireStatus === 'approved' ? 'APPROVED' : fireStatus === 'correction_requested' ? 'Action Needed' : fireStatus.toUpperCase()}
                          </span>
                          <span className={`inline-flex items-center text-[10px] font-black px-2 py-0.5 rounded-md border ${
                            sanitationStatus === 'approved' 
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                              : sanitationStatus === 'rejected' 
                              ? 'bg-red-50 text-red-800 border-red-300' 
                              : sanitationStatus === 'correction_requested' || sanitationStatus === 'returned'
                              ? 'bg-amber-50 text-amber-800 border-amber-300' 
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}>
                            🩺 Sanitation: {sanitationStatus === 'approved' ? 'APPROVED' : sanitationStatus === 'correction_requested' ? 'Action Needed' : sanitationStatus.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      {/* Full-width touch friendly action button */}
                      <div className="pt-1">
                        {permit.status === 'issued' ? (
                          <Link
                            to={`/permit-status/${permit._id}`}
                            className="w-full inline-flex items-center justify-center px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs"
                          >
                            <ShieldCheck className="w-4 h-4 mr-1.5" />
                            View & Print Official Permit
                          </Link>
                        ) : permit.status === 'pending_payment' ? (
                          <Link
                            to={`/permit-status/${permit._id}`}
                            className="w-full inline-flex items-center justify-center px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs"
                          >
                            <CreditCard className="w-4 h-4 mr-1.5" />
                            View Voucher & Pay
                          </Link>
                        ) : permit.status === 'payment_under_review' ? (
                          <Link
                            to={`/permit-status/${permit._id}`}
                            className="w-full inline-flex items-center justify-center px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs"
                          >
                            <Clock className="w-4 h-4 mr-1.5" />
                            Track Treasury Audit
                          </Link>
                        ) : (permit.status === 'rejected' || permit.status === 'returned_for_correction') ? (
                          <Link
                            to={`/permit-status/${permit._id}`}
                            className="w-full inline-flex items-center justify-center px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs"
                          >
                            <AlertCircle className="w-4 h-4 mr-1.5" />
                            Resolve Missing Items
                          </Link>
                        ) : (
                          <Link
                            to={`/permit-status/${permit._id}`}
                            className="w-full inline-flex items-center justify-center px-4 py-2.5 bg-slate-100 hover:bg-primary-50 text-slate-700 hover:text-primary-700 font-bold text-xs rounded-xl transition-all border border-slate-200"
                          >
                            View Dossier & Track Status
                            <ArrowUpRight className="w-3.5 h-3.5 ml-1.5" />
                          </Link>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Desktop Table View (Hidden on small mobile screens) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Business Entity & Category</th>
                      <th className="px-6 py-4">Date Applied</th>
                      <th className="px-6 py-4">Status / Review Stage</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredPermits.map((permit) => {
                      const missingCount = permit.missingRequirements?.length || 0
                      const trackingNo = permit.trackingNumber || permit.applicationNumber || 'N/A'
                      const isRenewal = permit.permitType === 'renewal'
                      const fireReview = permit.agencyReviews?.fire || permit.agencyReviews?.bureau_of_fire || {}
                      const sanitationReview = permit.agencyReviews?.sanitation || permit.agencyReviews?.bureau_of_sanitation || {}
                      const fireStatus = fireReview.status || 'pending'
                      const sanitationStatus = sanitationReview.status || 'pending'

                      return (
                        <tr key={permit._id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-700 font-extrabold flex items-center justify-center text-sm shrink-0">
                                {permit.businessInfo?.businessName?.[0] || 'B'}
                              </div>
                              <div>
                                <div className="flex items-center space-x-2">
                                  <p className="text-sm font-bold text-slate-900">
                                    {permit.businessInfo?.businessName || 'Untitled Application'}
                                  </p>
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    isRenewal ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' : 'bg-sky-100 text-sky-700 border border-sky-200'
                                  }`}>
                                    {isRenewal ? 'Renewal Permit' : 'New Permit'}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-500 mt-0.5">
                                  {permit.businessInfo?.businessNature || 'General Merchandise'} • {permit.businessInfo?.businessAddress?.barangay || 'Poblacion'}
                                </p>
                                <div className="flex items-center space-x-2 mt-1">
                                  <span className="text-[11px] font-mono font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                                    {trackingNo}
                                  </span>
                                  {permit.businessIdNumber && (
                                    <span className="text-[11px] font-mono text-slate-500">
                                      BIN: {permit.businessIdNumber}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Date Applied */}
                          <td className="px-6 py-4">
                            <div className="flex items-center text-xs text-slate-800 font-semibold">
                              <Calendar className="w-3.5 h-3.5 mr-1.5 text-primary-600 shrink-0" />
                              {formatDate(permit.appliedAt || permit.createdAt)}
                            </div>
                            <span className="text-[11px] text-slate-400 block mt-0.5">
                              Updated {formatDate(permit.updatedAt)}
                            </span>
                          </td>

                          {/* Status & Agency Progress */}
                          <td className="px-6 py-4">
                            <div>
                              {getStatusBadge(permit.status, missingCount)}
                              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                                <span className={`inline-flex items-center text-[10px] font-black px-2 py-0.5 rounded-md border ${
                                  fireStatus === 'approved' 
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                                    : fireStatus === 'rejected' 
                                    ? 'bg-red-50 text-red-800 border-red-300' 
                                    : fireStatus === 'correction_requested' || fireStatus === 'returned'
                                    ? 'bg-amber-50 text-amber-800 border-amber-300' 
                                    : 'bg-slate-100 text-slate-700 border-slate-200'
                                }`}>
                                  🔥 BFP Fire: {fireStatus === 'approved' ? 'APPROVED' : fireStatus === 'correction_requested' ? 'Action Needed' : fireStatus.toUpperCase()}
                                </span>
                                <span className={`inline-flex items-center text-[10px] font-black px-2 py-0.5 rounded-md border ${
                                  sanitationStatus === 'approved' 
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                                    : sanitationStatus === 'rejected' 
                                    ? 'bg-red-50 text-red-800 border-red-300' 
                                    : sanitationStatus === 'correction_requested' || sanitationStatus === 'returned'
                                    ? 'bg-amber-50 text-amber-800 border-amber-300' 
                                    : 'bg-slate-100 text-slate-700 border-slate-200'
                                }`}>
                                  🩺 Sanitation: {sanitationStatus === 'approved' ? 'APPROVED' : sanitationStatus === 'correction_requested' ? 'Action Needed' : sanitationStatus.toUpperCase()}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Action */}
                          <td className="px-6 py-4 text-right">
                            {permit.status === 'issued' ? (
                              <Link
                                to={`/permit-status/${permit._id}`}
                                className="inline-flex items-center px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs"
                              >
                                <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                                View & Print Permit
                              </Link>
                            ) : permit.status === 'pending_payment' ? (
                              <Link
                                to={`/permit-status/${permit._id}`}
                                className="inline-flex items-center px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs"
                              >
                                <CreditCard className="w-3.5 h-3.5 mr-1" />
                                View Voucher & Pay
                              </Link>
                            ) : permit.status === 'payment_under_review' ? (
                              <Link
                                to={`/permit-status/${permit._id}`}
                                className="inline-flex items-center px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs"
                              >
                                <Clock className="w-3.5 h-3.5 mr-1" />
                                Track Treasury Audit
                              </Link>
                            ) : (permit.status === 'rejected' || permit.status === 'returned_for_correction') ? (
                              <Link
                                to={`/permit-status/${permit._id}`}
                                className="inline-flex items-center px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs"
                              >
                                <AlertCircle className="w-3.5 h-3.5 mr-1" />
                                Resolve Missing Items
                              </Link>
                            ) : (
                              <Link
                                to={`/permit-status/${permit._id}`}
                                className="inline-flex items-center px-4 py-2 bg-slate-100 hover:bg-primary-50 text-slate-700 hover:text-primary-700 font-bold text-xs rounded-xl transition-all border border-slate-200 hover:border-primary-300"
                              >
                                View Dossier & Track
                                <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                              </Link>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Citizen Quick Support & Hotline Banner */}
        <div className="bg-gradient-to-r from-slate-900 to-primary-950 text-white rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-amber-300 flex-shrink-0">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold">Need Assistance with Requirements or Assessment?</h4>
              <p className="text-xs text-slate-300 mt-0.5">
                Our 24/7 AI Chatbot Assistant is available at the bottom right corner, or call the BPLO hotline at <strong>09811568676</strong>.
              </p>
            </div>
          </div>
          <Link
            to="/contact"
            className="px-5 py-2.5 bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs rounded-xl shadow transition-colors flex-shrink-0"
          >
            Contact BPLO Desk
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

