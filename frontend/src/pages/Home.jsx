import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Building2, 
  ShieldCheck, 
  Clock, 
  FileText, 
  CheckCircle2, 
  ArrowRight, 
  Phone, 
  Mail, 
  MapPin, 
  Search,
  Sparkles,
  ExternalLink
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const CLEARANCES = [
  {
    id: 1,
    title: 'Zoning & Locational Clearance',
    office: 'Office of the MPDC (2nd Floor, Municipal Hall)',
    purpose: 'Verifies that the business activity complies with the Comprehensive Land Use Plan and zoning ordinance of Janiuay.',
    requirements: 'Proof of ownership or lease contract, Barangay endorsement'
  },
  {
    id: 2,
    title: 'Occupancy Permit / Building Certificate',
    office: 'Office of the Building Official (OBO, Municipal Hall)',
    purpose: 'Ensures the physical commercial building or stall adheres to National Building Code structural and architectural safety.',
    requirements: 'As-built building plans, Certificate of Completion, Sanitary inspection report'
  },
  {
    id: 3,
    title: 'Barangay Business Clearance',
    office: 'Local Barangay Hall of Business Site',
    purpose: 'Authorizes commercial operations within the specific barangay territory with community endorsement.',
    requirements: 'Cedula, Proof of business address, Barangay clearance fee receipt'
  },
  {
    id: 4,
    title: 'Community Tax Certificate (Cedula)',
    office: "Municipal Treasurer's Window (1st Floor)",
    purpose: 'Proof of local tax residency and declared annual individual or corporate earnings.',
    requirements: 'Valid government ID, Prior year income statement or declaration'
  },
  {
    id: 5,
    title: 'Local Police Clearance',
    office: 'Janiuay Municipal Police Station',
    purpose: 'Verifies criminal record clearance for business proprietors and managing personnel.',
    requirements: 'Barangay Clearance for Police Clearance, 2x2 photo, Cedula'
  },
  {
    id: 6,
    title: 'Business Name Registration Certificate',
    office: 'DTI Iloilo Provincial Office / Online DTI BNRS Portal',
    purpose: 'Secures legal exclusive rights to the business trade name across the Philippines.',
    requirements: 'DTI Certificate (Sole Prop) or SEC Registration (Corporation/Partnership)'
  },
  {
    id: 7,
    title: 'Municipal Sanitary Permit',
    office: 'Municipal Health Office (MHO Janiuay)',
    purpose: 'Mandatory health inspection and hygiene compliance certificate for commercial premises.',
    requirements: 'Health certificates of food handlers/staff, water potability test results'
  }
]

export default function Home() {
  const { user } = useAuth()
  const [selectedClearance, setSelectedClearance] = useState(CLEARANCES[0])

  return (
    <div className="min-h-screen bg-white">
      
      {/* 1. HERO SECTION (Dark Navy Background) */}
      <section className="bg-[#07192b] text-white pt-14 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Col: Hero Pitch */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Badge */}
              <div className="inline-flex items-center space-x-2 text-[11px] font-semibold text-sky-400 bg-sky-950/80 border border-sky-800/80 px-3.5 py-1 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Official Municipal Licensing Portal — Province of Iloilo</span>
              </div>

              {/* Headings */}
              <div className="space-y-1">
                <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
                  Municipality of Janiuay
                </h1>
                <h2 className="text-3xl sm:text-5xl font-extrabold text-sky-400 tracking-tight">
                  Online Business Permit System
                </h2>
              </div>

              {/* Description */}
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
                Apply for, track, and renew your Business Permit digitally. Streamlined, paperless, and transparent processing for entrepreneurs across all 40+ barangays of Janiuay.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <Link
                  to={user ? "/apply-permit" : "/register"}
                  className="inline-flex items-center px-6 py-3 rounded-full bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-sky-500/20 transition group"
                >
                  Apply for New Permit <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
                </Link>

                {!user && (
                  <Link
                    to="/login"
                    className="inline-flex items-center px-6 py-3 rounded-full bg-slate-800/90 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm border border-slate-700 transition"
                  >
                    Citizen Login
                  </Link>
                )}
              </div>

              {/* 3 Key Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-slate-800/80 max-w-lg">
                <div>
                  <p className="text-xl sm:text-2xl font-extrabold text-white">2-3 Days</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Average Review SLA</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-extrabold text-white">100% Online</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Paperless Clearances</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-extrabold text-white">40+ Barangays</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Full Municipality Coverage</p>
                </div>
              </div>

            </div>

            {/* Right Col: Glassmorphism Service Status Card */}
            <div className="lg:col-span-5">
              <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/60 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5">
                
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-600/30 text-sky-400 flex items-center justify-center border border-sky-500/30">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">BPLO Service Status</h3>
                      <p className="text-[11px] text-slate-400">Ground Floor, Municipal Hall, Janiuay</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2.5 py-0.5 rounded-full">
                    Active 24/7
                  </span>
                </div>

                <div className="space-y-3 pt-2 text-xs border-t border-slate-800/80">
                  <div className="flex justify-between py-1.5 border-b border-slate-800/50">
                    <span className="text-slate-400">Office Operating Hours:</span>
                    <span className="font-semibold text-white">Mon–Fri, 8:00 AM – 5:00 PM</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-800/50">
                    <span className="text-slate-400">Hotline Assistance:</span>
                    <span className="font-semibold text-sky-400 font-mono">09811568676</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-800/50">
                    <span className="text-slate-400">Official Email:</span>
                    <span className="font-semibold text-white truncate max-w-[180px]">bplo.janiuay@gmail.com</span>
                  </div>
                </div>

                <Link
                  to="/about"
                  className="inline-block text-xs font-semibold text-sky-400 hover:text-sky-300 transition pt-1"
                >
                  Learn more about municipal requirements & ordinances &rarr;
                </Link>

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 2. HOW TO APPLY IN 4 EASY STEPS (White Background) */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto text-center space-y-4">
          
          <span className="inline-block text-[10px] font-extrabold uppercase tracking-widest text-sky-600 bg-sky-50 border border-sky-200 px-3.5 py-1 rounded-full">
            Simple Digital Flow
          </span>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            How to Apply Online in 4 Easy Steps
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
            No more long lines at the Municipal Hall. Complete your requirements anytime, anywhere.
          </p>

          {/* 4 Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-10 text-left">
            {[
              {
                num: '01',
                title: 'Create Citizen Account',
                desc: 'Sign up in under a minute with your email and mobile number to access the portal 24/7.'
              },
              {
                num: '02',
                title: 'Fill Business Details',
                desc: 'Enter your business trade name, line of business, capitalization, and barangay location.'
              },
              {
                num: '03',
                title: 'Attach 7 Clearances',
                desc: 'Upload clear scans or photos of your municipal clearances directly from your phone or PC.'
              },
              {
                num: '04',
                title: 'Receive Official Permit',
                desc: 'BPLO officers audit your files in 2-3 business days. Download your print-ready digital permit.'
              }
            ].map((step, i) => (
              <div
                key={i}
                className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-7 shadow-xs hover:shadow-md transition-all space-y-3"
              >
                <span className="text-xl font-extrabold text-sky-600 block">
                  {step.num}
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  {step.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 3. 7 MANDATORY MUNICIPAL CLEARANCES (Interactive Document Compliance) */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50/70 border-t border-slate-100">
        <div className="max-w-7xl mx-auto space-y-4">
          
          <div className="text-center space-y-2 mb-10">
            <span className="inline-block text-[10px] font-extrabold uppercase tracking-widest text-sky-600 bg-sky-50 border border-sky-200 px-3.5 py-1 rounded-full">
              Document Compliance
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              7 Mandatory Municipal Clearances
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
              Know exactly where to get each document before uploading to your digital application.
            </p>
          </div>

          {/* Interactive Split View */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Col: 7 Clearance Selectable Tabs */}
            <div className="lg:col-span-5 space-y-2.5">
              {CLEARANCES.map((doc) => {
                const isSelected = selectedClearance.id === doc.id
                return (
                  <button
                    key={doc.id}
                    onClick={() => setSelectedClearance(doc)}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl text-left transition text-xs font-semibold ${
                      isSelected
                        ? 'bg-white border-2 border-sky-500 shadow-sm text-slate-900'
                        : 'bg-white border border-slate-200/80 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                        isSelected ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {doc.id}
                      </span>
                      <span className="font-bold">{doc.title}</span>
                    </div>
                    <ArrowRight className={`w-4 h-4 transition ${isSelected ? 'text-sky-600 translate-x-0.5' : 'text-slate-300'}`} />
                  </button>
                )
              })}
            </div>

            {/* Right Col: Clearance Details Card */}
            <div className="lg:col-span-7">
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
                
                {/* Header */}
                <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
                  <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md">
                      Clearance {selectedClearance.id} of 7
                    </span>
                    <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-1">
                      {selectedClearance.title}
                    </h3>
                  </div>
                </div>

                {/* Office Location Box */}
                <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-4 space-y-1">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    Issuing Office in Janiuay:
                  </p>
                  <p className="text-xs font-bold text-slate-800">
                    {selectedClearance.office}
                  </p>
                </div>

                {/* Purpose & Description */}
                <div className="space-y-1 text-xs">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    Purpose & Description:
                  </p>
                  <p className="text-slate-600 leading-relaxed">
                    {selectedClearance.purpose}
                  </p>
                </div>

                {/* Requirements */}
                <div className="space-y-1 text-xs">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    Standard Requirements to Bring:
                  </p>
                  <p className="text-slate-600 leading-relaxed font-medium">
                    {selectedClearance.requirements}
                  </p>
                </div>

                {/* Action Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-100">
                  <span className="text-xs text-slate-500">
                    Need help preparing this file?
                  </span>
                  <Link
                    to={user ? "/apply-permit" : "/register"}
                    className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-xs transition"
                  >
                    Upload Scans Online &rarr;
                  </Link>
                </div>

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 4. READY TO ESTABLISH CTA & FOOTER (Dark Navy Background) */}
      <section className="bg-[#07192b] text-white py-20 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Ready to establish your business license in Janiuay?
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
            Join hundreds of local entrepreneurs and store owners who process their business permits digitally.
          </p>
          <div className="pt-2">
            <Link
              to={user ? "/apply-permit" : "/register"}
              className="inline-flex items-center px-8 py-3.5 rounded-full bg-sky-500 hover:bg-sky-600 text-white font-bold text-sm shadow-xl shadow-sky-500/25 transition"
            >
              Start New Application Today &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Official Bottom Footer */}
      <footer className="bg-[#051322] text-slate-400 py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-800/80 text-xs">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Logo & Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-sky-600 rounded-lg flex items-center justify-center text-white font-bold">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <p className="font-extrabold text-white text-sm">Municipality of Janiuay</p>
                <p className="text-[11px] text-slate-400">Business Permit and Licensing Office</p>
              </div>
            </div>
            <p className="text-slate-400 leading-relaxed max-w-sm">
              Streamlining business permit applications for the residents and entrepreneurs of Janiuay, Iloilo.
            </p>
            <div className="space-y-1 text-slate-300 font-medium pt-1">
              <p>09811568676 • bplo.janiuay@gmail.com</p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-2.5">
            <p className="font-bold text-white uppercase tracking-wider text-[11px]">Quick Links</p>
            <ul className="space-y-1.5">
              <li><Link to="/" className="hover:text-white transition">Home</Link></li>
              <li><Link to="/about" className="hover:text-white transition">About</Link></li>
              <li><Link to="/contact" className="hover:text-white transition">Contact</Link></li>
            </ul>
          </div>

          {/* Office Hours */}
          <div className="space-y-2.5">
            <p className="font-bold text-white uppercase tracking-wider text-[11px]">Office Hours</p>
            <div className="space-y-1 leading-relaxed">
              <p className="text-slate-300 font-semibold">Monday - Friday</p>
              <p>8:00 AM - 5:00 PM</p>
              <p className="pt-2 text-slate-300 font-semibold">Municipal Hall</p>
              <p>Janiuay, Iloilo, Philippines</p>
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-slate-800/60 text-center text-slate-500 text-[11px]">
          &copy; {new Date().getFullYear()} Municipality of Janiuay, Iloilo. All rights reserved.
        </div>
      </footer>

    </div>
  )
}
