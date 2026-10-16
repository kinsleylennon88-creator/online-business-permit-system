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
  ListOrdered,
  DollarSign,
  Receipt,
  Printer,
  Award,
  Sparkles,
  ExternalLink,
  Clock,
  Check,
  X
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { adminService, permitService } from '../../services/api'
import { Card, CardHeader, CardBody } from '../../components/shared/Card'
import Button from '../../components/shared/Button'
import Badge from '../../components/shared/Badge'
import Input from '../../components/shared/Input'
import toast from 'react-hot-toast'
import { getFileViewUrl, handleViewFile } from '../../utils/fileUrl'
import OrderOfPaymentModal from '../../components/permit/OrderOfPaymentModal'
import BusinessPermitCertificate from '../../components/permit/BusinessPermitCertificate'
import TreasurerSeal from '../../components/shared/TreasurerSeal'

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
  
  // Audit Modal State
  const [selectedPermit, setSelectedPermit] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [adminNotes, setAdminNotes] = useState('')
  const [selectedMissingItems, setSelectedMissingItems] = useState([])

  // BPLO Assessment Modal State
  const [showAssessmentModal, setShowAssessmentModal] = useState(false)
  const [assessmentPermit, setAssessmentPermit] = useState(null)
  const [assessmentFees, setAssessmentFees] = useState({
    businessTax: 1200,
    mayorsPermit: 800,
    sanitaryFee: 250,
    fireSafetyFee: 450,
    environmentalFee: 200,
    garbageFee: 300,
    plateStickerFee: 250
  })
  const [assessmentRemarks, setAssessmentRemarks] = useState('')
  const [isSubmittingAssessment, setIsSubmittingAssessment] = useState(false)

  // Treasury Payment Verification Modal State
  const [showVerificationModal, setShowVerificationModal] = useState(false)
  const [verificationPermit, setVerificationPermit] = useState(null)
  const [verifyOrNumber, setVerifyOrNumber] = useState('')
  const [verifyNotes, setVerifyNotes] = useState('')
  const [isSubmittingVerification, setIsSubmittingVerification] = useState(false)

  // Certificate and Order of Payment Modals State
  const [showCertificateModal, setShowCertificateModal] = useState(false)
  const [certificatePermit, setCertificatePermit] = useState(null)
  const [showOrderPaymentModal, setShowOrderPaymentModal] = useState(false)
  const [orderPaymentPermit, setOrderPaymentPermit] = useState(null)
  const [isIssuingPermit, setIsIssuingPermit] = useState(false)

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
      console.error('Fetch permits error:', error)
      toast.error(error.response?.data?.message || 'Registry sync failed')
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
      toast.success('Application approved and authorized for permit issuance!')
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

  const handleGrantAndClearDeficiencies = async (permitId) => {
    try {
      await permitService.approvePermit(permitId, { remarks: 'Corrections verified and accepted. Clearances granted.' })
      toast.success('Corrections granted! Deficiency notice has been deleted from client dashboard.')
      fetchPermits()
      setShowModal(false)
    } catch (error) {
      toast.error('Failed to grant corrections')
    }
  }

  // --- Payment Assessment Handlers ---
  const openAssessmentModal = (permit) => {
    setAssessmentPermit(permit)
    const existing = permit.assessment?.fees || {}
    const cap = permit.businessInfo?.capitalization || 100000
    const calculatedTax = existing.businessTax !== undefined 
      ? existing.businessTax 
      : Math.min(Math.max(Math.round(cap * 0.002), 500), 5000)

    setAssessmentFees({
      businessTax: calculatedTax,
      mayorsPermit: existing.mayorsPermit !== undefined ? existing.mayorsPermit : 800,
      sanitaryFee: existing.sanitaryFee !== undefined ? existing.sanitaryFee : 250,
      fireSafetyFee: existing.fireSafetyFee !== undefined ? existing.fireSafetyFee : 450,
      environmentalFee: existing.environmentalFee !== undefined ? existing.environmentalFee : 200,
      garbageFee: existing.garbageFee !== undefined ? existing.garbageFee : 300,
      plateStickerFee: existing.plateStickerFee !== undefined ? existing.plateStickerFee : 250
    })
    setAssessmentRemarks('')
    setShowAssessmentModal(true)
  }

  const totalAssessmentFee = Object.values(assessmentFees).reduce((sum, val) => sum + (Number(val) || 0), 0)

  const handleSendAssessment = async (e) => {
    e.preventDefault()
    if (!assessmentPermit) return
    try {
      setIsSubmittingAssessment(true)
      await permitService.sendAssessment(assessmentPermit._id, {
        fees: assessmentFees,
        remarks: assessmentRemarks
      })
      toast.success('Payment assessment and Order of Payment forwarded to applicant!')
      setShowAssessmentModal(false)
      if (showModal) setShowModal(false)
      fetchPermits()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to forward payment assessment')
    } finally {
      setIsSubmittingAssessment(false)
    }
  }

  // --- Treasury Payment Verification Handlers ---
  const openVerificationModal = (permit) => {
    setVerificationPermit(permit)
    setVerifyOrNumber(permit.paymentInfo?.orNumber || '')
    setVerifyNotes(permit.paymentInfo?.verificationNotes || '')
    setShowVerificationModal(true)
  }

  const handleVerifyPayment = async (verified) => {
    if (!verificationPermit) return
    if (verified && !verifyOrNumber.trim()) {
      return toast.error('Please enter the Official Receipt (OR) Number to confirm payment.')
    }
    try {
      setIsSubmittingVerification(true)
      await permitService.verifyPayment(verificationPermit._id, {
        verified,
        orNumber: verifyOrNumber.trim(),
        remarks: verifyNotes.trim()
      })
      toast.success(
        verified 
          ? 'Payment confirmed by Treasury! Application marked ready for BPLO permit issuance.' 
          : 'Payment rejected. Applicant notified to re-upload official receipt.'
      )
      setShowVerificationModal(false)
      fetchPermits()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to verify payment')
    } finally {
      setIsSubmittingVerification(false)
    }
  }

  // --- Permit Issuance Handlers ---
  const handleIssuePermit = async (permit) => {
    if (!window.confirm(`Issue official Mayor's Business Permit for "${permit.businessInfo?.businessName}"? This will activate the digital permit certificate valid until December 31.`)) {
      return
    }
    try {
      setIsIssuingPermit(true)
      const res = await permitService.issuePermit(permit._id, {
        remarks: "Official Mayor's Business Permit generated and issued according to municipal records."
      })
      toast.success('Mayor Business Permit officially issued!')
      fetchPermits()
      if (res.data?.data?.permit) {
        setCertificatePermit(res.data.data.permit)
        setShowCertificateModal(true)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to issue permit')
    } finally {
      setIsIssuingPermit(false)
    }
  }

  const openCertificate = (permit) => {
    setCertificatePermit(permit)
    setShowCertificateModal(true)
  }

  const openOrderPayment = (permit) => {
    setOrderPaymentPermit(permit)
    setShowOrderPaymentModal(true)
  }

  const getStatusBadge = (status, missingCount = 0) => {
    if (status === 'issued') {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-600 text-white shadow-xs">
          <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Active Permit Issued
        </span>
      )
    }

    if (status === 'approved') {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
          <Award className="w-3.5 h-3.5 mr-1 text-emerald-700" /> Approved • Ready to Issue
        </span>
      )
    }

    if (status === 'payment_under_review') {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-sky-100 text-sky-900 border border-sky-300 animate-pulse">
          <Clock className="w-3.5 h-3.5 mr-1 text-sky-700" /> Receipt Uploaded • Verify
        </span>
      )
    }

    if (status === 'pending_payment') {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
          <DollarSign className="w-3.5 h-3.5 mr-1 text-amber-700" /> Pending Client Payment
        </span>
      )
    }

    if (status === 'returned_for_correction' || status === 'rejected' || missingCount > 0) {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-red-100 text-red-800 border border-red-200">
          <AlertTriangle className="w-3 h-3 mr-1 text-red-600" /> Deficient / Missing ({missingCount})
        </span>
      )
    }

    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200">
        <Clock className="w-3 h-3 mr-1 text-amber-600" /> Review Required
      </span>
    )
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
            <div className="flex items-start sm:items-center space-x-3.5">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-300 p-1 flex items-center justify-center shrink-0 shadow-sm">
                <TreasurerSeal size={46} className="w-full h-full text-amber-900" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold text-amber-800 uppercase tracking-widest bg-amber-100 border border-amber-200 px-2.5 py-0.5 rounded-full">
                  Office of the Municipal Treasurer • Janiuay, Iloilo
                </span>
                <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1.5">
                  Business Permit Review &amp; Assessment Registry
                </h1>
                <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
                  Audit citizen permit submissions, decide payment assessments, verify Treasury receipts, and issue permits.
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 flex-wrap gap-2">
              <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
                {pagination.total} Total Records
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-amber-100 text-amber-900 text-xs font-bold border border-amber-200">
                {permits.filter(p => p.status === 'submitted' || p.status === 'under_review').length} In Review
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-sky-100 text-sky-900 text-xs font-bold border border-sky-200">
                {permits.filter(p => p.status === 'payment_under_review').length} Verify Payment
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-900 text-xs font-bold border border-emerald-200">
                {permits.filter(p => p.status === 'issued').length} Issued
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
          <div className="w-full md:w-72">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border-2 border-slate-200 py-2.5 px-4 focus:ring-4 focus:ring-primary-50 focus:border-primary-500 outline-none transition-all text-sm font-semibold bg-white cursor-pointer"
            >
              <option value="">Status: All Records</option>
              <option value="under_review">Review Required (New / Submitted)</option>
              <option value="pending_payment">Pending Client Payment</option>
              <option value="payment_under_review">Payment Receipt Uploaded (Verify)</option>
              <option value="approved">Approved (Ready to Issue)</option>
              <option value="issued">Issued Active Permits</option>
              <option value="rejected">Deficient / Corrections Flagged</option>
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
                    <th className="px-6 py-4">Status & Missing Items</th>
                    <th className="px-6 py-4 text-right">Workflow Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {permits.map((permit) => {
                    const missingCount = permit.missingRequirements?.length || 0
                    const isIssued = permit.status === 'issued'
                    const isApproved = permit.status === 'approved'
                    const isPaymentUnderReview = permit.status === 'payment_under_review' || permit.paymentInfo?.paymentStatus === 'receipt_uploaded'
                    const isPendingPayment = permit.status === 'pending_payment'
                    const isReviewStage = permit.status === 'submitted' || permit.status === 'under_review' || permit.status === 'returned_for_correction'

                    return (
                      <tr key={permit._id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-900 text-sm">
                            {permit.businessInfo?.businessName || 'N/A'}
                          </p>
                          <p className="text-xs text-slate-500 capitalize">
                            {permit.businessInfo?.businessType?.replace(/_/g, ' ')} • {permit.businessInfo?.businessNature}
                          </p>
                          <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                            Brgy. {permit.businessInfo?.businessAddress?.barangay || 'Poblacion'}, Janiuay
                          </p>
                        </td>

                        <td className="px-6 py-4 text-xs text-slate-700">
                          <p className="font-bold">{permit.applicant?.firstName} {permit.applicant?.lastName}</p>
                          <p className="text-slate-400 text-[11px]">{permit.applicant?.email}</p>
                          <p className="text-slate-400 text-[11px]">{permit.ownerInfo?.phone || permit.applicant?.phone}</p>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center text-xs font-semibold text-slate-800">
                            <Calendar className="w-3.5 h-3.5 mr-1.5 text-primary-600 flex-shrink-0" />
                            {formatDate(permit.appliedAt || permit.createdAt)}
                          </div>
                          {permit.paymentInfo?.preferredPaymentDate && (
                            <p className="text-[11px] text-amber-700 mt-1 font-medium">
                              Pref. Pay: {formatDate(permit.paymentInfo.preferredPaymentDate)}
                            </p>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          {getStatusBadge(permit.status, missingCount)}
                          {permit.permitNumber && (
                            <p className="text-[11px] font-mono font-bold text-slate-600 mt-1">
                              {permit.permitNumber}
                            </p>
                          )}
                          {permit.paymentInfo?.amount > 0 && (
                            <p className="text-[11px] font-semibold text-slate-500 mt-0.5">
                              Assessed: ₱{permit.paymentInfo.amount.toLocaleString()}
                            </p>
                          )}
                        </td>

                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-2 flex-wrap gap-y-1">
                            {/* View Full Dossier Link */}
                            <Link 
                              to={`/permit-status/${permit._id}`}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-primary-600 hover:bg-slate-100 transition-colors"
                              title="View Full Dossier"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>

                            {/* Issued -> View / Print Certificate */}
                            {isIssued && (
                              <button
                                onClick={() => openCertificate(permit)}
                                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all flex items-center"
                                title="View & Print Official Permit Certificate"
                              >
                                <Printer className="w-3.5 h-3.5 mr-1" />
                                Print Permit
                              </button>
                            )}

                            {/* Approved -> Issue Permit Button */}
                            {isApproved && (
                              <button
                                onClick={() => handleIssuePermit(permit)}
                                disabled={isIssuingPermit}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all flex items-center"
                                title="Issue Official Mayor's Permit"
                              >
                                <Award className="w-3.5 h-3.5 mr-1" />
                                Issue Permit
                              </button>
                            )}

                            {/* Payment Uploaded -> Treasury Verify Button */}
                            {isPaymentUnderReview && (
                              <button
                                onClick={() => openVerificationModal(permit)}
                                className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all flex items-center animate-bounce-subtle"
                                title="Verify Treasury Payment Receipt"
                              >
                                <Receipt className="w-3.5 h-3.5 mr-1" />
                                Verify Payment
                              </button>
                            )}

                            {/* Assessment Forwarded -> View Voucher Button */}
                            {permit.assessment?.forwardedToClient && (
                              <button
                                onClick={() => openOrderPayment(permit)}
                                className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg text-xs font-bold transition-all flex items-center"
                                title="View Order of Payment Voucher"
                              >
                                <FileText className="w-3.5 h-3.5 mr-1" />
                                Order Voucher
                              </button>
                            )}

                            {/* Under Review or Returned -> Assess & Forward Payment */}
                            {isReviewStage && (
                              <button
                                onClick={() => openAssessmentModal(permit)}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all flex items-center"
                                title="Determine Fees & Forward Order of Payment"
                              >
                                <DollarSign className="w-3.5 h-3.5 mr-1" />
                                Send Assessment
                              </button>
                            )}

                            {/* General Audit Clearances Button */}
                            <button
                              onClick={() => openAuditModal(permit)}
                              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold shadow-sm transition-all flex items-center"
                              title="Audit Clearance Documents & Deficiencies"
                            >
                              <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                              Audit
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

        {/* 1. INTERACTIVE AUDIT MODAL (Checklist + Deficiencies + Grant) */}
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

                {/* Modal Body */}
                <div className="p-6 overflow-y-auto space-y-6">
                  {/* Applicant Uploaded Documents */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Applicant Uploaded Documents ({selectedPermit.documents?.length || 0} Files Attached)
                    </label>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                      {selectedPermit.documents && selectedPermit.documents.length > 0 ? (
                        selectedPermit.documents.map((doc, dIdx) => (
                          <div key={dIdx} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                            <div className="flex items-center space-x-2">
                              <FileText className="w-4 h-4 text-sky-600" />
                              <span className="font-semibold text-slate-900 text-xs">{doc.name}</span>
                              <span className="text-[10px] text-slate-400 font-mono">({doc.originalName})</span>
                            </div>
                            <a
                              href={getFileViewUrl(doc.fileUrl)}
                              onClick={(e) => handleViewFile(e, doc.fileUrl)}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1 text-[11px] font-bold bg-sky-50 text-sky-700 rounded-lg hover:bg-sky-100 flex items-center cursor-pointer transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5 mr-1" /> View File
                            </a>
                          </div>
                        ))
                      ) : (
                        <p className="text-slate-400 italic text-xs">No applicant files uploaded yet.</p>
                      )}
                    </div>
                  </div>

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
                      placeholder="e.g., Please re-upload updated Fire Safety Inspection Certificate or renew Barangay Clearance..."
                      className="w-full rounded-xl border-2 border-slate-200 p-3.5 text-xs sm:text-sm focus:ring-4 focus:ring-primary-50 focus:border-primary-600 outline-none transition-all min-h-[90px]"
                    />
                  </div>
                </div>

                {/* Modal Footer Actions */}
                <div className="p-6 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <button 
                    onClick={() => setShowModal(false)}
                    className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 uppercase tracking-wider transition-colors"
                  >
                    Close
                  </button>

                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
                    {/* Deficiency notice action */}
                    <Button 
                      variant="danger" 
                      onClick={() => handleFlagDeficiencies(selectedPermit._id)}
                      leftIcon={<AlertTriangle className="w-4 h-4" />}
                      className="text-xs"
                    >
                      Send Deficiency ({selectedMissingItems.length})
                    </Button>

                    {/* Grant corrections if applicant had corrections */}
                    {(selectedPermit.status === 'returned_for_correction' || (selectedPermit.missingRequirements && selectedPermit.missingRequirements.length > 0)) && (
                      <Button
                        variant="secondary"
                        onClick={() => handleGrantAndClearDeficiencies(selectedPermit._id)}
                        className="text-xs border-emerald-300 text-emerald-800 hover:bg-emerald-50"
                        leftIcon={<Check className="w-4 h-4 text-emerald-600" />}
                      >
                        Grant & Clear Notice
                      </Button>
                    )}

                    {/* Forward to Assessment */}
                    <Button 
                      variant="primary" 
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold border-none"
                      onClick={() => {
                        setShowModal(false)
                        openAssessmentModal(selectedPermit)
                      }}
                      leftIcon={<DollarSign className="w-4 h-4" />}
                    >
                      Decide Assessment
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* 2. BPLO PAYMENT ASSESSMENT MODAL (Image 5: "BPLO decide payment assessment then forward to client") */}
        <AnimatePresence>
          {showAssessmentModal && assessmentPermit && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
                onClick={() => setShowAssessmentModal(false)}
              />

              <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="relative bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden z-10 max-h-[90vh] flex flex-col"
              >
                <form onSubmit={handleSendAssessment} className="flex flex-col h-full">
                  {/* Header */}
                  <div className="p-6 border-b border-slate-100 bg-emerald-50/50 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-emerald-100 rounded-2xl text-emerald-700">
                        <DollarSign className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">
                          Decide Payment Assessment & Order Voucher
                        </h3>
                        <p className="text-xs text-slate-500">
                          {assessmentPermit.businessInfo?.businessName} • {assessmentPermit.businessInfo?.businessNature}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Body with fee inputs */}
                  <div className="p-6 overflow-y-auto space-y-4">
                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs flex justify-between items-center">
                      <div>
                        <span className="text-slate-500">Declared Capital / Gross:</span>
                        <p className="font-bold text-slate-900 text-sm">
                          ₱{Number(assessmentPermit.businessInfo?.capitalization || 0).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-500">Preferred Pay Date:</span>
                        <p className="font-bold text-slate-900">
                          {formatDate(assessmentPermit.paymentInfo?.preferredPaymentDate) || 'Upon receipt'}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Itemized Regulatory & Municipal Fees (PHP)
                      </label>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">
                            Business Tax <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="50"
                            value={assessmentFees.businessTax}
                            onChange={(e) => setAssessmentFees({ ...assessmentFees, businessTax: Number(e.target.value) })}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold outline-none focus:border-emerald-500"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">
                            Mayor's Permit Fee <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="50"
                            value={assessmentFees.mayorsPermit}
                            onChange={(e) => setAssessmentFees({ ...assessmentFees, mayorsPermit: Number(e.target.value) })}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold outline-none focus:border-emerald-500"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">
                            Sanitary Inspection Fee
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="25"
                            value={assessmentFees.sanitaryFee}
                            onChange={(e) => setAssessmentFees({ ...assessmentFees, sanitaryFee: Number(e.target.value) })}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">
                            Fire Safety Inspection Fee
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="25"
                            value={assessmentFees.fireSafetyFee}
                            onChange={(e) => setAssessmentFees({ ...assessmentFees, fireSafetyFee: Number(e.target.value) })}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">
                            Environmental & Ecological Fee
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="25"
                            value={assessmentFees.environmentalFee}
                            onChange={(e) => setAssessmentFees({ ...assessmentFees, environmentalFee: Number(e.target.value) })}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">
                            Garbage & Waste Fee
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="25"
                            value={assessmentFees.garbageFee}
                            onChange={(e) => setAssessmentFees({ ...assessmentFees, garbageFee: Number(e.target.value) })}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">
                            Business Plate & Regulatory Sticker Fee
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="25"
                            value={assessmentFees.plateStickerFee}
                            onChange={(e) => setAssessmentFees({ ...assessmentFees, plateStickerFee: Number(e.target.value) })}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>

                      {/* Total Calculation Display */}
                      <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                            Total Order of Payment Amount:
                          </span>
                          <p className="text-[11px] text-emerald-700">
                            Forwarded to client dashboard with downloadable Order of Payment voucher.
                          </p>
                        </div>
                        <span className="text-2xl font-black text-emerald-800 font-mono">
                          ₱{totalAssessmentFee.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Assessment Instructions / Remarks for Applicant (Optional)
                        </label>
                        <textarea
                          value={assessmentRemarks}
                          onChange={(e) => setAssessmentRemarks(e.target.value)}
                          placeholder="e.g., Please present this Order of Payment at the Municipal Treasury Cashier counter or settle online..."
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs outline-none focus:border-emerald-500 min-h-[60px]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setShowAssessmentModal(false)}
                      className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 uppercase"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingAssessment || totalAssessmentFee <= 0}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center"
                    >
                      <Send className="w-4 h-4 mr-1.5" />
                      {isSubmittingAssessment ? 'Forwarding...' : 'Forward Assessment to Client'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* 3. TREASURY PAYMENT VERIFICATION MODAL (Image 4 & 5: Treasury confirms payment -> BPLO issues) */}
        <AnimatePresence>
          {showVerificationModal && verificationPermit && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
                onClick={() => setShowVerificationModal(false)}
              />

              <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="relative bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden z-10 max-h-[90vh] flex flex-col"
              >
                {/* Header */}
                <div className="p-6 border-b border-slate-100 bg-sky-50/50 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-sky-100 rounded-2xl text-sky-700">
                      <Receipt className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        Treasury Payment Receipt Audit & Verification
                      </h3>
                      <p className="text-xs text-slate-500">
                        {verificationPermit.businessInfo?.businessName} • Tracking: {verificationPermit.trackingNumber}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto space-y-4">
                  {/* Payment Details Card */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500">Assessed Amount:</span>
                      <p className="font-bold text-slate-900 text-sm">
                        ₱{Number(verificationPermit.paymentInfo?.amount || 0).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-500">Payment Channel:</span>
                      <p className="font-bold text-slate-900">
                        {verificationPermit.paymentInfo?.paymentMethod || 'Treasury Cashier'}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-500">Date Paid / Uploaded:</span>
                      <p className="font-bold text-slate-900">
                        {formatDate(verificationPermit.paymentInfo?.receiptDate || verificationPermit.paymentInfo?.receiptUploadedAt)}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-500">Current Payment Status:</span>
                      <p className="font-bold text-sky-700 capitalize">
                        {verificationPermit.paymentInfo?.paymentStatus?.replace(/_/g, ' ') || 'Pending Verification'}
                      </p>
                    </div>
                  </div>

                  {/* Uploaded Receipt Document / Photo */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Applicant Uploaded Official Receipt Proof
                    </label>
                    {verificationPermit.paymentInfo?.receiptUrl ? (
                      <div className="p-3 bg-sky-50 rounded-2xl border border-sky-200 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Receipt className="w-5 h-5 text-sky-700" />
                          <div>
                            <p className="text-xs font-bold text-sky-950">
                              {verificationPermit.paymentInfo?.receiptFileName || 'Official Receipt Document'}
                            </p>
                            <p className="text-[10px] text-sky-700 font-mono">
                              OR Number on file: {verificationPermit.paymentInfo?.orNumber || 'None provided'}
                            </p>
                          </div>
                        </div>
                        <a
                          href={getFileViewUrl(verificationPermit.paymentInfo.receiptUrl)}
                          onClick={(e) => handleViewFile(e, verificationPermit.paymentInfo.receiptUrl)}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5 mr-1" /> View Receipt
                        </a>
                      </div>
                    ) : (
                      <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
                        No physical receipt image uploaded yet.
                      </div>
                    )}
                  </div>

                  {/* OR Number Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Official Receipt (OR) Number Confirmed by Treasury <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., OR-2026-004821"
                      value={verifyOrNumber}
                      onChange={(e) => setVerifyOrNumber(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-200 text-xs font-mono font-bold outline-none focus:border-sky-500"
                      required
                    />
                  </div>

                  {/* Verification Notes */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Treasury Audit Remarks (Optional)
                    </label>
                    <textarea
                      value={verifyNotes}
                      onChange={(e) => setVerifyNotes(e.target.value)}
                      placeholder="e.g., Verified against Municipal Treasury Book of Accounts Page 42..."
                      className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-200 text-xs outline-none focus:border-sky-500 min-h-[60px]"
                    />
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setShowVerificationModal(false)}
                    className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 uppercase"
                  >
                    Cancel
                  </button>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      disabled={isSubmittingVerification}
                      onClick={() => handleVerifyPayment(false)}
                      className="px-4 py-2.5 rounded-xl bg-red-100 hover:bg-red-200 text-red-800 text-xs font-bold transition-all flex items-center"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Reject / Request Re-upload
                    </button>

                    <button
                      type="button"
                      disabled={isSubmittingVerification}
                      onClick={() => handleVerifyPayment(true)}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all flex items-center"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1.5" />
                      {isSubmittingVerification ? 'Confirming...' : 'Confirm & Authorize Issuance'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* 4. ORDER OF PAYMENT VOUCHER MODAL */}
        <OrderOfPaymentModal
          isOpen={showOrderPaymentModal}
          onClose={() => setShowOrderPaymentModal(false)}
          permit={orderPaymentPermit}
        />

        {/* 5. OFFICIAL MUNICIPALITY OF JANIUAY MAYOR'S BUSINESS PERMIT CERTIFICATE MODAL */}
        <BusinessPermitCertificate
          isOpen={showCertificateModal}
          onClose={() => setShowCertificateModal(false)}
          permit={certificatePermit}
        />
      </div>
    </div>
  )
}

export default AdminPermits
