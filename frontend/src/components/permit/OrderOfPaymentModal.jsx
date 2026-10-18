import React, { useRef, useState, useEffect } from 'react'
import { 
  Printer, 
  Download, 
  FileText, 
  Image as ImageIcon, 
  X, 
  Building2, 
  CheckCircle2, 
  CreditCard, 
  ShieldCheck, 
  Loader2 
} from 'lucide-react'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import toast from 'react-hot-toast'
import Button from '../shared/Button'

export const OrderOfPaymentModal = ({ isOpen, onClose, permit }) => {
  const printRef = useRef(null)
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgressText, setExportProgressText] = useState('')

  // Scoped print isolation class
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('has-order-payment-modal-open')
    } else {
      document.body.classList.remove('has-order-payment-modal-open')
    }
    return () => {
      document.body.classList.remove('has-order-payment-modal-open')
    }
  }, [isOpen])

  if (!isOpen || !permit) return null

  const assessment = permit.assessment || {}
  const fees = assessment.fees || {}
  const businessInfo = permit.businessInfo || {}
  const ownerInfo = permit.ownerInfo || {}
  const paymentInfo = permit.paymentInfo || {}

  const handlePrint = () => {
    window.print()
  }

  const handleExportPDF = async () => {
    try {
      setIsExporting(true)
      setExportProgressText('Generating Order of Payment PDF...')

      if (!printRef.current) throw new Error('Order of Payment sheet element not found')

      const canvas = await html2canvas(printRef.current, {
        scale: 2.5,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 1024,
        onclone: (clonedDoc) => {
          const sheet = clonedDoc.getElementById('order-of-payment-sheet')
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

      const trackingNumber = permit.trackingNumber || permit._id.toString().slice(-8).toUpperCase()
      const filename = `Order-of-Payment-${trackingNumber}.pdf`
      pdf.save(filename)
      toast.success('Order of Payment downloaded as PDF!')
    } catch (err) {
      console.error('PDF Export Error:', err)
      toast.error('Failed to generate PDF. You can also use Direct Print to Save as PDF.')
    } finally {
      setIsExporting(false)
      setExportProgressText('')
    }
  }

  const handleExportImage = async () => {
    try {
      setIsExporting(true)
      setExportProgressText('Saving Order of Payment image...')

      if (!printRef.current) throw new Error('Order of Payment sheet element not found')

      const canvas = await html2canvas(printRef.current, {
        scale: 2.5,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 1024,
        onclone: (clonedDoc) => {
          const sheet = clonedDoc.getElementById('order-of-payment-sheet')
          if (sheet) {
            sheet.style.width = '820px'
            sheet.style.maxWidth = '820px'
            sheet.style.margin = '0 auto'
            sheet.style.padding = '36px'
          }
        }
      })

      const dataUrl = canvas.toDataURL('image/png', 0.95)
      const trackingNumber = permit.trackingNumber || permit._id.toString().slice(-8).toUpperCase()
      const link = document.createElement('a')
      link.download = `Order-of-Payment-${trackingNumber}.png`
      link.href = dataUrl
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast.success('Order of Payment saved as image!')
    } catch (err) {
      console.error('Image Export Error:', err)
      toast.error('Failed to export image.')
    } finally {
      setIsExporting(false)
      setExportProgressText('')
    }
  }

  const feeItems = [
    { label: 'Business Tax (Local Tax Code)', amount: fees.businessTax || 0 },
    { label: "Mayor's Permit Fee & Regulatory Assessment", amount: fees.mayorsPermit || 0 },
    { label: 'Sanitary Inspection & Health Clearance Fee', amount: fees.sanitaryFee || 0 },
    { label: 'Fire Safety Inspection Assessment (BFP Fee)', amount: fees.fireSafetyFee || 0 },
    { label: 'Environmental & Ecological Management Fee', amount: fees.environmentalFee || 0 },
    { label: 'Solid Waste & Garbage Collection Fee', amount: fees.garbageFee || 150 },
    { label: 'Municipal Business Plate & Regulatory Sticker', amount: fees.plateStickerFee || 250 },
  ]

  const totalAmount = fees.total || feeItems.reduce((acc, item) => acc + item.amount, 0)

  return (
    <div 
      id="order-of-payment-modal"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print:p-0 print:static print:bg-white"
    >
      <div className="relative bg-white sm:rounded-3xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden my-2 sm:my-8 flex flex-col h-full sm:h-auto max-h-screen sm:max-h-[92vh] print:m-0 print:border-none print:shadow-none print:rounded-none">
        
        {/* Modal Top Actions (Hidden on print) */}
        <div className="p-3 sm:p-4 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 print:hidden shrink-0">
          <div className="flex items-center justify-between w-full sm:w-auto">
            <div className="flex items-center space-x-2">
              <CreditCard className="w-5 h-5 text-amber-400 shrink-0" />
              <span className="font-bold text-xs sm:text-sm tracking-wide truncate">Official Order of Payment</span>
            </div>
            <button
              onClick={onClose}
              className="sm:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end flex-wrap gap-y-1">
            <button
              onClick={handlePrint}
              disabled={isExporting}
              className="inline-flex items-center px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              <Printer className="w-3.5 h-3.5 mr-1 shrink-0" /> Print
            </button>
            <button
              onClick={handleExportPDF}
              disabled={isExporting}
              className="inline-flex items-center px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              {isExporting ? (
                <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin shrink-0" />
              ) : (
                <FileText className="w-3.5 h-3.5 mr-1 shrink-0" />
              )}
              Download PDF
            </button>
            <button
              onClick={handleExportImage}
              disabled={isExporting}
              className="inline-flex items-center px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-lg transition-colors border border-slate-700 cursor-pointer disabled:opacity-50"
            >
              <ImageIcon className="w-3.5 h-3.5 mr-1 shrink-0 text-emerald-400" /> Save Image
            </button>
            <button
              onClick={onClose}
              className="hidden sm:inline-flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Loading Overlay */}
        {isExporting && (
          <div className="print:hidden absolute inset-0 z-40 bg-slate-950/70 backdrop-blur-xs flex flex-col items-center justify-center text-white p-6">
            <Loader2 className="w-8 h-8 animate-spin text-amber-400 mb-2" />
            <p className="text-xs sm:text-sm font-bold">{exportProgressText || 'Processing...'}</p>
          </div>
        )}

        {/* Printable Order of Payment Document Body */}
        <div 
          ref={printRef} 
          id="order-of-payment-sheet"
          className="p-4 sm:p-10 relative bg-white font-serif overflow-y-auto flex-1 print:p-2"
        >
          {/* Subtle Watermark Seal */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
            <img 
              src="/janiuay-logo.png" 
              alt="Official Seal" 
              className="w-64 h-64 sm:w-96 sm:h-96 object-contain opacity-[0.06] transform -rotate-6 pointer-events-none" 
            />
          </div>

          <div className="relative z-10 space-y-4 sm:space-y-6 print:space-y-3">
            
            {/* Header */}
            <div className="text-center pb-3 sm:pb-4 border-b-2 border-slate-900 print:pb-2">
              <p className="text-[10px] sm:text-xs uppercase tracking-widest text-slate-600 font-sans font-bold">Republic of the Philippines</p>
              <p className="text-[10px] sm:text-xs uppercase tracking-widest text-slate-600 font-sans font-bold">Province of Iloilo</p>
              <h2 className="text-lg sm:text-xl font-bold uppercase tracking-wider text-slate-900 mt-0.5">Municipality of Janiuay</h2>
              <div className="mt-2 inline-block bg-slate-900 text-amber-400 px-3 sm:px-4 py-1 rounded-sm">
                <h1 className="text-xs sm:text-base md:text-lg font-extrabold uppercase tracking-widest font-sans">
                  OFFICE OF THE MUNICIPAL TREASURER
                </h1>
              </div>
              <p className="text-xs sm:text-sm font-sans font-bold uppercase tracking-widest text-slate-700 mt-2">
                ORDER OF PAYMENT VOUCHER
              </p>
            </div>

            {/* Assessment Meta Box */}
            <div className="grid grid-cols-2 sm:grid-cols-4 print:grid-cols-4 gap-2 sm:gap-3 p-3 bg-slate-50 border border-slate-300 text-xs font-sans rounded-md">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold">Date of Assessment:</span>
                <p className="font-bold text-slate-900">
                  {assessment.assessedAt ? new Date(assessment.assessedAt).toLocaleDateString() : new Date().toLocaleDateString()}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold">Tracking Number:</span>
                <p className="font-bold text-slate-900 font-mono">{permit.trackingNumber || 'TRK-2026-00000'}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold">Business ID (BIN):</span>
                <p className="font-bold text-slate-900 font-mono">{permit.businessIdNumber || 'Pending BIN'}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold">Payment Method:</span>
                <p className="font-bold text-slate-900">{paymentInfo.paymentMethod || 'Treasury Cashier'}</p>
              </div>
            </div>

            {/* Taxpayer Information */}
            <div className="p-3 border border-slate-200 rounded-md text-xs font-sans space-y-1 bg-white">
              <div className="flex flex-col sm:flex-row sm:justify-between">
                <div>
                  <span className="text-slate-500 text-[11px]">Business Trade Name:</span>
                  <p className="font-bold text-sm text-slate-900">{businessInfo.businessName || 'Business Name'}</p>
                </div>
                <div className="mt-2 sm:mt-0 sm:text-right">
                  <span className="text-slate-500 text-[11px]">Taxpayer / Proprietor:</span>
                  <p className="font-bold text-sm text-slate-900">{ownerInfo.firstName} {ownerInfo.lastName}</p>
                </div>
              </div>
              <div className="pt-1 text-slate-600 text-[11px]">
                <span>Address: </span>
                <span className="font-medium text-slate-900">
                  {businessInfo.businessAddress?.barangay || 'Poblacion'}, Janiuay, Iloilo
                </span>
              </div>
            </div>

            {/* Assessment Itemized Table */}
            <div className="border border-slate-300 rounded-md overflow-hidden font-sans">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-2 sm:p-2.5">Regulatory Fee Description</th>
                    <th className="p-2 sm:p-2.5 text-right w-32">Amount (PHP)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {feeItems.map((item, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                      <td className="p-2 sm:p-2.5 text-slate-800">{item.label}</td>
                      <td className="p-2 sm:p-2.5 text-right font-mono font-medium text-slate-900">
                        ₱{Number(item.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-amber-50/80 font-bold text-slate-900 border-t-2 border-slate-900">
                    <td className="p-2.5 text-right uppercase text-xs">Total Amount Due:</td>
                    <td className="p-2.5 text-right font-mono text-sm text-amber-950 font-extrabold">
                      ₱{Number(totalAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Settlement Instructions */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-md text-[11px] font-sans text-slate-600 leading-relaxed">
              <p className="font-bold text-slate-800 mb-1 uppercase text-[10px]">Payment Settlement Instructions:</p>
              <p>
                1. Present this official assessment voucher together with your cash/check at the <strong>Municipal Treasury Cashier (Window 3)</strong>, Janiuay Municipal Hall.
              </p>
              <p>
                2. If paying via Landbank Link.BizPortal or authorized digital payment channels, input Tracking Number <strong>{permit.trackingNumber || 'TRK-2026-00000'}</strong> as transaction reference.
              </p>
              <p>
                3. Secure your Official Receipt (OR) Number and upload the receipt image in your portal account to immediately activate your digital Mayor's Permit Certificate.
              </p>
            </div>

            {/* Officer Signatures */}
            <div className="pt-4 grid grid-cols-2 print:grid-cols-2 gap-8 text-center font-sans text-xs">
              <div>
                <p className="border-b border-slate-400 pb-1 font-bold text-slate-900">
                  {assessment.assessedBy ? 'Municipal Assessment Officer' : 'BPLO Licensing Examiner'}
                </p>
                <p className="text-[10px] text-slate-500 mt-1 uppercase">Assessed By</p>
              </div>
              <div>
                <p className="border-b border-slate-400 pb-1 font-bold text-slate-900">
                  MUNICIPAL TREASURER
                </p>
                <p className="text-[10px] text-slate-500 mt-1 uppercase">Approved for Collection</p>
              </div>
            </div>

          </div>
        </div>

        {/* Modal Bottom Bar */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between print:hidden shrink-0">
          <span className="text-[11px] sm:text-xs text-slate-500 truncate mr-2">Official Municipal Government of Janiuay Document</span>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center px-3 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 mr-1 shrink-0" /> Print
            </button>
            <button
              onClick={handleExportPDF}
              className="inline-flex items-center px-3 py-1 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 mr-1 shrink-0" /> PDF
            </button>
            <Button variant="secondary" onClick={onClose} size="sm">Close</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderOfPaymentModal
