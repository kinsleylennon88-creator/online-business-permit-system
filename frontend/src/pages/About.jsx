import React from 'react'
import { 
  Building2, 
  Users, 
  FileText, 
  ShieldCheck, 
  Clock, 
  Award, 
  Bot, 
  BookOpen, 
  CheckCircle2, 
  Sparkles, 
  HelpCircle, 
  Layers, 
  ArrowRight,
  Shield,
  Search
} from 'lucide-react'
import { Link } from 'react-router-dom'

const About = () => {
  const generalObjective = "To design, develop, and evaluate a secure, accessible, and responsive web-based Online Business Permit System for the Local Government System (BPLO) that streamlines business registration, reduces processing bottlenecks, minimizes documentary non-compliance through automated deficiency tracking, and improves citizen accessibility through AI-assisted guidance."

  const specificObjectives = [
    {
      num: '01',
      title: 'Digital Permit Application & Submission',
      desc: 'To establish an intuitive, step-by-step digital application wizard enabling citizens to file new business permits, specify ownership structures (A–Z), and attach verified documentary clearances.'
    },
    {
      num: '02',
      title: '24/7 Intelligent AI Citizen Assistance',
      desc: 'To integrate an Artificial Intelligence (AI) Chatbot into the system scope that delivers round-the-clock conversational support, answers citizen questions on municipal fees, and guides users through clearance requirements.'
    },
    {
      num: '03',
      title: 'Evaluator Audit & Deficiency Remediation',
      desc: 'To construct a dedicated BPLO administrative review module featuring an interactive A–Z missing requirements checklist and custom evaluator notes for instantaneous deficiency feedback.'
    },
    {
      num: '04',
      title: 'Alphabetical Categorization & Senior Accessibility',
      desc: 'To implement an accessible UI/UX framework with high contrast modes, font scale controls (A / A+ / A++), touch-friendly targets, and strictly alphabetized categories (A–Z) to prevent cognitive overload for senior citizens and novice computer users.'
    },
    {
      num: '05',
      title: 'Transparent Lifecycle Tracking & Verification',
      desc: 'To provide citizens with real-time dossier tracking displaying the exact application submission date, review stage timestamps, and verified digital certificates.'
    }
  ]

  const definitionOfTerms = [
    {
      term: 'Local Government System (LGU)',
      definition: 'The regulatory and administrative institutional framework governing local municipal jurisdictions, responsible for upholding local revenue codes, public safety ordinances, and commercial licensing.'
    },
    {
      term: 'Business Permits and Licensing Office (BPLO)',
      definition: 'The official regulatory department within the local government system mandated to process, audit, assess, and issue business permits and mayor’s licenses for commercial enterprises.'
    },
    {
      term: 'Artificial Intelligence (AI) Citizen Chatbot',
      definition: 'An automated conversational agent embedded directly into the platform to guide applicants through municipal procedures, fee estimations, and document compliance 24 hours a day, 7 days a week.'
    },
    {
      term: 'Deficiency Notice & Remediation',
      definition: 'An administrative notification dispatched by BPLO evaluators that explicitly itemizes missing or non-compliant clearance documents, allowing the applicant to remediate deficiencies without restarting the application.'
    },
    {
      term: 'Alphabetical Categorization (A–Z Standard)',
      definition: 'A standardized information architecture rule ordering all business ownership classifications, industry sectors, and required municipal clearances alphabetically from A to Z to optimize scanability and eliminate cognitive fatigue.'
    },
    {
      term: 'Application Submission Date (Date Applied)',
      definition: 'The verified, tamper-evident date and timestamp recorded in the municipal registry when the citizen officially transmits their business license docket for regulatory audit.'
    }
  ]

  const projectScope = [
    {
      category: 'In-Scope Features',
      items: [
        'End-to-end online business permit application and digital document upload',
        '24/7 AI-powered chatbot assistant for instant requirement consultations and citizen guidance',
        'Alphabetical sorting of business structures, industry categories, and municipal clearances (A–Z)',
        'Senior-citizen and beginner-friendly UI with accessible font scaling (A / A+ / A++) and high-contrast support',
        'Real-time application date tracking and multi-stage lifecycle status updates',
        'BPLO evaluator audit command center with itemized missing requirements checklist',
        'Direct citizen deficiency alert box and one-click missing document resubmission'
      ]
    },
    {
      category: 'System Governance & Security',
      items: [
        'Role-Based Access Control (RBAC) separating Citizen Applicants and BPLO Evaluator Staff',
        'Encrypted database storage for citizen credentials and enterprise portfolio records',
        'Comprehensive audit log recording all administrative review actions and decision notes',
        'Mobile-first responsive layout conforming to WCAG 2.1 accessibility guidelines'
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-primary-950 to-slate-900 text-white py-16 sm:py-20 border-b border-primary-800/30">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <div className="inline-flex items-center space-x-2 bg-white/10 px-4 py-1.5 rounded-full text-xs font-bold text-primary-200 border border-white/10 backdrop-blur-sm">
              <Building2 className="w-3.5 h-3.5" />
              <span>Institutional Research & Academic Overview</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
              Online Business Permit System (BPLO)
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
              A comprehensive digital governance solution engineered for the <strong>Local Government System</strong> to modernize commercial licensing, deliver 24/7 AI citizen support, and enhance accessibility for all entrepreneurs.
            </p>
          </div>
        </div>
      </section>

      <div className="container mt-12 space-y-16">
        {/* General & Specific Objectives */}
        <section className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-8">
          <div>
            <div className="flex items-center space-x-2 text-primary-600 font-bold text-xs uppercase tracking-wider mb-2">
              <BookOpen className="w-4 h-4" />
              <span>Thesis Academic Framework</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Project Objectives
            </h2>
          </div>

          {/* General Objective */}
          <div className="p-6 bg-primary-50/70 rounded-2xl border border-primary-200/80 space-y-2">
            <h3 className="text-sm font-bold text-primary-950 uppercase tracking-wide">
              General Objective
            </h3>
            <p className="text-sm sm:text-base text-slate-800 leading-relaxed font-medium">
              {generalObjective}
            </p>
          </div>

          {/* Specific Objectives */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
              Specific Objectives
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {specificObjectives.map((obj, i) => (
                <div key={i} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start space-x-4">
                  <span className="w-8 h-8 rounded-xl bg-primary-600 text-white font-extrabold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                    {obj.num}
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 mb-1">{obj.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{obj.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Project Scope (Featuring AI Chatbot) */}
        <section className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-8">
          <div>
            <div className="flex items-center space-x-2 text-primary-600 font-bold text-xs uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4" />
              <span>System Boundaries & Deliverables</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Project Scope & AI Chatbot Integration
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl">
              The system encompasses citizen-facing services, administrative oversight tools, and intelligent conversational support for the local government licensing ecosystem.
            </p>
          </div>

          {/* AI Chatbot Scope Highlight Box */}
          <div className="p-6 bg-gradient-to-r from-slate-900 to-primary-950 text-white rounded-2xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-primary-500/20 border border-primary-400/30 flex items-center justify-center text-primary-300 flex-shrink-0">
                <Bot className="w-7 h-7" />
              </div>
              <div>
                <div className="inline-flex items-center space-x-1.5 bg-primary-500/20 px-2.5 py-0.5 rounded-full text-[11px] font-bold text-primary-300 mb-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Scope Inclusion: 24/7 AI Assistant</span>
                </div>
                <h3 className="text-lg font-bold">24/7 Intelligent AI Citizen Chatbot</h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-2xl">
                  Embedded directly into the application scope to assist applicants with municipal tax codes, standard A–Z document checklists, fee calculations, and real-time deficiency troubleshooting without queueing at municipal hall.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projectScope.map((scopeGroup, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center">
                  <Layers className="w-4 h-4 mr-2 text-primary-600" />
                  {scopeGroup.category}
                </h3>
                <ul className="space-y-2.5">
                  {scopeGroup.items.map((item, iIdx) => (
                    <li key={iIdx} className="flex items-start space-x-2 text-xs text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span className="leading-tight">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Definition of Terms (Panelist Requirement) */}
        <section className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6">
          <div>
            <div className="flex items-center space-x-2 text-primary-600 font-bold text-xs uppercase tracking-wider mb-2">
              <BookOpen className="w-4 h-4" />
              <span>Terminology & Lexicon</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Definition of Terms
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Operational definitions of technical and governmental concepts utilized throughout the study.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {definitionOfTerms.map((termItem, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 hover:border-primary-300 transition-colors">
                <h3 className="text-sm font-extrabold text-primary-900">
                  {termItem.term}
                </h3>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {termItem.definition}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Call to action */}
        <section className="bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-3xl p-8 sm:p-12 text-center shadow-lg space-y-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Ready to Apply for Your Business Permit?
          </h2>
          <p className="text-xs sm:text-sm text-primary-100 max-w-xl mx-auto">
            Experience our 4-step streamlined application with automated clearance verification and 24/7 AI chatbot assistance.
          </p>
          <div className="pt-2">
            <Link
              to="/apply-permit"
              className="inline-flex items-center justify-center px-6 py-3.5 bg-white hover:bg-slate-100 text-primary-900 font-extrabold text-sm rounded-xl shadow transition-all"
            >
              Start Business Permit Application
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}

export default About
