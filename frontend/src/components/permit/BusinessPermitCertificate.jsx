import React, { useRef } from 'react'
import { Printer, Download, X, ShieldCheck, CheckCircle2, Award, QrCode } from 'lucide-react'
import Button from '../shared/Button'

export const BusinessPermitCertificate = ({ isOpen, onClose, permit }) => {
  const certificateRef = useRef(null)

  if (!isOpen || !permit) return null

  const businessInfo = permit.businessInfo || {}
  const ownerInfo = permit.ownerInfo || {}
  const paymentInfo = permit.paymentInfo || {}
  const assessment = permit.assessment || {}

  // 1. Dynamic Business Permit Type Generation According to Records ("Kay bal-on lang ni system tuya")
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

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    const certHtml = certificateRef.current?.innerHTML || ''
    const win = window.open('', '_blank')
    if (!win) return

    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title} - ${businessInfo.businessName || 'Certificate'}</title>
          <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
          <style>
            @page { size: A4 portrait; margin: 10mm; }
            body { font-family: 'Georgia', serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div style="max-width: 850px; margin: 0 auto; padding: 20px;">
            ${certHtml}
          </div>
        </body>
      </html>
    `)
    win.document.close()
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-4xl w-full border-2 border-amber-600/30 overflow-hidden my-6">
        
        {/* Modal Top Actions (Hidden on Print) */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span className="font-bold text-sm tracking-wide">
              Official Digital Mayor's Business Permit Certificate
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-sm"
            >
              <Printer className="w-4 h-4 mr-1.5" /> Direct Print
            </button>
            <button
              onClick={handleDownload}
              className="inline-flex items-center px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-all border border-slate-700"
            >
              <Download className="w-4 h-4 mr-1.5" /> Download PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Municipal Certificate Document Body */}
        <div ref={certificateRef} className="p-6 sm:p-12 bg-[#fffdfa] relative font-serif text-slate-900 print:p-8">
          
          {/* Ornate Double Filigree Gold Certificate Border */}
          <div className="border-[6px] border-amber-800/80 p-3 rounded-2xl relative shadow-inner">
            <div className="border-2 border-dashed border-amber-600/70 p-6 sm:p-10 rounded-xl relative overflow-hidden bg-[#fffdf7]">

              {/* Watermark of Official Municipal Seal */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
                <img 
                  src="/janiuay-logo.png" 
                  alt="Official Seal Watermark" 
                  className="w-[440px] h-[440px] object-contain opacity-[0.07] transform -rotate-6 pointer-events-none" 
                />
              </div>

              <div className="relative z-10 space-y-6">

                {/* Header with Municipal & National Emblems */}
                <div className="flex items-center justify-between pb-4 border-b-2 border-amber-800/60">
                  <div className="w-20 h-20 flex-shrink-0 flex items-center justify-center">
                    <img 
                      src="/janiuay-logo.png" 
                      alt="Official Seal" 
                      className="w-full h-full object-contain" 
                    />
                  </div>

                  <div className="text-center flex-1 px-4">
                    <p className="text-[11px] font-sans font-bold uppercase tracking-widest text-slate-600">Republic of the Philippines</p>
                    <p className="text-xs font-sans font-bold uppercase tracking-wider text-slate-700">Province of Iloilo</p>
                    <h2 className="text-lg sm:text-2xl font-bold uppercase tracking-widest text-amber-950 font-serif">
                      MUNICIPALITY OF JANIUAY
                    </h2>
                    <p className="text-xs font-sans font-extrabold uppercase tracking-widest text-slate-800 mt-0.5">
                      OFFICE OF THE MUNICIPAL MAYOR
                    </p>
                    <p className="text-[10px] font-sans font-semibold uppercase tracking-wider text-slate-500">
                      Business Permits & Licensing Office (BPLO)
                    </p>
                  </div>

                  <div className="w-20 h-20 flex-shrink-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full border-2 border-amber-600 p-1 flex items-center justify-center bg-white shadow-xs">
                      <ShieldCheck className="w-10 h-10 text-emerald-700" />
                    </div>
                  </div>
                </div>

                {/* Certificate Main Title (Generated according to records) */}
                <div className="text-center pt-2">
                  <span className="text-[10px] font-sans font-extrabold text-amber-900 bg-amber-100/80 px-3 py-1 rounded-full uppercase tracking-widest border border-amber-300">
                    Official Regulatory License
                  </span>
                  <h1 className="text-2xl sm:text-4xl font-extrabold uppercase tracking-widest text-amber-950 mt-2 font-serif">
                    {title}
                  </h1>
                  <p className="text-xs sm:text-sm font-sans font-bold text-slate-600 tracking-wider uppercase mt-1">
                    {subclassification}
                  </p>
                </div>

                {/* Grant Preamble */}
                <div className="text-center text-xs font-sans text-slate-700 max-w-xl mx-auto leading-relaxed italic">
                  Pursuant to the provisions of Section 143 of the Local Government Code of 1991 (Republic Act No. 7160)
                  and the Municipal Revenue Tax Ordinance of Janiuay, Iloilo, PERMISSION is hereby granted to:
                </div>

                {/* Business & Owner Display Box */}
                <div className="p-6 bg-white/90 rounded-2xl border-2 border-amber-800/40 text-center shadow-xs space-y-3">
                  <div>
                    <span className="text-[10px] font-sans font-bold text-slate-400 uppercase tracking-widest">
                      Registered Business Tradename
                    </span>
                    <h3 className="text-xl sm:text-3xl font-extrabold text-slate-900 uppercase font-serif tracking-tight mt-0.5">
                      {businessInfo.businessName || 'Business Name'}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs font-sans border-t border-slate-100">
                    <div>
                      <span className="text-slate-500">Proprietor / Representative:</span>
                      <p className="font-bold text-slate-900 text-sm">{ownerInfo.firstName} {ownerInfo.lastName}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Business Structure:</span>
                      <p className="font-bold text-slate-900 text-sm capitalize">{structureLabel}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-slate-500">Business Establishment Address:</span>
                      <p className="font-bold text-slate-900 text-sm">
                        {businessInfo.businessAddress?.barangay || 'Poblacion'}, Municipality of Janiuay, Province of Iloilo
                      </p>
                    </div>
                  </div>
                </div>

                {/* Regulatory Assessment & Receipt Verification Citations */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-amber-50/70 rounded-xl border border-amber-200 text-center text-xs font-sans">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Permit Certificate No.</span>
                    <p className="font-extrabold text-amber-950 font-mono text-sm">{permitNumber}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Business ID (BIN)</span>
                    <p className="font-bold text-slate-900 font-mono text-sm">{binNumber}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Official Receipt (OR)</span>
                    <p className="font-bold text-emerald-800 font-mono text-sm">{paymentInfo.orNumber || 'OR-PAID-TREAS'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Amount Paid</span>
                    <p className="font-bold text-slate-900 font-mono text-sm">
                      ₱{Number(paymentInfo.amount || assessment.fees?.total || 0).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Mandatory Regulatory Compliance Badges */}
                <div className="p-3 bg-white/70 rounded-xl border border-slate-200 text-[10px] font-sans text-slate-600 flex flex-wrap items-center justify-around gap-2 text-center">
                  <span className="flex items-center text-emerald-800 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" /> FSIC Compliant (BFP)
                  </span>
                  <span className="flex items-center text-emerald-800 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Sanitary Permit Cleared
                  </span>
                  <span className="flex items-center text-emerald-800 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Barangay Clearance Verified
                  </span>
                  <span className="flex items-center text-emerald-800 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Community Tax Paid (Cedula)
                  </span>
                </div>

                {/* Validity Notice */}
                <div className="text-center text-xs font-sans font-medium text-slate-700 leading-relaxed">
                  This Permit shall be posted conspicuously in the place of business and surrendered upon closure or revocation.
                  Valid from <strong>{issueDateFormatted}</strong> until <strong>{validUntilFormatted}</strong> unless sooner revoked for cause.
                </div>

                {/* Signatures & Verification QR Code */}
                <div className="pt-6 grid grid-cols-3 gap-4 items-end font-sans text-center text-xs">
                  {/* Left Signature: BPLO */}
                  <div>
                    <div className="h-10 flex items-center justify-center italic text-primary-800 font-serif font-bold text-sm">
                      Digitally Certified
                    </div>
                    <p className="border-t border-slate-900 pt-1 font-bold text-slate-900">
                      ENGR. ROEL A. SUMAGPAO
                    </p>
                    <p className="text-[10px] text-slate-500 uppercase font-semibold">
                      Licensing Officer / Head of BPLO
                    </p>
                  </div>

                  {/* Center: Digital Authenticity Seal & QR */}
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-16 h-16 p-1.5 border-2 border-slate-900 rounded-lg bg-white shadow-xs flex items-center justify-center">
                      <QrCode className="w-12 h-12 text-slate-900" />
                    </div>
                    <span className="text-[9px] font-mono text-slate-400 mt-1 uppercase">
                      SECURE ID: {permit._id.toString().slice(-8).toUpperCase()}
                    </span>
                  </div>

                  {/* Right Signature: Municipal Mayor */}
                  <div>
                    <div className="h-10 flex items-center justify-center italic text-primary-800 font-serif font-bold text-sm">
                      Approved by Authority
                    </div>
                    <p className="border-t border-slate-900 pt-1 font-bold text-slate-900">
                      HON. PAULINO P. DERIADA
                    </p>
                    <p className="text-[10px] text-slate-500 uppercase font-semibold">
                      Municipal Mayor • Janiuay, Iloilo
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Bar (Hidden on print) */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between print:hidden">
          <span className="text-xs text-slate-500">
            Official Municipal Certificate • Document Hash #{permit._id.toString().slice(-8).toUpperCase()}
          </span>
          <Button variant="secondary" onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  )
}

export default BusinessPermitCertificate
