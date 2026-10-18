import React, { useRef, useState } from 'react'
import { 
  Printer, 
  Download, 
  Image as ImageIcon, 
  FileText, 
  X, 
  CheckCircle2, 
  Sparkles, 
  Loader2,
  FileCheck,
  ChevronDown
} from 'lucide-react'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import toast from 'react-hot-toast'
import UnifiedApplicationForm from './UnifiedApplicationForm'

export const UnifiedApplicationFormModal = ({ isOpen, onClose, permit }) => {
  const formRef = useRef(null)
  const page1Ref = useRef(null)
  const page2Ref = useRef(null)
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgressText, setExportProgressText] = useState('')
  const [showExportMenu, setShowExportMenu] = useState(false)

  if (!isOpen || !permit) return null

  const trackingNo = permit.trackingNumber || 'TRK-2026-00000'
  const businessName = permit.businessInfo?.businessName || 'Business'

  // 1. Direct Native Print
  const handlePrint = () => {
    window.print()
  }

  // 2. Export to Official 2-Page PDF
  const handleExportPDF = async () => {
    try {
      setIsExporting(true)
      setExportProgressText('Rendering Page 1...')

      if (!page1Ref.current || !page2Ref.current) {
        throw new Error('Form pages not ready')
      }

      // Capture Page 1
      const canvas1 = await html2canvas(page1Ref.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      })
      const img1Data = canvas1.toDataURL('image/png')

      setExportProgressText('Rendering Page 2...')
      // Capture Page 2
      const canvas2 = await html2canvas(page2Ref.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      })
      const img2Data = canvas2.toDataURL('image/png')

      setExportProgressText('Generating PDF...')
      // Philippine legal document format (216mm x 330mm / 8.5" x 13" or Standard Letter/Legal)
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'legal'
      })

      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()

      pdf.addImage(img1Data, 'PNG', 0, 0, pdfWidth, pdfHeight, '', 'FAST')
      pdf.addPage()
      pdf.addImage(img2Data, 'PNG', 0, 0, pdfWidth, pdfHeight, '', 'FAST')

      const filename = `Unified-Application-Form-${trackingNo}.pdf`
      pdf.save(filename)
      toast.success('Unified Application Form downloaded as PDF!')
    } catch (err) {
      console.error('PDF Export Error:', err)
      toast.error('Failed to generate PDF. You can also use the Print button to Save as PDF.')
    } finally {
      setIsExporting(false)
      setExportProgressText('')
    }
  }

  // 3. Export as Image (PNG or JPEG)
  const handleExportImage = async (format = 'png') => {
    try {
      setIsExporting(true)
      setExportProgressText(`Exporting ${format.toUpperCase()} images...`)

      const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png'
      const ext = format === 'jpeg' ? 'jpg' : 'png'

      // Helper to trigger download
      const downloadCanvas = (canvas, pageNum) => {
        const dataUrl = canvas.toDataURL(mimeType, 0.95)
        const link = document.createElement('a')
        link.download = `UAF-Page-${pageNum}-${trackingNo}.${ext}`
        link.href = dataUrl
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }

      setExportProgressText(`Capturing Page 1 as ${format.toUpperCase()}...`)
      const canvas1 = await html2canvas(page1Ref.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      })
      downloadCanvas(canvas1, 1)

      setExportProgressText(`Capturing Page 2 as ${format.toUpperCase()}...`)
      const canvas2 = await html2canvas(page2Ref.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      })
      downloadCanvas(canvas2, 2)

      toast.success(`Unified Application Form Page 1 & 2 downloaded as ${format.toUpperCase()}!`)
    } catch (err) {
      console.error('Image Export Error:', err)
      toast.error(`Failed to export ${format.toUpperCase()} images.`)
    } finally {
      setIsExporting(false)
      setExportProgressText('')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/70 backdrop-blur-xs p-2 sm:p-4">
      <div className="relative w-full max-w-5xl bg-slate-100 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] border border-slate-300">
        
        {/* Top Control Bar (Hidden during window.print) */}
        <div className="no-print bg-slate-900 text-white px-4 py-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-black tracking-tight text-white">
                  Unified Application Form (UAF-2026-Revised)
                </h3>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  {trackingNo}
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate max-w-md">
                Official Business Permit Application Dossier • {businessName}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            {/* Primary Print Button */}
            <button
              onClick={handlePrint}
              disabled={isExporting}
              className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold shadow-sm transition flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
              title="Open browser print dialog"
            >
              <Printer className="w-3.5 h-3.5 text-slate-700" />
              <span>Print Form</span>
            </button>

            {/* Save as PDF Button */}
            <button
              onClick={handleExportPDF}
              disabled={isExporting}
              className="px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-sm transition flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
              title="Download official 2-page PDF document"
            >
              {isExporting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <FileText className="w-3.5 h-3.5" />
              )}
              <span>{isExporting ? 'Exporting...' : 'Save as PDF'}</span>
            </button>

            {/* Image Export Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                disabled={isExporting}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition flex items-center space-x-1 cursor-pointer disabled:opacity-50"
                title="More export options (Image, Blank Form)"
              >
                <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
                <span>Export Image</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-slate-200 py-1.5 z-50 text-slate-800 text-xs font-semibold">
                  <button
                    onClick={() => {
                      setShowExportMenu(false)
                      handleExportImage('png')
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-100 flex items-center space-x-2"
                  >
                    <ImageIcon className="w-4 h-4 text-emerald-600" />
                    <div>
                      <span className="block font-bold">Download PNG Images</span>
                      <span className="text-[10px] text-slate-500">High-res Page 1 &amp; Page 2</span>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setShowExportMenu(false)
                      handleExportImage('jpeg')
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-100 flex items-center space-x-2"
                  >
                    <ImageIcon className="w-4 h-4 text-sky-600" />
                    <div>
                      <span className="block font-bold">Download JPEG Images</span>
                      <span className="text-[10px] text-slate-500">Compact Page 1 &amp; Page 2</span>
                    </div>
                  </button>

                  <div className="border-t border-slate-100 my-1"></div>

                  <a
                    href="/forms/Fillable-UAF-2026-revised_.pdf"
                    download="Fillable-UAF-2026-revised_.pdf"
                    onClick={() => setShowExportMenu(false)}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-100 flex items-center space-x-2 text-slate-700"
                  >
                    <Download className="w-4 h-4 text-amber-600" />
                    <div>
                      <span className="block font-bold">Download Blank Template</span>
                      <span className="text-[10px] text-slate-500">Original Fillable UAF PDF</span>
                    </div>
                  </a>
                </div>
              )}
            </div>

            {/* Close Modal Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Loading Overlay when generating exports */}
        {isExporting && (
          <div className="no-print absolute inset-0 z-40 bg-slate-900/60 backdrop-blur-2xs flex flex-col items-center justify-center text-white">
            <Loader2 className="w-10 h-10 animate-spin text-amber-400 mb-3" />
            <p className="text-sm font-bold">{exportProgressText || 'Processing document...'}</p>
            <p className="text-xs text-slate-300 mt-1">Please wait while the official form is captured in high resolution.</p>
          </div>
        )}

        {/* Form Container (Scrollable on screen, full printable on print) */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-slate-200/80">
          <UnifiedApplicationForm 
            permit={permit} 
            formRef={formRef} 
            page1Ref={page1Ref} 
            page2Ref={page2Ref} 
          />
        </div>

        {/* Bottom Status Bar */}
        <div className="no-print bg-white px-4 py-2 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>All applicant, enterprise, and regulatory clearance fields auto-filled.</span>
          </div>
          <span className="text-[11px] font-mono">Format: Fillable-UAF-2026-revised</span>
        </div>
      </div>
    </div>
  )
}

export default UnifiedApplicationFormModal
