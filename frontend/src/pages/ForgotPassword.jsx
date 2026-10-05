import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const ForgotPassword = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [email, setEmail] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    try {
      // This would typically send to a backend API
      // For now, we'll simulate the password reset email
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setEmail(data.email)
      setIsSuccess(true)
      toast.success('Password reset instructions sent to your email!')
    } catch (error) {
      toast.error('Failed to send reset email. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-success-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="h-6 w-6 text-success-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Check Your Email
            </h2>
            <p className="text-gray-600 mb-6">
              We've sent password reset instructions to:
            </p>
            <div className="bg-gray-100 rounded-lg p-4 mb-6">
              <p className="font-medium text-gray-900">{email}</p>
            </div>
            <p className="text-sm text-gray-600 mb-8">
              Follow the instructions in the email to reset your password. 
              If you don't see the email, check your spam folder.
            </p>
            <div className="space-y-4">
              <button
                onClick={() => setIsSuccess(false)}
                className="w-full btn btn-primary"
              >
                Send Again
              </button>
              <Link
                to="/login"
                className="w-full btn btn-outline block text-center"
              >
                <ArrowLeft className="w-4 h-4 inline mr-2" />
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="mx-auto h-12 w-12 bg-primary-600 rounded-lg flex items-center justify-center mb-6">
            <Mail className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">
            Reset Your Password
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your email address and we'll send you instructions to reset your password.
          </p>
        </div>

        <div className="bg-white shadow-soft rounded-lg p-8">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: 'Invalid email address',
                    },
                  })}
                  type="email"
                  autoComplete="email"
                  className={`input pl-10 ${errors.email ? 'border-red-500' : ''}`}
                  placeholder="Enter your email address"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
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
                  'Send Reset Instructions'
                )}
              </button>
            </div>

            <div className="text-center">
              <Link
                to="/login"
                className="font-medium text-primary-600 hover:text-primary-500 inline-flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Login
              </Link>
            </div>
          </form>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              Sign up
            </Link>
          </p>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-primary-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Need Help?</h3>
          <p className="text-sm text-gray-600 mb-4">
            If you're having trouble accessing your account, contact our support team:
          </p>
          <div className="space-y-2 text-sm">
            <p className="flex items-center">
              <strong>Email:</strong>
              <a href="mailto:bplo.janiuay@gmail.com" className="ml-2 text-primary-600 hover:underline">
                bplo.janiuay@gmail.com
              </a>
            </p>
            <p className="flex items-center">
              <strong>Phone:</strong>
              <a href="tel:09811568676" className="ml-2 text-primary-600 hover:underline">
                09811568676
              </a>
            </p>
            <p className="flex items-center">
              <strong>Office Hours:</strong>
              <span className="ml-2">Mon-Fri, 8:00 AM - 5:00 PM</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
