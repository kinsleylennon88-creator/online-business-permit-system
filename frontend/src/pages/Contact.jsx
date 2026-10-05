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
  Building
} from 'lucide-react'
import toast from 'react-hot-toast'

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  
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
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Find Us</h2>
              
              {/* Map placeholder */}
              <div className="bg-gray-200 rounded-lg h-96 mb-8 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Interactive Map</p>
                  <p className="text-sm text-gray-500">Municipal Hall, Janiuay, Iloilo</p>
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
