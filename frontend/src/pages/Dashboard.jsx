import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
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
  AlertCircle
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { permitService } from '../services/api'
import { Card, CardHeader, CardBody } from '../components/shared/Card'
import Button from '../components/shared/Button'
import Badge from '../components/shared/Badge'
import toast from 'react-hot-toast'

const Dashboard = () => {
  const { user } = useAuth()
  const [permits, setPermits] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('All')
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  })

  useEffect(() => {
    fetchPermits()
  }, [])

  const fetchPermits = async () => {
    try {
      setLoading(true)
      const response = await permitService.getPermits({ limit: 50 })
      const permitsData = response.data.data.permits || []
      setPermits(permitsData)
      
      setStats({
        total: permitsData.length,
        pending: permitsData.filter(p => p.status === 'submitted' || p.status === 'under_review').length,
        approved: permitsData.filter(p => p.status === 'approved' || p.status === 'issued').length,
        rejected: permitsData.filter(p => p.status === 'rejected' || (p.missingRequirements && p.missingRequirements.length > 0)).length
      })
    } catch (error) {
      toast.error('Unable to sync permit records')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status, missingCount = 0) => {
    if (missingCount > 0 || status === 'rejected') {
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
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
            <Clock className="w-3 h-3 mr-1 text-amber-600" /> Under BPLO Review
          </span>
        )
      case 'approved':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" /> Approved
          </span>
        )
      case 'issued':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-600 text-white shadow-sm">
            <ShieldCheck className="w-3 h-3 mr-1" /> Active Permit Issued
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
    if (activeFilter === 'In Review') return permit.status === 'submitted' || permit.status === 'under_review'
    if (activeFilter === 'Approved') return permit.status === 'approved' || permit.status === 'issued'
    if (activeFilter === 'Missing Requirements') return permit.status === 'rejected' || (permit.missingRequirements && permit.missingRequirements.length > 0)
    if (activeFilter === 'Drafts') return permit.status === 'draft'
    return true
  })

  // Find any permit with missing requirements or deficiency remarks
  const deficientPermits = permits.filter(p => p.status === 'rejected' || (p.missingRequirements && p.missingRequirements.length > 0))

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
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
                {['All', 'In Review', 'Approved', 'Missing Requirements', 'Drafts'].map((tab) => (
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
            <div className="overflow-x-auto">
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
                    const fireStatus = permit.agencyReviews?.bureau_of_fire?.status
                    const sanitationStatus = permit.agencyReviews?.bureau_of_sanitation?.status

                    return (
                      <tr key={permit._id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-700 font-extrabold flex items-center justify-center text-sm flex-shrink-0">
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
                            <Calendar className="w-3.5 h-3.5 mr-1.5 text-primary-600 flex-shrink-0" />
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
                            <div className="flex items-center space-x-2 mt-2">
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                fireStatus === 'approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                fireStatus === 'rejected' ? 'bg-red-50 text-red-700 border border-red-200' :
                                fireStatus === 'returned' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                'bg-slate-100 text-slate-600 border border-slate-200'
                              }`}>
                                Fire: {fireStatus || 'pending'}
                              </span>
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                sanitationStatus === 'approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                sanitationStatus === 'rejected' ? 'bg-red-50 text-red-700 border border-red-200' :
                                sanitationStatus === 'returned' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                'bg-slate-100 text-slate-600 border border-slate-200'
                              }`}>
                                Sanitation: {sanitationStatus || 'pending'}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Action */}
                        <td className="px-6 py-4 text-right">
                          <Link
                            to={`/permit-status/${permit._id}`}
                            className="inline-flex items-center px-4 py-2 bg-slate-100 hover:bg-primary-50 text-slate-700 hover:text-primary-700 font-bold text-xs rounded-xl transition-all border border-slate-200 hover:border-primary-300"
                          >
                            View Dossier & Track
                            <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
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

