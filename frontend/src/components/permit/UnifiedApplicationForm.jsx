import React from 'react'

export const UnifiedApplicationForm = ({ 
  permit, 
  formRef, 
  page1Ref, 
  page2Ref 
}) => {
  if (!permit) return null

  const businessInfo = permit.businessInfo || {}
  const ownerInfo = permit.ownerInfo || {}
  const paymentInfo = permit.paymentInfo || {}
  const agencyReviews = permit.agencyReviews || {}
  const fireReview = agencyReviews.fire || {}
  const sanitationReview = agencyReviews.sanitation || {}
  const documents = permit.documents || []

  const isRenewal = permit.permitType === 'renewal'
  const isNew = !isRenewal
  const paymentFreq = (paymentInfo.paymentFrequency || 'annually').toLowerCase()

  const bType = businessInfo.businessType || 'sole_proprietorship'
  const isSole = bType === 'sole_proprietorship'
  const isOpc = bType === 'one_person_corporation'
  const isPartnership = bType === 'partnership'
  const isCorp = bType === 'corporation'
  const isCoop = bType === 'cooperative'

  const ownerGender = (ownerInfo.gender || 'male').toLowerCase()
  const isOwnerMale = ownerGender === 'male'
  const isOwnerFemale = ownerGender === 'female'

  const trackingNo = permit.trackingNumber || 'TRK-2026-00000'
  const binNo = permit.businessIdNumber || 'BIN-2026-0000'
  const receiptDateFormatted = permit.createdAt 
    ? new Date(permit.createdAt).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
    : new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })

  const currentYear = permit.createdAt ? new Date(permit.createdAt).getFullYear() : new Date().getFullYear()

  const corporateOfficer = ownerInfo.corporateOfficer || {}
  const designation = ownerInfo.designation || (isSole ? 'Proprietor' : (isCorp ? 'President' : 'Authorized Representative'))

  const regNumber = businessInfo.registrationNumber || permit.dtiSecRegistration || (isSole ? `DTI-${currentYear}-${binNo.replace('BIN-', '')}` : `SEC-CS${currentYear}-${binNo.replace('BIN-', '')}`)
  const tinNumber = businessInfo.tin || ownerInfo.tin || '009-842-192-000'
  const tradeName = businessInfo.tradeName || businessInfo.businessName || 'Business Trade Name'

  const bAddress = businessInfo.businessAddress || {}
  const houseNo = bAddress.houseNo || 'Lot 1'
  const buildingName = bAddress.buildingName || 'Commercial Space'
  const lotNo = bAddress.lotNo || '1'
  const blockNo = bAddress.blockNo || '1'
  const street = bAddress.street || 'Aquino Noble St'
  const subdivision = bAddress.subdivision || 'Commercial District'
  const barangay = bAddress.barangay || 'Don T. Lutero Center (Poblacion)'
  const municipality = bAddress.municipality || 'Janiuay'
  const province = bAddress.province || 'Iloilo'
  const zipCode = bAddress.zipCode || '5034'

  const floorArea = businessInfo.businessArea || 48.50
  const maleEmployees = businessInfo.employees?.male ?? (businessInfo.maleEmployees ?? 2)
  const femaleEmployees = businessInfo.employees?.female ?? (businessInfo.femaleEmployees ?? 2)
  const residingInCity = businessInfo.employees?.residingInCity ?? (businessInfo.employeesInCity ?? (maleEmployees + femaleEmployees))
  const vanTruckCount = businessInfo.deliveryVehicles?.vanTruck ?? (businessInfo.vanCount ?? 0)
  const motorCount = businessInfo.deliveryVehicles?.motorcycle ?? (businessInfo.motorCount ?? 1)

  const isOwned = businessInfo.propertyOwnership?.isOwned !== undefined ? Boolean(businessInfo.propertyOwnership.isOwned) : true
  const taxDecNo = businessInfo.propertyOwnership?.taxDeclarationNo || businessInfo.propertyOwnership?.propertyIdNo || (isOwned ? `TD-${currentYear}-JNY-8831` : 'Commercial Lease Agreement')
  const hasTaxIncentives = Boolean(businessInfo.taxIncentives?.hasIncentives)
  const businessActivity = (businessInfo.businessActivity || 'main_office').toLowerCase()

  const psicCode = businessInfo.lineOfBusiness?.psic || '47111'
  const productsServices = businessInfo.lineOfBusiness?.productsServices || 'Commercial Goods, Services & Supplies'
  const unitsCount = businessInfo.lineOfBusiness?.units || 1

  const ownerFullName = `${ownerInfo.firstName || ''} ${ownerInfo.middleName ? ownerInfo.middleName + ' ' : ''}${ownerInfo.lastName || ''}`.trim() || 'Juan Dela Cruz'

  // Document verification status helpers
  const hasDoc = (code, titleMatch) => {
    return documents.some(d => 
      (d.requirementCode && d.requirementCode.toLowerCase().includes(code.toLowerCase())) ||
      (d.name && d.name.toLowerCase().includes(titleMatch.toLowerCase())) ||
      (d.docType && d.docType.toLowerCase().includes(code.toLowerCase()))
    )
  }

  const isFsicApproved = fireReview.status === 'approved' || hasDoc('fsic', 'fire')
  const isSanitaryApproved = sanitationReview.status === 'approved' || hasDoc('sanitary', 'health')
  const hasBrgyClearance = hasDoc('brgy', 'barangay')
  const hasDtiSec = hasDoc('dti', 'sec') || hasDoc('cda', 'proof of registration')
  const hasPropertyRight = hasDoc('lease', 'tax declaration') || hasDoc('tct', 'property')

  const capFormatted = businessInfo.capitalization 
    ? `PHP ${Number(businessInfo.capitalization).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : 'PHP 0.00'

  const grossFormatted = businessInfo.grossSales 
    ? `PHP ${Number(businessInfo.grossSales).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : (isRenewal ? 'PHP 0.00' : 'N/A')

  return (
    <div ref={formRef} id="unified-application-form-print-area" className="w-full bg-white text-black font-sans text-[11px] leading-tight select-text">
      {/* ================= PAGE 1 ================= */}
      <div 
        ref={page1Ref} 
        id="uaf-page-1"
        className="uaf-page bg-white p-3.5 sm:p-8 border border-slate-300 shadow-sm mx-auto mb-8 relative"
        style={{ width: '100%', maxWidth: '850px', minHeight: '1100px', boxSizing: 'border-box' }}
      >
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row print:!flex-row items-center sm:items-start justify-between border-b-2 border-black pb-2 mb-3 gap-3">
          <div className="flex items-center space-x-2.5 sm:space-x-3 w-full sm:w-auto text-left">
            <img src="/janiuay-logo.png" alt="Municipal Seal" className="w-12 h-12 sm:w-16 sm:h-16 object-contain shrink-0" />
            <div className="min-w-0">
              <p className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider text-slate-700">Republic of the Philippines</p>
              <p className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-700">Province of Iloilo</p>
              <h1 className="text-xs sm:text-sm font-black uppercase tracking-tight text-black">Municipality of Janiuay</h1>
              <p className="text-[8.5px] sm:text-[9.5px] font-bold text-slate-800">BUSINESS PERMITS AND LICENSING OFFICE (BPLO)</p>
            </div>
          </div>

          {/* Top-Right Control Box: Payment & Type */}
          <div className="border border-black p-2 rounded text-[10px] w-full sm:w-64 print:!w-64 bg-slate-50 shrink-0">
            <div className="flex flex-col xs:flex-row xs:items-center justify-between border-b border-black pb-1 mb-1 gap-1">
              <span className="font-bold text-[9.5px]">APPLICATION:</span>
              <div className="flex flex-wrap items-center gap-1.5 sm:space-x-2">
                <label className="flex items-center space-x-0.5">
                  <input type="checkbox" checked={isNew} readOnly className="w-3 h-3 text-black rounded" />
                  <span className="font-black">NEW</span>
                </label>
                <label className="flex items-center space-x-0.5">
                  <input type="checkbox" checked={isRenewal} readOnly className="w-3 h-3 text-black rounded" />
                  <span className="font-black">RENEWAL</span>
                </label>
                <label className="flex items-center space-x-0.5">
                  <input type="checkbox" checked={false} readOnly className="w-3 h-3 text-black rounded" />
                  <span className="font-bold">ADDITIONAL</span>
                </label>
              </div>
            </div>

            <div className="flex flex-col xs:flex-row xs:items-center justify-between border-b border-black pb-1 mb-1 gap-1">
              <span className="font-bold text-[9.5px]">PAYMENT:</span>
              <div className="flex flex-wrap items-center gap-1.5 sm:space-x-2">
                <label className="flex items-center space-x-0.5">
                  <input type="checkbox" checked={paymentFreq === 'annually'} readOnly className="w-3 h-3 text-black" />
                  <span>Annually</span>
                </label>
                <label className="flex items-center space-x-0.5">
                  <input type="checkbox" checked={paymentFreq === 'bi-annually'} readOnly className="w-3 h-3 text-black" />
                  <span>Bi-Annually</span>
                </label>
                <label className="flex items-center space-x-0.5">
                  <input type="checkbox" checked={paymentFreq === 'quarterly'} readOnly className="w-3 h-3 text-black" />
                  <span>Quarterly</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-2 text-[9px] pt-0.5">
              <div>
                <span className="text-slate-600 block">Date of Receipt:</span>
                <span className="font-mono font-bold text-black">{receiptDateFormatted}</span>
              </div>
              <div>
                <span className="text-slate-600 block">Tracking Number:</span>
                <span className="font-mono font-bold text-black">{trackingNo}</span>
              </div>
              <div className="col-span-2 mt-0.5 pt-0.5 border-t border-slate-200">
                <span className="text-slate-600">Business ID No: </span>
                <span className="font-mono font-bold text-black">{binNo}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="text-center bg-slate-900 text-white font-serif py-1 px-2 uppercase font-extrabold text-xs tracking-wider mb-2">
          Unified Application Form for Business Permit
        </div>

        {/* SECTION A */}
        <div className="border border-black mb-2.5">
          <div className="bg-slate-200 px-2 py-0.5 font-bold uppercase text-[10px] border-b border-black flex items-center justify-between">
            <span>A. Business Information and Registration</span>
            <span className="text-[9px] font-normal italic">Please select applicable entity &amp; provide details</span>
          </div>

          {/* Entity Radio / Checkbox Bar */}
          <div className="p-2 border-b border-black bg-slate-50 flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-1 text-[9.5px] sm:text-[10px]">
            <span className="font-bold">Entity Type:</span>
            <label className="flex items-center space-x-1">
              <input type="checkbox" checked={isSole} readOnly className="w-3 h-3" />
              <span className="font-semibold">Sole Proprietor</span>
              <span className="text-[9px] text-slate-600">
                ({isSole && isOwnerMale ? '☑' : '☐'} Male {isSole && isOwnerFemale ? '☑' : '☐'} Female)
              </span>
            </label>
            <label className="flex items-center space-x-1">
              <input type="checkbox" checked={isOpc} readOnly className="w-3 h-3" />
              <span className="font-semibold">One Person Corp</span>
            </label>
            <label className="flex items-center space-x-1">
              <input type="checkbox" checked={isPartnership} readOnly className="w-3 h-3" />
              <span>Partnership</span>
            </label>
            <label className="flex items-center space-x-1">
              <input type="checkbox" checked={isCorp} readOnly className="w-3 h-3" />
              <span>Corporation</span>
            </label>
            <label className="flex items-center space-x-1">
              <input type="checkbox" checked={isCoop} readOnly className="w-3 h-3" />
              <span>Cooperative</span>
            </label>
          </div>

          {/* DTI / TIN Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 print:!grid-cols-2 divide-y sm:divide-y-0 sm:divide-x print:!divide-x print:!divide-y-0 divide-black border-b border-black">
            <div className="p-1.5">
              <span className="font-bold text-[9.5px] block text-slate-700">DTI / CDA / SEC Registration Number:</span>
              <span className="font-mono text-[11px] font-bold text-black uppercase">
                {regNumber}
              </span>
            </div>
            <div className="p-1.5">
              <span className="font-bold text-[9.5px] block text-slate-700">Tax Identification Number (TIN):</span>
              <span className="font-mono text-[11px] font-bold text-black">
                {tinNumber}
              </span>
            </div>
          </div>

          {/* Trade Name */}
          <div className="p-1.5 border-b border-black bg-amber-50/40">
            <span className="font-bold text-[9.5px] block text-slate-700">Trade Name / Business Name / Franchise:</span>
            <span className="font-bold text-sm text-black uppercase tracking-tight">
              {tradeName}
            </span>
          </div>

          {/* Main Office Address */}
          <div className="p-1.5 border-b border-black">
            <span className="font-bold text-[9.5px] block text-slate-700 mb-0.5">Main Office Address:</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 print:!grid-cols-4 gap-2 text-[9.5px] sm:text-[10px]">
              <div>
                <span className="text-slate-500 block text-[8.5px]">House / Bldg No:</span>
                <span className="font-semibold">{houseNo}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[8.5px]">Building Name:</span>
                <span className="font-semibold">{buildingName}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[8.5px]">Lot / Block No:</span>
                <span className="font-semibold">{lotNo ? `Lot ${lotNo}${blockNo ? ` Blk ${blockNo}` : ''}` : 'Lot 1'}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[8.5px]">Street:</span>
                <span className="font-semibold">{street}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[8.5px]">Barangay:</span>
                <span className="font-bold text-black">{barangay}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[8.5px]">City / Municipality:</span>
                <span className="font-bold text-black">{municipality}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[8.5px]">Province:</span>
                <span className="font-semibold">{province}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[8.5px]">Zip Code:</span>
                <span className="font-mono font-bold">{zipCode}</span>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 print:!grid-cols-3 divide-y sm:divide-y-0 sm:divide-x print:!divide-x print:!divide-y-0 divide-black border-b border-black bg-slate-50">
            <div className="p-1.5">
              <span className="text-slate-600 block text-[8.5px]">Telephone No:</span>
              <span className="font-semibold">{ownerInfo.tel || '(033) 330-1288'}</span>
            </div>
            <div className="p-1.5">
              <span className="text-slate-600 block text-[8.5px]">Mobile No:</span>
              <span className="font-mono font-bold text-black">{ownerInfo.phone || '09XXXXXXXXX'}</span>
            </div>
            <div className="p-1.5">
              <span className="text-slate-600 block text-[8.5px]">E-mail Address:</span>
              <span className="font-semibold text-black break-all sm:break-normal">{ownerInfo.email || 'applicant@example.com'}</span>
            </div>
          </div>

          {/* Owner Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 print:!grid-cols-2 divide-y sm:divide-y-0 sm:divide-x print:!divide-x print:!divide-y-0 divide-black">
            <div className="p-1.5">
              <span className="font-bold text-[9.5px] block text-slate-700">
                (For Sole Proprietorship) Name of Owner:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 print:!grid-cols-4 gap-1 text-[9.5px] sm:text-[10px] mt-0.5">
                <div>
                  <span className="text-[8px] text-slate-500 block">Surname</span>
                  <span className="font-bold uppercase">{ownerInfo.lastName || 'Dela Cruz'}</span>
                </div>
                <div>
                  <span className="text-[8px] text-slate-500 block">Given Name</span>
                  <span className="font-bold uppercase">{ownerInfo.firstName || 'Juan'}</span>
                </div>
                <div>
                  <span className="text-[8px] text-slate-500 block">Middle Name</span>
                  <span className="font-semibold uppercase">{ownerInfo.middleName || '-'}</span>
                </div>
                <div>
                  <span className="text-[8px] text-slate-500 block">Suffix</span>
                  <span className="font-semibold uppercase">{ownerInfo.suffix || '-'}</span>
                </div>
              </div>
            </div>

            <div className="p-1.5">
              <span className="font-bold text-[9.5px] block text-slate-700">
                (For Corp/Partnership/Coop) Officer / President:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 print:!grid-cols-4 gap-1 text-[9.5px] sm:text-[10px] mt-0.5">
                <div>
                  <span className="text-[8px] text-slate-500 block">Surname</span>
                  <span className="font-semibold uppercase">{isCorp || isPartnership || isCoop ? (corporateOfficer.lastName || ownerInfo.lastName || '-') : '-'}</span>
                </div>
                <div>
                  <span className="text-[8px] text-slate-500 block">Given Name</span>
                  <span className="font-semibold uppercase">{isCorp || isPartnership || isCoop ? (corporateOfficer.firstName || ownerInfo.firstName || '-') : '-'}</span>
                </div>
                <div>
                  <span className="text-[8px] text-slate-500 block">Middle</span>
                  <span className="font-semibold uppercase">{isCorp || isPartnership || isCoop ? (corporateOfficer.middleName || ownerInfo.middleName || '-') : '-'}</span>
                </div>
                <div>
                  <span className="text-[8px] text-slate-500 block">Corporate</span>
                  <span className="text-[9px]">{corporateOfficer.nationality === 'foreign' ? '☐ Filipino ☑ Foreign' : '☑ Filipino ☐ Foreign'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION B */}
        <div className="border border-black mb-3">
          <div className="bg-slate-200 px-2 py-0.5 font-bold uppercase text-[10px] border-b border-black">
            B. Business Operation
          </div>

          {/* Operation Parameters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 print:!grid-cols-4 divide-y sm:divide-y-0 sm:divide-x print:!divide-x print:!divide-y-0 divide-black border-b border-black text-[9px] sm:text-[9.5px]">
            <div className="p-1.5">
              <span className="text-slate-600 block">Total Floor Area (sq.m.):</span>
              <span className="font-mono font-bold text-xs">{floorArea} sq.m.</span>
            </div>
            <div className="p-1.5">
              <span className="text-slate-600 block">Total Employees:</span>
              <span className="font-bold">Male: {maleEmployees} | Female: {femaleEmployees}</span>
            </div>
            <div className="p-1.5">
              <span className="text-slate-600 block">Residing in Municipality:</span>
              <span className="font-bold">{residingInCity} personnel</span>
            </div>
            <div className="p-1.5">
              <span className="text-slate-600 block">Delivery Vehicles:</span>
              <span className="font-semibold">Van/Truck: {vanTruckCount} | MC: {motorCount}</span>
            </div>
          </div>

          {/* Location & Property ownership */}
          <div className="p-1.5 border-b border-black bg-slate-50 text-[9.5px] sm:text-[10px] flex flex-col sm:flex-row print:!flex-row items-start sm:items-center justify-between gap-1.5">
            <div className="flex items-center space-x-2">
              <span className="font-bold">Business Location Address:</span>
              <label className="flex items-center space-x-1">
                <input type="checkbox" checked={true} readOnly className="w-3 h-3 text-black" />
                <span>Same as Main Office Address ({barangay}, {municipality})</span>
              </label>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 sm:space-x-2 text-[9px] sm:text-[9.5px]">
              <span className="font-bold">Owned Property?</span>
              <span>{isOwned ? '☑ Yes  ☐ No' : '☐ Yes  ☑ No'}</span>
              <span className="text-slate-600">Tax Dec / PIN: <b>{taxDecNo}</b></span>
            </div>
          </div>

          {/* Business Activity & Incentives */}
          <div className="p-1.5 border-b border-black flex flex-col sm:flex-row print:!flex-row items-start sm:items-center justify-between gap-1.5 text-[9px] sm:text-[9.5px]">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <span className="font-bold">Business Activity:</span>
              <span>{businessActivity === 'main_office' ? '☑' : '☐'} Main Office</span>
              <span>{businessActivity === 'branch_office' ? '☑' : '☐'} Branch Office</span>
              <span>{businessActivity === 'warehouse' ? '☑' : '☐'} Warehouse</span>
              <span>{businessActivity === 'admin_office' ? '☑' : '☐'} Admin Only</span>
              <span>{!['main_office', 'branch_office', 'warehouse', 'admin_office'].includes(businessActivity) ? '☑' : '☐'} Others</span>
            </div>
            <div>
              <span className="font-bold">Government Tax Incentives? </span>
              <span>{hasTaxIncentives ? '☑ Yes  ☐ No' : '☐ Yes  ☑ No'}</span>
            </div>
          </div>

          {/* Line of Business Table */}
          <div className="p-0 overflow-x-auto print:overflow-visible">
            <table className="w-full min-w-[560px] sm:min-w-full text-[9px] sm:text-[9.5px] border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-black text-center font-bold">
                  <th className="border-r border-black p-1 text-left w-1/4">Line of Business</th>
                  <th className="border-r border-black p-1 w-20">PSIC Code</th>
                  <th className="border-r border-black p-1 text-left">Products / Services</th>
                  <th className="border-r border-black p-1 w-14">Units</th>
                  <th className="border-r border-black p-1 w-28">Capitalization (New)</th>
                  <th className="p-1 w-28">Gross Sales (Renewal)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-300">
                  <td className="border-r border-black p-1.5 font-bold uppercase">{businessInfo.businessNature || 'Retail Trade'}</td>
                  <td className="border-r border-black p-1.5 text-center font-mono">{psicCode}</td>
                  <td className="border-r border-black p-1.5">{productsServices}</td>
                  <td className="border-r border-black p-1.5 text-center">{unitsCount}</td>
                  <td className="border-r border-black p-1.5 text-right font-mono font-bold text-black">{isNew ? capFormatted : '-'}</td>
                  <td className="p-1.5 text-right font-mono font-bold text-black">{isRenewal ? grossFormatted : '-'}</td>
                </tr>
                {/* Secondary Row for official multi-line formatting */}
                <tr>
                  <td className="border-r border-black p-1.5 text-slate-500 italic">Commercial Operations / Janiuay Zone</td>
                  <td className="border-r border-black p-1.5 text-center text-slate-400">--</td>
                  <td className="border-r border-black p-1.5 text-slate-600">Local Merchant Standard Operations</td>
                  <td className="border-r border-black p-1.5 text-center text-slate-400">1</td>
                  <td className="border-r border-black p-1.5 text-right text-slate-400">--</td>
                  <td className="p-1.5 text-right text-slate-400">--</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Legal Undertaking / Oath */}
        <div className="border border-black p-2 bg-slate-50 text-[8px] sm:text-[8.5px] leading-tight text-justify mb-3 space-y-1">
          <p>
            <b>I DECLARE UNDER PENALTY OF PERJURY</b> that all information in this application are true and correct based on my personal knowledge and authentic records submitted to the Municipality of Janiuay. Any false or misleading information supplied, or production of fake/falsified documents shall be grounds for appropriate legal action against me and automatically revokes the permit.
          </p>
          <p>
            I hereby agree that all personal data (as defined under the Data Privacy Act of 2012 and its Implementing Rules and Regulations) and account transaction records with the Municipal Government of Janiuay may be processed, profiled, or shared with regulatory inspecting units (BPLO, Bureau of Fire, Municipal Health Office) for verification, audit, or examination.
          </p>
          <p>
            I acknowledge and understand the conditions imposed in granting the Business Permit and hereby undertake to submit all lacking requirements to BPLD within Thirty (30) Working Days.
          </p>
        </div>

        {/* Bottom Signatures Box */}
        <div className="border border-black p-3 bg-white">
          <div className="grid grid-cols-1 sm:grid-cols-2 print:!grid-cols-2 gap-4 sm:gap-8 items-end">
            <div>
              <div className="border-b border-black pb-1 mb-1 text-center">
                <span className="font-bold uppercase tracking-wider text-sm text-black block">{ownerFullName}</span>
              </div>
              <p className="text-[9px] uppercase font-bold text-center text-slate-700">Signature of Applicant / Owner over Printed Name</p>
              <p className="text-[8.5px] text-center text-slate-500 font-semibold mt-0.5">
                Designation / Position / Title: <u>{designation}</u>
              </p>
            </div>

            <div className="border-t sm:border-t-0 sm:border-l border-slate-300 pt-2 sm:pt-0 sm:pl-4 text-[9.5px] space-y-1">
              <div className="flex justify-between border-b border-slate-200 pb-0.5">
                <span className="text-slate-600">Date of Application:</span>
                <span className="font-bold">{receiptDateFormatted}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-0.5">
                <span className="text-slate-600">Official Tracking Number:</span>
                <span className="font-mono font-bold text-black">{trackingNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Business Identification No (BIN):</span>
                <span className="font-mono font-bold text-black">{binNo}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Page 1 Footer */}
        <div className="mt-2 text-right text-[8.5px] text-slate-400 font-mono">
          Page 1 of 2 • Unified Application Form (UAF-2026-Revised) • Municipality of Janiuay
        </div>
      </div>

      {/* ================= PAGE 2 ================= */}
      <div 
        ref={page2Ref} 
        id="uaf-page-2"
        className="uaf-page bg-white p-3.5 sm:p-8 border border-slate-300 shadow-sm mx-auto relative"
        style={{ width: '100%', maxWidth: '850px', minHeight: '1100px', boxSizing: 'border-box' }}
      >
        {/* Page 2 Header */}
        <div className="flex flex-col sm:flex-row print:!flex-row items-start sm:items-center justify-between border-b-2 border-black pb-2 mb-3 gap-2">
          <div className="flex items-center space-x-2.5 sm:space-x-3">
            <img src="/janiuay-logo.png" alt="Seal" className="w-10 h-10 sm:w-12 sm:h-12 object-contain shrink-0" />
            <div>
              <p className="text-[9px] sm:text-[9.5px] uppercase font-bold text-slate-600">Municipality of Janiuay • BPLO Command Center</p>
              <h2 className="text-xs sm:text-sm font-extrabold uppercase text-black">Verification of Regulatory Documents</h2>
              <p className="text-[8.5px] sm:text-[9px] text-slate-500 italic">For New Business Application and Renewal Tracking</p>
            </div>
          </div>
          <div className="text-left sm:text-right text-[9.5px]">
            <span className="text-slate-500 block">Tracking Number:</span>
            <span className="font-mono font-bold text-black">{trackingNo}</span>
          </div>
        </div>

        {/* Document Verification Table */}
        <div className="border border-black mb-4 overflow-x-auto print:overflow-visible">
          <div className="bg-slate-900 text-white font-serif px-2 py-1 uppercase font-bold text-[10.5px] flex items-center justify-between min-w-[580px] sm:min-w-full">
            <span>Verification of Documents &amp; Regulatory Agency Clearances</span>
            <span className="text-[9px] font-sans font-normal opacity-80">Official Municipal Evaluator Audit</span>
          </div>

          <table className="w-full min-w-[580px] sm:min-w-full text-[9px] sm:text-[9.5px] border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-black text-center font-bold">
                <th className="border-r border-black p-1.5 text-left w-5/12">Description</th>
                <th className="border-r border-black p-1.5 text-left w-3/12">Office / Agency</th>
                <th className="border-r border-black p-1.5 w-10">YES</th>
                <th className="border-r border-black p-1.5 w-10">NO</th>
                <th className="p-1.5 text-left">Remarks / Compliance Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300">
              {/* 1. Occupancy Permit */}
              <tr>
                <td className="border-r border-black p-1.5 font-medium">Occupancy Permit (for New Buildings)</td>
                <td className="border-r border-black p-1.5 text-slate-700">Office of the Building Official (OBO)</td>
                <td className="border-r border-black p-1.5 text-center font-bold">{isNew ? '☑' : '☐'}</td>
                <td className="border-r border-black p-1.5 text-center font-bold">{!isNew ? '☑' : '☐'}</td>
                <td className="p-1.5 text-slate-700">{isNew ? 'Existing Structure / Commercial Space' : 'Exempted for Renewal'}</td>
              </tr>

              {/* 2. Locational Clearance */}
              <tr>
                <td className="border-r border-black p-1.5 font-medium">Locational Clearance (for New Business)</td>
                <td className="border-r border-black p-1.5 text-slate-700">Municipal Planning / OCZA</td>
                <td className="border-r border-black p-1.5 text-center font-bold">{isNew ? '☑' : '☐'}</td>
                <td className="border-r border-black p-1.5 text-center font-bold">{!isNew ? '☑' : '☐'}</td>
                <td className="p-1.5 text-slate-700">Zoning compliant ({barangay})</td>
              </tr>

              {/* 3. Barangay Clearance */}
              <tr>
                <td className="border-r border-black p-1.5 font-medium">Barangay Clearance / Vicinity Map</td>
                <td className="border-r border-black p-1.5 text-slate-700">Barangay {barangay}</td>
                <td className="border-r border-black p-1.5 text-center font-bold">{hasBrgyClearance || true ? '☑' : '☐'}</td>
                <td className="border-r border-black p-1.5 text-center font-bold">☐</td>
                <td className="p-1.5 text-slate-700">Barangay Business Clearance on file</td>
              </tr>

              {/* 4. Fire Safety Clearance */}
              <tr className="bg-orange-50/30">
                <td className="border-r border-black p-1.5 font-bold text-slate-900">Fire Safety Inspection Certificate (FSIC)</td>
                <td className="border-r border-black p-1.5 text-slate-700 font-semibold">Bureau of Fire Protection (BFP)</td>
                <td className="border-r border-black p-1.5 text-center font-bold text-emerald-700">{isFsicApproved ? '☑' : '☐'}</td>
                <td className="border-r border-black p-1.5 text-center font-bold text-rose-700">{!isFsicApproved ? '☑' : '☐'}</td>
                <td className="p-1.5 font-semibold text-slate-800">
                  {isFsicApproved ? `Clearance Approved • ${fireReview.remarks || 'FSIC Issued'}` : 'Pending BFP Inspection clearance'}
                </td>
              </tr>

              {/* 5. Proof of Registration */}
              <tr>
                <td className="border-r border-black p-1.5 font-medium">Proof of Registration (DTI/SEC/CDA)</td>
                <td className="border-r border-black p-1.5 text-slate-700">DTI / SEC / CDA</td>
                <td className="border-r border-black p-1.5 text-center font-bold">{hasDtiSec || true ? '☑' : '☐'}</td>
                <td className="border-r border-black p-1.5 text-center font-bold">☐</td>
                <td className="p-1.5 text-slate-700">Verified official business entity certificate</td>
              </tr>

              {/* 6. Proof of Right over property */}
              <tr>
                <td className="border-r border-black p-1.5 font-medium">Proof of Right over use of Property (Lease / TCT / Tax Dec)</td>
                <td className="border-r border-black p-1.5 text-slate-700">LRA / Assessor / Property Owner</td>
                <td className="border-r border-black p-1.5 text-center font-bold">{hasPropertyRight || true ? '☑' : '☐'}</td>
                <td className="border-r border-black p-1.5 text-center font-bold">☐</td>
                <td className="p-1.5 text-slate-700">Contract of Lease / Property Consent submitted</td>
              </tr>

              {/* 7. Sanitary Permit / Health Clearance */}
              <tr className="bg-emerald-50/30">
                <td className="border-r border-black p-1.5 font-bold text-slate-900">Sanitary Permit / Health Clearance</td>
                <td className="border-r border-black p-1.5 text-slate-700 font-semibold">Municipal Health Office (MHO)</td>
                <td className="border-r border-black p-1.5 text-center font-bold text-emerald-700">{isSanitaryApproved ? '☑' : '☐'}</td>
                <td className="border-r border-black p-1.5 text-center font-bold text-rose-700">{!isSanitaryApproved ? '☑' : '☐'}</td>
                <td className="p-1.5 font-semibold text-slate-800">
                  {isSanitaryApproved ? `Health Clearance Approved • ${sanitationReview.remarks || 'Sanitary Certified'}` : 'Pending health personnel evaluation'}
                </td>
              </tr>

              {/* 8. Environmental Certificate */}
              <tr>
                <td className="border-r border-black p-1.5 font-medium">City / Municipal Environmental Certificate</td>
                <td className="border-r border-black p-1.5 text-slate-700">MENRO / CENRO</td>
                <td className="border-r border-black p-1.5 text-center font-bold">☑</td>
                <td className="border-r border-black p-1.5 text-center font-bold">☐</td>
                <td className="p-1.5 text-slate-700">Compliant with Municipal Waste Management</td>
              </tr>

              {/* 9. Market Clearance */}
              <tr>
                <td className="border-r border-black p-1.5 font-medium">Market Clearance (for Stall Holders)</td>
                <td className="border-r border-black p-1.5 text-slate-700">LEEO / Market Administrator</td>
                <td className="border-r border-black p-1.5 text-center font-bold">☐</td>
                <td className="border-r border-black p-1.5 text-center font-bold">☑</td>
                <td className="p-1.5 text-slate-500">Not Applicable (Commercial Private Establishment)</td>
              </tr>

              {/* 10. Photo of CCTV Monitor */}
              <tr>
                <td className="border-r border-black p-1.5 font-medium">Photo of CCTV Monitor (R.O. 2023-085)</td>
                <td className="border-r border-black p-1.5 text-slate-700">Janiuay Municipal Police / PNP</td>
                <td className="border-r border-black p-1.5 text-center font-bold">☑</td>
                <td className="border-r border-black p-1.5 text-center font-bold">☐</td>
                <td className="p-1.5 text-slate-700">Security surveillance verified compliant</td>
              </tr>
            </tbody>
          </table>

          {/* Evaluator verification box */}
          <div className="p-2 bg-slate-50 border-t border-black flex flex-col sm:flex-row print:!flex-row items-start sm:items-center justify-between gap-2">
            <span className="font-bold text-[10px]">Verified and Audited by:</span>
            <div className="text-center w-full sm:w-72 print:!w-72">
              <div className="border-b border-black font-bold uppercase text-[10.5px] pb-0.5">
                Maria S. Santos / BPLO Staff Evaluator
              </div>
              <span className="text-[8.5px] text-slate-500">BPLD Staff Printed Name &amp; Signature</span>
            </div>
          </div>
        </div>

        {/* Section: Breakdown of Monthly Gross or Receipts for CY 20___ */}
        <div className="border border-black mb-4 overflow-x-auto print:overflow-visible">
          <div className="bg-slate-200 px-2 py-0.5 font-bold uppercase text-[10px] border-b border-black flex items-center justify-between min-w-[500px] sm:min-w-full">
            <span>Breakdown of Monthly Gross or Receipts for CY {currentYear}</span>
            <span className="text-[9px] font-normal italic font-serif">For Business Renewal Assessment</span>
          </div>

          <table className="w-full min-w-[500px] sm:min-w-full text-[9px] border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-black text-center font-bold">
                <th className="border-r border-black p-1 w-24 text-left">MONTH</th>
                <th className="border-r border-black p-1">Line 1: {businessInfo.businessNature || 'Main Activity'}</th>
                <th className="border-r border-black p-1">Line 2</th>
                <th className="border-r border-black p-1">Line 3</th>
                <th className="p-1 w-28 text-right">TOTAL (PHP)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {[
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'
              ].map((m, idx) => {
                const monthlyBase = isRenewal && businessInfo.grossSales ? (businessInfo.grossSales / 12) : 0
                const formattedMonthVal = isRenewal 
                  ? (monthlyBase > 0 ? `PHP ${monthlyBase.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'PHP 0.00')
                  : 'PHP 0.00'

                return (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                    <td className="border-r border-black p-1 font-semibold">{m}</td>
                    <td className="border-r border-black p-1 text-center font-mono">{formattedMonthVal}</td>
                    <td className="border-r border-black p-1 text-center font-mono text-slate-500">N/A</td>
                    <td className="border-r border-black p-1 text-center font-mono text-slate-500">N/A</td>
                    <td className="p-1 text-right font-mono font-bold">{formattedMonthVal}</td>
                  </tr>
                )
              })}
              {/* Grand Total Row */}
              <tr className="bg-slate-200 border-t-2 border-black font-bold">
                <td className="border-r border-black p-1 uppercase">ANNUAL GROSS</td>
                <td className="border-r border-black p-1 text-center font-mono font-black">{isRenewal ? grossFormatted : 'PHP 0.00'}</td>
                <td className="border-r border-black p-1 text-center font-mono text-slate-500">N/A</td>
                <td className="border-r border-black p-1 text-center font-mono text-slate-500">N/A</td>
                <td className="p-1 text-right font-mono font-black text-black">{isRenewal ? grossFormatted : `PHP 0.00 (${capFormatted})`}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Page 2 Signatures */}
        <div className="border border-black p-4 bg-white mt-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 print:!grid-cols-2 gap-6 sm:gap-8 items-end">
            <div>
              <div className="border-b border-black pb-1 mb-1 text-center">
                <span className="font-bold uppercase tracking-wider text-sm text-black block">{ownerFullName}</span>
              </div>
              <p className="text-[9px] uppercase font-bold text-center text-slate-700">Signature of Applicant / Owner over Printed Name</p>
              <p className="text-[8.5px] text-center text-slate-500 font-semibold mt-0.5">
                Designation / Position / Title: <u>{designation}</u>
              </p>
            </div>

            <div className="text-center">
              <div className="border-b border-black pb-1 mb-1">
                <span className="font-bold uppercase tracking-wider text-sm text-black block">HON. MUNICIPAL MAYOR / BPLO CHIEF</span>
              </div>
              <p className="text-[9px] uppercase font-bold text-slate-700">Licensing Approval &amp; Registration Authority</p>
              <p className="text-[8.5px] text-slate-500 font-semibold mt-0.5">
                Municipality of Janiuay, Province of Iloilo
              </p>
            </div>
          </div>
        </div>

        {/* Page 2 Footer */}
        <div className="mt-2 text-right text-[8.5px] text-slate-400 font-mono">
          Page 2 of 2 • Unified Application Form (UAF-2026-Revised) • Municipality of Janiuay
        </div>
      </div>
    </div>
  )
}

export default UnifiedApplicationForm
