import React, { useRef, useState, useEffect } from 'react'
import { 
  Printer, 
  Download, 
  FileText, 
  Image as ImageIcon, 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  Award, 
  QrCode, 
  Loader2, 
  Sparkles 
} from 'lucide-react'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import toast from 'react-hot-toast'
import Button from '../shared/Button'

export const BusinessPermitCertificate = ({ isOpen, onClose, permit, autoPrint = false }) => {
  const certificateRef = useRef(null)
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgressText, setExportProgressText] = useState('')

  // Manage body class for scoped print isolation
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('has-certificate-modal-open')
    } else {
      document.body.classList.remove('has-certificate-modal-open')
    }
    return () => {
      document.body.classList.remove('has-certificate-modal-open')
    }
  }, [isOpen])

  // Automatically trigger native print dialog when opened via Print button
  useEffect(() => {
    if (isOpen && autoPrint) {
      const timer = setTimeout(() => {
        window.print()
      }, 400)
      return () => clearTimeout(timer)
    }
  }, [isOpen, autoPrint])

  if (!isOpen || !permit) return null

  const businessInfo = permit.businessInfo || {}
  const ownerInfo = permit.ownerInfo || {}
  const paymentInfo = permit.paymentInfo || {}
  const assessment = permit.assessment || {}

  // 1. Dynamic Business Permit Type Generation According to Records
  const getDynamicPermitType = () => {
    const isRenewal = permit.permitType === 'renewal'
    const structure = businessInfo.businessType || 'sole_proprietorship'
    const nature = businessInfo.businessNature || 'Commercial & Retail'

    let structureLabel = 'Sole Proprietorship'
    if (structure === 'one_person_corporation') structureLabel = 'One Person Corporation (OPC)'
    else if (structure === 'corporation') structureLabel = 'Corporate Entity'
    else if (structure === 'partnership') structureLabel = 'Commercial Partnership'
    else if (structure === 'cooperative') structureLabel = 'Registered Cooperative'

    const title = isRenewal ? "MAYOR'S RENEWAL BUSINESS PERMIT" : "MAYOR'S BUSINESS PERMIT"
    const subclassification = `${structureLabel.toUpperCase()} • ${nature.toUpperCase()}`

    return { title, subclassification, structureLabel, isRenewal }
  }

  const { title, subclassification, structureLabel, isRenewal } = getDynamicPermitType()

  const issueYear = permit.issuedAt ? new Date(permit.issuedAt).getFullYear() : new Date().getFullYear()
  const permitNumber = permit.permitNumber || `BP-${issueYear}-0001`
  const binNumber = permit.businessIdNumber || `BIN-${issueYear}-1001`
  const issueDateFormatted = permit.issuedAt
    ? new Date(permit.issuedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  const validUntilFormatted = permit.expiresAt
    ? new Date(permit.expiresAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : `December 31, ${issueYear}`

  // 1. Native Print (uses scoped @media print CSS for clean 1-page paper output)
  const handlePrint = () => {
    window.print()
  }

  // 2. High-Resolution PDF Export
  const handleExportPDF = async () => {
    try {
      setIsExporting(true)
      setExportProgressText("Generating official Mayor's Permit PDF...")

      if (!certificateRef.current) throw new Error('Certificate sheet element not found')

      const canvas = await html2canvas(certificateRef.current, {
        scale: 2.5,
        useCORS: true,
        logging: false,
        backgroundColor: '#fffdfa',
        windowWidth: 1024,
        onclone: (clonedDoc) => {
          const sheet = clonedDoc.getElementById('business-permit-certificate-sheet')
          if (sheet) {
            sheet.style.width = '820px'
            sheet.style.maxWidth = '820px'
            sheet.style.margin = '0 auto'
            sheet.style.padding = '36px'
          }
        }
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
      })

      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const margin = 8
      const printableWidth = pdfWidth - (margin * 2)
      const imgHeight = (canvas.height * printableWidth) / canvas.width

      const yPos = imgHeight < (pdfHeight - margin * 2)
        ? margin + ((pdfHeight - margin * 2) - imgHeight) / 2
        : margin

      pdf.addImage(imgData, 'PNG', margin, yPos, printableWidth, Math.min(imgHeight, pdfHeight - margin * 2), '', 'FAST')

      const filename = `Mayors-Business-Permit-${permitNumber.replace(/\s+/g, '-')}.pdf`
      pdf.save(filename)
      toast.success("Mayor's Permit Certificate downloaded as PDF!")
    } catch (err) {
      console.error('PDF Export Error:', err)
      toast.error('Failed to generate PDF. You can also use the Direct Print button to Save as PDF.')
    } finally {
      setIsExporting(false)
      setExportProgressText('')
    }
  }

  // 3. High-Resolution Image Export (PNG / JPG)
  const handleExportImage = async (format = 'png') => {
    try {
      setIsExporting(true)
      setExportProgressText(`Exporting high-resolution ${format.toUpperCase()} image...`)

      if (!certificateRef.current) throw new Error('Certificate sheet element not found')

      const canvas = await html2canvas(certificateRef.current, {
        scale: 2.5,
        useCORS: true,
        logging: false,
        backgroundColor: '#fffdfa',
        windowWidth: 1024,
        onclone: (clonedDoc) => {
          const sheet = clonedDoc.getElementById('business-permit-certificate-sheet')
          if (sheet) {
            sheet.style.width = '820px'
            sheet.style.maxWidth = '820px'
            sheet.style.margin = '0 auto'
            sheet.style.padding = '36px'
          }
        }
      })

      const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png'
      const ext = format === 'jpeg' ? 'jpg' : 'png'
      const dataUrl = canvas.toDataURL(mimeType, 0.95)

      const link = document.createElement('a')
      link.download = `Mayors-Business-Permit-${permitNumber.replace(/\s+/g, '-')}.${ext}`
      link.href = dataUrl
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast.success(`Mayor's Permit Certificate saved as ${format.toUpperCase()} image!`)
    } catch (err) {
      console.error('Image Export Error:', err)
      toast.error(`Failed to export ${format.toUpperCase()} image.`)
    } finally {
      setIsExporting(false)
      setExportProgressText('')
    }
  }

  return (
    <div 
      id="business-permit-certificate-modal"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-6 print:p-0 print:static print:bg-white"
    >
      <div className="relative bg-white sm:rounded-3xl shadow-2xl max-w-4xl w-full border-2 border-amber-600/30 overflow-hidden my-2 sm:my-6 print:m-0 print:border-none print:shadow-none print:rounded-none">
        
        {/* Modal Top Actions Toolbar (Hidden on Print) */}
        <div className="p-3 sm:p-4 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
          <div className="flex items-center justify-between w-full sm:w-auto">
            <div className="flex items-center space-x-2.5">
              <Award className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <span className="font-bold text-xs sm:text-sm tracking-wide block">
                  Official Mayor's Business Permit
                </span>
                <span className="text-[10px] text-amber-300 font-mono">
                  {permitNumber} • {binNumber}
                </span>
              </div>
            </div>
            
            {/* Mobile Close Button */}
            <button
              onClick={onClose}
              className="sm:hidden p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Action Buttons Toolbar */}
          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end flex-wrap gap-y-2">
            <button
              onClick={handlePrint}
              disabled={isExporting}
              className="inline-flex items-center px-3 sm:px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50"
              title="Print directly or Save as PDF via browser print"
            >
              <Printer className="w-4 h-4 mr-1.5 shrink-0" /> Direct Print
            </button>

            <button
              onClick={handleExportPDF}
              disabled={isExporting}
              className="inline-flex items-center px-3 sm:px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50"
              title="Download high-resolution official PDF document"
            >
              {isExporting ? (
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin shrink-0" />
              ) : (
                <FileText className="w-4 h-4 mr-1.5 shrink-0" />
              )}
              Download PDF
            </button>

            <button
              onClick={() => handleExportImage('png')}
              disabled={isExporting}
              className="inline-flex items-center px-3 sm:px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-all border border-slate-700 cursor-pointer disabled:opacity-50"
              title="Save certificate as PNG image to gallery"
            >
              <ImageIcon className="w-4 h-4 mr-1.5 shrink-0 text-emerald-400" />
              Save Image
            </button>

            {/* Desktop Close Button */}
            <button
              onClick={onClose}
              className="hidden sm:inline-flex p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer ml-1"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Loading Overlay when generating PDF or Image */}
        {isExporting && (
          <div className="print:hidden absolute inset-0 z-40 bg-slate-950/70 backdrop-blur-xs flex flex-col items-center justify-center text-white p-6">
            <Loader2 className="w-10 h-10 animate-spin text-amber-400 mb-3" />
            <p className="text-sm font-bold">{exportProgressText || 'Processing certificate...'}</p>
            <p className="text-xs text-slate-300 mt-1 text-center max-w-sm">
              Rendering official security borders, seals, and typography in high-resolution...
            </p>
          </div>
        )}

        {/* Printable Official Municipal Certificate Document Body */}
        <div 
          ref={certificateRef} 
          id="business-permit-certificate-sheet"
          className="p-4 sm:p-10 bg-[#fffdfa] relative font-serif text-slate-900 print:p-2"
        >
          {/* Ornate Double Filigree Gold Certificate Border */}
          <div className="border-[5px] sm:border-[6px] border-amber-800/80 p-2 sm:p-3 rounded-2xl relative shadow-inner print:border-4 print:p-1.5">
            <div className="border-2 border-dashed border-amber-600/70 p-4 sm:p-8 rounded-xl relative overflow-hidden bg-[#fffdf7] print:p-4">

              {/* Watermark of Official Municipal Seal */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
                <img 
                  src="/janiuay-logo.png" 
                  alt="Official Seal Watermark" 
                  style={{ opacity: 0.08 }}
                  className="w-[320px] h-[320px] sm:w-[440px] sm:h-[440px] object-contain transform -rotate-6 pointer-events-none" 
                />
              </div>

              <div className="relative z-10 space-y-4 sm:space-y-6 print:space-y-3">

                {/* Header with Municipal & National Emblems */}
                <div className="flex items-center justify-between pb-3 sm:pb-4 border-b-2 border-amber-800/60 print:pb-2">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 flex items-center justify-center">
                    <img 
                      src="/janiuay-logo.png" 
                      alt="Official Seal" 
                      className="w-full h-full object-contain" 
                    />
                  </div>

                  <div className="text-center flex-1 px-2 sm:px-4">
                    <p className="text-[10px] sm:text-[11px] font-sans font-bold uppercase tracking-widest text-slate-600">Republic of the Philippines</p>
                    <p className="text-[11px] sm:text-xs font-sans font-bold uppercase tracking-wider text-slate-700">Province of Iloilo</p>
                    <h2 className="text-base sm:text-2xl font-bold uppercase tracking-widest text-amber-950 font-serif">
                      MUNICIPALITY OF JANIUAY
                    </h2>
                    <p className="text-[11px] sm:text-xs font-sans font-extrabold uppercase tracking-widest text-slate-800 mt-0.5">
                      OFFICE OF THE MUNICIPAL MAYOR
                    </p>
                    <p className="text-[9px] sm:text-[10px] font-sans font-semibold uppercase tracking-wider text-slate-500">
                      Business Permits & Licensing Office (BPLO)
                    </p>
                  </div>

                  <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 flex items-center justify-center">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-amber-600 p-1 flex items-center justify-center bg-white shadow-xs">
                      <ShieldCheck className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-700" />
                    </div>
                  </div>
                </div>

                {/* Certificate Main Title (Generated according to records) */}
                <div className="text-center pt-1 sm:pt-2">
                  <span className="text-[9px] sm:text-[10px] font-sans font-extrabold text-amber-900 bg-amber-100/80 px-3 py-1 rounded-full uppercase tracking-widest border border-amber-300">
                    Official Regulatory License
                  </span>
                  <h1 className="text-xl sm:text-3xl md:text-4xl font-extrabold uppercase tracking-widest text-amber-950 mt-1.5 sm:mt-2 font-serif">
                    {title}
                  </h1>
                  <p className="text-[11px] sm:text-sm font-sans font-bold text-slate-600 tracking-wider uppercase mt-1">
                    {subclassification}
                  </p>
                </div>

                {/* Grant Preamble */}
                <div className="text-center text-[11px] sm:text-xs font-sans text-slate-700 max-w-xl mx-auto leading-relaxed italic">
                  Pursuant to the provisions of Section 143 of the Local Government Code of 1991 (Republic Act No. 7160)
                  and the Municipal Revenue Tax Ordinance of Janiuay, Iloilo, PERMISSION is hereby granted to:
                </div>

                {/* Business & Owner Display Box */}
                <div className="p-4 sm:p-6 bg-white/90 rounded-2xl border-2 border-amber-800/40 text-center shadow-xs space-y-2.5 sm:space-y-3 print:p-3 print:space-y-1.5">
                  <div>
                    <span className="text-[9px] sm:text-[10px] font-sans font-bold text-slate-400 uppercase tracking-widest">
                      Registered Business Tradename
                    </span>
                    <h3 className="text-lg sm:text-2xl md:text-3xl font-extrabold text-slate-900 uppercase font-serif tracking-tight mt-0.5">
                      {businessInfo.businessName || 'Business Name'}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 print:grid-cols-2 gap-2 sm:gap-3 pt-2 text-xs font-sans border-t border-slate-100 text-left sm:text-center print:text-center">
                    <div>
                      <span className="text-slate-500 text-[11px]">Proprietor / Representative:</span>
                      <p className="font-bold text-slate-900 text-xs sm:text-sm">{ownerInfo.firstName} {ownerInfo.lastName}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[11px]">Business Structure:</span>
                      <p className="font-bold text-slate-900 text-xs sm:text-sm capitalize">{structureLabel}</p>
                    </div>
                    <div className="sm:col-span-2 print:col-span-2">
                      <span className="text-slate-500 text-[11px]">Business Establishment Address:</span>
                      <p className="font-bold text-slate-900 text-xs sm:text-sm">
                        {businessInfo.businessAddress?.barangay || 'Poblacion'}, Municipality of Janiuay, Province of Iloilo
                      </p>
                    </div>
                  </div>
                </div>

                {/* Regulatory Assessment & Receipt Verification Citations */}
                <div className="grid grid-cols-2 sm:grid-cols-4 print:grid-cols-4 gap-2 sm:gap-3 p-2.5 sm:p-3 bg-amber-50/70 rounded-xl border border-amber-200 text-center text-xs font-sans">
                  <div>
                    <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase">Permit Certificate No.</span>
                    <p className="font-extrabold text-amber-950 font-mono text-xs sm:text-sm truncate">{permitNumber}</p>
                  </div>
                  <div>
                    <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase">Business ID (BIN)</span>
                    <p className="font-bold text-slate-900 font-mono text-xs sm:text-sm truncate">{binNumber}</p>
                  </div>
                  <div>
                    <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase">Official Receipt (OR)</span>
                    <p className="font-bold text-emerald-800 font-mono text-xs sm:text-sm truncate">{paymentInfo.orNumber || 'OR-PAID-TREAS'}</p>
                  </div>
                  <div>
                    <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase">Amount Paid</span>
                    <p className="font-bold text-slate-900 font-mono text-xs sm:text-sm">
                      ₱{Number(paymentInfo.amount || assessment.fees?.total || 0).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Mandatory Regulatory Compliance Badges */}
                <div className="p-2 sm:p-2.5 bg-white/70 rounded-xl border border-slate-200 text-[9px] sm:text-[10px] font-sans text-slate-600 flex flex-wrap items-center justify-around gap-1.5 sm:gap-2 text-center">
                  <span className="flex items-center text-emerald-800 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600 shrink-0" /> FSIC Compliant (BFP)
                  </span>
                  <span className="flex items-center text-emerald-800 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600 shrink-0" /> Sanitary Permit Cleared
                  </span>
                  <span className="flex items-center text-emerald-800 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600 shrink-0" /> Barangay Clearance Verified
                  </span>
                  <span className="flex items-center text-emerald-800 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600 shrink-0" /> Community Tax Paid (Cedula)
                  </span>
                </div>

                {/* Validity Notice */}
                <div className="text-center text-[11px] sm:text-xs font-sans font-medium text-slate-700 leading-relaxed">
                  This Permit shall be posted conspicuously in the place of business and surrendered upon closure or revocation.
                  Valid from <strong>{issueDateFormatted}</strong> until <strong>{validUntilFormatted}</strong> unless sooner revoked for cause.
                </div>

                {/* Signatures & Verification QR Code */}
                <div className="pt-3 sm:pt-6 grid grid-cols-3 print:grid-cols-3 gap-2 sm:gap-4 items-end font-sans text-center text-xs">
                  {/* Left Signature: BPLO */}
                  <div>
                    <div className="h-8 sm:h-10 flex items-center justify-center italic text-primary-800 font-serif font-bold text-xs sm:text-sm">
                      Digitally Certified
                    </div>
                    <p className="border-t border-slate-900 pt-1 font-bold text-slate-900 text-[10px] sm:text-xs">
                      ENGR. ROEL A. SUMAGPAO
                    </p>
                    <p className="text-[8px] sm:text-[9.5px] text-slate-500 uppercase font-semibold">
                      Licensing Officer / Head of BPLO
                    </p>
                  </div>

                  {/* Center: Digital Authenticity Seal & QR */}
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 p-1 border-2 border-slate-900 rounded-lg bg-white shadow-xs flex items-center justify-center">
                      <QrCode className="w-10 h-10 sm:w-12 sm:h-12 text-slate-900" />
                    </div>
                    <span className="text-[8px] sm:text-[9px] font-mono text-slate-400 mt-1 uppercase">
                      SECURE ID: {permit._id.toString().slice(-8).toUpperCase()}
                    </span>
                  </div>

                  {/* Right Signature: Municipal Mayor */}
                  <div>
                    <div className="h-8 sm:h-10 flex items-center justify-center italic text-primary-800 font-serif font-bold text-xs sm:text-sm">
                      Approved by Authority
                    </div>
                    <p className="border-t border-slate-900 pt-1 font-bold text-slate-900 text-[10px] sm:text-xs">
                      HON. PAULINO P. DERIADA
                    </p>
                    <p className="text-[8px] sm:text-[9.5px] text-slate-500 uppercase font-semibold">
                      Municipal Mayor • Janiuay, Iloilo
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Bar (Hidden on print) */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
          <span className="text-[11px] sm:text-xs text-slate-500 text-center sm:text-left">
            Official Municipal Certificate • Document Hash #{permit._id.toString().slice(-8).toUpperCase()}
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 mr-1.5" /> Print
            </button>
            <button
              onClick={handleExportPDF}
              className="inline-flex items-center px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 mr-1.5" /> PDF
            </button>
            <Button variant="secondary" size="sm" onClick={onClose}>Close</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BusinessPermitCertificate
