import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Search, 
  Users, 
  Shield,
  User,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Mail,
  Phone,
  MoreVertical,
  Activity
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { adminService } from '../../services/api'
import { Card, CardHeader, CardBody } from '../../components/shared/Card'
import Button from '../../components/shared/Button'
import Badge from '../../components/shared/Badge'
import Input from '../../components/shared/Input'
import toast from 'react-hot-toast'

const AdminUsers = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 })
  const [selectedUser, setSelectedUser] = useState(null)
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [newRole, setNewRole] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [searchTerm, roleFilter, pagination.current])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const params = { page: pagination.current, limit: 20, search: searchTerm, role: roleFilter }
      const response = await adminService.getUsers(params)
      setUsers(response.data.data.users)
      setPagination(response.data.data.pagination)
    } catch (error) {
      toast.error('Directory sync failed')
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async () => {
    if (!newRole || !selectedUser) return
    try {
      await adminService.updateUserRole(selectedUser._id, newRole)
      toast.success('Clearance level updated.')
      fetchUsers()
      setShowRoleModal(false)
    } catch (error) { toast.error('Role sync failed') }
  }

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to revoke access for this citizen? This action is immutable.')) return
    try {
      await adminService.deleteUser(userId)
      toast.success('Access revoked.')
      fetchUsers()
    } catch (error) { toast.error('Revocation failed') }
  }

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin': return <Badge variant="warning">BPLO Staff</Badge>
      case 'superadmin': return <Badge variant="danger">System Admin</Badge>
      case 'fire_reviewer': return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-800 border border-orange-200">Bureau of Fire</span>
      case 'sanitation_reviewer': return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">Bureau of Sanitation</span>
      default: return <Badge variant="neutral">Citizen</Badge>
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  return (
    <div className="min-h-screen bg-brand-50/50 pb-20">
      <div className="bg-white border-b border-brand-100 pt-8 pb-12">
        <div className="container">
          <Link to="/admin" className="flex items-center text-brand-400 hover:text-brand-900 transition-colors font-bold text-sm mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" /> Command Center
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl font-display font-bold text-brand-900 tracking-tight">Citizen & Staff Directory</h1>
              <p className="text-brand-500 mt-2">Manage municipal registry accounts, agency reviewers, and clearance levels.</p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="info">{pagination.total} Total Registered</Badge>
              <Badge variant="success">89 Online Now</Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mt-8">
        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { label: 'Total Registry', value: pagination.total, icon: Users, color: 'text-primary-600', bg: 'bg-primary-50' },
            { label: 'Staff Clearance', value: users.filter(u => u.role !== 'user').length, icon: Shield, color: 'text-warning-600', bg: 'bg-warning-50' },
            { label: 'New Enrollees', value: '+12%', icon: User, color: 'text-success-600', bg: 'bg-success-50' }
          ].map((stat, i) => (
            <Card key={i} className="hover:shadow-premium transition-all">
              <CardBody className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-brand-400 uppercase tracking-widest mb-1">{stat.label}</p>
                  <p className="text-2xl font-display font-bold text-brand-900">{stat.value}</p>
                </div>
                <div className={`p-4 ${stat.bg} rounded-2xl`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card className="mb-8 border-none shadow-premium bg-white/80 backdrop-blur-md">
          <CardBody className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input 
                  placeholder="Search by name, email, or registry ID..." 
                  icon={<Search className="w-4 h-4" />}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="w-full md:w-64">
                <select 
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full rounded-xl border-2 border-brand-100 py-2.5 px-4 focus:ring-4 focus:ring-primary-50 focus:border-primary-500 outline-none transition-all text-sm font-semibold"
                >
                  <option value="">Role: All Accounts</option>
                  <option value="user">Citizens</option>
                  <option value="fire_reviewer">Bureau of Fire Reviewers</option>
                  <option value="sanitation_reviewer">Bureau of Sanitation Reviewers</option>
                  <option value="admin">BPLO Staff</option>
                  <option value="superadmin">System Admins</option>
                </select>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Directory Table */}
        <Card className="overflow-hidden border-brand-100">
          <CardBody className="p-0">
            {loading && users.length === 0 ? (
              <div className="p-20 flex justify-center"><Activity className="w-10 h-10 animate-spin text-brand-200" /></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-brand-50/50 border-b border-brand-100">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-bold text-brand-400 uppercase tracking-widest">Citizen / Staff</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-brand-400 uppercase tracking-widest">Communication</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-brand-400 uppercase tracking-widest">Clearance</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-brand-400 uppercase tracking-widest">Enrollment</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-brand-400 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-50">
                    <AnimatePresence mode="popLayout">
                      {users.map((user, idx) => (
                        <motion.tr 
                          key={user._id} 
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          transition={{ delay: idx * 0.03 }}
                          className="hover:bg-brand-50/30 transition-colors group"
                        >
                          <td className="px-6 py-5">
                            <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 bg-brand-900 rounded-full flex items-center justify-center text-white text-xs font-bold ring-4 ring-brand-50">
                                {user.firstName[0]}{user.lastName[0]}
                              </div>
                              <div>
                                <p className="font-bold text-brand-900">{user.firstName} {user.lastName}</p>
                                <p className="text-[10px] text-brand-400 font-bold uppercase tracking-tight">{user.address?.barangay || 'Municipal Registry'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex flex-col space-y-1">
                              <div className="flex items-center text-xs text-brand-500 font-medium"><Mail className="w-3 h-3 mr-2" /> {user.email}</div>
                              <div className="flex items-center text-[10px] text-brand-400 font-bold"><Phone className="w-3 h-3 mr-2" /> {user.phone || 'N/A'}</div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            {getRoleBadge(user.role)}
                          </td>
                          <td className="px-6 py-5 text-sm text-brand-500 font-medium">
                            {formatDate(user.createdAt)}
                          </td>
                          <td className="px-6 py-5 text-right">
                            <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button 
                                variant="secondary" size="sm" iconOnly={<Shield className="w-4 h-4" />} 
                                onClick={() => { setSelectedUser(user); setNewRole(user.role); setShowRoleModal(true); }}
                              />
                              {user.role !== 'superadmin' && (
                                <Button 
                                  variant="danger" size="sm" iconOnly={<XCircle className="w-4 h-4" />} 
                                  onClick={() => handleDeleteUser(user._id)}
                                />
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="mt-8 flex items-center justify-between">
            <p className="text-xs font-bold text-brand-400 uppercase tracking-widest">Page {pagination.current} of {pagination.pages}</p>
            <div className="flex items-center space-x-2">
              <Button 
                variant="secondary" size="sm" disabled={pagination.current === 1}
                onClick={() => setPagination(p => ({ ...p, current: p.current - 1 }))}
                iconOnly={<ChevronLeft className="w-4 h-4" />}
              />
              <Button 
                variant="secondary" size="sm" disabled={pagination.current === pagination.pages}
                onClick={() => setPagination(p => ({ ...p, current: p.current + 1 }))}
                iconOnly={<ChevronRight className="w-4 h-4" />}
              />
            </div>
          </div>
        )}

        {/* Role Modal */}
        <AnimatePresence>
          {showRoleModal && selectedUser && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-brand-900/40 backdrop-blur-sm"
                onClick={() => setShowRoleModal(false)}
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
              >
                <div className="p-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-3 bg-warning-50 rounded-2xl">
                      <ShieldAlert className="w-6 h-6 text-warning-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-display font-bold text-brand-900">Clearance</h2>
                      <p className="text-brand-500 text-sm">{selectedUser.firstName} {selectedUser.lastName}</p>
                    </div>
                  </div>

                  <div className="space-y-4 mb-8">
                    <label className="block text-xs font-bold text-brand-400 uppercase tracking-widest">Assigned Security Role</label>
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                      className="w-full rounded-2xl border-2 border-brand-100 py-3 px-4 focus:ring-4 focus:ring-primary-50 focus:border-primary-500 outline-none transition-all text-sm font-bold"
                    >
                      <option value="user">Citizen (Standard Access)</option>
                      <option value="fire_reviewer">Bureau of Fire Reviewer (FSIC Inspection)</option>
                      <option value="sanitation_reviewer">Bureau of Sanitation Reviewer (Sanitary Clearance)</option>
                      <option value="admin">BPLO Staff (Assessment & Audit Access)</option>
                      <option value="superadmin">System Admin (Full Registry Access)</option>
                    </select>
                  </div>

                  <Button variant="primary" className="w-full" onClick={handleRoleChange} leftIcon={<CheckCircle2 className="w-5 h-5" />}>
                    Sync Clearance
                  </Button>
                  <button 
                    onClick={() => setShowRoleModal(false)}
                    className="w-full mt-4 text-xs font-bold text-brand-400 hover:text-brand-900 uppercase tracking-widest transition-colors py-2"
                  >
                    Cancel Edit
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default AdminUsers

