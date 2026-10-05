import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Search, 
  Filter, 
  Eye, 
  CheckCircle2, 
  XCircle, 
  FileText,
  ArrowLeft,
  Download,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  MoreVertical,
  Activity,
  Calendar,
  AlertTriangle,
  Send,
  ListOrdered
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { adminService, permitService } from '../../services/api'
import { Card, CardHeader, CardBody } from '../../components/shared/Card'
import Button from '../../components/shared/Button'
import Badge from '../../components/shared/Badge'
import Input from '../../components/shared/Input'
import toast from 'react-hot-toast'

// Standard clearances in Alphabetical Order (A to Z)
const standardChecklist = [
  'Barangay Business Clearance',
  'Business Name Registration Certificate',
  'Community Tax Certificate (Cedula)',
  'Contract of Lease / Proof of Property Ownership',
  'Fire Safety Inspection Certificate (FSIC)',
  'Municipal Sanitary & Health Permit',
  'Occupancy Permit / Building Clearance',
  'Police Clearance Certificate',
  'Zoning and Locational Clearance'
]

const AdminPermits = () => {
  const [permits, setPermits] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 })
  const [selectedPermit, setSelectedPermit] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [adminNotes, setAdminNotes] = useState('')
  const [selectedMissingItems, setSelectedMissingItems] = useState([])

  useEffect(() => {
    fetchPermits()
  }, [searchTerm, statusFilter, pagination.current])

  const fetchPermits = async () => {
    try {
      setLoading(true)
      const params = { page: pagination.current, limit: 20, search: searchTerm, status: statusFilter }
      const response = await adminService.getPermits(params)
      setPermits(response.data.data.permits || [])
      setPagination(response.data.data.pagination || { current: 1, pages: 1, total: 0 })
    } catch (error) {
      toast.error('Registry sync failed')
    } finally {
      setLoading(false)
    }
  }

  const openAuditModal = (permit) => {
    setSelectedPermit(permit)
    setAdminNotes(permit.adminComments || permit.remarks || '')
    setSelectedMissingItems(permit.missingRequirements || [])
    setShowModal(true)
  }

  const toggleMissingItem = (item) => {
    setSelectedMissingItems(prev => 
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    )
  }

  const handleApprove = async (permitId) => {
    try {
      await permitService.approvePermit(permitId, { remarks: adminNotes || 'Application meets all LGU standards.' })
      toast.success('Permit approved and queued for issuance!')
      fetchPermits()
      setShowModal(false)
    } catch (error) { 
      toast.error('Approval sync failed') 
    }
  }

  const handleFlagDeficiencies = async (permitId) => {
    if (selectedMissingItems.length === 0 && !adminNotes.trim()) {
      return toast.error('Please select at least one missing clearance or enter notes.')
    }
    try {
      await permitService.rejectPermit(permitId, {
        reason: adminNotes.trim() || 'Missing documentary requirements. See itemized list.',
        missingRequirements: selectedMissingItems,
        adminComments: adminNotes.trim()
      })
      toast.success('Deficiency notice and missing requirements sent to applicant!')
      fetchPermits()
      setShowModal(false)
    } catch (error) { 
      toast.error('Deficiency update failed') 
    }
  }

  const getStatusBadge = (status, missingCount = 0) => {
    if (missingCount > 0 || status === 'rejected') {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-red-100 text-red-800 border border-red-200">
          <AlertTriangle className="w-3 h-3 mr-1 text-red-600" /> Deficient / Missing ({missingCount})
        </span>
      )
    }

    switch (status) {
      case 'submitted':
      case 'under_review':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">Review Required</span>
      case 'approved':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">Approved</span>
      case 'issued':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-600 text-white">Active Permit</span>
      default:
        return <Badge variant="neutral">{status}</Badge>
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 pt-8 pb-10">
        <div className="container">
          <Link to="/admin" className="inline-flex items-center text-slate-500 hover:text-slate-900 transition-colors font-bold text-xs mb-4">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Command Center
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <span className="text-xs font-bold text-primary-700 uppercase tracking-widest bg-primary-50 px-2.5 py-1 rounded-md border border-primary-100">
                BPLO Regulatory Oversight
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
                Business Permit Review Registry
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                Audit citizen permit submissions, verify clearances, and itemize missing requirements.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
                {pagination.total} Total Records
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-amber-100 text-amber-900 text-xs font-bold border border-amber-200">
                {permits.filter(p => p.status === 'submitted' || p.status === 'under_review').length} Pending
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mt-8">
        {/* Search & Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input 
              placeholder="Search by business tradename, applicant name, or Case ID..." 
              icon={<Search className="w-4 h-4" />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full md:w-64">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border-2 border-slate-200 py-2.5 px-4 focus:ring-4 focus:ring-primary-50 focus:border-primary-500 outline-none transition-all text-sm font-semibold bg-white cursor-pointer"
            >
              <option value="">Status: All Records</option>
              <option value="submitted">In Review / Submitted</option>
              <option value="approved">Approved</option>
              <option value="rejected">Deficient / Rejected</option>
              <option value="issued">Issued Active</option>
            </select>
          </div>
        </div>

        {/* Registry Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {loading && permits.length === 0 ? (
            <div className="p-20 flex flex-col items-center justify-center">
              <Activity className="w-8 h-8 animate-spin text-primary-600 mb-2" />
              <p className="text-sm font-bold text-slate-600">Loading permit applications...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Business Entity & Structure</th>
                    <th className="px-6 py-4">Applicant Owner</th>
                    <th className="px-6 py-4">Date Applied</th>
                    <th className="px-6 py-4">Jurisdiction</th>
                    <th className="px-6 py-4">Status & Missing Items</th>
                    <th className="px-6 py-4 text-right">Audit Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {permits.map((permit) => {
                    const missingCount = permit.missingRequirements?.length || 0
                    return (
                      <tr key={permit._id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-900 text-sm">
                            {permit.businessInfo?.businessName || 'N/A'}
                          </p>
                          <p className="text-xs text-slate-500 capitalize">
                            {permit.businessInfo?.businessType?.replace('_', ' ')} • {permit.businessInfo?.businessNature}
                          </p>
                        </td>

                        <td className="px-6 py-4 text-xs text-slate-700">
                          <p className="font-bold">{permit.applicant?.firstName} {permit.applicant?.lastName}</p>
                          <p className="text-slate-400 text-[11px]">{permit.applicant?.email}</p>
                        </td>

                        {/* Date Applied (Panelist Request) */}
                        <td className="px-6 py-4">
                          <div className="flex items-center text-xs font-semibold text-slate-800">
                            <Calendar className="w-3.5 h-3.5 mr-1.5 text-primary-600 flex-shrink-0" />
                            {formatDate(permit.appliedAt || permit.createdAt)}
                          </div>
                        </td>

                        <td className="px-6 py-4 text-xs font-medium text-slate-600">
                          {permit.businessInfo?.businessAddress?.barangay || 'Poblacion'}
                        </td>

                        <td className="px-6 py-4">
                          {getStatusBadge(permit.status, missingCount)}
                        </td>

                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Link 
                              to={`/permit-status/${permit._id}`}
                              className="p-2 rounded-lg text-slate-500 hover:text-primary-600 hover:bg-slate-100 transition-colors"
                              title="View Full Dossier"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>

                            <button
                              onClick={() => openAuditModal(permit)}
                              className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all flex items-center"
                            >
                              <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                              Audit Application
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Page {pagination.current} of {pagination.pages}
            </p>
            <div className="flex items-center space-x-2">
              <Button 
                variant="secondary" 
                size="sm" 
                disabled={pagination.current === 1}
                onClick={() => setPagination(p => ({ ...p, current: p.current - 1 }))}
                iconOnly={<ChevronLeft className="w-4 h-4" />}
              />
              <Button 
                variant="secondary" 
                size="sm" 
                disabled={pagination.current === pagination.pages}
                onClick={() => setPagination(p => ({ ...p, current: p.current + 1 }))}
                iconOnly={<ChevronRight className="w-4 h-4" />}
              />
            </div>
          </div>
        )}

        {/* INTERACTIVE AUDIT MODAL (Missing Requirements Checklist + Admin Comments) */}
        <AnimatePresence>
          {showModal && selectedPermit && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
                onClick={() => setShowModal(false)}
              />
              
              <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col"
              >
                {/* Modal Header */}
                <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-primary-100 rounded-2xl text-primary-700">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">
                        BPLO Application Audit & Compliance Review
                      </h2>
                      <p className="text-xs text-slate-500">
                        Business: <strong>{selectedPermit.businessInfo?.businessName}</strong> • Date Applied: {formatDate(selectedPermit.appliedAt || selectedPermit.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Modal Body (Scrollable Checklist) */}
                <div className="p-6 overflow-y-auto space-y-6">
                  {/* Checklist of 9 standard requirements (A to Z) */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Select Missing / Deficient Clearances (A–Z Checklist)
                      </label>
                      <span className="text-[11px] text-red-600 font-semibold">
                        {selectedMissingItems.length} selected as missing
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                      {standardChecklist.map((item, idx) => {
                        const isMissing = selectedMissingItems.includes(item)
                        return (
                          <label 
                            key={idx}
                            className={`flex items-start space-x-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                              isMissing 
                                ? 'bg-red-50 border-red-300 text-red-900 font-bold' 
                                : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isMissing}
                              onChange={() => toggleMissingItem(item)}
                              className="mt-0.5 rounded text-red-600 focus:ring-red-500 w-4 h-4 cursor-pointer"
                            />
                            <span className="leading-tight">{item}</span>
                          </label>
                        )
                      })}
                    </div>
                  </div>

                  {/* Admin Comments / Deficiency Remarks */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Evaluator Audit Notes & Instructions for Applicant
                    </label>
                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="e.g., The submitted Barangay Clearance is expired. Please upload a 2026 renewed copy and Fire Safety inspection..."
                      className="w-full rounded-xl border-2 border-slate-200 p-3.5 text-xs sm:text-sm focus:ring-4 focus:ring-primary-50 focus:border-primary-600 outline-none transition-all min-h-[100px]"
                    />
                  </div>
                </div>

                {/* Modal Footer Actions */}
                <div className="p-6 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <button 
                    onClick={() => setShowModal(false)}
                    className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 uppercase tracking-wider transition-colors"
                  >
                    Cancel
                  </button>

                  <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                    <Button 
                      variant="danger" 
                      onClick={() => handleFlagDeficiencies(selectedPermit._id)}
                      leftIcon={<AlertTriangle className="w-4 h-4" />}
                      className="w-full sm:w-auto text-xs"
                    >
                      Send Deficiency Notice ({selectedMissingItems.length} items)
                    </Button>

                    <Button 
                      variant="primary" 
                      className="bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto text-xs font-bold border-none"
                      onClick={() => handleApprove(selectedPermit._id)}
                      leftIcon={<CheckCircle2 className="w-4 h-4" />}
                    >
                      Approve Application
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default AdminPermits

