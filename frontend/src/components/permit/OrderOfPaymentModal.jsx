import React, { useRef } from 'react'
import { Printer, Download, X, Building2, CheckCircle2, CreditCard, ShieldCheck } from 'lucide-react'
import Button from '../shared/Button'

export const OrderOfPaymentModal = ({ isOpen, onClose, permit }) => {
  const printRef = useRef(null)

  if (!isOpen || !permit) return null

  const assessment = permit.assessment || {}
  const fees = assessment.fees || {}
  const businessInfo = permit.businessInfo || {}
  const ownerInfo = permit.ownerInfo || {}
  const paymentInfo = permit.paymentInfo || {}

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    const printContent = printRef.current?.innerHTML || ''
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Order of Payment - ${businessInfo.businessName || 'Permit'}</title>
          <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
          <style>
            @page { size: portrait; margin: 15mm; }
            body { font-family: 'Times New Roman', serif; color: #111827; }
            .print-voucher { max-width: 800px; margin: 0 auto; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div class="print-voucher p-6">
            ${printContent}
          </div>
        </body>
      </html>
    `)
    printWindow.document.close()
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-0 sm:p-4">
      <div className="relative bg-white sm:rounded-3xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden my-0 sm:my-8 flex flex-col h-full sm:h-auto max-h-screen sm:max-h-[92vh]">
        
        {/* Modal Top Actions (Hidden on print) */}
        <div className="p-3 sm:p-4 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 print:hidden shrink-0">
          <div className="flex items-center justify-between w-full sm:w-auto">
            <div className="flex items-center space-x-2">
              <CreditCard className="w-5 h-5 text-amber-400 shrink-0" />
              <span className="font-bold text-xs sm:text-sm tracking-wide truncate">Official Order of Payment</span>
            </div>
            <button
              onClick={onClose}
              className="sm:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <button
              onClick={handlePrint}
              className="inline-flex items-center px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 mr-1 shrink-0" /> Print
            </button>
            <button
              onClick={handleDownload}
              className="inline-flex items-center px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-lg transition-colors border border-slate-700 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 mr-1 shrink-0" /> Download
            </button>
            <button
              onClick={onClose}
              className="hidden sm:inline-flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Order of Payment Document Body */}
        <div ref={printRef} className="p-4 sm:p-10 relative bg-white font-serif overflow-y-auto flex-1">
          
          {/* Subtle Watermark Seal */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
            <img 
              src="/janiuay-logo.png" 
              alt="Official Seal" 
              className="w-64 h-64 sm:w-96 sm:h-96 object-contain opacity-[0.06] transform -rotate-6 pointer-events-none" 
            />
          </div>

          <div className="relative z-10 space-y-4 sm:space-y-6">
            
            {/* Header */}
            <div className="text-center pb-3 sm:pb-4 border-b-2 border-slate-900">
              <p className="text-[10px] sm:text-xs uppercase tracking-widest text-slate-600 font-sans font-bold">Republic of the Philippines</p>
              <p className="text-[10px] sm:text-xs uppercase tracking-widest text-slate-600 font-sans font-bold">Province of Iloilo</p>
              <h2 className="text-lg sm:text-xl font-bold uppercase tracking-wider text-slate-900 mt-0.5">Municipality of Janiuay</h2>
              <div className="mt-2 inline-block bg-slate-900 text-amber-400 px-3 sm:px-4 py-1 rounded-sm">
                <h1 className="text-xs sm:text-base md:text-lg font-extrabold uppercase tracking-widest font-sans">
                  OFFICE OF THE MUNICIPAL TREASURER
                </h1>
              </div>
              <p className="text-[10px] sm:text-xs font-sans font-bold text-slate-700 mt-2 uppercase tracking-wider">
                Official Order of Payment • Business Tax &amp; Licensing Assessment
              </p>
            </div>

            {/* Document Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 p-3 sm:p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs font-sans">
              <div>
                <span className="text-[9.5px] sm:text-[10px] font-bold text-slate-500 uppercase">Case / Tracking No.</span>
                <p className="font-bold text-slate-900 font-mono text-xs sm:text-sm mt-0.5 truncate">{permit.trackingNumber || 'N/A'}</p>
              </div>
              <div>
                <span className="text-[9.5px] sm:text-[10px] font-bold text-slate-500 uppercase">Business ID (BIN)</span>
                <p className="font-bold text-slate-900 font-mono text-xs sm:text-sm mt-0.5 truncate">{permit.businessIdNumber || 'Pending'}</p>
              </div>
              <div>
                <span className="text-[9.5px] sm:text-[10px] font-bold text-slate-500 uppercase">Assessment Date</span>
                <p className="font-bold text-slate-900 mt-0.5 text-xs sm:text-sm">
                  {assessment.assessedAt ? new Date(assessment.assessedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : new Date().toLocaleDateString()}
                </p>
              </div>
              <div>
                <span className="text-[9.5px] sm:text-[10px] font-bold text-slate-500 uppercase">Preferred Payment Date</span>
                <p className="font-bold text-primary-700 mt-0.5 text-xs sm:text-sm">
                  {paymentInfo.receiptDate ? new Date(paymentInfo.receiptDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Scheduled'}
                </p>
              </div>
            </div>

            {/* Taxpayer / Enterprise Details */}
            <div className="border border-slate-200 rounded-xl p-3 sm:p-4 text-xs font-sans space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-500">Business Tradename:</span>
                  <p className="font-bold text-slate-900 text-sm">{businessInfo.businessName || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-slate-500">Registered Owner / Taxpayer:</span>
                  <p className="font-bold text-slate-900 text-sm">{ownerInfo.firstName} {ownerInfo.lastName}</p>
                </div>
                <div>
                  <span className="text-slate-500">Line of Business &amp; Nature:</span>
                  <p className="font-medium text-slate-800">{businessInfo.businessNature || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-slate-500">Location Address:</span>
                  <p className="font-medium text-slate-800">{businessInfo.businessAddress?.barangay}, Janiuay, Iloilo</p>
                </div>
              </div>
            </div>

            {/* Assessment Itemized Breakdown Table */}
            <div className="overflow-x-auto print:overflow-visible">
              <table className="w-full min-w-[460px] sm:min-w-full text-xs font-sans border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-900 bg-slate-100 text-slate-800 font-bold uppercase text-[10.5px] sm:text-[11px]">
                    <th className="py-2 px-3 text-left">Assessment Regulatory Item</th>
                    <th className="py-2 px-3 text-right">Account Code</th>
                    <th className="py-2 px-3 text-right">Amount (PHP ₱)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {feeItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-2 px-3 text-slate-900 font-medium">{item.label}</td>
                      <td className="py-2 px-3 text-right font-mono text-slate-400">4-01-01-{idx + 1}0</td>
                      <td className="py-2 px-3 text-right font-bold text-slate-900 font-mono">
                        ₱{Number(item.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-900 bg-amber-50/80 font-bold text-xs sm:text-sm">
                    <td colSpan={2} className="py-2.5 px-3 uppercase text-slate-900 tracking-wider">
                      Total Regulatory Fees &amp; Taxes Payable:
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-950 font-extrabold font-mono text-sm sm:text-base text-primary-700">
                      ₱{Number(totalAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Payment Instructions */}
            <div className="p-3 sm:p-4 bg-slate-50 rounded-xl border border-slate-200 text-[10.5px] sm:text-[11px] font-sans text-slate-600 space-y-1 leading-relaxed">
              <p className="font-bold text-slate-800 uppercase tracking-wide">Settlement Channels &amp; Instructions:</p>
              <ul className="list-disc pl-4 space-y-0.5">
                <li><strong>Over-the-Counter:</strong> Pay at the Municipal Treasurer Cashier Window, Ground Floor, Municipal Hall, Janiuay.</li>
                <li><strong>After Payment:</strong> Secure your Official Receipt (OR) and upload a photo/scanned copy in your citizen portal to trigger permit release.</li>
              </ul>
            </div>

            {/* Signatures */}
            <div className="pt-6 sm:pt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 text-center font-sans text-xs">
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
          <Button variant="secondary" onClick={onClose} size="sm">Close</Button>
        </div>
      </div>
    </div>
  )
}

export default OrderOfPaymentModal
