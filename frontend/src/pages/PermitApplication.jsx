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
  Activity,
  Eye,
  MapPin,
  Briefcase,
  Users,
  Truck,
  Building,
  Check
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { permitService } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardHeader, CardBody } from '../components/shared/Card'
import Button from '../components/shared/Button'
import Input from '../components/shared/Input'
import Badge from '../components/shared/Badge'
import PermitStepper from '../components/permit/PermitStepper'
import UnifiedApplicationFormModal from '../components/permit/UnifiedApplicationFormModal'
import { JANIUAY_BARANGAYS } from '../constants/barangays'
import toast from 'react-hot-toast'

// 1. Business Ownership Types in ALPHABETICAL ORDER (A to Z)
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

// 3. Official 60 Barangays of Janiuay, Iloilo in ALPHABETICAL ORDER (A to Z)
const barangaysAlphabetical = JANIUAY_BARANGAYS

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
  
  // UAF Modal Preview State
  const [showUafPreview, setShowUafPreview] = useState(false)
  const [previewPermitData, setPreviewPermitData] = useState(null)

  const { register, handleSubmit, watch, setValue, getValues, formState: { errors } } = useForm({
    defaultValues: {
      permitType: 'new',
      previousPermitNumber: '',
      businessInfo: {
        businessName: '',
        tradeName: '',
        registrationNumber: '',
        tin: '',
        businessType: 'sole_proprietorship',
        businessNature: 'Retail Trade / Sari-Sari Store',
        capitalization: '',
        grossSales: '',
        businessAddress: {
          houseNo: '',
          buildingName: '',
          lotNo: '',
          blockNo: '',
          street: 'Main Street',
          subdivision: '',
          barangay: 'Don T. Lutero Center (Poblacion)',
          municipality: 'Janiuay',
          province: 'Iloilo',
          zipCode: '5034'
        },
        businessArea: 35,
        employees: {
          male: 1,
          female: 1,
          residingInCity: 2
        },
        deliveryVehicles: {
          vanTruck: 0,
          motorcycle: 1
        },
        propertyOwnership: {
          isOwned: true,
          taxDeclarationNo: ''
        },
        taxIncentives: {
          hasIncentives: false
        },
        businessActivity: 'main_office',
        lineOfBusiness: {
          psic: '47111',
          productsServices: 'Commercial Retail Goods & Supplies',
          units: 1
        }
      },
      ownerInfo: {
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        middleName: '',
        suffix: '',
        gender: user?.gender || 'prefer_not_to_say',
        phone: user?.phone || '',
        tel: '(033) 330-1288',
        email: user?.email || '',
        designation: 'Proprietor',
        corporateOfficer: {
          firstName: '',
          lastName: '',
          middleName: '',
          suffix: '',
          nationality: 'filipino'
        }
      },
      paymentInfo: {
        paymentFrequency: 'annually',
        receiptDate: ''
      }
    }
  })

  const permitType = watch('permitType')
  const previousPermitNumber = watch('previousPermitNumber')
  const businessName = watch('businessInfo.businessName')
  const tradeName = watch('businessInfo.tradeName')
  const businessType = watch('businessInfo.businessType')
  const businessNature = watch('businessInfo.businessNature')
  const capitalization = watch('businessInfo.capitalization')
  const grossSales = watch('businessInfo.grossSales')
  const barangay = watch('businessInfo.businessAddress.barangay')
  const gender = watch('ownerInfo.gender')
  const designation = watch('ownerInfo.designation')
  const isPropertyOwned = watch('businessInfo.propertyOwnership.isOwned')
  const hasTaxIncentives = watch('businessInfo.taxIncentives.hasIncentives')
  const businessActivity = watch('businessInfo.businessActivity')
  const paymentFrequency = watch('paymentInfo.paymentFrequency')
  const receiptDate = watch('paymentInfo.receiptDate')

  const isCorpOrPartnership = ['corporation', 'partnership', 'cooperative', 'one_person_corporation'].includes(businessType)

  const steps = [
    { title: '1. Business Identity & Address', subtitle: 'Entity Info, TIN & Location' },
    { title: '2. Operations & Ownership', subtitle: 'Profile, Assets & Schedule' },
    { title: '3. Applicant Clearances', subtitle: 'Upload Required Documents' },
    { title: '4. Final Review & Submit', subtitle: 'Sworn Declaration & UAF' }
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
          const bi = permit.businessInfo
          setValue('businessInfo.businessName', bi.businessName || '')
          setValue('businessInfo.tradeName', bi.tradeName || '')
          setValue('businessInfo.registrationNumber', bi.registrationNumber || '')
          setValue('businessInfo.tin', bi.tin || '')
          setValue('businessInfo.businessType', bi.businessType || 'sole_proprietorship')
          setValue('businessInfo.businessNature', bi.businessNature || 'Retail Trade / Sari-Sari Store')
          setValue('businessInfo.capitalization', bi.capitalization || '')
          setValue('businessInfo.grossSales', bi.grossSales || '')
          setValue('businessInfo.businessArea', bi.businessArea || 35)
          setValue('businessInfo.businessActivity', bi.businessActivity || 'main_office')

          if (bi.businessAddress) {
            setValue('businessInfo.businessAddress.houseNo', bi.businessAddress.houseNo || '')
            setValue('businessInfo.businessAddress.buildingName', bi.businessAddress.buildingName || '')
            setValue('businessInfo.businessAddress.lotNo', bi.businessAddress.lotNo || '')
            setValue('businessInfo.businessAddress.blockNo', bi.businessAddress.blockNo || '')
            setValue('businessInfo.businessAddress.street', bi.businessAddress.street || 'Main Street')
            setValue('businessInfo.businessAddress.subdivision', bi.businessAddress.subdivision || '')
            setValue('businessInfo.businessAddress.barangay', bi.businessAddress.barangay || 'Don T. Lutero Center (Poblacion)')
            setValue('businessInfo.businessAddress.municipality', bi.businessAddress.municipality || 'Janiuay')
            setValue('businessInfo.businessAddress.province', bi.businessAddress.province || 'Iloilo')
            setValue('businessInfo.businessAddress.zipCode', bi.businessAddress.zipCode || '5034')
          }
          if (bi.employees) {
            setValue('businessInfo.employees.male', bi.employees.male ?? 1)
            setValue('businessInfo.employees.female', bi.employees.female ?? 1)
            setValue('businessInfo.employees.residingInCity', bi.employees.residingInCity ?? 2)
          }
          if (bi.deliveryVehicles) {
            setValue('businessInfo.deliveryVehicles.vanTruck', bi.deliveryVehicles.vanTruck ?? 0)
            setValue('businessInfo.deliveryVehicles.motorcycle', bi.deliveryVehicles.motorcycle ?? 1)
          }
          if (bi.propertyOwnership) {
            setValue('businessInfo.propertyOwnership.isOwned', bi.propertyOwnership.isOwned !== undefined ? bi.propertyOwnership.isOwned : true)
            setValue('businessInfo.propertyOwnership.taxDeclarationNo', bi.propertyOwnership.taxDeclarationNo || '')
          }
          if (bi.taxIncentives) {
            setValue('businessInfo.taxIncentives.hasIncentives', Boolean(bi.taxIncentives.hasIncentives))
          }
          if (bi.lineOfBusiness) {
            setValue('businessInfo.lineOfBusiness.psic', bi.lineOfBusiness.psic || '47111')
            setValue('businessInfo.lineOfBusiness.productsServices', bi.lineOfBusiness.productsServices || '')
            setValue('businessInfo.lineOfBusiness.units', bi.lineOfBusiness.units || 1)
          }
        }

        if (permit.ownerInfo) {
          const oi = permit.ownerInfo
          setValue('ownerInfo.firstName', oi.firstName || '')
          setValue('ownerInfo.lastName', oi.lastName || '')
          setValue('ownerInfo.middleName', oi.middleName || '')
          setValue('ownerInfo.suffix', oi.suffix || '')
          setValue('ownerInfo.gender', oi.gender || 'prefer_not_to_say')
          setValue('ownerInfo.phone', oi.phone || '')
          setValue('ownerInfo.tel', oi.tel || '')
          setValue('ownerInfo.email', oi.email || '')
          setValue('ownerInfo.designation', oi.designation || 'Proprietor')
          if (oi.corporateOfficer) {
            setValue('ownerInfo.corporateOfficer.firstName', oi.corporateOfficer.firstName || '')
            setValue('ownerInfo.corporateOfficer.lastName', oi.corporateOfficer.lastName || '')
            setValue('ownerInfo.corporateOfficer.middleName', oi.corporateOfficer.middleName || '')
            setValue('ownerInfo.corporateOfficer.suffix', oi.corporateOfficer.suffix || '')
            setValue('ownerInfo.corporateOfficer.nationality', oi.corporateOfficer.nationality || 'filipino')
          }
        }

        if (permit.paymentInfo) {
          const pi = permit.paymentInfo
          setValue('paymentInfo.paymentFrequency', pi.paymentFrequency || 'annually')
          if (pi.receiptDate) {
            setValue('paymentInfo.receiptDate', new Date(pi.receiptDate).toISOString().split('T')[0])
          }
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

  const isValidObjectId = (checkId) => typeof checkId === 'string' && /^[0-9a-fA-F]{24}$/.test(checkId)

  const saveOrUpdateDraft = async (formData) => {
    try {
      const data = formData || getValues()
      const pType = data.permitType || 'new'
      const bInfo = data.businessInfo || {}
      const oInfo = data.ownerInfo || {}
      const pInfo = data.paymentInfo || {}

      const payload = {
        permitType: pType,
        previousPermitNumber: pType === 'renewal' ? data.previousPermitNumber : undefined,
        businessInfo: {
          businessName: bInfo.businessName || 'Business Application',
          tradeName: bInfo.tradeName || bInfo.businessName || '',
          registrationNumber: bInfo.registrationNumber || '',
          tin: bInfo.tin || '',
          businessType: bInfo.businessType || 'sole_proprietorship',
          businessNature: bInfo.businessNature || 'Retail Trade / Sari-Sari Store',
          capitalization: Number(bInfo.capitalization) || 10000,
          grossSales: pType === 'renewal' ? (Number(bInfo.grossSales) || 0) : 0,
          businessAddress: {
            houseNo: bInfo.businessAddress?.houseNo || '',
            buildingName: bInfo.businessAddress?.buildingName || '',
            lotNo: bInfo.businessAddress?.lotNo || '',
            blockNo: bInfo.businessAddress?.blockNo || '',
            street: bInfo.businessAddress?.street || 'Main Street',
            subdivision: bInfo.businessAddress?.subdivision || '',
            barangay: bInfo.businessAddress?.barangay || 'Don T. Lutero Center (Poblacion)',
            municipality: bInfo.businessAddress?.municipality || 'Janiuay',
            province: bInfo.businessAddress?.province || 'Iloilo',
            zipCode: bInfo.businessAddress?.zipCode || '5034'
          },
          businessArea: Number(bInfo.businessArea) || 35,
          employees: {
            male: Number(bInfo.employees?.male) || 0,
            female: Number(bInfo.employees?.female) || 0,
            residingInCity: Number(bInfo.employees?.residingInCity) || 0
          },
          deliveryVehicles: {
            vanTruck: Number(bInfo.deliveryVehicles?.vanTruck) || 0,
            motorcycle: Number(bInfo.deliveryVehicles?.motorcycle) || 0
          },
          propertyOwnership: {
            isOwned: bInfo.propertyOwnership?.isOwned !== undefined ? Boolean(bInfo.propertyOwnership.isOwned) : true,
            taxDeclarationNo: bInfo.propertyOwnership?.taxDeclarationNo || ''
          },
          taxIncentives: {
            hasIncentives: Boolean(bInfo.taxIncentives?.hasIncentives)
          },
          businessActivity: bInfo.businessActivity || 'main_office',
          lineOfBusiness: {
            psic: bInfo.lineOfBusiness?.psic || '47111',
            productsServices: bInfo.lineOfBusiness?.productsServices || 'Commercial Retail Goods & Supplies',
            units: Number(bInfo.lineOfBusiness?.units) || 1
          }
        },
        ownerInfo: {
          firstName: oInfo.firstName || user?.firstName || 'Citizen',
          lastName: oInfo.lastName || user?.lastName || 'Applicant',
          middleName: oInfo.middleName || '',
          suffix: oInfo.suffix || '',
          gender: oInfo.gender || user?.gender || 'prefer_not_to_say',
          phone: oInfo.phone || user?.phone || '09123456789',
          tel: oInfo.tel || '',
          email: oInfo.email || user?.email || 'citizen@example.com',
          designation: oInfo.designation || (bInfo.businessType === 'sole_proprietorship' ? 'Proprietor' : 'President'),
          corporateOfficer: {
            firstName: oInfo.corporateOfficer?.firstName || '',
            lastName: oInfo.corporateOfficer?.lastName || '',
            middleName: oInfo.corporateOfficer?.middleName || '',
            suffix: oInfo.corporateOfficer?.suffix || '',
            nationality: oInfo.corporateOfficer?.nationality || 'filipino'
          }
        },
        paymentInfo: {
          paymentFrequency: pInfo.paymentFrequency || 'annually',
          receiptDate: pInfo.receiptDate || null
        }
      }

      if (isValidObjectId(permitId)) {
        await permitService.updatePermit(permitId, payload)
        return permitId
      } else {
        const res = await permitService.createPermit(payload)
        const newId = res.data?.data?.permit?._id
        if (newId) {
          setPermitId(newId)
          return newId
        }
        throw new Error('Could not initialize application')
      }
    } catch (err) {
      console.error('saveOrUpdateDraft error:', err)
      throw err
    }
  }

  const handleFileUpload = async (requirement, files) => {
    if (!files?.length) return
    setIsUploading(true)
    try {
      let targetId = permitId
      if (!isValidObjectId(targetId)) {
        targetId = await saveOrUpdateDraft(getValues())
      }
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
      const errMsg = e.response?.data?.message || e.message || 'File upload failed. Please verify file type (PDF/Images) and size (<5MB).'
      toast.error(errMsg, { duration: 5000 })
    } finally {
      setIsUploading(false)
    }
  }

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, steps.length))
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1))

  const onStepSubmit = async (formData) => {
    setIsLoading(true)
    try {
      await saveOrUpdateDraft(formData)
      toast.success('Application progress saved.')
      nextStep()
    } catch (e) {
      toast.error(e.response?.data?.message || 'Please review required fields before continuing.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStep3Continue = () => {
    if (docRequirements.length > 0) {
      const missing = docRequirements.filter(req => {
        const uploadedItem = uploadedFiles[req.name]
        return !uploadedItem || uploadedItem.length === 0
      })

      if (missing.length > 0) {
        toast.error(
          `Missed Information: All clearances are mandatory. Please attach: ${missing.map(m => m.name).join(', ')}`,
          { duration: 5000 }
        )
        return
      }
    }
    nextStep()
  }

  const handleOpenUafPreview = async () => {
    try {
      setIsLoading(true)
      let targetId = permitId
      if (!isValidObjectId(targetId)) {
        targetId = await saveOrUpdateDraft(getValues())
      } else {
        await saveOrUpdateDraft(getValues())
      }
      const res = await permitService.getPermit(targetId)
      if (res.data?.data?.permit) {
        setPreviewPermitData(res.data.data.permit)
        setShowUafPreview(true)
      }
    } catch (err) {
      toast.error('Could not generate preview: ' + (err.message || 'Error'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleFinalSubmit = async () => {
    setIsLoading(true)
    try {
      let targetId = permitId
      if (!isValidObjectId(targetId)) {
        targetId = await saveOrUpdateDraft(getValues())
      } else {
        await saveOrUpdateDraft(getValues())
      }
      await permitService.submitPermit(targetId)
      toast.success('Permit application submitted and routed to Bureau of Fire and Sanitation!')
      navigate('/dashboard')
    } catch (error) {
      const errMsg = error.response?.data?.message || error.message || 'Submission error. Please ensure all mandatory documents are attached.'
      toast.error(errMsg, { duration: 6000 })
    } finally {
      setIsLoading(false)
    }
  }

  // STEP 1: Permit Type, Registration & Main Office Address (UAF Section A)
  const renderStep1 = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
      <div className="bg-white rounded-2xl p-5 sm:p-8 border border-slate-200 shadow-xs relative overflow-hidden">
        <div className="relative z-10 space-y-6">
          
          {/* Header Title */}
          <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center text-primary-700 font-bold shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Step 1: Permit Type, Business Identity &amp; Address</h3>
              <p className="text-xs text-slate-500">Official Unified Application Form (UAF-2026 Section A) Requirements</p>
            </div>
          </div>

          {/* 1. Permit Type Selector */}
          <div>
            <label className="block text-sm font-extrabold text-slate-900 mb-3">
              Application Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start space-x-3.5 ${
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

              <label className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start space-x-3.5 ${
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

          {/* Previous Permit & Gross Sales for Renewal */}
          {permitType === 'renewal' && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="p-5 bg-purple-50 rounded-2xl border border-purple-200 space-y-4">
              <div className="flex items-center space-x-2 text-purple-900 font-bold text-xs">
                <RotateCcw className="w-4 h-4 text-purple-700" />
                <span>Renewal Assessment Declarations (UAF Required)</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-purple-950 mb-1">
                    Previous Permit / Tracking Number <span className="text-red-500">*</span>
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
                </div>
                <div>
                  <label className="block text-xs font-bold text-purple-950 mb-1">
                    Previous Calendar Year Gross Sales / Receipts (PHP ₱) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="e.g., 250000"
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-purple-200 bg-white focus:border-purple-600 focus:ring-4 focus:ring-purple-100 outline-none text-sm font-mono font-bold"
                    {...register('businessInfo.grossSales', {
                      required: permitType === 'renewal' ? 'Gross sales declaration is required for renewal' : false
                    })}
                  />
                  <p className="text-[11px] text-purple-700 mt-1">Used to compute official tax assessment on Page 2 of the UAF.</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* 2. Business Entity Identity Card */}
          <div className="border border-slate-200 rounded-2xl p-4 sm:p-5 bg-slate-50/50 space-y-4">
            <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center">
              <Briefcase className="w-4 h-4 mr-1.5 text-primary-600" /> Business Identity &amp; Government Registration
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Registered Business Name */}
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">
                  Registered Business Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Janiuay General Merchandise"
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-primary-600 focus:ring-4 focus:ring-primary-100 outline-none text-sm font-medium bg-white"
                  {...register('businessInfo.businessName', { required: 'Business name is required' })}
                />
                {errors.businessInfo?.businessName && (
                  <p className="text-xs font-bold text-red-600 mt-1">{errors.businessInfo.businessName.message}</p>
                )}
              </div>

              {/* Trade Name / Franchise */}
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">
                  Trade Name / Franchise <span className="text-slate-400 font-normal">(Optional if same as business name)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Golden Harvest Janiuay Branch"
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-primary-600 focus:ring-4 focus:ring-primary-100 outline-none text-sm font-medium bg-white"
                  {...register('businessInfo.tradeName')}
                />
              </div>

              {/* Business Ownership Type */}
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">
                  Registration Type / Structure (A–Z) <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('businessInfo.businessType')}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-primary-600 focus:ring-4 focus:ring-primary-100 outline-none text-sm font-semibold bg-white cursor-pointer"
                >
                  {businessTypesAlphabetical.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              {/* DTI / CDA / SEC Registration Number */}
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">
                  DTI / SEC / CDA Registration Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., 2026-DTI-89102 or CS-2026-00129"
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-primary-600 focus:ring-4 focus:ring-primary-100 outline-none text-sm font-mono font-medium bg-white"
                  {...register('businessInfo.registrationNumber', { required: 'Official registration number is required' })}
                />
                {errors.businessInfo?.registrationNumber && (
                  <p className="text-xs font-bold text-red-600 mt-1">{errors.businessInfo.registrationNumber.message}</p>
                )}
              </div>

              {/* Tax Identification Number (TIN) */}
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">
                  Tax Identification Number (TIN) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., 009-842-192-000"
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-primary-600 focus:ring-4 focus:ring-primary-100 outline-none text-sm font-mono font-medium bg-white"
                  {...register('businessInfo.tin', { required: 'Business/Owner TIN is required' })}
                />
                {errors.businessInfo?.tin && (
                  <p className="text-xs font-bold text-red-600 mt-1">{errors.businessInfo.tin.message}</p>
                )}
              </div>

              {/* Industry Category / Nature */}
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">
                  Industry Category / Nature <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('businessInfo.businessNature')}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-primary-600 focus:ring-4 focus:ring-primary-100 outline-none text-sm font-semibold bg-white cursor-pointer"
                >
                  {businessNaturesAlphabetical.map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>

              {/* Capitalization */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-900 mb-1">
                  Initial Capitalization (PHP ₱) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  placeholder="e.g., 50000"
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-primary-600 focus:ring-4 focus:ring-primary-100 outline-none text-sm font-mono font-bold bg-white"
                  {...register('businessInfo.capitalization', { required: 'Capitalization is required' })}
                />
                {errors.businessInfo?.capitalization && (
                  <p className="text-xs font-bold text-red-600 mt-1">{errors.businessInfo.capitalization.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* 3. Main Office Address (UAF Section A Address Breakdown) */}
          <div className="border border-slate-200 rounded-2xl p-4 sm:p-5 bg-slate-50/50 space-y-4">
            <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center">
              <MapPin className="w-4 h-4 mr-1.5 text-primary-600" /> Main Office Address Breakdown (UAF Section A)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">House / Building No.</label>
                <input
                  type="text"
                  placeholder="e.g., Bldg 2 or Door 1"
                  className="w-full px-3.5 py-2 rounded-xl border-2 border-slate-200 text-sm bg-white outline-none focus:border-primary-600"
                  {...register('businessInfo.businessAddress.houseNo')}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">Building Name</label>
                <input
                  type="text"
                  placeholder="e.g., Janiuay Commercial Plaza"
                  className="w-full px-3.5 py-2 rounded-xl border-2 border-slate-200 text-sm bg-white outline-none focus:border-primary-600"
                  {...register('businessInfo.businessAddress.buildingName')}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">Lot No. / Block No.</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Lot 4"
                    className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 text-sm bg-white outline-none focus:border-primary-600"
                    {...register('businessInfo.businessAddress.lotNo')}
                  />
                  <input
                    type="text"
                    placeholder="Blk 2"
                    className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 text-sm bg-white outline-none focus:border-primary-600"
                    {...register('businessInfo.businessAddress.blockNo')}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">Street Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  placeholder="e.g., Aquino Noble St"
                  className="w-full px-3.5 py-2 rounded-xl border-2 border-slate-200 text-sm bg-white outline-none focus:border-primary-600"
                  {...register('businessInfo.businessAddress.street', { required: 'Street name is required' })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">Subdivision / Zone</label>
                <input
                  type="text"
                  placeholder="e.g., Commercial Zone"
                  className="w-full px-3.5 py-2 rounded-xl border-2 border-slate-200 text-sm bg-white outline-none focus:border-primary-600"
                  {...register('businessInfo.businessAddress.subdivision')}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">
                  Barangay in Janiuay (A–Z) <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('businessInfo.businessAddress.barangay')}
                  className="w-full px-3.5 py-2 rounded-xl border-2 border-slate-200 text-sm font-semibold bg-white outline-none focus:border-primary-600 cursor-pointer"
                >
                  {barangaysAlphabetical.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">City / Municipality</label>
                <input
                  type="text"
                  value="Janiuay"
                  readOnly
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm bg-slate-100 text-slate-600 font-bold"
                  {...register('businessInfo.businessAddress.municipality')}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">Province</label>
                <input
                  type="text"
                  value="Iloilo"
                  readOnly
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm bg-slate-100 text-slate-600 font-bold"
                  {...register('businessInfo.businessAddress.province')}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">Postal Zip Code</label>
                <input
                  type="text"
                  value="5034"
                  readOnly
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm bg-slate-100 text-slate-600 font-mono font-bold"
                  {...register('businessInfo.businessAddress.zipCode')}
                />
              </div>
            </div>
          </div>

          {/* Action Controls */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
            <Link to="/dashboard" className="px-5 py-3 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-100 transition-colors">
              Cancel &amp; Return
            </Link>
            <button
              type="button"
              onClick={handleSubmit(onStepSubmit)}
              disabled={isLoading}
              className="inline-flex items-center px-6 py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-bold text-base rounded-xl shadow-md transition-all focus:ring-4 focus:ring-primary-200"
            >
              Continue to Step 2: Ownership &amp; Operations
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )

  // STEP 2: Ownership Profile, Corporate Officers, Operations & Payment (UAF Section A & B)
  const renderStep2 = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
      <div className="bg-white rounded-2xl p-5 sm:p-8 border border-slate-200 shadow-xs relative overflow-hidden">
        <div className="relative z-10 space-y-6">
          
          {/* Header Title */}
          <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center text-primary-700 font-bold shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Step 2: Business Owner, Operations &amp; Payment Schedule</h3>
              <p className="text-xs text-slate-500">Applicant identity, operational scale (UAF Section B), and municipal treasury terms</p>
            </div>
          </div>

          {/* 1. Sole Proprietor / Signatory Profile */}
          <div className="border border-slate-200 rounded-2xl p-4 sm:p-5 bg-slate-50/50 space-y-4">
            <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center">
              <User className="w-4 h-4 mr-1.5 text-primary-600" /> Applicant / Owner Personal Details
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">Given (First) Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  placeholder="Juan"
                  className="w-full px-3.5 py-2 rounded-xl border-2 border-slate-200 text-sm bg-white outline-none focus:border-primary-600 font-medium"
                  {...register('ownerInfo.firstName', { required: 'First name is required' })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">Middle Name</label>
                <input
                  type="text"
                  placeholder="Santos"
                  className="w-full px-3.5 py-2 rounded-xl border-2 border-slate-200 text-sm bg-white outline-none focus:border-primary-600 font-medium"
                  {...register('ownerInfo.middleName')}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">Surname (Last Name) <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  placeholder="Dela Cruz"
                  className="w-full px-3.5 py-2 rounded-xl border-2 border-slate-200 text-sm bg-white outline-none focus:border-primary-600 font-medium"
                  {...register('ownerInfo.lastName', { required: 'Last name is required' })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">Suffix</label>
                <select
                  {...register('ownerInfo.suffix')}
                  className="w-full px-3.5 py-2 rounded-xl border-2 border-slate-200 text-sm bg-white outline-none focus:border-primary-600 cursor-pointer"
                >
                  <option value="">None</option>
                  <option value="Jr.">Jr.</option>
                  <option value="Sr.">Sr.</option>
                  <option value="II">II</option>
                  <option value="III">III</option>
                  <option value="IV">IV</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">Mobile Phone <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  placeholder="09XXXXXXXXX"
                  className="w-full px-3.5 py-2 rounded-xl border-2 border-slate-200 text-sm font-mono bg-white outline-none focus:border-primary-600"
                  {...register('ownerInfo.phone', { 
                    required: 'Mobile phone is required',
                    pattern: { value: /^09\d{9}$/, message: 'Please enter valid Philippine mobile number (09XXXXXXXXX)' }
                  })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">Telephone / Landline</label>
                <input
                  type="text"
                  placeholder="(033) 330-1288"
                  className="w-full px-3.5 py-2 rounded-xl border-2 border-slate-200 text-sm bg-white outline-none focus:border-primary-600"
                  {...register('ownerInfo.tel')}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">Email Address <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  placeholder="citizen@example.com"
                  className="w-full px-3.5 py-2 rounded-xl border-2 border-slate-200 text-sm bg-white outline-none focus:border-primary-600"
                  {...register('ownerInfo.email', { required: 'Email address is required' })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">Official Designation / Title</label>
                <input
                  type="text"
                  placeholder="Proprietor / President"
                  className="w-full px-3.5 py-2 rounded-xl border-2 border-slate-200 text-sm bg-white outline-none focus:border-primary-600 font-medium"
                  {...register('ownerInfo.designation')}
                />
              </div>
            </div>

            {/* Gender Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1.5">
                Owner Gender Selection <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'male', label: 'Male' },
                  { value: 'female', label: 'Female' },
                  { value: 'prefer_not_to_say', label: 'Prefer not to say' }
                ].map(g => (
                  <label key={g.value} className={`p-3 rounded-xl border-2 cursor-pointer flex items-center justify-center space-x-2 font-bold text-xs transition-all ${
                    gender === g.value ? 'border-primary-600 bg-primary-50 text-primary-900' : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}>
                    <input type="radio" value={g.value} {...register('ownerInfo.gender')} className="hidden" />
                    <span>{g.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* 2. Corporate Officer / President (Conditional for Corp/Partnership/Coop) */}
          {isCorpOrPartnership && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="border border-blue-200 rounded-2xl p-4 sm:p-5 bg-blue-50/40 space-y-4">
              <h4 className="text-xs font-extrabold text-blue-900 uppercase tracking-wider flex items-center">
                <Building className="w-4 h-4 mr-1.5 text-blue-700" /> Corporate Officer / President in Charge (For Corp/Partnership/Coop)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                <div>
                  <label className="block text-xs font-bold text-blue-950 mb-1">First Name</label>
                  <input
                    type="text"
                    placeholder="Officer First Name"
                    className="w-full px-3 py-2 rounded-xl border border-blue-200 text-sm bg-white outline-none"
                    {...register('ownerInfo.corporateOfficer.firstName')}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-blue-950 mb-1">Middle Name</label>
                  <input
                    type="text"
                    placeholder="Middle Name"
                    className="w-full px-3 py-2 rounded-xl border border-blue-200 text-sm bg-white outline-none"
                    {...register('ownerInfo.corporateOfficer.middleName')}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-blue-950 mb-1">Surname</label>
                  <input
                    type="text"
                    placeholder="Officer Surname"
                    className="w-full px-3 py-2 rounded-xl border border-blue-200 text-sm bg-white outline-none"
                    {...register('ownerInfo.corporateOfficer.lastName')}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-blue-950 mb-1">Suffix</label>
                  <input
                    type="text"
                    placeholder="None, Jr."
                    className="w-full px-3 py-2 rounded-xl border border-blue-200 text-sm bg-white outline-none"
                    {...register('ownerInfo.corporateOfficer.suffix')}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-blue-950 mb-1">Nationality</label>
                  <select
                    {...register('ownerInfo.corporateOfficer.nationality')}
                    className="w-full px-3 py-2 rounded-xl border border-blue-200 text-sm bg-white outline-none font-bold cursor-pointer"
                  >
                    <option value="filipino">Filipino</option>
                    <option value="foreign">Foreign</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}

          {/* 3. Business Operation (UAF Section B Breakdown) */}
          <div className="border border-slate-200 rounded-2xl p-4 sm:p-5 bg-slate-50/50 space-y-4">
            <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center">
              <Activity className="w-4 h-4 mr-1.5 text-primary-600" /> Business Operation Parameters (UAF Section B)
            </h4>

            {/* Business Activity Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1.5">
                Principal Business Activity <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[
                  { value: 'main_office', label: 'Main Office' },
                  { value: 'branch_office', label: 'Branch Office' },
                  { value: 'admin_office', label: 'Admin Only' },
                  { value: 'warehouse', label: 'Warehouse' },
                  { value: 'others', label: 'Others' }
                ].map(act => (
                  <label key={act.value} className={`p-2.5 rounded-xl border-2 cursor-pointer text-center font-bold text-xs transition-all ${
                    businessActivity === act.value ? 'border-primary-600 bg-primary-50 text-primary-900' : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}>
                    <input type="radio" value={act.value} {...register('businessInfo.businessActivity')} className="hidden" />
                    <span>{act.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Dimensions, Employees & Vehicles Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">
                  Total Floor Area (sq. meters) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g., 48.5"
                  className="w-full px-3.5 py-2 rounded-xl border-2 border-slate-200 text-sm font-mono font-bold bg-white outline-none focus:border-primary-600"
                  {...register('businessInfo.businessArea', { required: 'Floor area is required' })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">Establishment Employees</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Male"
                    title="Male Employees"
                    className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 text-sm bg-white outline-none focus:border-primary-600 font-mono"
                    {...register('businessInfo.employees.male')}
                  />
                  <input
                    type="number"
                    placeholder="Female"
                    title="Female Employees"
                    className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 text-sm bg-white outline-none focus:border-primary-600 font-mono"
                    {...register('businessInfo.employees.female')}
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">Male count / Female count</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">Employees Residing in Janiuay</label>
                <input
                  type="number"
                  placeholder="e.g., 2"
                  className="w-full px-3.5 py-2 rounded-xl border-2 border-slate-200 text-sm font-mono bg-white outline-none focus:border-primary-600"
                  {...register('businessInfo.employees.residingInCity')}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">Delivery Vehicles Count</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Van/Truck"
                    title="Van or Truck"
                    className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 text-sm bg-white outline-none focus:border-primary-600 font-mono"
                    {...register('businessInfo.deliveryVehicles.vanTruck')}
                  />
                  <input
                    type="number"
                    placeholder="Motorcycle"
                    title="Motorcycle"
                    className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 text-sm bg-white outline-none focus:border-primary-600 font-mono"
                    {...register('businessInfo.deliveryVehicles.motorcycle')}
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">Vans &amp; Trucks / Motorcycles</p>
              </div>

              {/* Property Ownership */}
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">Property Ownership</label>
                <div className="flex items-center space-x-3 mb-2">
                  <label className="flex items-center space-x-1.5 text-xs font-bold cursor-pointer">
                    <input
                      type="radio"
                      value="true"
                      checked={isPropertyOwned === true || isPropertyOwned === 'true'}
                      onChange={() => setValue('businessInfo.propertyOwnership.isOwned', true)}
                      className="text-primary-600"
                    />
                    <span>Owned Property</span>
                  </label>
                  <label className="flex items-center space-x-1.5 text-xs font-bold cursor-pointer">
                    <input
                      type="radio"
                      value="false"
                      checked={isPropertyOwned === false || isPropertyOwned === 'false'}
                      onChange={() => setValue('businessInfo.propertyOwnership.isOwned', false)}
                      className="text-primary-600"
                    />
                    <span>Rented / Leased</span>
                  </label>
                </div>
                <input
                  type="text"
                  placeholder="Tax Dec No. / Property ID (e.g. TD-2026-081)"
                  className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 text-xs bg-white outline-none font-mono"
                  {...register('businessInfo.propertyOwnership.taxDeclarationNo')}
                />
              </div>

              {/* Tax Incentives */}
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">Government Tax Incentives</label>
                <div className="flex items-center space-x-4 pt-2">
                  <label className="flex items-center space-x-1.5 text-xs font-bold cursor-pointer">
                    <input
                      type="radio"
                      value="false"
                      checked={!hasTaxIncentives}
                      onChange={() => setValue('businessInfo.taxIncentives.hasIncentives', false)}
                    />
                    <span>No Incentives</span>
                  </label>
                  <label className="flex items-center space-x-1.5 text-xs font-bold cursor-pointer">
                    <input
                      type="radio"
                      value="true"
                      checked={hasTaxIncentives}
                      onChange={() => setValue('businessInfo.taxIncentives.hasIncentives', true)}
                    />
                    <span>Yes (BOI/PEZA)</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Line of Business Table Details */}
            <div className="border-t border-slate-200 pt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">Products / Services Offered</label>
                <input
                  type="text"
                  placeholder="e.g., General merchandise, groceries, retail supplies"
                  className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 text-xs bg-white outline-none font-medium"
                  {...register('businessInfo.lineOfBusiness.productsServices')}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">PSIC Code (Standard Classification)</label>
                <input
                  type="text"
                  placeholder="47111"
                  className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 text-xs font-mono font-bold bg-white outline-none"
                  {...register('businessInfo.lineOfBusiness.psic')}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">Number of Operating Units / Stalls</label>
                <input
                  type="number"
                  placeholder="1"
                  className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 text-xs font-mono font-bold bg-white outline-none"
                  {...register('businessInfo.lineOfBusiness.units')}
                />
              </div>
            </div>
          </div>

          {/* 4. Payment Frequency & Treasury Schedule */}
          <div className="border border-slate-200 rounded-2xl p-4 sm:p-5 bg-slate-50/50 space-y-4">
            <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center">
              <CreditCard className="w-4 h-4 mr-1.5 text-primary-600" /> Municipal Treasury Terms &amp; Payment Schedule
            </h4>

            <div>
              <label className="block text-xs font-bold text-slate-900 mb-2">
                Preferred Payment Frequency <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { value: 'annually', label: 'Annually', desc: '100% full annual settlement' },
                  { value: 'bi-annually', label: 'Bi-annually', desc: '2 equal semi-annual installments' },
                  { value: 'quarterly', label: 'Quarterly', desc: '4 quarterly installments' }
                ].map(pf => (
                  <label key={pf.value} className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                    paymentFrequency === pf.value ? 'border-primary-600 bg-primary-50 shadow-2xs' : 'border-slate-200 hover:border-slate-300 bg-white'
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

            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1">
                Preferred date of payment if Approved by treasurer <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 text-sm font-semibold focus:border-primary-600 focus:ring-4 focus:ring-primary-100 outline-none bg-white"
                {...register('paymentInfo.receiptDate', { required: 'Please select your preferred date of payment' })}
              />
              {errors.paymentInfo?.receiptDate && (
                <p className="text-xs font-bold text-red-600 mt-1">{errors.paymentInfo.receiptDate.message}</p>
              )}
            </div>
          </div>

          {/* Navigation Controls */}
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
      </div>
    </motion.div>
  )

  // STEP 3: Applicant Clearances
  const renderStep3 = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
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
            const isRequired = req.isRequired || req.code === 'REQ-POLICE' || req.name?.toLowerCase().includes('police')

            return (
              <div
                key={idx}
                className={`bg-white p-4 sm:p-5 rounded-2xl border-2 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isUploaded 
                    ? 'border-emerald-300 bg-emerald-50/20' 
                    : isRequired 
                    ? 'border-red-200 bg-red-50/10 hover:border-red-400' 
                    : 'border-slate-200 hover:border-primary-300'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold flex-shrink-0 ${
                    isUploaded 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : isRequired 
                      ? 'bg-red-100 text-red-600 border border-red-200' 
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {isUploaded ? <CheckCircle2 className="w-6 h-6" /> : <FileText className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                        isRequired ? 'bg-red-100 text-red-700' : 'bg-primary-100 text-primary-700'
                      }`}>
                        {req.code}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900">{req.name}</h4>
                      {isRequired && (
                        <span className="text-[10px] text-red-600 font-extrabold bg-red-50 border border-red-200 px-1.5 py-0.5 rounded tracking-wide">
                          *Required
                        </span>
                      )}
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
          onClick={handleStep3Continue}
          disabled={isUploading}
          className="inline-flex items-center px-6 py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-bold text-base rounded-xl shadow-md transition-all focus:ring-4 focus:ring-primary-200"
        >
          Continue to Step 4: Final Review
          <ArrowRight className="w-5 h-5 ml-2" />
        </button>
      </div>
    </motion.div>
  )

  // STEP 4: Review, Live UAF Form Preview & Final Submission
  const renderStep4 = () => {
    const curValues = getValues()
    const bi = curValues.businessInfo || {}
    const oi = curValues.ownerInfo || {}
    const pi = curValues.paymentInfo || {}

    return (
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
        <div className="bg-white rounded-2xl p-5 sm:p-8 border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="relative z-10 space-y-6">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 flex-wrap gap-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center text-primary-700 shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Step 4: Final Verification &amp; Submission</h3>
                  <p className="text-xs text-slate-500">Every declared field is verified for official UAF-2026 compilation</p>
                </div>
              </div>

              {/* UAF Live Preview Button */}
              <button
                type="button"
                onClick={handleOpenUafPreview}
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm transition-all focus:ring-4 focus:ring-indigo-100"
              >
                <Eye className="w-4 h-4 mr-1.5" />
                Preview Official UAF-2026 Form
              </button>
            </div>

            {/* Comprehensive Review Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-200 text-xs sm:text-sm">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Permit Type</span>
                <p className="text-base font-extrabold text-purple-700 mt-0.5 uppercase">
                  {permitType === 'renewal' ? 'Renewal Permit' : 'New Permit Application'}
                </p>
              </div>

              {permitType === 'renewal' && (
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Previous Permit / Gross Sales</span>
                  <p className="text-sm font-mono font-extrabold text-slate-900 mt-0.5">
                    {previousPermitNumber || 'None'} • ₱{Number(grossSales || 0).toLocaleString()}
                  </p>
                </div>
              )}

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Registered Tradename</span>
                <p className="text-base font-extrabold text-slate-900 mt-0.5">{bi.businessName || 'N/A'}</p>
                {bi.tradeName && <p className="text-xs text-slate-500">Trade/Franchise: {bi.tradeName}</p>}
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Registration &amp; TIN</span>
                <p className="text-sm font-mono font-bold text-slate-900 mt-0.5">
                  Reg: {bi.registrationNumber || 'Pending'} • TIN: {bi.tin || 'Pending'}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Ownership Structure</span>
                <p className="text-base font-extrabold text-slate-900 mt-0.5 capitalize">
                  {bi.businessType?.replace(/_/g, ' ') || 'Sole Proprietorship'}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Line of Business &amp; Capital</span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">
                  {bi.businessNature} • ₱{Number(bi.capitalization || 0).toLocaleString()}
                </p>
              </div>

              <div className="md:col-span-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Main Office Address</span>
                <p className="text-sm font-semibold text-slate-900 mt-0.5">
                  {[
                    bi.businessAddress?.houseNo,
                    bi.businessAddress?.buildingName,
                    bi.businessAddress?.lotNo ? `Lot ${bi.businessAddress.lotNo}` : null,
                    bi.businessAddress?.street,
                    bi.businessAddress?.subdivision,
                    bi.businessAddress?.barangay,
                    'Janiuay, Iloilo 5034'
                  ].filter(Boolean).join(', ')}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Applicant / Owner</span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">
                  {oi.firstName} {oi.middleName ? oi.middleName + ' ' : ''}{oi.lastName} {oi.suffix || ''} ({oi.designation || 'Proprietor'})
                </p>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Operations Dimensions</span>
                <p className="text-xs font-semibold text-slate-900 mt-0.5">
                  Area: {bi.businessArea || 35} sq.m. • Employees: {(Number(bi.employees?.male) || 0) + (Number(bi.employees?.female) || 0)} • Activity: {bi.businessActivity?.replace('_', ' ')}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Payment Frequency</span>
                <p className="text-sm font-bold text-slate-900 mt-0.5 capitalize">{pi.paymentFrequency || 'Annually'}</p>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Target Treasury Date</span>
                <p className="text-sm font-mono font-bold text-slate-900 mt-0.5">{pi.receiptDate || 'Pending'}</p>
              </div>
            </div>

            {/* Zero Blank Assurance Alert */}
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-start space-x-3">
              <Check className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-bold text-emerald-950">Official 2026 UAF Compliance Complete</p>
                <p className="text-xs text-emerald-800 mt-0.5 leading-relaxed">
                  All required questions across Page 1 and Page 2 of the Unified Application Form have been populated. You can preview the finalized official PDF before routing.
                </p>
              </div>
            </div>

            {/* Automatic Agency Routing Notice */}
            <div className="p-4 bg-primary-50 rounded-2xl border border-primary-200 space-y-1">
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
        </div>
      </motion.div>
    )
  }

  return (
    <div className="min-h-screen bg-transparent pb-20">
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

      <div className="container max-w-4xl mt-8 relative">
        <div className="relative z-10">
          <AnimatePresence mode="wait">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
          </AnimatePresence>
        </div>
      </div>

      {/* Official UAF-2026 Interactive Modal Preview */}
      <UnifiedApplicationFormModal
        isOpen={showUafPreview}
        onClose={() => setShowUafPreview(false)}
        permit={previewPermitData}
      />
    </div>
  )
}

export default PermitApplication
