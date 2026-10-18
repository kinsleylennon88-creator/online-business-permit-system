import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Send, 
  MessageSquare,
  AlertCircle,
  Building,
  Navigation,
  ExternalLink,
  Layers,
  Compass
} from 'lucide-react'
import toast from 'react-hot-toast'

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [mapType, setMapType] = useState('roadmap') // 'roadmap' | 'satellite'
  const [isMapLoading, setIsMapLoading] = useState(true)
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm()

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    try {
      // This would typically send to a backend API
      // For now, we'll simulate the submission
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.success('Message sent successfully! We\'ll get back to you soon.')
      reset()
    } catch (error) {
      toast.error('Failed to send message. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const contactInfo = [
    {
      icon: Phone,
      label: 'Phone',
      value: '09811568676',
      href: 'tel:09811568676',
      color: 'text-primary-600'
    },
    {
      icon: Mail,
      label: 'Email',
      value: 'bplo.janiuay@gmail.com',
      href: 'mailto:bplo.janiuay@gmail.com',
      color: 'text-primary-600'
    },
    {
      icon: MapPin,
      label: 'Address',
      value: 'Municipal Hall, Janiuay, Iloilo, Philippines',
      href: '#',
      color: 'text-primary-600'
    },
    {
      icon: Clock,
      label: 'Office Hours',
      value: 'Monday - Friday, 8:00 AM - 5:00 PM',
      href: '#',
      color: 'text-gray-600'
    }
  ]

  const faqs = [
    {
      question: 'What are the requirements for a new business permit?',
      answer: 'You need: Zoning Clearance, Occupancy Permit, Barangay Clearance, Cedula, Police Clearance, Business Name Registration, and Sanitary Permit.'
    },
    {
      question: 'How long does it take to process a business permit?',
      answer: 'Typically 2-3 business days once all required documents are submitted and complete.'
    },
    {
      question: 'Can I apply for a business permit online?',
      answer: 'Yes! You can apply completely online through our digital system from registration to document submission.'
    },
    {
      question: 'What are the office hours of BPLO?',
      answer: 'We are open Monday to Friday, 8:00 AM to 5:00 PM. Online applications are accepted 24/7.'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Contact BPLO Desk
            </h1>
            <p className="text-xl text-primary-100 leading-relaxed">
              Get in touch with the Local Government System Business Permit and Licensing Office. 
              We're here to assist citizens and entrepreneurs with business permit processing and compliance.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {contactInfo.map((info, index) => {
              const Icon = info.icon
              return (
                <div key={index} className="text-center group">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-primary-600 transition-colors">
                    <Icon className="w-8 h-8 text-primary-600 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{info.label}</h3>
                  {info.href.startsWith('tel:') || info.href.startsWith('mailto:') ? (
                    <a 
                      href={info.href} 
                      className={`${info.color} hover:underline`}
                    >
                      {info.value}
                    </a>
                  ) : (
                    <p className={info.color}>{info.value}</p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Contact Form and Map */}
      <section className="py-20 bg-gray-50">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Send us a Message</h2>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <input
                      id="firstName"
                      autoComplete="given-name"
                      {...register('firstName', { required: 'First name is required' })}
                      type="text"
                      className={`input ${errors.firstName ? 'border-red-500' : ''}`}
                      placeholder="Your first name"
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.firstName.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <input
                      id="lastName"
                      autoComplete="family-name"
                      {...register('lastName', { required: 'Last name is required' })}
                      type="text"
                      className={`input ${errors.lastName ? 'border-red-500' : ''}`}
                      placeholder="Your last name"
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    id="email"
                    autoComplete="email"
                    {...register('email', { 
                      required: 'Email is required',
                      pattern: {
                        value: /^\S+@\S+$/i,
                        message: 'Invalid email address'
                      }
                    })}
                    type="email"
                    className={`input ${errors.email ? 'border-red-500' : ''}`}
                    placeholder="your.email@example.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    autoComplete="tel"
                    {...register('phone', { 
                      required: 'Phone number is required',
                      pattern: {
                        value: /^09\d{9}$/,
                        message: 'Please enter a valid Philippine mobile number'
                      }
                    })}
                    type="tel"
                    className={`input ${errors.phone ? 'border-red-500' : ''}`}
                    placeholder="09XX-XXX-XXXX"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Subject
                  </label>
                  <select
                    id="subject"
                    {...register('subject', { required: 'Please select a subject' })}
                    className={`input ${errors.subject ? 'border-red-500' : ''}`}
                  >
                    <option value="">Select a subject</option>
                    <option value="general-inquiry">General Inquiry</option>
                    <option value="business-permit">Business Permit Application</option>
                    <option value="renewal">Permit Renewal</option>
                    <option value="technical-support">Technical Support</option>
                    <option value="complaint">Complaint</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.subject && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.subject.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    {...register('message', { 
                      required: 'Message is required',
                      minLength: {
                        value: 10,
                        message: 'Message must be at least 10 characters'
                      }
                    })}
                    rows={5}
                    className={`input ${errors.message ? 'border-red-500' : ''}`}
                    placeholder="Tell us how we can help you..."
                  />
                  {errors.message && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.message.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn btn-primary btn-lg disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Sending...
                    </div>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Map and Additional Info */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">Find Us</h2>
                  <p className="text-sm text-gray-500 mt-1">Municipality of Janiuay Official BPLO Headquarters</p>
                </div>
                <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1 shadow-sm text-xs font-medium self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => { setMapType('roadmap'); setIsMapLoading(true); }}
                    className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                      mapType === 'roadmap'
                        ? 'bg-primary-600 text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    Map
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMapType('satellite'); setIsMapLoading(true); }}
                    className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                      mapType === 'satellite'
                        ? 'bg-primary-600 text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Compass className="w-3.5 h-3.5" />
                    Satellite
                  </button>
                </div>
              </div>
              
              {/* Interactive Map Box */}
              <div className="relative rounded-2xl overflow-hidden border border-gray-200 bg-gray-100 shadow-md mb-8 group">
                {/* Header Strip inside Map Card */}
                <div className="bg-white/95 backdrop-blur px-4 py-3 border-b border-gray-200 flex items-center justify-between z-10 relative">
                  <div className="flex items-center space-x-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                    <span className="text-xs font-semibold text-gray-900 uppercase tracking-wide">
                      Municipal Hall • Janiuay, Iloilo
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href="https://www.google.com/maps/dir/?api=1&destination=Janiuay+Municipal+Hall+Iloilo"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1 hover:underline"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      Get Directions
                    </a>
                    <span className="text-gray-300">|</span>
                    <a
                      href="https://www.google.com/maps/search/?api=1&query=Janiuay+Municipal+Hall+Iloilo"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium text-gray-600 hover:text-gray-900 flex items-center gap-1 hover:underline"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Full Map
                    </a>
                  </div>
                </div>

                {/* Map iframe */}
                <div className="relative h-96 w-full bg-slate-100">
                  {isMapLoading && (
                    <div className="absolute inset-0 bg-gray-100/90 flex flex-col items-center justify-center z-10 text-gray-500">
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent mb-2"></div>
                      <p className="text-xs font-medium text-gray-600">Loading interactive map...</p>
                      <p className="text-[11px] text-gray-400">Municipal Hall, Janiuay, Iloilo</p>
                    </div>
                  )}
                  <iframe
                    title="Janiuay Municipal Hall Interactive Map"
                    src={
                      mapType === 'satellite'
                        ? 'https://maps.google.com/maps?q=Janiuay+Municipal+Hall,+Janiuay,+Iloilo,+Philippines&t=k&z=17&ie=UTF8&iwloc=&output=embed'
                        : 'https://maps.google.com/maps?q=Janiuay+Municipal+Hall,+Janiuay,+Iloilo,+Philippines&t=m&z=16&ie=UTF8&iwloc=&output=embed'
                    }
                    className="w-full h-full border-0"
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    onLoad={() => setIsMapLoading(false)}
                  ></iframe>
                </div>

                {/* Bottom detail bar */}
                <div className="bg-slate-50 border-t border-gray-200 px-4 py-2.5 text-xs text-gray-600 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-primary-600 shrink-0" />
                    <span>Aquino Nobleza East, Janiuay, Iloilo 5034</span>
                  </div>
                  <span className="text-[11px] text-gray-500 font-mono">10.9576° N, 122.5029° E</span>
                </div>
              </div>

              {/* Quick Contact */}
              <div className="bg-primary-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Contact</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 text-primary-600 mr-3" />
                    <span className="text-gray-700">09811568676</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="w-5 h-5 text-primary-600 mr-3" />
                    <span className="text-gray-700">bplo.janiuay@gmail.com</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-primary-600 mr-3" />
                    <span className="text-gray-700">Mon-Fri: 8:00 AM - 5:00 PM</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Quick answers to common questions about business permits in the local government system
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div key={index} className="card">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <MessageSquare className="w-5 h-5 text-primary-600 mr-2" />
                      {faq.question}
                    </h3>
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Contact */}
      <section className="py-12 bg-danger-600 text-white">
        <div className="container text-center">
          <h3 className="text-2xl font-bold mb-4">Need Urgent Assistance?</h3>
          <p className="text-danger-100 mb-6">
            For urgent matters or emergencies, please call us directly at our hotline
          </p>
          <a 
            href="tel:09811568676" 
            className="btn bg-white text-danger-600 hover:bg-gray-100 btn-lg font-semibold"
          >
            <Phone className="w-5 h-5 mr-2" />
            Call Hotline: 09811568676
          </a>
        </div>
      </section>
    </div>
  )
}

export default Contact
