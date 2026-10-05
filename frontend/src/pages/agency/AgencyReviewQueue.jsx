import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Flame, 
  Sparkles, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  FileText, 
  Upload, 
  Eye, 
  Calendar, 
  ShieldCheck, 
  Activity, 
  ArrowLeft,
  ChevronRight,
  User,
  Building2,
  Phone,
  Mail
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { agencyService, permitService } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import { Card, CardHeader, CardBody } from '../../components/shared/Card'
import Button from '../../components/shared/Button'
import Badge from '../../components/shared/Badge'
import Input from '../../components/shared/Input'
import toast from 'react-hot-toast'

const AgencyReviewQueue = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const isFire = user?.role === 'fire_reviewer'
  const isSanitation = user?.role === 'sanitation_reviewer'
  const agencyDomain = isFire ? 'fire' : isSanitation ? 'sanitation' : 'fire'
  const agencyTitle = isFire ? 'Bureau of Fire Protection (BFP)' : isSanitation ? 'Bureau of Sanitation / Municipal Health' : 'Agency Review Portal'

  const [permits, setPermits] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPermit, setSelectedPermit] = useState(null)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviewAction, setReviewAction] = useState('approved')
  const [reviewNotes, setReviewNotes] = useState('')
  const [correctionReason, setCorrectionReason] = useState('')
  const [inspectionDate, setInspectionDate] = useState('')
  const [agencyFile, setAgencyFile] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchQueue()
  }, [statusFilter, searchTerm])

  const fetchQueue = async () => {
    try {
      setLoading(true)
      const res = await agencyService.getQueue({
        agency: agencyDomain,
        status: statusFilter || undefined,
        search: searchTerm || undefined
      })
      if (res.data?.data) {
        setPermits(res.data.data.permits || [])
      }
    } catch (err) {
      toast.error('Failed to sync agency review queue')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenReview = async (permitItem) => {
    try {
      const res = await agencyService.getPermit(permitItem._id, { agency: agencyDomain })
      const fullPermit = res.data?.data?.permit || permitItem
      setSelectedPermit(fullPermit)
      const myReview = fullPermit.agencyReviews?.[agencyDomain] || {}
      setReviewNotes(myReview.remarks || '')
      setCorrectionReason(myReview.correctionReason || '')
      setInspectionDate(myReview.inspectionDate ? myReview.inspectionDate.split('T')[0] : '')
      setReviewAction(myReview.status === 'pending' ? 'approved' : myReview.status || 'approved')
      setShowReviewModal(true)
    } catch (e) {
      setSelectedPermit(permitItem)
      setShowReviewModal(true)
    }
  }

  const handleDecisionSubmit = async (e) => {
    e.preventDefault()
    if (!selectedPermit) return
    try {
      setSubmitting(true)
      await agencyService.submitReview(selectedPermit._id, {
        agency: agencyDomain,
        status: reviewAction,
        remarks: reviewNotes,
        correctionReason: reviewAction === 'correction_requested' ? correctionReason : undefined,
        inspectionDate: inspectionDate || undefined
      })

      // Upload clearance certificate if attached
      if (agencyFile) {
        const fd = new FormData()
        fd.append('documents', agencyFile)
        fd.append('agency', agencyDomain)
        fd.append('title', isFire ? 'Fire Safety Inspection Certificate (FSIC)' : 'Sanitary Permit Clearance Certificate')
        await agencyService.uploadDocument(selectedPermit._id, fd)
      }

      toast.success(`Agency review decision recorded as ${reviewAction.toUpperCase()}!`)
      setShowReviewModal(false)
      fetchQueue()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review decision')
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800"><CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Clearance Approved</span>
      case 'rejected':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-rose-100 text-rose-800"><XCircle className="w-3.5 h-3.5 mr-1 text-rose-600" /> Disapproved</span>
      case 'correction_requested':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-amber-100 text-amber-900"><AlertTriangle className="w-3.5 h-3.5 mr-1 text-amber-600" /> Correction Requested</span>
      default:
        return <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-sky-100 text-sky-800"><Clock className="w-3.5 h-3.5 mr-1 text-sky-600" /> Pending Review</span>
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Top Banner */}
      <div className="bg-white border-b border-slate-200 pt-8 pb-10">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className={`text-xs font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-md border flex items-center ${
                  isFire 
                    ? 'bg-amber-50 text-amber-800 border-amber-200' 
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                }`}>
                  {isFire ? <Flame className="w-3.5 h-3.5 mr-1 text-amber-600" /> : <Sparkles className="w-3.5 h-3.5 mr-1 text-emerald-600" />}
                  {agencyTitle}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Mandatory Clearance Review Queue
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                Evaluate business establishments, conduct compliance inspections, and issue official {isFire ? 'FSIC clearances' : 'Sanitary clearances'}.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
                {permits.length} Assigned Records
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-amber-100 text-amber-900 text-xs font-bold border border-amber-200">
                {permits.filter(p => p.myAgencyReview?.status === 'pending').length} Pending Inspection
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mt-8 space-y-6">
        {/* Filter & Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search by business name, tracking number, or applicant..."
              icon={<Search className="w-4 h-4" />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-64">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border-2 border-slate-200 py-2.5 px-4 focus:ring-4 focus:ring-primary-50 focus:border-primary-500 outline-none transition-all text-xs font-semibold bg-white cursor-pointer"
            >
              <option value="">All Review Statuses</option>
              <option value="pending">Pending Inspection</option>
              <option value="approved">Clearance Approved</option>
              <option value="correction_requested">Correction Requested</option>
              <option value="rejected">Disapproved</option>
            </select>
          </div>
        </div>

        {/* Review Queue Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-20 flex flex-col items-center justify-center">
              <Activity className="w-8 h-8 animate-spin text-primary-600 mb-2" />
              <p className="text-sm font-bold text-slate-600">Loading {agencyTitle} review queue...</p>
            </div>
          ) : permits.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3 text-slate-400">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-slate-800">No applications in review queue</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                All submitted applications for your agency have been evaluated or no new applications match your filter.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Business Tradename & Nature</th>
                    <th className="px-6 py-4">Owner & Contact</th>
                    <th className="px-6 py-4">Barangay Location</th>
                    <th className="px-6 py-4">Application Type</th>
                    <th className="px-6 py-4">Agency Review Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {permits.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-900 text-sm">{item.businessInfo?.businessName}</p>
                        <p className="text-slate-500 text-[11px]">{item.businessInfo?.businessNature} • <span className="font-mono text-primary-700 font-bold">{item.trackingNumber}</span></p>
                      </td>
                      <td className="px-6 py-4 text-slate-700">
                        <p className="font-bold">{item.ownerInfo?.firstName} {item.ownerInfo?.lastName}</p>
                        <p className="text-slate-400 text-[11px]">{item.ownerInfo?.phone} • {item.ownerInfo?.email}</p>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-700">
                        {item.businessInfo?.businessAddress?.barangay || 'Poblacion'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                          item.permitType === 'renewal' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {item.permitType === 'renewal' ? 'Renewal Permit' : 'New Permit'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(item.myAgencyReview?.status)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleOpenReview(item)}
                          className="inline-flex items-center px-3.5 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
                          Review & Inspect
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Agency Review & Inspection Modal */}
        <AnimatePresence>
          {showReviewModal && selectedPermit && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setShowReviewModal(false)} />
              <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-3 rounded-2xl ${isFire ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {isFire ? <Flame className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">
                        {isFire ? 'Bureau of Fire Protection Clearance Review' : 'Bureau of Sanitation Clearance Review'}
                      </h2>
                      <p className="text-xs text-slate-500">
                        Business: <strong>{selectedPermit.businessInfo?.businessName}</strong> ({selectedPermit.trackingNumber})
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleDecisionSubmit} className="p-6 overflow-y-auto space-y-6 text-xs flex-1">
                  {/* Business & Applicant Info Snapshot */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Tradename</span>
                      <p className="font-bold text-slate-900 mt-0.5">{selectedPermit.businessInfo?.businessName}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Sector / Nature</span>
                      <p className="font-bold text-slate-900 mt-0.5">{selectedPermit.businessInfo?.businessNature}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Barangay</span>
                      <p className="font-bold text-slate-900 mt-0.5">{selectedPermit.businessInfo?.businessAddress?.barangay}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Applicant</span>
                      <p className="font-bold text-slate-900 mt-0.5">{selectedPermit.ownerInfo?.firstName} {selectedPermit.ownerInfo?.lastName}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Contact Phone</span>
                      <p className="font-bold text-slate-900 mt-0.5">{selectedPermit.ownerInfo?.phone}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Permit Type</span>
                      <p className="font-bold text-purple-700 uppercase mt-0.5">{selectedPermit.permitType || 'New'}</p>
                    </div>
                  </div>

                  {/* Applicant-Uploaded Documents for Reviewer Verification */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Applicant Uploaded Documents ({selectedPermit.documents?.length || 0} Files Attached)
                    </label>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                      {selectedPermit.documents && selectedPermit.documents.length > 0 ? (
                        selectedPermit.documents.map((doc, dIdx) => (
                          <div key={dIdx} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                            <div className="flex items-center space-x-2">
                              <FileText className="w-4 h-4 text-primary-600" />
                              <span className="font-semibold text-slate-900">{doc.name}</span>
                              <span className="text-[10px] text-slate-400 font-mono">({doc.originalName})</span>
                            </div>
                            <a
                              href={doc.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1 text-[11px] font-bold bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 flex items-center"
                            >
                              <Eye className="w-3.5 h-3.5 mr-1" /> View File
                            </a>
                          </div>
                        ))
                      ) : (
                        <p className="text-slate-400 italic">No applicant files uploaded yet.</p>
                      )}
                    </div>
                  </div>

                  {/* Agency Review Decision Radio */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Official Clearance Decision
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <label className={`p-3 rounded-xl border-2 cursor-pointer flex items-center space-x-2 ${
                        reviewAction === 'approved' ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold' : 'border-slate-200'
                      }`}>
                        <input type="radio" name="decision" value="approved" checked={reviewAction === 'approved'} onChange={() => setReviewAction('approved')} />
                        <span>Grant Clearance</span>
                      </label>
                      <label className={`p-3 rounded-xl border-2 cursor-pointer flex items-center space-x-2 ${
                        reviewAction === 'correction_requested' ? 'border-amber-500 bg-amber-50 text-amber-900 font-bold' : 'border-slate-200'
                      }`}>
                        <input type="radio" name="decision" value="correction_requested" checked={reviewAction === 'correction_requested'} onChange={() => setReviewAction('correction_requested')} />
                        <span>Request Correction</span>
                      </label>
                      <label className={`p-3 rounded-xl border-2 cursor-pointer flex items-center space-x-2 ${
                        reviewAction === 'rejected' ? 'border-rose-500 bg-rose-50 text-rose-900 font-bold' : 'border-slate-200'
                      }`}>
                        <input type="radio" name="decision" value="rejected" checked={reviewAction === 'rejected'} onChange={() => setReviewAction('rejected')} />
                        <span>Disapprove</span>
                      </label>
                    </div>
                  </div>

                  {/* Inspection Date */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Physical Inspection Date (Optional)
                      </label>
                      <input
                        type="date"
                        value={inspectionDate}
                        onChange={(e) => setInspectionDate(e.target.value)}
                        className="w-full px-3 py-2 border rounded-xl"
                      />
                    </div>

                    {/* Agency Document Attachment */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Attach Official {isFire ? 'FSIC Report / Certificate' : 'Sanitary Clearance Certificate'}
                      </label>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => setAgencyFile(e.target.files?.[0] || null)}
                        className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                      />
                    </div>
                  </div>

                  {/* Correction Reason if applicable */}
                  {reviewAction === 'correction_requested' && (
                    <div>
                      <label className="block text-[11px] font-bold text-red-700 uppercase mb-1">
                        Correction / Deficiency Request for Applicant *
                      </label>
                      <textarea
                        value={correctionReason}
                        onChange={(e) => setCorrectionReason(e.target.value)}
                        required
                        placeholder="Specify exact missing requirements or corrections (e.g., Provide updated fire extinguisher certification or updated medical health cards)..."
                        className="w-full p-3 border-2 border-amber-300 rounded-xl min-h-[70px]"
                      />
                    </div>
                  )}

                  {/* General Review Notes */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Evaluator Findings & Inspection Remarks
                    </label>
                    <textarea
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      placeholder="e.g. Conducted on-site inspection. Establishment compliant with municipal fire safety standards."
                      className="w-full p-3 border rounded-xl min-h-[70px]"
                    />
                  </div>

                  <div className="pt-4 border-t flex justify-end space-x-2">
                    <Button type="button" variant="secondary" size="sm" onClick={() => setShowReviewModal(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" size="sm" disabled={submitting}>
                      {submitting ? 'Recording Decision...' : 'Confirm Clearance Decision'}
                    </Button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default AgencyReviewQueue
