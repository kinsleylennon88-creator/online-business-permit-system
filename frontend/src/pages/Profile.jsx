import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '../contexts/AuthContext'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Lock, 
  Save, 
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

const barangays = [
  'Poblacion', 'Aganan', 'Balabago', 'Barasalon', 'Bongol', 'Bucari', 'Calinog', 'Carpenter',
  'Crispin', 'Daja', 'Dongon', 'Guinobatan', 'Janiuay', 'Latawan', 'Lubot', 'Moroboro',
  'Pitogo', 'Quipot', 'San Julian', 'San Pedro', 'Santo Tomas', 'Sara', 'Tambal',
  'Tibiao', 'Yabon', 'Zarragoza'
]

const Profile = () => {
  const { user, updateProfile, changePassword } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [isUpdating, setIsUpdating] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors }
  } = useForm({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      'address.street': user?.address?.street || '',
      'address.barangay': user?.address?.barangay || ''
    }
  })

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    watch: watchPassword,
    reset: resetPassword,
    formState: { errors: passwordErrors }
  } = useForm()

  const newPassword = watchPassword('newPassword')

  const onSubmitProfile = async (data) => {
    setIsUpdating(true)
    try {
      await updateProfile(data)
    } catch (error) {
      // Error handled in AuthContext
    } finally {
      setIsUpdating(false)
    }
  }

  const onSubmitPassword = async (data) => {
    setIsChangingPassword(true)
    try {
      await changePassword(data)
      resetPassword()
    } catch (error) {
      // Error handled in AuthContext
    } finally {
      setIsChangingPassword(false)
    }
  }

  const getRoleBadge = (role) => {
    const configs = {
      user: { label: 'User', class: 'badge-secondary' },
      admin: { label: 'Administrator', class: 'badge-warning' },
      superadmin: { label: 'Super Admin', class: 'badge-danger' }
    }
    const config = configs[role] || configs.user
    return <span className={`badge ${config.class}`}>{config.label}</span>
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'profile'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Profile Information
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'password'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Change Password
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="card">
            <div className="card-header border-b border-gray-200">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </span>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{user?.firstName} {user?.lastName}</h2>
                  <p className="text-gray-500">{user?.email}</p>
                  <div className="mt-1">{getRoleBadge(user?.role)}</div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="card-body">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...registerProfile('firstName', { required: 'First name is required' })}
                      className={`input pl-10 ${profileErrors.firstName ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {profileErrors.firstName && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {profileErrors.firstName.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...registerProfile('lastName', { required: 'Last name is required' })}
                      className={`input pl-10 ${profileErrors.lastName ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {profileErrors.lastName && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {profileErrors.lastName.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...registerProfile('email')}
                      type="email"
                      disabled
                      className="input pl-10 bg-gray-100"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...registerProfile('phone', {
                        required: 'Phone number is required',
                        pattern: {
                          value: /^09\d{9}$/,
                          message: 'Please enter a valid Philippine mobile number'
                        }
                      })}
                      className={`input pl-10 ${profileErrors.phone ? 'border-red-500' : ''}`}
                      placeholder="09XX-XXX-XXXX"
                    />
                  </div>
                  {profileErrors.phone && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {profileErrors.phone.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...registerProfile('address.street')}
                      className="input pl-10"
                      placeholder="House/Street number and name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Barangay
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      {...registerProfile('address.barangay', { required: 'Barangay is required' })}
                      className={`input pl-10 ${profileErrors['address.barangay'] ? 'border-red-500' : ''}`}
                    >
                      <option value="">Select barangay</option>
                      {barangays.map(barangay => (
                        <option key={barangay} value={barangay}>{barangay}</option>
                      ))}
                    </select>
                  </div>
                  {profileErrors['address.barangay'] && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {profileErrors['address.barangay'].message}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Member since</p>
                    <p className="font-medium text-gray-900">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                    </p>
                  </div>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="btn btn-primary disabled:opacity-50"
                  >
                    {isUpdating ? (
                      <LoadingSpinner size="sm" className="mr-2" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Password Tab */}
        {activeTab === 'password' && (
          <div className="card">
            <div className="card-header border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Change Password</h2>
              <p className="text-gray-500">Update your account password</p>
            </div>

            <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="card-body">
              <div className="space-y-6 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...registerPassword('currentPassword', { required: 'Current password is required' })}
                      type={showCurrentPassword ? 'text' : 'password'}
                      className={`input pl-10 pr-10 ${passwordErrors.currentPassword ? 'border-red-500' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {passwordErrors.currentPassword && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {passwordErrors.currentPassword.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...registerPassword('newPassword', {
                        required: 'New password is required',
                        minLength: {
                          value: 6,
                          message: 'Password must be at least 6 characters'
                        }
                      })}
                      type={showNewPassword ? 'text' : 'password'}
                      className={`input pl-10 pr-10 ${passwordErrors.newPassword ? 'border-red-500' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {passwordErrors.newPassword && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {passwordErrors.newPassword.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...registerPassword('confirmPassword', {
                        required: 'Please confirm your password',
                        validate: value => value === newPassword || 'Passwords do not match'
                      })}
                      type={showNewPassword ? 'text' : 'password'}
                      className={`input pl-10 ${passwordErrors.confirmPassword ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {passwordErrors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {passwordErrors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="btn btn-primary btn-lg disabled:opacity-50 w-full"
                >
                  {isChangingPassword ? (
                    <LoadingSpinner size="sm" className="mr-2" />
                  ) : (
                    <Lock className="w-4 h-4 mr-2" />
                  )}
                  Change Password
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

export default Profile
