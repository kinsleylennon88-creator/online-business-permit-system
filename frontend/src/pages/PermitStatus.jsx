import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { permitService } from '../services/api'
import toast from 'react-hot-toast'
import { 
  ArrowLeft, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Clock,
  AlertCircle,
  Download,
  Printer,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Activity,
  ChevronRight,
  ExternalLink,
  Calendar,
  AlertTriangle,
  Upload,
  Flame,
  Sparkles,
  CreditCard,
  Building2,
  RotateCcw
} from 'lucide-react'
import { format } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardHeader, CardBody } from '../components/shared/Card'
import Button from '../components/shared/Button'
import Badge from '../components/shared/Badge'

const PermitStatus = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [permit, setPermit] = useState(null)
  const [loading, setLoading] = useState(true)
  const [uploadingDoc, setUploadingDoc] = useState(null)

  useEffect(() => {
    fetchPermit()
  }, [id])

  const fetchPermit = async () => {
    try {
      setLoading(true)
      const response = await permitService.getPermit(id)
      setPermit(response.data?.data?.permit)
    } catch (error) {
      toast.error('Failed to load permit application dossier')
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleUploadMissing = async (docName, files) => {
    if (!files?.length) return
    try {
      setUploadingDoc(docName)
      const fd = new FormData()
      Array.from(files).forEach(f => fd.append('documents', f))
      const docNames = {}
      Array.from(files).forEach(f => {
        docNames[f.name] = docName
      })
      fd.append('docNames', JSON.stringify(docNames))
      
      await permitService.uploadDocuments(id, fd)
      toast.success(`${docName} updated. Evaluators have been notified!`)
      fetchPermit()
    } catch (e) {
      toast.error(e.response?.data?.message || `Failed to upload ${docName}`)
    } finally {
      setUploadingDoc(null)
    }
  }

  const getStatusInfo = (status, missingCount = 0) => {
    if (missingCount > 0 || status === 'returned_for_correction' || status === 'rejected') {
      return {
        label: 'Action Required (Deficiency / Correction Needed)',
        variant: 'danger',
        icon: AlertTriangle,
        desc: 'Reviewers flagged missing or deficient documents. Please see details below and upload required files.'
      }
    }

    switch (status) {
      case 'submitted':
      case 'under_review':
      case 'under_admin_review':
        return {
          label: 'Under Active Evaluation',
          variant: 'warning',
          icon: Clock,
          desc: 'Your application is actively undergoing clearance evaluation by BPLO, Bureau of Fire, and Bureau of Sanitation.'
        }
      case 'approved':
        return {
          label: 'Application Approved & Assessed',
          variant: 'success',
          icon: CheckCircle2,
          desc: 'Your application has passed all agency requirements and has been approved by the Municipal Licensing Board.'
        }
      case 'issued':
        return {
          label: 'Active Business Permit Issued',
          variant: 'success',
          icon: ShieldCheck,
          desc: 'Your official Mayor\'s Business Permit is active and registered in the municipal database.'
        }
      default:
        return {
          label: 'Draft Application',
          variant: 'neutral',
          icon: FileText,
          desc: 'Draft in progress.'
        }
    }
  }

  const getAgencyStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <span className="inline-flex items-center px-2 py-0.5 rounded font-bold text-[11px] bg-emerald-100 text-emerald-800"><CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" /> Clearance Approved</span>
      case 'rejected':
        return <span className="inline-flex items-center px-2 py-0.5 rounded font-bold text-[11px] bg-rose-100 text-rose-800"><XCircle className="w-3 h-3 mr-1 text-rose-600" /> Disapproved</span>
      case 'correction_requested':
        return <span className="inline-flex items-center px-2 py-0.5 rounded font-bold text-[11px] bg-amber-100 text-amber-900"><AlertTriangle className="w-3 h-3 mr-1 text-amber-600" /> Correction Requested</span>
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded font-bold text-[11px] bg-sky-50 text-sky-700"><Clock className="w-3 h-3 mr-1 text-sky-600" /> Pending Inspection</span>
    }
  }

  const formatSafeDate = (d) => {
    if (!d) return 'Pending'
    try {
      return format(new Date(d), 'MMMM d, yyyy • h:mm a')
    } catch {
      return new Date(d).toLocaleDateString()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Activity className="w-10 h-10 animate-spin text-primary-600" />
      </div>
    )
  }

  if (!permit) return null

  const missingCount = permit.missingRequirements?.length || 0
  const info = getStatusInfo(permit.status, missingCount)
  const fireReview = permit.agencyReviews?.fire || {}
  const sanitationReview = permit.agencyReviews?.sanitation || {}

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 pt-8 pb-10">
        <div className="container">
          <div className="flex items-center justify-between mb-6">
            <button 
              onClick={() => navigate('/dashboard')} 
              className="inline-flex items-center text-sm font-bold text-slate-600 hover:text-primary-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Dashboard
            </button>
            <div className="flex items-center space-x-2">
              <Button variant="secondary" size="sm" leftIcon={<Printer className="w-4 h-4" />} onClick={() => window.print()}>
                Print Application Dossier
              </Button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center space-x-5">
              <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center shadow-md flex-shrink-0 ${
                info.variant === 'success' 
                  ? 'bg-emerald-600 text-white' 
                  : info.variant === 'warning' 
                  ? 'bg-amber-500 text-white' 
                  : info.variant === 'danger'
                  ? 'bg-red-600 text-white'
                  : 'bg-slate-800 text-white'
              }`}>
                <info.icon className="w-8 h-8 sm:w-10 sm:h-10" />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {permit.businessInfo?.businessName || 'Business Permit Application'}
                  </h1>
                  <Badge variant={info.variant}>{info.label}</Badge>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase ${
                    permit.permitType === 'renewal' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {permit.permitType === 'renewal' ? 'Renewal Permit' : 'New Permit'}
                  </span>
                </div>
                
                <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500 mt-1">
                  <span>Tracking Number: <strong className="font-mono text-primary-700">{permit.trackingNumber || 'Pending'}</strong></span>
                  {permit.businessIdNumber && <span>Business ID: <strong className="font-mono text-slate-800">{permit.businessIdNumber}</strong></span>}
                  <span>Applied: <strong className="text-slate-800">{formatSafeDate(permit.appliedAt || permit.createdAt)}</strong></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Case Dossier */}
          <div className="lg:col-span-2 space-y-6">

            {/* DEFICIENCY / CORRECTION NOTICES */}
            {(missingCount > 0 || permit.status === 'returned_for_correction' || permit.status === 'rejected' || permit.adminComments) && (
              <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-lg font-bold text-red-950">
                      Evaluator Compliance Notes & Action Required
                    </h3>
                    <p className="text-xs sm:text-sm text-red-900 mt-1 leading-relaxed">
                      {permit.adminComments || permit.remarks || 'Please upload the missing or corrected documents below.'}
                    </p>
                  </div>
                </div>

                {permit.missingRequirements && permit.missingRequirements.length > 0 && (
                  <div className="pt-2">
                    <p className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                      Itemized Missing / Corrected Documents:
                    </p>
                    <div className="space-y-2">
                      {permit.missingRequirements.map((reqName, rIdx) => (
                        <div key={rIdx} className="bg-white p-3.5 rounded-xl border border-red-200 flex items-center justify-between gap-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-red-600">⚠️</span>
                            <span className="text-sm font-bold text-slate-900">{reqName}</span>
                          </div>

                          <label className="cursor-pointer flex-shrink-0">
                            <input
                              type="file"
                              className="hidden"
                              accept="image/*,.pdf,.doc,.docx"
                              onChange={(e) => handleUploadMissing(reqName, e.target.files)}
                            />
                            <span className="inline-flex items-center px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all">
                              <Upload className="w-3.5 h-3.5 mr-1" />
                              {uploadingDoc === reqName ? 'Uploading...' : 'Upload Replacement'}
                            </span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* AGENCY REVIEW CLEARANCES (Fire & Sanitation Status) */}
            <Card>
              <CardHeader
                title="Inter-Agency Clearance Routing Status"
                subtitle="Live status from reviewing agencies"
                icon={<ShieldCheck className="w-5 h-5 text-primary-600" />}
              />
              <CardBody className="space-y-4">
                {/* Bureau of Fire Review */}
                <div className="p-4 rounded-2xl border-2 border-slate-100 bg-slate-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                        <Flame className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">Bureau of Fire Protection (BFP)</h4>
                        <p className="text-[11px] text-slate-500">Fire Safety Inspection Clearance (FSIC)</p>
                      </div>
                    </div>
                    {getAgencyStatusBadge(fireReview.status)}
                  </div>
                  {fireReview.remarks && (
                    <p className="text-xs text-slate-700 bg-white p-2.5 rounded-xl border">
                      <strong>BFP Inspection Findings:</strong> {fireReview.remarks}
                    </p>
                  )}
                  {fireReview.correctionReason && (
                    <p className="text-xs text-amber-900 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                      <strong>BFP Correction Request:</strong> {fireReview.correctionReason}
                    </p>
                  )}
                </div>

                {/* Bureau of Sanitation Review */}
                <div className="p-4 rounded-2xl border-2 border-slate-100 bg-slate-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">Bureau of Sanitation / Municipal Health</h4>
                        <p className="text-[11px] text-slate-500">Sanitary Permit & Health Clearances</p>
                      </div>
                    </div>
                    {getAgencyStatusBadge(sanitationReview.status)}
                  </div>
                  {sanitationReview.remarks && (
                    <p className="text-xs text-slate-700 bg-white p-2.5 rounded-xl border">
                      <strong>Sanitation Findings:</strong> {sanitationReview.remarks}
                    </p>
                  )}
                  {sanitationReview.correctionReason && (
                    <p className="text-xs text-amber-900 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                      <strong>Sanitation Correction Request:</strong> {sanitationReview.correctionReason}
                    </p>
                  )}
                </div>
              </CardBody>
            </Card>

            {/* Enterprise & Payment Parameter Details */}
            <Card>
              <CardHeader
                title="Registered Enterprise Parameters"
                subtitle="Declared registration details"
                icon={<Building2 className="w-5 h-5 text-primary-600" />}
              />
              <CardBody className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Registration Type</span>
                  <p className="font-bold text-slate-900 mt-0.5 capitalize">{permit.businessInfo?.businessType?.replace(/_/g, ' ')}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Line of Business</span>
                  <p className="font-bold text-slate-900 mt-0.5">{permit.businessInfo?.businessNature}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Capitalization</span>
                  <p className="font-bold text-slate-900 mt-0.5">₱{Number(permit.businessInfo?.capitalization || 0).toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Barangay</span>
                  <p className="font-bold text-slate-900 mt-0.5">{permit.businessInfo?.businessAddress?.barangay}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Payment Frequency</span>
                  <p className="font-bold text-slate-900 mt-0.5 capitalize">{permit.paymentInfo?.paymentFrequency || 'Annually'}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Receipt Date</span>
                  <p className="font-bold text-slate-900 mt-0.5">{permit.paymentInfo?.receiptDate ? new Date(permit.paymentInfo.receiptDate).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Applicant Gender</span>
                  <p className="font-bold text-slate-900 mt-0.5 capitalize">{permit.ownerInfo?.gender?.replace(/_/g, ' ') || 'Not specified'}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Permit Type</span>
                  <p className="font-bold text-purple-700 mt-0.5 uppercase">{permit.permitType || 'New'}</p>
                </div>
              </CardBody>
            </Card>

            {/* Document Vault & Version History */}
            <Card>
              <CardHeader
                title="Document Vault & Clearance Files"
                subtitle="Audited records and certificates in secure vault"
                icon={<FileText className="w-5 h-5 text-emerald-600" />}
              />
              <CardBody className="p-0">
                <div className="divide-y divide-slate-100 text-xs">
                  {permit.documents && permit.documents.length > 0 ? (
                    permit.documents.map((doc, idx) => (
                      <div key={idx} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{doc.name}</p>
                            <p className="text-[11px] text-slate-400 font-mono">
                              {doc.originalName} • v{doc.version || 1} • {formatSafeDate(doc.uploadedAt)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-primary-50 text-slate-700 hover:text-primary-700 font-bold text-xs transition-colors flex items-center"
                          >
                            <ExternalLink className="w-3.5 h-3.5 mr-1" /> View File
                          </a>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-slate-400">
                      Standard application files stored on secure file server.
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Side Info & Timeline */}
          <div className="space-y-6">
            <Card>
              <CardHeader title="Audit & Approval History" subtitle="Milestone trail" />
              <CardBody>
                <div className="space-y-4 text-xs">
                  {permit.approvalHistory && permit.approvalHistory.length > 0 ? (
                    permit.approvalHistory.map((h, idx) => (
                      <div key={idx} className="flex items-start space-x-3">
                        <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
                          ✓
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 capitalize">{h.action?.replace(/_/g, ' ')}</p>
                          <p className="text-slate-500 text-[11px] leading-tight">{h.remarks}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{formatSafeDate(h.performedAt)}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-400">No review milestones recorded yet.</p>
                  )}
                </div>
              </CardBody>
            </Card>

            <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm text-center">
              <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
              <h4 className="font-bold text-sm">BPLO Regulatory Support Desk</h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Need guidance on your application status or agency clearances?
              </p>
              <div className="mt-4">
                <a 
                  href="tel:09811568676" 
                  className="block w-full py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg border border-slate-700 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 inline mr-1 text-emerald-400" /> Helpline: 09811568676
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PermitStatus
