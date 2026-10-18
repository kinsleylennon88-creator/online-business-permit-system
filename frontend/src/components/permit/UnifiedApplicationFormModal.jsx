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

      // Capture Page 1 with standard legal width isolation
      const canvas1 = await html2canvas(page1Ref.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 1024,
        onclone: (clonedDoc) => {
          const p1 = clonedDoc.getElementById('uaf-page-1')
          if (p1) {
            p1.style.width = '850px'
            p1.style.maxWidth = '850px'
            p1.style.padding = '32px'
          }
        }
      })
      const img1Data = canvas1.toDataURL('image/png')

      setExportProgressText('Rendering Page 2...')
      // Capture Page 2 with standard legal width isolation
      const canvas2 = await html2canvas(page2Ref.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 1024,
        onclone: (clonedDoc) => {
          const p2 = clonedDoc.getElementById('uaf-page-2')
          if (p2) {
            p2.style.width = '850px'
            p2.style.maxWidth = '850px'
            p2.style.padding = '32px'
          }
        }
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
        backgroundColor: '#ffffff',
        windowWidth: 1024,
        onclone: (clonedDoc) => {
          const p1 = clonedDoc.getElementById('uaf-page-1')
          if (p1) {
            p1.style.width = '850px'
            p1.style.maxWidth = '850px'
            p1.style.padding = '32px'
          }
        }
      })
      downloadCanvas(canvas1, 1)

      setExportProgressText(`Capturing Page 2 as ${format.toUpperCase()}...`)
      const canvas2 = await html2canvas(page2Ref.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 1024,
        onclone: (clonedDoc) => {
          const p2 = clonedDoc.getElementById('uaf-page-2')
          if (p2) {
            p2.style.width = '850px'
            p2.style.maxWidth = '850px'
            p2.style.padding = '32px'
          }
        }
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
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/70 backdrop-blur-xs p-0 sm:p-4">
      <div className="relative w-full max-w-5xl bg-slate-100 sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col h-full sm:max-h-[95vh] border border-slate-300">
        
        {/* Top Control Bar (Hidden during window.print) */}
        <div className="no-print bg-slate-900 text-white px-3 sm:px-4 py-2.5 sm:py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center justify-between w-full sm:w-auto">
            <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
                <FileCheck className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center space-x-2">
                  <h3 className="text-xs sm:text-sm font-black tracking-tight text-white truncate">
                    Unified Application Form (UAF)
                  </h3>
                  <span className="hidden xs:inline-block px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    {trackingNo}
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs text-slate-400 truncate max-w-xs sm:max-w-md">
                  Official Application Dossier • {businessName}
                </p>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={onClose}
              className="sm:hidden p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition shrink-0 ml-2"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Action Buttons Toolbar */}
          <div className="flex items-center justify-between sm:justify-end gap-1.5 sm:space-x-2 w-full sm:w-auto overflow-x-auto pb-0.5 sm:pb-0">
            <div className="flex items-center gap-1.5 sm:space-x-2 flex-1 sm:flex-initial">
              {/* Primary Print Button */}
              <button
                onClick={handlePrint}
                disabled={isExporting}
                className="flex-1 sm:flex-initial px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 text-[11px] sm:text-xs font-bold shadow-sm transition flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
                title="Open browser print dialog"
              >
                <Printer className="w-3.5 h-3.5 text-slate-700 shrink-0" />
                <span>Print</span>
              </button>

              {/* Save as PDF Button */}
              <button
                onClick={handleExportPDF}
                disabled={isExporting}
                className="flex-1 sm:flex-initial px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-[11px] sm:text-xs font-bold shadow-sm transition flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50 whitespace-nowrap"
                title="Download official 2-page PDF document"
              >
                {isExporting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                ) : (
                  <FileText className="w-3.5 h-3.5 shrink-0" />
                )}
                <span>{isExporting ? 'Exporting...' : 'PDF'}</span>
              </button>

              {/* Image Export Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  disabled={isExporting}
                  className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] sm:text-xs font-bold border border-slate-700 transition flex items-center space-x-1 cursor-pointer disabled:opacity-50"
                  title="More export options (Image, Blank Form)"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Export</span>
                  <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
                </button>

                {showExportMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-slate-200 py-1.5 z-50 text-slate-800 text-xs font-semibold">
                    <button
                      onClick={() => {
                        setShowExportMenu(false)
                        handleExportImage('png')
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-slate-100 flex items-center space-x-2 cursor-pointer"
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
                      className="w-full text-left px-3.5 py-2 hover:bg-slate-100 flex items-center space-x-2 cursor-pointer"
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
            </div>

            {/* Desktop Close Button */}
            <button
              onClick={onClose}
              className="hidden sm:inline-flex p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
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
        <div className="flex-1 overflow-y-auto overflow-x-auto p-2 sm:p-6 bg-slate-200/80">
          <UnifiedApplicationForm 
            permit={permit} 
            formRef={formRef} 
            page1Ref={page1Ref} 
            page2Ref={page2Ref} 
          />
        </div>

        {/* Bottom Status Bar */}
        <div className="no-print bg-white px-3 sm:px-4 py-2 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-500 shrink-0 gap-1 sm:gap-0">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
            <span className="truncate">All applicant, enterprise, and clearance fields auto-filled.</span>
          </div>
          <span className="text-[10px] sm:text-[11px] font-mono text-slate-400">Format: Fillable-UAF-2026-revised</span>
        </div>
      </div>
    </div>
  )
}

export default UnifiedApplicationFormModal
