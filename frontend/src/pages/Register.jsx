import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, Mail, Lock, User, Phone, MapPin, ArrowRight, ShieldCheck, CheckCircle2, Upload } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import Button from '../components/shared/Button'
import Input from '../components/shared/Input'
import Badge from '../components/shared/Badge'
import toast from 'react-hot-toast'
import { JANIUAY_BARANGAYS } from '../constants/barangays'

const barangays = JANIUAY_BARANGAYS

const Register = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [idFrontPreview, setIdFrontPreview] = useState(null)
  const [idFrontFile, setIdFrontFile] = useState(null)
  const [idBackPreview, setIdBackPreview] = useState(null)
  const [idBackFile, setIdBackFile] = useState(null)
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm()

  const password = watch('password')

  const handleIdUpload = (e, side) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be under 5MB')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      if (side === 'front') {
        setIdFrontPreview(reader.result)
        setIdFrontFile(file)
      } else {
        setIdBackPreview(reader.result)
        setIdBackFile(file)
      }
    }
    reader.readAsDataURL(file)
  }

  const onSubmit = async (data) => {
    if (!idFrontPreview || !idBackPreview) {
      toast.error('Please upload both the Front and Back photos of your Philippine National ID.')
      return
    }

    setIsLoading(true)
    try {
      await registerUser({
        ...data,
        nationalIdFront: idFrontPreview,
        nationalIdBack: idBackPreview
      })
      toast.success('Account established! Proceeding to Permit Application...')
      navigate('/apply-permit')
    } catch (error) {
      // Error is handled in AuthContext
    } finally {
      setIsLoading(false)
    }
  }

  const registerHeroImage = "/civic_tech_register_hero_1778950428442.png";

  return (
    <div className="min-h-screen flex bg-white font-sans overflow-hidden">
      {/* Left Side: Brand & Visuals */}
      <motion.div 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="hidden lg:flex lg:w-5/12 relative bg-brand-900 items-center justify-center overflow-hidden"
      >
        <div className="absolute inset-0 z-0">
          <img 
            src={registerHeroImage} 
            alt="Business Growth" 
            className="w-full h-full object-cover opacity-30 mix-blend-overlay scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-950 via-brand-900/90 to-brand-950" />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.08]">
            <img src="/janiuay-logo.png" alt="Official Seal" className="w-[480px] h-[480px] object-contain transform -rotate-12 pointer-events-none" />
          </div>
        </div>

        <div className="relative z-10 p-16 w-full max-w-xl">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <Badge variant="success" className="mb-6 bg-accent-500/10 border-accent-500/20 text-accent-400 backdrop-blur-md">
              Fast-Track Registration
            </Badge>
            <h1 className="text-5xl font-display font-bold text-white leading-tight mb-8">
              Start your <br />
              <span className="text-accent-400">Business Journey</span> <br />
              with Confidence.
            </h1>
            
            <div className="space-y-6">
              {[
                "Instant account verification",
                "Digital document vault access",
                "Real-time application tracking",
                "Direct channel to municipal staff"
              ].map((feature, i) => (
                <motion.div 
                  key={i}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 + (i * 0.1) }}
                  className="flex items-center space-x-3 text-brand-200"
                >
                  <CheckCircle2 className="w-5 h-5 text-accent-500" />
                  <span className="font-light">{feature}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Right Side: Register Form */}
      <motion.div 
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex-1 flex flex-col justify-start items-center p-8 lg:p-16 bg-brand-50 overflow-y-auto"
      >
        <div className="w-full max-w-2xl space-y-10 my-auto">
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col items-start"
          >
            <h2 className="text-4xl font-display font-bold text-brand-900 tracking-tight">
              Create Enterprise Account
            </h2>
            <p className="mt-3 text-brand-500 text-lg">
              Already using the portal?{' '}
              <Link to="/login" className="text-primary-600 font-bold hover:underline">Sign in</Link>
            </p>
          </motion.div>

          <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-brand-400 uppercase tracking-widest">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  placeholder="John"
                  icon={<User className="w-5 h-5" />}
                  {...register('firstName', { required: 'Required' })}
                  error={errors.firstName?.message}
                />
                <Input
                  label="Last Name"
                  placeholder="Doe"
                  icon={<User className="w-5 h-5" />}
                  {...register('lastName', { required: 'Required' })}
                  error={errors.lastName?.message}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="john@example.com"
                  icon={<Mail className="w-5 h-5" />}
                  {...register('email', { required: 'Required' })}
                  error={errors.email?.message}
                />
                <Input
                  label="Mobile Number"
                  placeholder="0912-345-6789"
                  icon={<Phone className="w-5 h-5" />}
                  {...register('phone', { required: 'Required' })}
                  error={errors.phone?.message}
                />
              </div>
            </div>

            {/* Location Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-brand-400 uppercase tracking-widest">Location Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Street Address"
                  placeholder="Unit 101, Business Tower"
                  {...register('address.street')}
                />
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-brand-700 ml-1">Barangay</label>
                  <div className="relative group">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-400 group-focus-within:text-primary-500 transition-colors w-5 h-5" />
                    <select
                      {...register('address.barangay', { required: 'Required' })}
                      className="block w-full transition-all duration-200 outline-none sm:text-sm rounded-xl border-2 pl-11 pr-4 py-3 border-brand-100 hover:border-brand-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-50 appearance-none bg-white text-brand-900"
                    >
                      <option value="">Select Barangay</option>
                      {barangays.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Security */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-brand-400 uppercase tracking-widest">Security</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Input
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    icon={<Lock className="w-5 h-5" />}
                    {...register('password', { required: 'Required' })}
                    error={errors.password?.message}
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-[38px] text-brand-400 hover:text-brand-600 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <Input
                  label="Confirm Password"
                  type="password"
                  placeholder="••••••••"
                  icon={<Lock className="w-5 h-5" />}
                  {...register('confirmPassword', { 
                    validate: v => v === password || 'Passwords do not match'
                  })}
                  error={errors.confirmPassword?.message}
                />
              </div>
            </div>

            {/* National ID Verification (Requirement from Flowchart & Specs) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-brand-400 uppercase tracking-widest">
                  Philippine National ID (PhilSys) Verification <span className="text-red-500">*</span>
                </h3>
                <span className="text-xs text-primary-600 font-semibold bg-primary-50 px-2 py-0.5 rounded-md">
                  Front & Back Required
                </span>
              </div>
              <p className="text-xs text-brand-500">
                Please attach clear photos or scanned copies of your valid Philippine National ID card.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* ID Front */}
                <div className="border-2 border-dashed border-brand-200 rounded-2xl p-4 text-center hover:border-primary-400 transition-colors bg-white/70">
                  <label className="block text-xs font-bold text-brand-700 mb-2">National ID (Front)</label>
                  {idFrontPreview ? (
                    <div className="relative group">
                      <img src={idFrontPreview} alt="National ID Front" className="w-full h-32 object-cover rounded-xl shadow-xs border border-brand-100" />
                      <button
                        type="button"
                        onClick={() => { setIdFrontPreview(null); setIdFrontFile(null); }}
                        className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 text-xs hover:bg-red-700 shadow-sm"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center justify-center h-32 border-2 border-slate-100 rounded-xl hover:bg-brand-50/50 transition-colors">
                      <Upload className="w-6 h-6 text-brand-400 mb-1" />
                      <span className="text-xs font-bold text-primary-600">Upload Front Photo</span>
                      <span className="text-[10px] text-brand-400 mt-0.5">JPG, PNG or WEBP (max 5MB)</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleIdUpload(e, 'front')}
                      />
                    </label>
                  )}
                </div>

                {/* ID Back */}
                <div className="border-2 border-dashed border-brand-200 rounded-2xl p-4 text-center hover:border-primary-400 transition-colors bg-white/70">
                  <label className="block text-xs font-bold text-brand-700 mb-2">National ID (Back)</label>
                  {idBackPreview ? (
                    <div className="relative group">
                      <img src={idBackPreview} alt="National ID Back" className="w-full h-32 object-cover rounded-xl shadow-xs border border-brand-100" />
                      <button
                        type="button"
                        onClick={() => { setIdBackPreview(null); setIdBackFile(null); }}
                        className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 text-xs hover:bg-red-700 shadow-sm"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center justify-center h-32 border-2 border-slate-100 rounded-xl hover:bg-brand-50/50 transition-colors">
                      <Upload className="w-6 h-6 text-brand-400 mb-1" />
                      <span className="text-xs font-bold text-primary-600">Upload Back Photo</span>
                      <span className="text-[10px] text-brand-400 mt-0.5">JPG, PNG or WEBP (max 5MB)</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleIdUpload(e, 'back')}
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <label className="flex items-start space-x-3 cursor-pointer group">
                <input
                  type="checkbox"
                  {...register('terms', { required: true })}
                  className="mt-1 w-5 h-5 rounded border-brand-200 text-primary-600 focus:ring-primary-500 transition-all"
                />
                <span className="text-sm text-brand-500 leading-relaxed">
                  I certify that all information provided is true and correct. I agree to the <Link className="text-primary-600 font-bold hover:underline">Terms of Service</Link> and <Link className="text-primary-600 font-bold hover:underline">Data Privacy Policy</Link>.
                </span>
              </label>

              <Button
                type="submit"
                className="w-full py-4 text-base"
                isLoading={isLoading}
                rightIcon={<ArrowRight className="w-5 h-5" />}
              >
                Establish Account
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  )
}

export default Register

