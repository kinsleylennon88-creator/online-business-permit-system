import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, Mail, Lock, ShieldCheck, ArrowRight, Github } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import Button from '../components/shared/Button'
import Input from '../components/shared/Input'
import { Card, CardBody } from '../components/shared/Card'
import Badge from '../components/shared/Badge'

const Login = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      await login(data)
      navigate('/dashboard')
    } catch (error) {
      // Error is handled in AuthContext
    } finally {
      setIsLoading(false)
    }
  }

  const loginHeroImage = "/civic_tech_login_hero_1778950266008.png";

  return (
    <div className="min-h-screen flex bg-white font-sans overflow-hidden">
      {/* Left Side: Brand & Visuals */}
      <motion.div 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="hidden lg:flex lg:w-1/2 relative bg-brand-900 items-center justify-center overflow-hidden"
      >
        <div className="absolute inset-0 z-0">
          <img 
            src={loginHeroImage} 
            alt="CivicTech Architecture" 
            className="w-full h-full object-cover opacity-40 mix-blend-overlay scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-brand-950 via-brand-900/80 to-transparent" />
        </div>

        <div className="relative z-10 p-16 w-full max-w-2xl">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <Badge variant="info" className="mb-6 bg-white/10 border-white/20 text-white backdrop-blur-md">
              Enterprise Grade
            </Badge>
            <h1 className="text-6xl font-display font-bold text-white leading-tight mb-6">
              Empowering <br />
              <span className="text-accent-400">Institutional</span> <br />
              Digital Growth.
            </h1>
            <p className="text-xl text-brand-200 font-light leading-relaxed mb-12">
              The gold standard in digital licensing. Streamlining government services with secure, transparent, and high-performance technology.
            </p>

            <div className="grid grid-cols-2 gap-8 border-t border-white/10 pt-12">
              <div>
                <h4 className="text-white font-semibold text-lg mb-1">99.9% Uptime</h4>
                <p className="text-brand-400 text-sm font-light">Mission-critical reliability for public services.</p>
              </div>
              <div>
                <h4 className="text-white font-semibold text-lg mb-1">AES-256 Secure</h4>
                <p className="text-brand-400 text-sm font-light">Industry-leading data encryption standards.</p>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-accent-500/20 rounded-full blur-[120px]" />
        <div className="absolute top-1/4 -right-12 w-64 h-64 bg-primary-500/10 rounded-full blur-[100px]" />
      </motion.div>

      {/* Right Side: Login Form */}
      <motion.div 
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex-1 flex flex-col justify-center items-center p-8 lg:p-24 bg-brand-50"
      >
        <div className="w-full max-w-md space-y-12">
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col items-center text-center"
          >
            <div className="mb-6 p-4 bg-white shadow-premium rounded-2xl">
              <ShieldCheck className="w-10 h-10 text-primary-600" />
            </div>
            <h2 className="text-3xl font-display font-bold text-brand-900 tracking-tight">
              Welcome back
            </h2>
            <p className="mt-2 text-brand-500">
              Please enter your credentials to access the portal
            </p>
          </motion.div>

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <Input
                label="Corporate Email"
                placeholder="name@organization.gov"
                icon={<Mail className="w-5 h-5" />}
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: 'Invalid email address',
                  },
                })}
                error={errors.email?.message}
              />

              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  icon={<Lock className="w-5 h-5" />}
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Minimum 6 characters required',
                    },
                  })}
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
            </div>

            <div className="flex items-center justify-between px-1">
              <label className="flex items-center space-x-2 cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-brand-200 text-primary-600 focus:ring-primary-500 focus:ring-offset-0 transition-all"
                />
                <span className="text-sm text-brand-500 group-hover:text-brand-700 transition-colors">Keep me signed in</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm font-semibold text-primary-600 hover:text-primary-700"
              >
                Reset Password
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full py-4 text-base"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-5 h-5" />}
            >
              Sign into Portal
            </Button>
          </form>

          <div className="pt-8 border-t border-brand-200">
            <p className="text-center text-sm text-brand-500">
              Don't have an enterprise account?{' '}
              <Link
                to="/register"
                className="font-bold text-brand-900 hover:text-primary-600 transition-colors inline-flex items-center"
              >
                Create Account
                <ArrowRight className="ml-1 w-4 h-4" />
              </Link>
            </p>
          </div>
        </div>

        {/* Legal Footer */}
        <div className="mt-auto pt-12 text-center">
          <p className="text-xs text-brand-300">
            &copy; 2026 CivicPermit Enterprise. All rights reserved. <br />
            Protected by advanced biometric and institutional encryption.
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default Login

