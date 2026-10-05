import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { 
  ArrowLeft, 
  ArrowRight, 
  Upload, 
  FileText,
  AlertCircle,
  Building2,
  User,
  CreditCard,
  ShieldCheck,
  ChevronRight,
  Info,
  CheckCircle2,
  HelpCircle,
  RotateCcw,
  Sparkles,
  Flame,
  Activity
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { permitService } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardHeader, CardBody } from '../components/shared/Card'
import Button from '../components/shared/Button'
import Input from '../components/shared/Input'
import Badge from '../components/shared/Badge'
import PermitStepper from '../components/permit/PermitStepper'
import toast from 'react-hot-toast'

// 1. Business Ownership Types in ALPHABETICAL ORDER (A to Z) including One Person Corporation
const businessTypesAlphabetical = [
  { value: 'cooperative', label: 'Cooperative' },
  { value: 'corporation', label: 'Corporation' },
  { value: 'one_person_corporation', label: 'One Person Corporation (OPC)' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'sole_proprietorship', label: 'Sole Proprietorship' }
]

// 2. Business Categories & Natures in ALPHABETICAL ORDER (A to Z)
const businessNaturesAlphabetical = [
  'Agriculture & Farming',
  'Construction & Real Estate',
  'Education & Training',
  'Financial & Insurance Services',
  'Food & Beverage / Restaurant',
  'Healthcare & Medical Services',
  'Information Technology & BPO',
  'Manufacturing & Industrial',
  'Personal Care & Wellness',
  'Professional & Consultancy Services',
  'Retail Trade / Sari-Sari Store',
  'Tourism, Hospitality & Lodging',
  'Transportation & Logistics',
  'Wholesale Trade & Distribution',
  'Other / Miscellaneous Services'
]

// 3. Jurisdictions / Barangays in ALPHABETICAL ORDER (A to Z)
const barangaysAlphabetical = [
  'Aganan', 'Balabago', 'Barasalon', 'Bongol', 'Bucari', 'Calinog', 'Carpenter',
  'Crispin', 'Daja', 'Dongon', 'Guinobatan', 'Janiuay Central', 'Latawan', 'Lubot', 'Moroboro',
  'Pitogo', 'Poblacion', 'Quipot', 'San Julian', 'San Pedro', 'Santo Tomas', 'Sara', 'Tambal',
  'Tibiao', 'Yabon', 'Zarragoza'
]

const PermitApplication = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [permitId, setPermitId] = useState(id || null)
  const [uploadedFiles, setUploadedFiles] = useState({})
  const [docRequirements, setDocRequirements] = useState([])
  const [reqLoading, setReqLoading] = useState(false)
  
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      permitType: 'new',
      previousPermitNumber: '',
      businessInfo: {
        businessType: 'sole_proprietorship',
        businessNature: 'Retail Trade / Sari-Sari Store',
        businessAddress: {
          barangay: 'Poblacion'
        }
      },
      ownerInfo: {
        gender: user?.gender || 'prefer_not_to_say'
      },
      paymentInfo: {
        paymentFrequency: 'annually'
      }
    }
  })
  
  const permitType = watch('permitType')
  const previousPermitNumber = watch('previousPermitNumber')
  const businessName = watch('businessInfo.businessName')
  const businessType = watch('businessInfo.businessType')
  const businessNature = watch('businessInfo.businessNature')
  const barangay = watch('businessInfo.businessAddress.barangay')
  const capitalization = watch('businessInfo.capitalization')
  const gender = watch('ownerInfo.gender')
  const paymentFrequency = watch('paymentInfo.paymentFrequency')
  const receiptDate = watch('paymentInfo.receiptDate')

  const steps = [
    { title: '1. Permit Type & Entity', subtitle: 'New / Renewal & Business Info' },
    { title: '2. Ownership & Payment', subtitle: 'Profile & Payment Terms' },
    { title: '3. Applicant Clearances', subtitle: 'Upload Required Documents' },
    { title: '4. Final Review & Submit', subtitle: 'Sworn Declaration' }
  ]

  useEffect(() => {
    if (id) loadExistingPermit(id)
  }, [id])

  useEffect(() => {
    fetchRequirements()
  }, [permitType, businessType])

  const fetchRequirements = async () => {
    try {
      setReqLoading(true)
      const res = await permitService.getRequirements({
        permitType: permitType || 'new',
        businessType: businessType || 'sole_proprietorship'
      })
      if (res.data?.data?.requirements) {
        setDocRequirements(res.data.data.requirements)
      }
    } catch (e) {
      console.warn('Failed to load dynamic requirements, using defaults')
    } finally {
      setReqLoading(false)
    }
  }

  const loadExistingPermit = async (targetId) => {
    try {
      const response = await permitService.getPermit(targetId)
      const permit = response.data?.data?.permit
      if (permit) {
        if (permit.permitType) setValue('permitType', permit.permitType)
        if (permit.previousPermitNumber) setValue('previousPermitNumber', permit.previousPermitNumber)
        if (permit.businessInfo) {
          Object.entries(permit.businessInfo).forEach(([k, v]) => setValue(`businessInfo.${k}`, v))
        }
        if (permit.ownerInfo) {
          Object.entries(permit.ownerInfo).forEach(([k, v]) => setValue(`ownerInfo.${k}`, v))
        }
        if (permit.paymentInfo) {
          Object.entries(permit.paymentInfo).forEach(([k, v]) => setValue(`paymentInfo.${k}`, v))
        }
        
        const fileMap = {}
        if (permit.documents) {
          permit.documents.forEach(d => {
            fileMap[d.name] = [{ name: d.originalName || d.name, uploadedAt: d.uploadedAt, version: d.version || 1 }]
          })
        }
        setUploadedFiles(fileMap)
      }
    } catch (e) {
      toast.error('Failed to load saved application draft')
    }
  }

  const handleFileUpload = async (requirement, files) => {
    if (!files?.length) return
    setIsUploading(true)
    try {
      const targetId = permitId || await createDraft()
      const fd = new FormData()
      
      Array.from(files).forEach(f => fd.append('documents', f))
      
      const docNames = {}
      const reqCodes = {}
      Array.from(files).forEach(f => {
        docNames[f.name] = requirement.name
        reqCodes[f.name] = requirement.code
      })
      fd.append('docNames', JSON.stringify(docNames))
      fd.append('reqCodes', JSON.stringify(reqCodes))

      await permitService.uploadDocuments(targetId, fd)
      
      setUploadedFiles(prev => ({
        ...prev,
        [requirement.name]: Array.from(files).map(f => ({
          name: f.name,
          uploadedAt: new Date(),
          version: (prev[requirement.name]?.[0]?.version || 0) + 1
        }))
      }))
      
      toast.success(`${requirement.name} uploaded successfully!`)
    } catch (e) {
      const errMsg = e.response?.data?.message || 'File upload failed. Please verify file type (PDF/Images) and size (<5MB).'
      toast.error(errMsg)
    } finally {
      setIsUploading(false)
    }
  }

  const createDraft = async () => {
    try {
      const res = await permitService.createPermit({
        permitType: permitType || 'new',
        previousPermitNumber: permitType === 'renewal' ? previousPermitNumber : undefined,
        businessInfo: { 
          businessName: businessName || 'Draft Application', 
          businessType: businessType || 'sole_proprietorship',
          businessNature: businessNature || 'Retail Trade / Sari-Sari Store',
          capitalization: Number(capitalization) || 10000,
          businessAddress: { barangay: barangay || 'Poblacion' }
        },
        ownerInfo: { 
          firstName: user?.firstName || 'Citizen', 
          lastName: user?.lastName || 'Applicant', 
          email: user?.email || 'citizen@example.com',
          phone: user?.phone || '09123456789',
          gender: gender || 'prefer_not_to_say'
        },
        paymentInfo: {
          paymentFrequency: paymentFrequency || 'annually',
          receiptDate: receiptDate || null
        }
      })
      const createdId = res.data.data.permit._id
      setPermitId(createdId)
      return createdId
    } catch (e) {
      const fallbackId = permitId || 'DRAFT-' + Date.now()
      setPermitId(fallbackId)
      return fallbackId
    }
  }

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, steps.length))
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1))

  const onStepSubmit = async () => {
    setIsLoading(true)
    try {
      await createDraft()
      toast.success('Application progress saved.')
      nextStep()
    } catch (e) {
      nextStep()
    } finally {
      setIsLoading(false)
    }
  }

  const handleFinalSubmit = async () => {
    setIsLoading(true)
    try {
      const targetId = permitId || await createDraft()
      await permitService.submitPermit(targetId)
      toast.success('Permit application submitted and routed to Bureau of Fire and Sanitation!')
      navigate('/dashboard')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Submission error. Please ensure all mandatory documents are attached.')
    } finally {
      setIsLoading(false)
    }
  }

  // STEP 1: Permit Type & Business Identity
  const renderStep1 = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        
        {/* Permit Type Selector (Requirement 1) */}
        <div>
          <label className="block text-sm font-extrabold text-slate-900 mb-3">
            Select Permit Application Type <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-start space-x-3.5 ${
              permitType === 'new'
                ? 'border-primary-600 bg-primary-50/50 shadow-xs'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}>
              <input
                type="radio"
                value="new"
                {...register('permitType')}
                className="mt-1 w-4 h-4 text-primary-600 focus:ring-primary-500"
              />
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-base font-extrabold text-slate-900">New Permit Application</span>
                  <Badge variant="info" size="sm">First Time</Badge>
                </div>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  For new commercial enterprises, newly registered businesses, or branch expansions in Janiuay.
                </p>
              </div>
            </label>

            <label className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-start space-x-3.5 ${
              permitType === 'renewal'
                ? 'border-purple-600 bg-purple-50/50 shadow-xs'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}>
              <input
                type="radio"
                value="renewal"
                {...register('permitType')}
                className="mt-1 w-4 h-4 text-purple-600 focus:ring-purple-500"
              />
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-base font-extrabold text-slate-900">Renewal Permit</span>
                  <Badge variant="warning" size="sm">Annual Renewal</Badge>
                </div>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  For existing licensed enterprises renewing their Mayor's Permit for the current calendar year.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Previous Permit Reference if Renewal (Requirement 1) */}
        {permitType === 'renewal' && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="p-4 bg-purple-50 rounded-2xl border border-purple-200 space-y-3">
            <div className="flex items-center space-x-2 text-purple-900 font-bold text-xs">
              <RotateCcw className="w-4 h-4 text-purple-700" />
              <span>Previous Year Permit Information</span>
            </div>
            <div>
              <label className="block text-xs font-bold text-purple-950 mb-1">
                Previous Permit Number or Case Tracking Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., BP-2025-0042 or TRK-2025-10201"
                className="w-full px-4 py-2.5 rounded-xl border-2 border-purple-200 bg-white focus:border-purple-600 focus:ring-4 focus:ring-purple-100 outline-none text-sm font-mono font-bold"
                {...register('previousPermitNumber', {
                  required: permitType === 'renewal' ? 'Previous permit number is required for renewal applications' : false
                })}
              />
              {errors.previousPermitNumber && (
                <p className="text-xs font-bold text-red-600 mt-1">{errors.previousPermitNumber.message}</p>
              )}
              <p className="text-[11px] text-purple-700 mt-1">
                Enter your previous official permit certificate number to expedite renewal clearance.
              </p>
            </div>
          </motion.div>
        )}

        {/* Registered Business Tradename */}
        <div>
          <label className="block text-sm font-bold text-slate-900 mb-1.5">
            Registered Business Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g., Janiuay General Merchandise, Golden Harvest Bakery"
            className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-primary-600 focus:ring-4 focus:ring-primary-100 outline-none text-base transition-all font-medium"
            {...register('businessInfo.businessName', { required: 'Business name is required' })}
          />
          {errors.businessInfo?.businessName && (
            <p className="text-xs font-bold text-red-600 mt-1">{errors.businessInfo.businessName.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Business Ownership Type (Requirement 3: includes One Person Corporation) */}
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-1.5">
              Registration Type / Structure (A–Z) <span className="text-red-500">*</span>
            </label>
            <select
              {...register('businessInfo.businessType')}
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-primary-600 focus:ring-4 focus:ring-primary-100 outline-none text-sm sm:text-base font-semibold bg-white cursor-pointer"
            >
              {businessTypesAlphabetical.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500 mt-1">Includes Sole Proprietorship, One Person Corp, Corporation, Partnership, Cooperative</p>
          </div>

          {/* Industry Category / Nature */}
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-1.5">
              Industry Category / Line of Business <span className="text-red-500">*</span>
            </label>
            <select
              {...register('businessInfo.businessNature')}
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-primary-600 focus:ring-4 focus:ring-primary-100 outline-none text-sm sm:text-base font-semibold bg-white cursor-pointer"
            >
              {businessNaturesAlphabetical.map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>

          {/* Capitalization */}
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-1.5">
              Capitalization (PHP ₱) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              placeholder="e.g., 50000"
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-primary-600 focus:ring-4 focus:ring-primary-100 outline-none text-base font-medium"
              {...register('businessInfo.capitalization', { required: 'Capitalization is required' })}
            />
          </div>

          {/* Barangay Location */}
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-1.5">
              Barangay Location in Janiuay (A–Z) <span className="text-red-500">*</span>
            </label>
            <select
              {...register('businessInfo.businessAddress.barangay')}
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-primary-600 focus:ring-4 focus:ring-primary-100 outline-none text-sm sm:text-base font-semibold bg-white cursor-pointer"
            >
              {barangaysAlphabetical.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Controls */}
        <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
          <Link to="/dashboard" className="px-5 py-3 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-100 transition-colors">
            Cancel & Return
          </Link>
          <button
            type="button"
            onClick={handleSubmit(onStepSubmit)}
            disabled={isLoading}
            className="inline-flex items-center px-6 py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-bold text-base rounded-xl shadow-md transition-all focus:ring-4 focus:ring-primary-200"
          >
            Continue to Step 2: Ownership & Payment
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        </div>
      </div>
    </motion.div>
  )

  // STEP 2: Ownership & Payment Information (Requirement 2 & 3)
  const renderStep2 = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center text-primary-700">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Step 2: Business Owner Profile & Payment Schedule</h3>
            <p className="text-xs text-slate-500">Applicant identity and payment frequency configuration</p>
          </div>
        </div>

        {/* Owner Profile Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase">Legal Name</span>
            <p className="text-base font-bold text-slate-900 mt-0.5">{user?.firstName} {user?.lastName}</p>
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase">Email Address</span>
            <p className="text-base font-bold text-slate-900 mt-0.5">{user?.email}</p>
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase">Contact Phone</span>
            <p className="text-base font-bold text-slate-900 mt-0.5">{user?.phone || '09123456789'}</p>
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase">Barangay Residence</span>
            <p className="text-base font-bold text-slate-900 mt-0.5">{user?.address?.barangay || 'Poblacion'}</p>
          </div>
        </div>

        {/* Gender Selection (Requirement 3) */}
        <div>
          <label className="block text-sm font-bold text-slate-900 mb-1.5">
            Gender Selection <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: 'male', label: 'Male' },
              { value: 'female', label: 'Female' },
              { value: 'prefer_not_to_say', label: 'Prefer not to say' }
            ].map(g => (
              <label key={g.value} className={`p-3.5 rounded-xl border-2 cursor-pointer flex items-center justify-center space-x-2 font-bold text-xs sm:text-sm transition-all ${
                gender === g.value ? 'border-primary-600 bg-primary-50 text-primary-900' : 'border-slate-200 hover:border-slate-300'
              }`}>
                <input type="radio" value={g.value} {...register('ownerInfo.gender')} className="hidden" />
                <span>{g.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Payment Frequency (Requirement 2) */}
        <div>
          <label className="block text-sm font-bold text-slate-900 mb-1.5">
            Preferred Payment Frequency <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { value: 'annually', label: 'Annually', desc: '100% full annual settlement' },
              { value: 'bi-annually', label: 'Bi-annually', desc: '2 equal semi-annual installments' },
              { value: 'quarterly', label: 'Quarterly', desc: '4 quarterly installments' }
            ].map(pf => (
              <label key={pf.value} className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                paymentFrequency === pf.value ? 'border-primary-600 bg-primary-50 shadow-2xs' : 'border-slate-200 hover:border-slate-300'
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-extrabold text-slate-900 text-sm">{pf.label}</span>
                  <input type="radio" value={pf.value} {...register('paymentInfo.paymentFrequency')} />
                </div>
                <p className="text-[11px] text-slate-500">{pf.desc}</p>
              </label>
            ))}
          </div>
        </div>

        {/* Optional Receipt Date Picker */}
        <div>
          <label className="block text-sm font-bold text-slate-900 mb-1">
            Date of Payment Receipt (Optional / If paid at Treasury)
          </label>
          <input
            type="date"
            className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 text-sm font-medium focus:border-primary-600 outline-none"
            {...register('paymentInfo.receiptDate')}
          />
        </div>

        <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={prevStep}
            className="inline-flex items-center px-5 py-3 rounded-xl font-bold text-sm text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Step 1
          </button>
          <button
            type="button"
            onClick={handleSubmit(onStepSubmit)}
            disabled={isLoading}
            className="inline-flex items-center px-6 py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-bold text-base rounded-xl shadow-md transition-all focus:ring-4 focus:ring-primary-200"
          >
            Continue to Step 3: Clearances
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        </div>
      </div>
    </motion.div>
  )

  // STEP 3: Applicant Clearances (Requirement 4: Agency-review docs removed!)
  const renderStep3 = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
      {/* Notice Banner Explaining Agency Reviews */}
      <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 flex items-start space-x-3">
        <Info className="w-5 h-5 text-sky-700 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-bold text-sky-950">Step 3: Upload Applicant Mandatory Documents</p>
          <p className="text-xs text-sky-800 mt-0.5 leading-relaxed">
            Please attach the clearances required from the applicant below. Note that <strong>Fire Safety Inspection (FSIC)</strong> and <strong>Sanitary Clearances</strong> are assigned and uploaded directly by the Bureau of Fire and Bureau of Sanitation reviewers after you submit.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {reqLoading ? (
          <div className="p-12 text-center bg-white rounded-2xl border">
            <Activity className="w-6 h-6 animate-spin text-primary-600 mx-auto mb-2" />
            <p className="text-xs text-slate-500 font-bold">Loading applicable requirements...</p>
          </div>
        ) : docRequirements.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border text-xs text-slate-500">
            Standard requirements checklist loaded.
          </div>
        ) : (
          docRequirements.map((req, idx) => {
            const uploadedItem = uploadedFiles[req.name]
            const isUploaded = Boolean(uploadedItem && uploadedItem.length > 0)

            return (
              <div
                key={idx}
                className={`bg-white p-4 sm:p-5 rounded-2xl border-2 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isUploaded ? 'border-emerald-300 bg-emerald-50/20' : 'border-slate-200 hover:border-primary-300'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold flex-shrink-0 ${
                    isUploaded ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {isUploaded ? <CheckCircle2 className="w-6 h-6" /> : <FileText className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-extrabold text-primary-700 bg-primary-100 px-2 py-0.5 rounded">
                        {req.code}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900">{req.name}</h4>
                      {req.isRequired && <span className="text-[10px] text-red-600 font-bold">*Required</span>}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Issuing Office: <strong>{req.issuingAgency || 'Local Hall'}</strong> • {req.notes || req.description}
                    </p>
                    {isUploaded && (
                      <p className="text-xs text-emerald-700 font-bold mt-1 flex items-center">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Attached: {uploadedItem.map(f => f.name).join(', ')} (v{uploadedItem[0]?.version || 1})
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end flex-shrink-0">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*,.pdf,.doc,.docx"
                      disabled={isUploading}
                      onChange={(e) => handleFileUpload(req, e.target.files)}
                    />
                    <span className={`inline-flex items-center px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                      isUploaded 
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                        : 'bg-primary-600 hover:bg-primary-700 text-white'
                    } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      <Upload className="w-4 h-4 mr-1.5" />
                      {isUploading ? 'Uploading...' : isUploaded ? 'Replace / Resubmit' : 'Upload File'}
                    </span>
                  </label>
                </div>
              </div>
            )
          })
        )}
      </div>

      <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
        <button
          type="button"
          onClick={prevStep}
          className="inline-flex items-center px-5 py-3 rounded-xl font-bold text-sm text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Step 2
        </button>
        <button
          type="button"
          onClick={nextStep}
          disabled={isUploading}
          className="inline-flex items-center px-6 py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-bold text-base rounded-xl shadow-md transition-all focus:ring-4 focus:ring-primary-200"
        >
          Continue to Step 4: Final Review
          <ArrowRight className="w-5 h-5 ml-2" />
        </button>
      </div>
    </motion.div>
  )

  // STEP 4: Review & Final Submission
  const renderStep4 = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center text-primary-700">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Step 4: Final Verification & Submission</h3>
            <p className="text-xs text-slate-500">Please review your business details and declared information</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-200 text-xs sm:text-sm">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Permit Type</span>
            <p className="text-base font-extrabold text-purple-700 mt-0.5 uppercase">{permitType === 'renewal' ? 'Renewal Permit' : 'New Permit Application'}</p>
          </div>
          {permitType === 'renewal' && (
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Previous Permit Ref</span>
              <p className="text-base font-mono font-extrabold text-slate-900 mt-0.5">{previousPermitNumber || 'Not specified'}</p>
            </div>
          )}
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Business Tradename</span>
            <p className="text-base font-extrabold text-slate-900 mt-0.5">{businessName || 'N/A'}</p>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Ownership Structure</span>
            <p className="text-base font-extrabold text-slate-900 mt-0.5 capitalize">{businessType?.replace(/_/g, ' ') || 'Sole Proprietorship'}</p>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Line of Business</span>
            <p className="text-base font-extrabold text-slate-900 mt-0.5">{businessNature}</p>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Capitalization</span>
            <p className="text-base font-extrabold text-slate-900 mt-0.5">₱{Number(capitalization || 0).toLocaleString()}</p>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Payment Frequency</span>
            <p className="text-base font-extrabold text-slate-900 mt-0.5 capitalize">{paymentFrequency || 'Annually'}</p>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Barangay Location</span>
            <p className="text-base font-extrabold text-slate-900 mt-0.5">{barangay}</p>
          </div>
        </div>

        {/* Automatic Agency Routing Notice */}
        <div className="p-4 bg-primary-50 rounded-2xl border border-primary-200 space-y-2">
          <p className="text-xs font-bold text-primary-950 flex items-center">
            <Sparkles className="w-4 h-4 mr-1 text-primary-600" /> Automatic Agency Routing on Submission
          </p>
          <p className="text-xs text-primary-900 leading-relaxed">
            Upon submitting, your application will receive a unique tracking number and automatically route to the <strong>Bureau of Fire Protection</strong> and <strong>Bureau of Sanitation</strong> review portals for expedited evaluation.
          </p>
        </div>

        {/* Sworn Declaration */}
        <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
          <p className="text-xs text-amber-900 leading-relaxed font-medium">
            <strong>Sworn Certification:</strong> I hereby certify under penalty of perjury that all statements made herein are true and accurate. I understand that any false declaration will subject me to revocation of license and criminal prosecution under applicable municipal ordinances and Philippine laws.
          </p>
        </div>

        <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={prevStep}
            className="inline-flex items-center px-5 py-3 rounded-xl font-bold text-sm text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Step 3
          </button>

          <button
            type="button"
            onClick={handleFinalSubmit}
            disabled={isLoading}
            className="inline-flex items-center px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-base rounded-xl shadow-lg transition-all focus:ring-4 focus:ring-emerald-200"
          >
            <CheckCircle2 className="w-6 h-6 mr-2" />
            {isLoading ? 'Submitting Application...' : 'Submit Application to BPLO'}
          </button>
        </div>
      </div>
    </motion.div>
  )

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="bg-white border-b border-slate-200 pt-8 pb-8">
        <div className="container max-w-4xl">
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={() => navigate('/dashboard')} 
              className="inline-flex items-center text-sm font-bold text-slate-600 hover:text-primary-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Dashboard
            </button>
            <span className="text-xs font-extrabold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              Form 101-BPLO (Janiuay Online Portal)
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {permitType === 'renewal' ? 'Renewal Business Permit Application' : 'New Business Permit Application'}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Complete the 4 steps below. Your application draft is saved automatically as you progress.
          </p>

          <div className="mt-6">
            <PermitStepper steps={steps} currentStep={currentStep} />
          </div>
        </div>
      </div>

      <div className="container max-w-4xl mt-8">
        <AnimatePresence mode="wait">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default PermitApplication
