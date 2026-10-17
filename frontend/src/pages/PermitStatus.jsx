import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { permitService } from '../services/api'
import toast from 'react-hot-toast'
import { getFileViewUrl, handleViewFile } from '../utils/fileUrl'
import { 
  ArrowLeft, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Clock,
  AlertCircle,
  Download,
  Eye,
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
import OrderOfPaymentModal from '../components/permit/OrderOfPaymentModal'
import BusinessPermitCertificate from '../components/permit/BusinessPermitCertificate'

const PermitStatus = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [permit, setPermit] = useState(null)
  const [loading, setLoading] = useState(true)
  const [uploadingDoc, setUploadingDoc] = useState(null)

  // Payment and Certificate Modals State
  const [showOrderPaymentModal, setShowOrderPaymentModal] = useState(false)
  const [showCertificateModal, setShowCertificateModal] = useState(false)
  const [receiptFile, setReceiptFile] = useState(null)
  const [orNumberInput, setOrNumberInput] = useState('')
  const [paymentMethodInput, setPaymentMethodInput] = useState('Treasury Cashier')
  const [receiptDateInput, setReceiptDateInput] = useState(new Date().toISOString().split('T')[0])
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false)

  useEffect(() => {
    fetchPermit()
  }, [id])

  const fetchPermit = async () => {
    try {
      setLoading(true)
      const response = await permitService.getPermit(id)
      const fetchedPermit = response.data?.data?.permit
      setPermit(fetchedPermit)
      if (fetchedPermit?.paymentInfo?.orNumber) {
        setOrNumberInput(fetchedPermit.paymentInfo.orNumber)
      }
      if (fetchedPermit?.paymentInfo?.paymentMethod) {
        setPaymentMethodInput(fetchedPermit.paymentInfo.paymentMethod)
      }
    } catch (error) {
      toast.error('Failed to load permit application dossier')
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleUploadPaymentReceipt = async (e) => {
    e.preventDefault()
    if (!receiptFile && !permit?.paymentInfo?.receiptUrl) {
      return toast.error('Please attach a clear photo or copy of your payment receipt.')
    }
    if (!orNumberInput.trim() && !permit?.paymentInfo?.orNumber) {
      return toast.error('Please enter the Official Receipt (OR) Number.')
    }

    try {
      setIsSubmittingPayment(true)
      const fd = new FormData()
      if (receiptFile) fd.append('receipt', receiptFile)
      fd.append('orNumber', orNumberInput.trim() || permit?.paymentInfo?.orNumber || '')
      fd.append('paymentMethod', paymentMethodInput)
      fd.append('receiptDate', receiptDateInput)

      await permitService.uploadPaymentReceipt(id, fd)
      toast.success('Payment receipt submitted! Queued for Treasury staff verification.')
      fetchPermit()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit payment receipt')
    } finally {
      setIsSubmittingPayment(false)
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
      case 'pending_payment':
        return {
          label: 'Order of Payment Issued • Settle Assessment',
          variant: 'warning',
          icon: CreditCard,
          desc: 'BPLO has finalized your fees assessment. Please view your Order of Payment, settle at the Treasury, and upload your receipt.'
        }
      case 'payment_under_review':
        return {
          label: 'Payment Receipt Under Treasury Verification',
          variant: 'warning',
          icon: Clock,
          desc: 'Your payment receipt proof has been submitted and is currently being verified by the Municipal Treasury.'
        }
      case 'approved':
        return {
          label: 'Payment Verified • Approved by Licensing Board',
          variant: 'success',
          icon: CheckCircle2,
          desc: 'Your payment has been verified by the Treasury. Your Mayor Business Permit is ready for issuance by the BPLO.'
        }
      case 'issued':
        return {
          label: 'Official Mayor\'s Business Permit Issued',
          variant: 'success',
          icon: ShieldCheck,
          desc: 'Your official Mayor\'s Business Permit certificate has been issued. You can view, download, or directly print your municipal permit.'
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
    <div className="min-h-screen bg-transparent pb-20">
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

            {/* 1. ISSUED PERMIT CERTIFICATE SHOWCASE BANNER */}
            {permit.status === 'issued' && (
              <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border-2 border-amber-400/40 relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <div className="inline-flex items-center space-x-2 bg-amber-400/20 px-3 py-1 rounded-full text-xs font-bold text-amber-200 border border-amber-400/30">
                      <ShieldCheck className="w-4 h-4 text-amber-300" />
                      <span>Official Regulatory Permit Certificate Generated</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                      Mayor's Business Permit Issued!
                    </h2>
                    <p className="text-sm text-amber-100 max-w-xl leading-relaxed">
                      Your business permit certificate has been officially issued by the Municipality of Janiuay. You can view the high-resolution certificate, print it, or download the digital copy below.
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-amber-200 pt-1">
                      <span>Permit No: <strong className="font-mono text-white text-sm">{permit.permitNumber}</strong></span>
                      <span>•</span>
                      <span>Business ID: <strong className="font-mono text-white text-sm">{permit.businessIdNumber}</strong></span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-shrink-0">
                    <button
                      onClick={() => setShowCertificateModal(true)}
                      className="px-5 py-3.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-sm rounded-xl transition-all shadow-md flex items-center justify-center"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Certificate
                    </button>
                    <button
                      onClick={() => setShowCertificateModal(true)}
                      className="px-5 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold text-sm rounded-xl transition-all border border-white/20 flex items-center justify-center"
                    >
                      <Printer className="w-4 h-4 mr-2" />
                      Print / Download
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 2. MUNICIPAL TREASURY PAYMENT ASSESSMENT & RECEIPT PROOF (Image 1, 2, 3) */}
            {(permit.assessment?.forwardedToClient || permit.status === 'pending_payment' || permit.status === 'payment_under_review' || permit.paymentInfo?.amount > 0 || permit.status === 'approved' || permit.status === 'issued') && (
              <Card className="border-2 border-primary-200 bg-white shadow-sm overflow-hidden">
                <CardHeader
                  title="Municipal Treasury Assessment & Payment Proof"
                  subtitle="Order of payment voucher and receipt settlement"
                  icon={<CreditCard className="w-5 h-5 text-primary-600" />}
                />
                <CardBody className="space-y-6">
                  {/* Assessment Summary Box */}
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Total Regulatory Assessment
                      </span>
                      <p className="text-3xl font-extrabold text-slate-900 font-mono">
                        ₱{Number(permit.assessment?.fees?.total || permit.paymentInfo?.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-slate-500">
                        Target Payment Date: <strong>{permit.paymentInfo?.receiptDate ? new Date(permit.paymentInfo.receiptDate).toLocaleDateString() : 'Scheduled by Treasury'}</strong>
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        leftIcon={<FileText className="w-4 h-4 text-primary-600" />}
                        onClick={() => setShowOrderPaymentModal(true)}
                      >
                        View / Print Order of Payment
                      </Button>
                    </div>
                  </div>

                  {/* Payment Receipt Status / Upload Form */}
                  {permit.paymentInfo?.paymentStatus === 'verified' || permit.status === 'approved' || permit.status === 'issued' ? (
                    <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-bold text-emerald-950">
                            Payment Verified by Municipal Treasury
                          </p>
                          <p className="text-xs text-emerald-800">
                            Official Receipt (OR) No: <strong>{permit.paymentInfo?.orNumber || 'Recorded in Treasury'}</strong> • Method: <strong>{permit.paymentInfo?.paymentMethod || 'Treasury Cashier'}</strong>
                          </p>
                        </div>
                      </div>
                      {permit.paymentInfo?.receiptUrl && (
                        <a
                          href={getFileViewUrl(permit.paymentInfo.receiptUrl)}
                          onClick={(e) => handleViewFile(e, permit.paymentInfo.receiptUrl)}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center"
                        >
                          <ExternalLink className="w-3.5 h-3.5 mr-1" /> View Receipt
                        </a>
                      )}
                    </div>
                  ) : permit.paymentInfo?.paymentStatus === 'receipt_uploaded' || permit.status === 'payment_under_review' ? (
                    <div className="p-5 bg-sky-50 rounded-2xl border border-sky-200 space-y-3">
                      <div className="flex items-center space-x-3">
                        <Clock className="w-6 h-6 text-sky-600 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-bold text-sky-950">
                            Payment Receipt Submitted • Treasury Verification in Progress
                          </p>
                          <p className="text-xs text-sky-800">
                            OR No: <strong>{permit.paymentInfo?.orNumber || orNumberInput || 'Under audit'}</strong> • Date Paid: <strong>{permit.paymentInfo?.receiptDate ? new Date(permit.paymentInfo.receiptDate).toLocaleDateString() : 'Today'}</strong>
                          </p>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-sky-200/60 flex items-center justify-between text-xs text-sky-900">
                        <span>Treasury staff will verify this payment to trigger permit issuance.</span>
                        {permit.paymentInfo?.receiptUrl && (
                          <a
                            href={getFileViewUrl(permit.paymentInfo.receiptUrl)}
                            onClick={(e) => handleViewFile(e, permit.paymentInfo.receiptUrl)}
                            target="_blank"
                            rel="noreferrer"
                            className="font-bold underline flex items-center"
                          >
                            <ExternalLink className="w-3.5 h-3.5 mr-1" /> View Uploaded Receipt
                          </a>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Receipt Upload Form */
                    <form onSubmit={handleUploadPaymentReceipt} className="space-y-4 p-5 rounded-2xl bg-amber-50/50 border border-amber-200">
                      <div className="flex items-center space-x-2">
                        <Upload className="w-5 h-5 text-amber-700" />
                        <h4 className="text-sm font-bold text-amber-950">
                          Upload Official Payment Receipt (Municipal Treasury Cashier)
                        </h4>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        After paying at the Municipal Treasurer Cashier window, upload your Official Receipt (OR) to allow the admin and treasury to verify your payment.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Official Receipt (OR) Number <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="e.g., OR-2026-8812"
                            value={orNumberInput}
                            onChange={(e) => setOrNumberInput(e.target.value)}
                            required
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold outline-none focus:border-primary-500 bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Payment Method
                          </label>
                          <select
                            value={paymentMethodInput}
                            onChange={(e) => setPaymentMethodInput(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold outline-none focus:border-primary-500 bg-white"
                          >
                            <option value="Treasury Cashier">Treasury Office Cashier (Over-the-Counter)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Date of Payment Receipt
                          </label>
                          <input
                            type="date"
                            value={receiptDateInput}
                            onChange={(e) => setReceiptDateInput(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium outline-none focus:border-primary-500 bg-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Attach Photo / Scanned Copy of Receipt <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                          className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-primary-600 file:text-white hover:file:bg-primary-700 cursor-pointer"
                        />
                        <span className="text-[10px] text-slate-400 mt-1 block">Supported formats: JPG, PNG, WEBP, PDF (Max 5MB)</span>
                      </div>

                      <div className="pt-2 flex justify-end">
                        <Button
                          type="submit"
                          isLoading={isSubmittingPayment}
                          leftIcon={<Upload className="w-4 h-4" />}
                        >
                          Submit Payment Proof to Treasury
                        </Button>
                      </div>
                    </form>
                  )}
                </CardBody>
              </Card>
            )}

            {/* 3. DEFICIENCY / CORRECTION NOTICES (Deleted once complied, granted, or approved) */}
            {permit.status === 'returned_for_correction' && (missingCount > 0 || fireReview.status === 'correction_requested' || sanitationReview.status === 'correction_requested') && (
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
                  {fireReview.status === 'correction_requested' && fireReview.correctionReason && (
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
                  {sanitationReview.status === 'correction_requested' && sanitationReview.correctionReason && (
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
                            href={getFileViewUrl(doc.fileUrl)}
                            onClick={(e) => handleViewFile(e, doc.fileUrl)}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-primary-50 text-slate-700 hover:text-primary-700 font-bold text-xs transition-colors flex items-center cursor-pointer"
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

      {/* Order of Payment Voucher Modal */}
      <OrderOfPaymentModal
        isOpen={showOrderPaymentModal}
        onClose={() => setShowOrderPaymentModal(false)}
        permit={permit}
      />

      {/* Official Municipality of Janiuay Mayor's Business Permit Certificate Modal */}
      <BusinessPermitCertificate
        isOpen={showCertificateModal}
        onClose={() => setShowCertificateModal(false)}
        permit={permit}
      />
    </div>
  )
}

export default PermitStatus
